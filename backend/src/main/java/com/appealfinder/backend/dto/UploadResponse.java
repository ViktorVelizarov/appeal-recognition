package com.appealfinder.backend.dto;

import com.appealfinder.backend.model.DetectionRun;

import java.util.List;

public record UploadResponse(
        String runId,
        String originalImageUrl,
        String detectedImageUrl,
        List<DetectionRun.CroppedImage> croppedImages
) {
}
