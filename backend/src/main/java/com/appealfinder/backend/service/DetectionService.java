package com.appealfinder.backend.service;

import com.appealfinder.backend.config.AppProperties;
import com.appealfinder.backend.dto.UploadResponse;
import com.appealfinder.backend.exception.DetectionException;
import com.appealfinder.backend.model.DetectionRun;
import com.appealfinder.backend.repository.DetectionRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DetectionService {

    private static final String JSON_BEGIN_MARKER = "JSON_RESULT_BEGIN";
    private static final String JSON_END_MARKER = "JSON_RESULT_END";
    private static final double MIN_DETECTION_CONFIDENCE = 0.50;

    private final AppProperties props;
    private final S3Service s3Service;
    private final DetectionRunRepository detectionRunRepository;
    private final ObjectMapper objectMapper;

    public UploadResponse processUpload(String userId, MultipartFile file) {
        Path pythonDir = Path.of(props.python().dir());
        Path scriptPath = pythonDir.resolve("object_detection_YOLO.py");
        Path modelPath = pythonDir.resolve("trained_YOLO8.pt");
        Path dataYamlPath = pythonDir.resolve("data.yaml");

        DetectionRun run = new DetectionRun();
        run.setUserId(userId);
        run.setTimestamp(Instant.now());
        run.setStatus("processing");
        run = detectionRunRepository.save(run);

        if (!Files.exists(scriptPath)) {
            failRun(run, "Python script not found");
            throw new DetectionException("Python script not found");
        }
        if (!Files.exists(modelPath)) {
            failRun(run, "Model file not found");
            throw new DetectionException("Model file not found");
        }
        if (!Files.exists(dataYamlPath)) {
            failRun(run, "data.yaml not found");
            throw new DetectionException("data.yaml not found");
        }

        Path uploadedFile = pythonDir.resolve("uploaded_" + UUID.randomUUID() + ".jpg");
        try {
            file.transferTo(uploadedFile);
        } catch (IOException e) {
            failRun(run, "Failed to save uploaded file: " + e.getMessage());
            throw new DetectionException("Failed to save uploaded file", e);
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : uploadedFile.getFileName().toString();

        try {
            JsonNode result = runDetectionScript(scriptPath, uploadedFile);
            return handleDetectionResult(run, userId, uploadedFile, originalFilename, result);
        } catch (DetectionException e) {
            failRun(run, e.getMessage());
            deleteQuietly(uploadedFile);
            throw e;
        }
    }

    private UploadResponse handleDetectionResult(DetectionRun run, String userId, Path uploadedFile,
                                                  String originalFilename, JsonNode result) {
        try {
            Path resultImagePath = Path.of(result.get("result_image_path").asString());
            Path runDirectory = Path.of(result.get("run_directory").asString());
            String runId = run.getId();

            // Matches the original Node backend: both the original and detected
            // S3 keys are derived from the user's uploaded filename, not our
            // internal temp/generated filenames.
            String originalKey = s3Service.generateS3Key(userId, runId, originalFilename, "original");
            String originalImageUrl = s3Service.uploadFile(uploadedFile, originalKey);

            String detectedKey = s3Service.generateS3Key(userId, runId, originalFilename, "detected");
            String detectedImageUrl = s3Service.uploadFile(resultImagePath, detectedKey);

            List<DetectionRun.CroppedImage> croppedImages = new ArrayList<>();
            JsonNode detections = result.get("detections");
            if (detections != null && detections.isArray()) {
                for (JsonNode detection : detections) {
                    double confidence = detection.get("confidence").asDouble();
                    if (confidence < MIN_DETECTION_CONFIDENCE) {
                        continue;
                    }

                    String croppedFileName = detection.get("cropped_image").asString();
                    Path croppedPath = runDirectory.resolve("cropped").resolve(croppedFileName);
                    if (!Files.exists(croppedPath)) {
                        log.warn("Cropped image not found: {}", croppedPath);
                        continue;
                    }

                    String croppedKey = s3Service.generateS3Key(userId, runId, croppedFileName, "cropped");
                    String croppedUrl = s3Service.uploadFile(croppedPath, croppedKey);

                    List<Integer> bbox = new ArrayList<>();
                    JsonNode bboxNode = detection.get("bbox");
                    if (bboxNode != null) {
                        for (JsonNode coordinate : bboxNode) {
                            bbox.add(coordinate.asInt());
                        }
                    }

                    croppedImages.add(new DetectionRun.CroppedImage(
                            detection.get("class").asString(),
                            confidence,
                            bbox,
                            croppedUrl
                    ));
                }
            }

            run.setOriginalImageUrl(originalImageUrl);
            run.setDetectedImageUrl(detectedImageUrl);
            run.setCroppedImages(croppedImages);
            run.setStatus("completed");
            detectionRunRepository.save(run);

            deleteQuietly(uploadedFile);
            deleteDirectoryQuietly(runDirectory);

            return new UploadResponse(runId, originalImageUrl, detectedImageUrl, croppedImages);
        } catch (Exception e) {
            log.error("Failed to process detection results", e);
            failRun(run, "Failed to process results: " + e.getMessage());
            deleteQuietly(uploadedFile);
            throw new DetectionException("Failed to process results");
        }
    }

    private JsonNode runDetectionScript(Path scriptPath, Path imagePath) {
        ProcessBuilder processBuilder = new ProcessBuilder(
                props.python().executable(), scriptPath.toString(), imagePath.toString());
        // The python script redirects all of its own stdout into stderr, so
        // merging here just gives us one stream to read without any risk of
        // deadlocking on two unconsumed OS pipes.
        processBuilder.redirectErrorStream(true);

        String output;
        int exitCode;
        try {
            Process process = processBuilder.start();
            try (InputStream inputStream = process.getInputStream()) {
                output = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
            exitCode = process.waitFor();
        } catch (IOException e) {
            throw new DetectionException("Failed to start detection process: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new DetectionException("Detection process was interrupted", e);
        }

        if (exitCode != 0) {
            throw new DetectionException("Python script failed: " + output);
        }

        int beginIndex = output.indexOf(JSON_BEGIN_MARKER);
        int endIndex = output.indexOf(JSON_END_MARKER);
        if (beginIndex < 0 || endIndex < 0 || endIndex <= beginIndex) {
            throw new DetectionException("Could not find JSON result in Python output");
        }

        String json = output.substring(beginIndex + JSON_BEGIN_MARKER.length(), endIndex).trim();
        return objectMapper.readTree(json);
    }

    private void failRun(DetectionRun run, String error) {
        run.setStatus("failed");
        run.setError(error);
        detectionRunRepository.save(run);
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Failed to delete {}: {}", path, e.getMessage());
        }
    }

    private void deleteDirectoryQuietly(Path directory) {
        if (!Files.exists(directory)) return;
        try (var paths = Files.walk(directory)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.delete(path);
                } catch (IOException e) {
                    log.warn("Failed to delete {}: {}", path, e.getMessage());
                }
            });
        } catch (IOException e) {
            log.warn("Failed to clean up run directory {}: {}", directory, e.getMessage());
        }
    }
}
