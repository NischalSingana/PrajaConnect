package com.prajaconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${groq.api-key}")
    private String groqApiKey;

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private static final String SYSTEM_PROMPT = "You are a civic issue analyzer for PrajaConnect. Analyze the given title and description of a civic issue. Categorize it into one of: 'Infrastructure', 'Sanitation', 'Safety', or 'General'. Assign a priority: 'Low', 'Medium', 'High', or 'Critical'. Provide a confidence score (0-100). Return ONLY a JSON object with keys: category, priority, confidence.";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> analyzeIssue(String title, String description) {
        String userPrompt = "Title: " + title + "\nDescription: " + description;

        try {
            return callGroq(userPrompt);
        } catch (Exception groqError) {
            try {
                return callGemini(userPrompt);
            } catch (Exception geminiError) {
                throw new RuntimeException("All AI models failed");
            }
        }
    }

    private Map<String, Object> callGroq(String userPrompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(groqApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "model", "llama-3.3-70b-versatile",
            "response_format", Map.of("type", "json_object"),
            "messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", userPrompt)
            )
        );

        ResponseEntity<JsonNode> response = restTemplate.exchange(
            GROQ_URL, HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class
        );

        String content = response.getBody().path("choices").get(0).path("message").path("content").asText("{}");
        Map<String, Object> parsed = objectMapper.readValue(content, Map.class);
        parsed = new java.util.HashMap<>(parsed);
        parsed.put("model", "Groq Llama-3.3-70B");
        return parsed;
    }

    private Map<String, Object> callGemini(String userPrompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = SYSTEM_PROMPT + "\n\nUser Issue:\n" + userPrompt;
        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
            "generationConfig", Map.of("response_mime_type", "application/json")
        );

        String url = GEMINI_URL + "?key=" + geminiApiKey;
        ResponseEntity<JsonNode> response = restTemplate.exchange(
            url, HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class
        );

        String text = response.getBody().path("candidates").get(0).path("content").path("parts").get(0).path("text").asText("{}");
        Map<String, Object> parsed = objectMapper.readValue(text, Map.class);
        parsed = new java.util.HashMap<>(parsed);
        parsed.put("model", "Gemini 1.5-Flash");
        return parsed;
    }
}
