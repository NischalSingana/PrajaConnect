package com.prajaconnect.repository;

import com.prajaconnect.entity.IssueUpvote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueUpvoteRepository extends JpaRepository<IssueUpvote, Long> {
    boolean existsByIssueIdAndUserId(String issueId, String userId);
}
