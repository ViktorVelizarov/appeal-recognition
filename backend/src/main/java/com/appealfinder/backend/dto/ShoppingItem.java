package com.appealfinder.backend.dto;

import tools.jackson.databind.JsonNode;

/**
 * price is passed through as raw JSON (SerpAPI sometimes returns a plain
 * string, sometimes a {extracted_value, currency} object) - the frontend
 * already handles both shapes, so we don't force it into one Java type here.
 */
public record ShoppingItem(
        String title,
        String imageUrl,
        String itemUrl,
        String thumbnail,
        String source,
        JsonNode price,
        String snippet,
        double confidence
) {
}
