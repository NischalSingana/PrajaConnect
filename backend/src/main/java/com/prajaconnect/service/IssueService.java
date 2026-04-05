package com.prajaconnect.service;

import com.prajaconnect.entity.Issue;
import com.prajaconnect.entity.IssueUpvote;
import com.prajaconnect.entity.Notification;
import com.prajaconnect.repository.IssueRepository;
import com.prajaconnect.repository.IssueUpvoteRepository;
import com.prajaconnect.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class IssueService {

    private static final List<String> VALID_STATUSES = List.of("Pending", "In Progress", "Resolved", "Escalated");
    private static final Set<String>  STATUS_ROLES   = Set.of("politician", "moderator", "admin");
    private static final Set<String>  RESPOND_ROLES  = Set.of("politician", "admin");
    private static final Set<String>  FLAG_ROLES     = Set.of("moderator", "admin");

    private final IssueRepository issueRepository;
    private final IssueUpvoteRepository issueUpvoteRepository;
    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public IssueService(IssueRepository issueRepository,
                        IssueUpvoteRepository issueUpvoteRepository,
                        NotificationRepository notificationRepository,
                        UserService userService) {
        this.issueRepository = issueRepository;
        this.issueUpvoteRepository = issueUpvoteRepository;
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    public List<Issue> findAll() {
        return issueRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Issue> findByReporter(String reporterId) {
        return issueRepository.findByReporterIdOrderByCreatedAtDesc(reporterId);
    }

    public void deleteByOwner(String id, String callerId) {
        Issue issue = findOrThrow(id);
        if (!issue.getReporterId().equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own issues");
        }
        issueRepository.deleteById(id);
    }

    public Issue create(String userId, Map<String, Object> body) {
        String priority = (String) body.getOrDefault("priority", "Medium");
        int slaHours = switch (priority) {
            case "Critical" -> 12;
            case "High"     -> 24;
            case "Low"      -> 72;
            default          -> 48;
        };

        Issue issue = new Issue();
        issue.setId("ISS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
        issue.setTitle((String) body.get("title"));
        issue.setDescription((String) body.get("description"));
        issue.setReporterId(userId);
        issue.setCategory((String) body.get("category"));
        issue.setPriority(priority);
        issue.setStatus("Pending");
        issue.setLocation((String) body.get("location"));
        issue.setSlaDeadline(LocalDateTime.now().plusHours(slaHours));
        issue.setEscalationLevel("Normal");
        issue.setIsPetition(Boolean.TRUE.equals(body.get("isPetition")));
        issue.setImageUrl((String) body.get("imageUrl"));
        issue.setUpvotes(0);
        issue.setFlagged(false);

        if (body.get("aiCategoryConfidence") instanceof Number n) issue.setAiCategoryConfidence(n.intValue());
        if (body.get("lat")             instanceof Number n) issue.setLat(n.doubleValue());
        if (body.get("lng")             instanceof Number n) issue.setLng(n.doubleValue());
        if (body.get("petitionTarget")  instanceof Number n) issue.setPetitionTarget(n.intValue());

        Issue saved = issueRepository.save(issue);
        saveNotification(userId, "STATUS_CHANGE", "Issue Reported Successfully",
            "Your report \"" + saved.getTitle() + "\" has been submitted and is being reviewed.",
            saved.getId());
        return saved;
    }

    public Issue upvote(String id, String userId) {
        Issue issue = findOrThrow(id);
        if (issueUpvoteRepository.existsByIssueIdAndUserId(id, userId)) {
            return issue;
        }
        IssueUpvote vote = new IssueUpvote();
        vote.setIssueId(id);
        vote.setUserId(userId);
        issueUpvoteRepository.save(vote);
        issue.setUpvotes(issue.getUpvotes() + 1);
        return issueRepository.save(issue);
    }

    public Issue updateStatus(String id, String status, String callerId) {
        requireRole(callerId, STATUS_ROLES, "update issue status");
        if (!VALID_STATUSES.contains(status)) throw new IllegalArgumentException("Invalid status");
        Issue issue = findOrThrow(id);
        issue.setStatus(status);
        issue.setResolvedAt("Resolved".equals(status) ? LocalDateTime.now() : null);
        Issue saved = issueRepository.save(issue);
        saveNotification(saved.getReporterId(), "STATUS_CHANGE", "Issue Status Updated",
            "Your report \"" + saved.getTitle() + "\" is now \"" + status + "\".", saved.getId());
        return saved;
    }

    public Issue respond(String id, String response, String callerId) {
        requireRole(callerId, RESPOND_ROLES, "post an official response");
        if (response == null || response.isBlank()) throw new IllegalArgumentException("Response text required");
        Issue issue = findOrThrow(id);
        issue.setResponse(response);
        Issue saved = issueRepository.save(issue);
        saveNotification(saved.getReporterId(), "REPLY", "Official Response Received",
            "An official has responded to your report \"" + saved.getTitle() + "\".", saved.getId());
        return saved;
    }

    public Issue flag(String id, boolean flagged, String flagReason, String callerId) {
        requireRole(callerId, FLAG_ROLES, "flag issues");
        Issue issue = findOrThrow(id);
        issue.setFlagged(flagged);
        issue.setFlagReason(flagReason);
        return issueRepository.save(issue);
    }

    private Issue findOrThrow(String id) {
        return issueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
    }

    private void requireRole(String userId, Set<String> allowed, String action) {
        String role = userService.getRoleOrDefault(userId);
        if (!allowed.contains(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Role '" + role + "' is not permitted to " + action);
        }
    }

    private void saveNotification(String userId, String type, String title, String message, String issueId) {
        try {
            Notification n = new Notification();
            n.setId(UUID.randomUUID().toString());
            n.setUserId(userId);
            n.setType(type);
            n.setTitle(title);
            n.setMessage(message);
            n.setLinkToIssueId(issueId);
            n.setIsRead(false);
            notificationRepository.save(n);
        } catch (Exception ignored) {}
    }
}
