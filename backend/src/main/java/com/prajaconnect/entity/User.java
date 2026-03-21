package com.prajaconnect.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "role", nullable = false)
    private String role = "citizen";

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "reputation_score")
    private Integer reputationScore = 0;

    @Column(name = "district")
    private String district;

    @Column(name = "transparency_score")
    private Integer transparencyScore = 0;

    @Column(name = "avg_response_time_hours")
    private Double avgResponseTimeHours = 0.0;

    @Column(name = "resolution_rate")
    private Integer resolutionRate = 0;

    @Column(name = "citizen_rating")
    private Double citizenRating = 0.0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Integer getReputationScore() { return reputationScore; }
    public void setReputationScore(Integer reputationScore) { this.reputationScore = reputationScore; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public Integer getTransparencyScore() { return transparencyScore; }
    public void setTransparencyScore(Integer transparencyScore) { this.transparencyScore = transparencyScore; }
    public Double getAvgResponseTimeHours() { return avgResponseTimeHours; }
    public void setAvgResponseTimeHours(Double avgResponseTimeHours) { this.avgResponseTimeHours = avgResponseTimeHours; }
    public Integer getResolutionRate() { return resolutionRate; }
    public void setResolutionRate(Integer resolutionRate) { this.resolutionRate = resolutionRate; }
    public Double getCitizenRating() { return citizenRating; }
    public void setCitizenRating(Double citizenRating) { this.citizenRating = citizenRating; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
