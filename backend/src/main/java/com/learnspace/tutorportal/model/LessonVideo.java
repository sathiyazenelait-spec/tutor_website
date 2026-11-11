package com.learnspace.tutorportal.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lesson_videos")
public class LessonVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject; // Mathematics, Physics, Chemistry, Biology

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 1000)
    private String videoUrl;

    private String duration; // e.g. "14:20"

    private Long tutorId;
    private String tutorName;

    private int likes = 0;
    private double rating = 5.0;
    private int ratingCount = 1;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "lessonVideo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<SubReferenceClip> subReferences = new ArrayList<>();

    public LessonVideo() {}

    public LessonVideo(String title, String subject, String description, String videoUrl, String duration, Long tutorId, String tutorName) {
        this.title = title;
        this.subject = subject;
        this.description = description;
        this.videoUrl = videoUrl;
        this.duration = duration;
        this.tutorId = tutorId;
        this.tutorName = tutorName;
        this.likes = 0;
        this.rating = 5.0;
        this.ratingCount = 1;
        this.createdAt = LocalDateTime.now();
    }

    public void addSubReference(SubReferenceClip clip) {
        subReferences.add(clip);
        clip.setLessonVideo(this);
    }

    public void removeSubReference(SubReferenceClip clip) {
        subReferences.remove(clip);
        clip.setLessonVideo(null);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getRatingCount() { return ratingCount; }
    public void setRatingCount(int ratingCount) { this.ratingCount = ratingCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<SubReferenceClip> getSubReferences() { return subReferences; }
    public void setSubReferences(List<SubReferenceClip> subReferences) { this.subReferences = subReferences; }
}
