package com.appealfinder.backend.controller;

import com.appealfinder.backend.dto.ErrorResponse;
import com.appealfinder.backend.dto.ShoppingItem;
import com.appealfinder.backend.dto.UploadResponse;
import com.appealfinder.backend.model.DetectionRun;
import com.appealfinder.backend.model.User;
import com.appealfinder.backend.repository.DetectionRunRepository;
import com.appealfinder.backend.service.DetectionService;
import com.appealfinder.backend.service.ShoppingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class DetectionController {

    private final DetectionService detectionService;
    private final DetectionRunRepository detectionRunRepository;
    private final ShoppingService shoppingService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("image") MultipartFile image, @AuthenticationPrincipal User user) {
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("No image file uploaded"));
        }

        UploadResponse response = detectionService.processUpload(user.getId(), image);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/detection-runs")
    public List<DetectionRun> listRuns(@AuthenticationPrincipal User user) {
        return detectionRunRepository.findByUserIdOrderByTimestampDesc(user.getId());
    }

    @GetMapping("/api/detection-runs/{runId}")
    public ResponseEntity<?> getRun(@PathVariable String runId, @AuthenticationPrincipal User user) {
        return detectionRunRepository.findById(runId)
                .filter(run -> run.getUserId().equals(user.getId()))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(new ErrorResponse("Detection run not found")));
    }

    @GetMapping("/api/similar-items/{runId}")
    public ResponseEntity<?> similarItems(@PathVariable String runId, @RequestParam String filename) {
        try {
            if (filename.startsWith("http")) {
                return ResponseEntity.ok(shoppingService.searchSimilarItemsWeb(filename));
            }

            DetectionRun run = detectionRunRepository.findById(runId).orElse(null);
            if (run == null) {
                return ResponseEntity.status(404).body(new ErrorResponse("Detection run not found"));
            }

            String finalFilename = filename;
            DetectionRun.CroppedImage cropped = run.getCroppedImages().stream()
                    .filter(img -> img.getImageUrl() != null && img.getImageUrl().contains(finalFilename))
                    .findFirst()
                    .orElse(null);

            if (cropped == null) {
                return ResponseEntity.status(404).body(new ErrorResponse("Cropped image not found"));
            }

            List<ShoppingItem> results = shoppingService.searchSimilarItemsWeb(cropped.getImageUrl());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error searching for similar items", e);
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to search for similar items"));
        }
    }
}
