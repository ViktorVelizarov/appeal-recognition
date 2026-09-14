package com.appealfinder.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Python python, Aws aws, Google google, Serpapi serpapi) {

    public record Jwt(String secret, int expirationDays) {
    }

    public record Cors(String allowedOrigin) {
    }

    public record Python(String dir, String executable) {
    }

    public record Aws(String accessKeyId, String secretAccessKey, String region, String bucketName) {
    }

    public record Google(String apiKey, String searchEngineId) {
    }

    public record Serpapi(String apiKey) {
    }
}
