package com.prajaconnect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.Set;
import java.util.UUID;

@Service
public class R2StorageService {

    private static final int  MAX_IMAGE_BYTES  = 10 * 1024 * 1024; // 10 MB
    private static final int  CONNECT_TIMEOUT  = 5_000;             // 5 s
    private static final int  READ_TIMEOUT     = 5_000;             // 5 s
    private static final Set<String> ALLOWED_MIME = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    @Value("${r2.account-id}")
    private String accountId;

    @Value("${r2.access-key-id}")
    private String accessKeyId;

    @Value("${r2.secret-access-key}")
    private String secretAccessKey;

    @Value("${r2.bucket-name}")
    private String bucket;

    @Value("${r2.public-url}")
    private String publicUrl;

    private S3Client s3;

    @PostConstruct
    public void init() {
        if (accountId.isBlank() || accessKeyId.isBlank() || secretAccessKey.isBlank()) {
            // R2 not configured; upload/download endpoints will return errors at call time
            return;
        }
        s3 = S3Client.builder()
            .region(Region.of("auto"))
            .endpointOverride(java.net.URI.create("https://" + accountId + ".r2.cloudflarestorage.com"))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            ))
            .build();
    }

    public String upload(MultipartFile file) throws Exception {
        if (s3 == null) throw new IllegalStateException("R2 storage is not configured");

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME.contains(contentType)) {
            throw new IllegalArgumentException(
                "Invalid file type. Allowed: JPEG, PNG, WebP, GIF."
            );
        }

        byte[] bytes = file.getBytes();
        if (!isValidMagicBytes(bytes, contentType)) {
            throw new IllegalArgumentException(
                "File content does not match the declared MIME type."
            );
        }

        String ext = contentType.split("/")[1].replace("jpeg", "jpg");
        String key = "issues/" + System.currentTimeMillis() + "-"
                     + UUID.randomUUID().toString().substring(0, 8) + "." + ext;

        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(contentType)
            .build();

        s3.putObject(request, RequestBody.fromBytes(bytes));
        return publicUrl + "/" + key;
    }

    public byte[] fetchBytes(String url) throws Exception {
        if (publicUrl.isBlank()) throw new IllegalStateException("R2 storage is not configured");
        HttpURLConnection conn = (HttpURLConnection) java.net.URI.create(url).toURL().openConnection();
        conn.setConnectTimeout(CONNECT_TIMEOUT);
        conn.setReadTimeout(READ_TIMEOUT);
        conn.connect();

        int reported = conn.getContentLength();
        if (reported > MAX_IMAGE_BYTES) {
            conn.disconnect();
            throw new IOException("Remote resource exceeds 10 MB size limit.");
        }

        try (var stream = conn.getInputStream()) {
            byte[] data = stream.readNBytes(MAX_IMAGE_BYTES + 1);
            if (data.length > MAX_IMAGE_BYTES) {
                throw new IOException("Remote resource exceeds 10 MB size limit.");
            }
            return data;
        } finally {
            conn.disconnect();
        }
    }

    private boolean isValidMagicBytes(byte[] b, String contentType) {
        if (b.length < 4) return false;
        return switch (contentType) {
            case "image/jpeg" -> b[0] == (byte) 0xFF && b[1] == (byte) 0xD8;
            case "image/png"  -> b[0] == (byte) 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47;
            case "image/gif"  -> b[0] == 0x47 && b[1] == 0x49 && b[2] == 0x46;
            case "image/webp" -> b.length >= 12 && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50;
            default           -> false;
        };
    }
}
