package com.learnspace.tutorportal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "video_ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"lessonVideoId", "userId"})
})
public class VideoRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lessonVideoId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private int ratingValue; // 1 to 5

    public VideoRating() {}

    public VideoRating(Long lessonVideoId, Long userId, int ratingValue) {
        this.lessonVideoId = lessonVideoId;
        this.userId = userId;
        this.ratingValue = ratingValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLessonVideoId() { return lessonVideoId; }
    public void setLessonVideoId(Long lessonVideoId) { this.lessonVideoId = lessonVideoId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public int getRatingValue() { return ratingValue; }
    public void setRatingValue(int ratingValue) { this.ratingValue = ratingValue; }
}
