package com.learnspace.tutorportal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shared_lessons")
public class SharedLesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private Long lessonVideoId;

    @Column(nullable = false)
    private String lessonTitle;

    private String subject;

    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    public SharedLesson() {}

    public SharedLesson(Long senderId, String senderName, Long receiverId, String receiverName, Long lessonVideoId, String lessonTitle, String subject, String message) {
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
        this.lessonVideoId = lessonVideoId;
        this.lessonTitle = lessonTitle;
        this.subject = subject;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public Long getLessonVideoId() { return lessonVideoId; }
    public void setLessonVideoId(Long lessonVideoId) { this.lessonVideoId = lessonVideoId; }

    public String getLessonTitle() { return lessonTitle; }
    public void setLessonTitle(String lessonTitle) { this.lessonTitle = lessonTitle; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
