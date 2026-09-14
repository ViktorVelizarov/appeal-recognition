package com.appealfinder.backend.service;

import com.appealfinder.backend.config.AppProperties;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.nio.file.Path;

@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucketName;

    public S3Service(AppProperties props) {
        this.bucketName = props.aws().bucketName();
        this.s3Client = S3Client.builder()
                .region(Region.of(props.aws().region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(props.aws().accessKeyId(), props.aws().secretAccessKey())))
                .build();
    }

    public String uploadFile(Path filePath, String key) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType("image/jpeg")
                .build();
        s3Client.putObject(request, RequestBody.fromFile(filePath));
        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
    }

    public String generateS3Key(String userId, String runId, String fileName, String type) {
        String baseName = Path.of(fileName).getFileName().toString();
        String sanitized = baseName.replaceAll("[^a-zA-Z0-9.]", "_");

        if ("cropped".equals(type)) {
            return "users/%s/runs/%s/cropped/%s".formatted(userId, runId, sanitized);
        }
        return "users/%s/runs/%s/%s_%s".formatted(userId, runId, type, sanitized);
    }
}
