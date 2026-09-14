package com.appealfinder.backend.service;

import com.appealfinder.backend.config.AppProperties;
import com.appealfinder.backend.dto.ShoppingItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * Ported from services/shoppingService.js: only the SerpAPI Google Lens path
 * (searchSimilarItemsWeb) and its Google Custom Search fallback are actually
 * reachable in the original app - the Amazon/Zalando/ASOS/H&M/TinEye/Yandex
 * methods there called fake endpoints with no real credentials and were never
 * invoked by any route, so they were not ported.
 */
@Slf4j
@Service
public class ShoppingService {

    private static final List<String> FASHION_FALLBACK_TERMS = List.of(
            "trendy fashion clothing",
            "latest fashion trends",
            "designer apparel",
            "stylish clothing",
            "fashion accessories"
    );

    private final AppProperties props;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    public ShoppingService(AppProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
    }

    public List<ShoppingItem> searchSimilarItemsWeb(String imageUrl) {
        String serpApiKey = props.serpapi().apiKey();
        if (serpApiKey == null || serpApiKey.isBlank()) {
            log.info("SERPAPI_API_KEY not configured, using fallback search");
            return searchFashionFallback();
        }

        try {
            String body = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https").host("serpapi.com").path("/search.json")
                            .queryParam("engine", "google_lens")
                            .queryParam("url", imageUrl)
                            .queryParam("api_key", serpApiKey)
                            .queryParam("hl", "en")
                            .queryParam("country", "us")
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode response = objectMapper.readTree(body);
            if (!response.has("visual_matches") && !response.has("products")) {
                return searchFashionFallback();
            }

            List<ShoppingItem> results = new ArrayList<>();
            appendMatches(results, response.get("visual_matches"), 8, "Visually similar item", 0.9);
            appendMatches(results, response.get("products"), 4, "Related product", 0.95);

            return results.isEmpty() ? searchFashionFallback() : removeDuplicates(results);
        } catch (Exception e) {
            log.warn("Google Lens search failed, falling back to fashion search: {}", e.getMessage());
            return searchFashionFallback();
        }
    }

    private void appendMatches(List<ShoppingItem> results, JsonNode matches, int limit, String snippet, double confidence) {
        if (matches == null || !matches.isArray()) return;

        int count = Math.min(limit, matches.size());
        for (int i = 0; i < count; i++) {
            JsonNode match = matches.get(i);
            results.add(new ShoppingItem(
                    textOr(match, "title", "Similar Item"),
                    firstText(match, "image", "thumbnail"),
                    textOrNull(match, "link"),
                    textOrNull(match, "thumbnail"),
                    textOr(match, "source", "Shopping Site"),
                    match.get("price"),
                    snippet,
                    confidence
            ));
        }
    }

    private List<ShoppingItem> searchFashionFallback() {
        String apiKey = props.google().apiKey();
        String searchEngineId = props.google().searchEngineId();
        if (isBlank(apiKey) || isBlank(searchEngineId)) {
            return List.of();
        }

        String term = FASHION_FALLBACK_TERMS.get(new Random().nextInt(FASHION_FALLBACK_TERMS.size()));

        try {
            String body = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https").host("www.googleapis.com").path("/customsearch/v1")
                            .queryParam("key", apiKey)
                            .queryParam("cx", searchEngineId)
                            .queryParam("searchType", "image")
                            .queryParam("q", term)
                            .queryParam("imgType", "photo")
                            .queryParam("imgSize", "large")
                            .queryParam("num", 5)
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode response = objectMapper.readTree(body);
            JsonNode items = response.get("items");
            if (items == null || !items.isArray()) return List.of();

            List<ShoppingItem> results = new ArrayList<>();
            for (JsonNode item : items) {
                JsonNode image = item.get("image");
                String contextLink = image != null ? textOrNull(image, "contextLink") : null;
                String thumbnailLink = image != null ? textOrNull(image, "thumbnailLink") : null;

                results.add(new ShoppingItem(
                        textOr(item, "title", "Fashion Item"),
                        textOrNull(item, "link"),
                        contextLink != null ? contextLink : textOrNull(item, "displayLink"),
                        thumbnailLink != null ? thumbnailLink : textOrNull(item, "link"),
                        textOr(item, "displayLink", "Fashion Search"),
                        null,
                        null,
                        0.6
                ));
            }
            return results;
        } catch (Exception e) {
            log.warn("Fashion fallback search failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<ShoppingItem> removeDuplicates(List<ShoppingItem> items) {
        Set<String> seen = new HashSet<>();
        List<ShoppingItem> unique = new ArrayList<>();
        for (ShoppingItem item : items) {
            String key = item.imageUrl() != null ? item.imageUrl() : item.title();
            if (seen.add(key)) {
                unique.add(item);
            }
        }
        return unique;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String textOr(JsonNode node, String field, String fallback) {
        JsonNode value = node.get(field);
        return value != null && !value.isNull() ? value.asString() : fallback;
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && !value.isNull() ? value.asString() : null;
    }

    private String firstText(JsonNode node, String field1, String field2) {
        String value = textOrNull(node, field1);
        return value != null ? value : textOrNull(node, field2);
    }
}
