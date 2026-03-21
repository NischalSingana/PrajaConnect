package com.prajaconnect.repository;

import com.prajaconnect.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, String> {

    List<Issue> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);

    @Query("SELECT i FROM Issue i WHERE i.status = 'Resolved' AND i.resolvedAt IS NOT NULL")
    List<Issue> findResolvedWithTimestamp();
}
