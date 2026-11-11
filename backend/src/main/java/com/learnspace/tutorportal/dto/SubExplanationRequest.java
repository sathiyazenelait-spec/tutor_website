package com.learnspace.tutorportal.dto;

import jakarta.validation.constraints.NotBlank;

public class SubExplanationRequest {
    @NotBlank(message = "Term key is required")
    private String termKey;

    @NotBlank(message = "Term label is required")
    private String termLabel;

    @NotBlank(message = "Explanation title is required")
    private String explanationTitle;

    @NotBlank(message = "Explanation content is required")
    private String explanationContent;

    private String clipUrl;

    public SubExplanationRequest() {}

    public SubExplanationRequest(String termKey, String termLabel, String explanationTitle, String explanationContent, String clipUrl) {
        this.termKey = termKey;
        this.termLabel = termLabel;
        this.explanationTitle = explanationTitle;
        this.explanationContent = explanationContent;
        this.clipUrl = clipUrl;
    }

    public String getTermKey() { return termKey; }
    public void setTermKey(String termKey) { this.termKey = termKey; }

    public String getTermLabel() { return termLabel; }
    public void setTermLabel(String termLabel) { this.termLabel = termLabel; }

    public String getExplanationTitle() { return explanationTitle; }
    public void setExplanationTitle(String explanationTitle) { this.explanationTitle = explanationTitle; }

    public String getExplanationContent() { return explanationContent; }
    public void setExplanationContent(String explanationContent) { this.explanationContent = explanationContent; }

    public String getClipUrl() { return clipUrl; }
    public void setClipUrl(String clipUrl) { this.clipUrl = clipUrl; }
}

