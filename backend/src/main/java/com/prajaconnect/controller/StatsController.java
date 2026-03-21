package com.prajaconnect.controller;

import com.prajaconnect.entity.Issue;
import com.prajaconnect.repository.IssueRepository;
import com.prajaconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StatsController {

    private final UserRepository userRepository;
    private final IssueRepository issueRepository;

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        long citizens  = userRepository.count();
        long issueCount = issueRepository.count();
        long resolved  = issueRepository.countByStatus("Resolved");

        List<Issue> withTimestamp = issueRepository.findResolvedWithTimestamp().stream()
            .filter(i -> i.getResolvedAt() != null)
            .collect(Collectors.toList());

        String avgResponseTime = "0";
        if (!withTimestamp.isEmpty()) {
            double totalHours = withTimestamp.stream()
                .mapToDouble(i -> Duration.between(i.getCreatedAt(), i.getResolvedAt()).toHours())
                .sum();
            long avg = Math.round(totalHours / withTimestamp.size());
            avgResponseTime = avg + "h";
        }

        return Map.of(
            "citizens", citizens,
            "issues", issueCount,
            "resolved", resolved,
            "avgResponseTime", avgResponseTime
        );
    }
}
