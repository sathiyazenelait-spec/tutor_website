package com.learnspace.tutorportal.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class SmartNoteRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String chapter;

    @NotBlank(message = "Formula is required")
    private String formula;

    @NotBlank(message = "Content is required")
    private String content;

    private List<SubExplanationRequest> subExplanations = new ArrayList<>();

    public SmartNoteRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getChapter() { return chapter; }
    public void setChapter(String chapter) { this.chapter = chapter; }

    public String getFormula() { return formula; }
    public void setFormula(String formula) { this.formula = formula; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<SubExplanationRequest> getSubExplanations() { return subExplanations; }
    public void setSubExplanations(List<SubExplanationRequest> subExplanations) { this.subExplanations = subExplanations; }
}
