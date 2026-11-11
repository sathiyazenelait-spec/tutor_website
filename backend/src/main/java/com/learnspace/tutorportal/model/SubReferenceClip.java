package com.learnspace.tutorportal.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "sub_reference_clips")
public class SubReferenceClip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String timestamp; // e.g. "02:15"

    @Column(nullable = false)
    private String keypointTitle; // e.g. "(a + b)² Expansion Proof"

    @Column(nullable = false)
    private String formulaOrConcept; // e.g. "(a + b)² = a² + 2ab + b²"

    @Column(length = 1000)
    private String clipVideoUrl;

    @Column(length = 1000)
    private String explanation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_video_id")
    @JsonBackReference
    private LessonVideo lessonVideo;

    public SubReferenceClip() {}

    public SubReferenceClip(String timestamp, String keypointTitle, String formulaOrConcept, String clipVideoUrl, String explanation) {
        this.timestamp = timestamp;
        this.keypointTitle = keypointTitle;
        this.formulaOrConcept = formulaOrConcept;
        this.clipVideoUrl = clipVideoUrl;
        this.explanation = explanation;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getKeypointTitle() { return keypointTitle; }
    public void setKeypointTitle(String keypointTitle) { this.keypointTitle = keypointTitle; }

    public String getFormulaOrConcept() { return formulaOrConcept; }
    public void setFormulaOrConcept(String formulaOrConcept) { this.formulaOrConcept = formulaOrConcept; }

    public String getClipVideoUrl() { return clipVideoUrl; }
    public void setClipVideoUrl(String clipVideoUrl) { this.clipVideoUrl = clipVideoUrl; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LessonVideo getLessonVideo() { return lessonVideo; }
    public void setLessonVideo(LessonVideo lessonVideo) { this.lessonVideo = lessonVideo; }
}
