package com.prajaconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "reporter_id", nullable = false)
    private String reporterId;

    @Column(name = "assigned_politician_id")
    private String assignedPoliticianId;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "ai_category_confidence")
    private Integer aiCategoryConfidence;

    @Column(name = "priority", nullable = false)
    private String priority = "Medium";

    @Column(name = "status", nullable = false)
    private String status = "Pending";

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "sla_deadline", nullable = false)
    private LocalDateTime slaDeadline;

    @Column(name = "escalation_level", nullable = false)
    private String escalationLevel = "Normal";

    @Column(name = "is_petition", nullable = false)
    private Boolean isPetition = false;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "upvotes", nullable = false)
    private Integer upvotes = 0;

    @Column(name = "petition_target")
    private Integer petitionTarget;

    @Column(name = "comments_count", nullable = false)
    private Integer commentsCount = 0;

    @Column(name = "response", columnDefinition = "text")
    private String response;

    @Column(name = "flagged", nullable = false)
    private Boolean flagged = false;

    @Column(name = "flag_reason")
    private String flagReason;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
