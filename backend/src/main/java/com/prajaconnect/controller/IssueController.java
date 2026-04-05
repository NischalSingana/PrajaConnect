package com.prajaconnect.controller;

import com.prajaconnect.service.AiService;
import com.prajaconnect.service.IssueService;
import com.prajaconnect.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class IssueController {

    private final IssueService issueService;
    private final UserService userService;
    private final AiService aiService;

    public IssueController(IssueService issueService, UserService userService, AiService aiService) {
        this.issueService = issueService;
        this.userService  = userService;
        this.aiService    = aiService;
    }

    @GetMapping("/issues")
    public ResponseEntity<?> getAllIssues() {
        return ResponseEntity.ok(issueService.findAll());
    }

    @GetMapping("/issues/{id}")
    public ResponseEntity<?> getIssueById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(issueService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", "Issue not found"));
        }
    }

    @GetMapping("/issues/my")
    public ResponseEntity<?> getMyIssues(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(issueService.findByReporter(jwt.getSubject()));
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable String id,
                                          @AuthenticationPrincipal Jwt jwt) {
        try {
            issueService.deleteByOwner(id, jwt.getSubject());
            return ResponseEntity.noContent().build();
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/issues")
    public ResponseEntity<?> createIssue(@AuthenticationPrincipal Jwt jwt,
                                          @RequestBody Map<String, Object> body) {
        String userId = jwt.getSubject();
        userService.getOrCreate(userId);
        try {
            return ResponseEntity.status(201).body(issueService.create(userId, body));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create issue", "message", e.getMessage()));
        }
    }

    @PostMapping("/issues/{id}/upvote")
    public ResponseEntity<?> upvote(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        userService.getOrCreate(userId);
        try {
            return ResponseEntity.ok(issueService.upvote(id, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/issues/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @AuthenticationPrincipal Jwt jwt,
                                           @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(issueService.updateStatus(id, body.get("status"), jwt.getSubject()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/issues/{id}/respond")
    public ResponseEntity<?> respond(@PathVariable String id,
                                      @AuthenticationPrincipal Jwt jwt,
                                      @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(issueService.respond(id, body.get("response"), jwt.getSubject()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/issues/{id}/flag")
    public ResponseEntity<?> flag(@PathVariable String id,
                                   @AuthenticationPrincipal Jwt jwt,
                                   @RequestBody Map<String, Object> body) {
        try {
            boolean flagged   = Boolean.TRUE.equals(body.get("flagged"));
            String flagReason = (String) body.get("flagReason");
            return ResponseEntity.ok(issueService.flag(id, flagged, flagReason, jwt.getSubject()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/analyze-issue")
    public ResponseEntity<?> analyzeIssue(@RequestBody Map<String, String> body) {
        String title       = body.get("title");
        String description = body.get("description");
        if (title == null || description == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title and description are required"));
        }
        try {
            return ResponseEntity.ok(aiService.analyzeIssue(title, description));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "All AI models failed"));
        }
    }
}
