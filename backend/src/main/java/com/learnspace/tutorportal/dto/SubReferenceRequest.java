package com.learnspace.tutorportal.dto;

import jakarta.validation.constraints.NotBlank;

public class SubReferenceRequest {
    private String timestamp; // e.g. "03:15"

    @NotBlank(message = "Keypoint title is required")
    private String keypointTitle; // e.g. "(a+b)² Formula"

    @NotBlank(message = "Formula or concept is required")
    private String formulaOrConcept; // e.g. "(a + b)² = a² + 2ab + b²"

    private String clipVideoUrl;
    private String explanation;

    public SubReferenceRequest() {}

    public SubReferenceRequest(String timestamp, String keypointTitle, String formulaOrConcept, String clipVideoUrl, String explanation) {
        this.timestamp = timestamp;
        this.keypointTitle = keypointTitle;
        this.formulaOrConcept = formulaOrConcept;
        this.clipVideoUrl = clipVideoUrl;
        this.explanation = explanation;
    }

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
}

