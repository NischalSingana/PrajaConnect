package com.prajaconnect.controller;

import com.prajaconnect.service.R2StorageService;
import com.prajaconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ImageController {

    private final R2StorageService r2StorageService;
    private final UserService userService;

    @Value("${r2.public-url:}")
    private String r2PublicUrl;

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam("image") MultipartFile file
    ) {
        userService.getOrCreate(jwt.getSubject());
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image file provided"));
        }
        try {
            String url = r2StorageService.upload(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Image upload failed"));
        }
    }

    @GetMapping("/proxy-image")
    public ResponseEntity<byte[]> proxyImage(
        @RequestParam String url,
        @RequestParam(required = false, defaultValue = "image.jpg") String filename
    ) {
        // Fail closed: if R2_PUBLIC_URL is not configured, or URL doesn't start with it, reject
        if (r2PublicUrl.isEmpty() || !url.startsWith(r2PublicUrl)) {
            return ResponseEntity.status(403).build();
        }
        try {
            byte[] bytes = r2StorageService.fetchBytes(url);
            String safeFilename = filename.replaceAll("[^a-zA-Z0-9._\\-]", "_");
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFilename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }
}
