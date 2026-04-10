package com.prajaconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ClerkService {

    @Value("${clerk.secret-key:}")
    private String secretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String CLERK_API = "https://api.clerk.com/v1";

    public JsonNode getUser(String userId) {
        HttpHeaders headers = authHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<JsonNode> response = restTemplate.exchange(
            CLERK_API + "/users/" + userId,
            HttpMethod.GET,
            entity,
            JsonNode.class
        );
        return response.getBody();
    }

    public void updateUserMetadata(String userId, Map<String, Object> publicMetadata) {
        HttpHeaders headers = authHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = Map.of("public_metadata", publicMetadata);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        restTemplate.exchange(
            CLERK_API + "/users/" + userId + "/metadata",
            HttpMethod.PATCH,
            entity,
            JsonNode.class
        );
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(secretKey);
        return headers;
    }
}
