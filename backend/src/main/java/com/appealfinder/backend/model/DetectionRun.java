package com.appealfinder.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "detectionruns")
public class DetectionRun {

    @Id
    @JsonProperty("_id")
    private String id;

    private String userId;

    private Instant timestamp;

    private String originalImageUrl;

    private String detectedImageUrl;

    private List<CroppedImage> croppedImages = new ArrayList<>();

    /** processing | completed | failed */
    private String status;

    private String error;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CroppedImage {

        @Field("class")
        @JsonProperty("class")
        private String className;

        private double confidence;

        private List<Integer> bbox;

        private String imageUrl;
    }
}
