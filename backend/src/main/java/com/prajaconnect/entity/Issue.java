package com.prajaconnect.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
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

    public Issue() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }
    public String getAssignedPoliticianId() { return assignedPoliticianId; }
    public void setAssignedPoliticianId(String assignedPoliticianId) { this.assignedPoliticianId = assignedPoliticianId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getAiCategoryConfidence() { return aiCategoryConfidence; }
    public void setAiCategoryConfidence(Integer aiCategoryConfidence) { this.aiCategoryConfidence = aiCategoryConfidence; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }
    public String getEscalationLevel() { return escalationLevel; }
    public void setEscalationLevel(String escalationLevel) { this.escalationLevel = escalationLevel; }
    public Boolean getIsPetition() { return isPetition; }
    public void setIsPetition(Boolean isPetition) { this.isPetition = isPetition; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }
    public Integer getPetitionTarget() { return petitionTarget; }
    public void setPetitionTarget(Integer petitionTarget) { this.petitionTarget = petitionTarget; }
    public Integer getCommentsCount() { return commentsCount; }
    public void setCommentsCount(Integer commentsCount) { this.commentsCount = commentsCount; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public Boolean getFlagged() { return flagged; }
    public void setFlagged(Boolean flagged) { this.flagged = flagged; }
    public String getFlagReason() { return flagReason; }
    public void setFlagReason(String flagReason) { this.flagReason = flagReason; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
