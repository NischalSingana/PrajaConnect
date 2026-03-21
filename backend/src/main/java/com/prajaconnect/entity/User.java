package com.prajaconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
