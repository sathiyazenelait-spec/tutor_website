package com.learnspace.tutorportal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subject_requests")
public class SubjectRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subjectName;

    @Column(length = 1500)
    private String description;

    @Column(nullable = false)
    private Long tutorId;

    @Column(nullable = false)
    private String tutorName;

    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    private String adminFeedback;

    private LocalDateTime createdAt = LocalDateTime.now();

    public SubjectRequest() {}

    public SubjectRequest(String subjectName, String description, Long tutorId, String tutorName) {
        this.subjectName = subjectName;
        this.description = description;
        this.tutorId = tutorId;
        this.tutorName = tutorName;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminFeedback() { return adminFeedback; }
    public void setAdminFeedback(String adminFeedback) { this.adminFeedback = adminFeedback; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
