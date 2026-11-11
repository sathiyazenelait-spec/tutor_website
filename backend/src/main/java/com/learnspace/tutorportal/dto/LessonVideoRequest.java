package com.learnspace.tutorportal.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class LessonVideoRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Subject is required")
    private String subject; // Mathematics, Physics, Chemistry, Biology

    private String description;

    @NotBlank(message = "Video URL is required")
    private String videoUrl;

    private String duration;

    private List<SubReferenceRequest> subReferences = new ArrayList<>();

    public LessonVideoRequest() {}

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

    public List<SubReferenceRequest> getSubReferences() { return subReferences; }
    public void setSubReferences(List<SubReferenceRequest> subReferences) { this.subReferences = subReferences; }
}
