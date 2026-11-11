package com.learnspace.tutorportal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "video_comments")
public class VideoComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lessonVideoId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String userName;

    private String userRole; // ROLE_STUDENT or ROLE_TUTOR

    @Column(nullable = false, length = 1500)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    public VideoComment() {}

    public VideoComment(Long lessonVideoId, Long userId, String userName, String userRole, String content) {
        this.lessonVideoId = lessonVideoId;
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLessonVideoId() { return lessonVideoId; }
    public void setLessonVideoId(Long lessonVideoId) { this.lessonVideoId = lessonVideoId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
