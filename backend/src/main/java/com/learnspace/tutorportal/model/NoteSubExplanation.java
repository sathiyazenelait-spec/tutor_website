package com.learnspace.tutorportal.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "note_sub_explanations")
public class NoteSubExplanation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String termKey; // unique identifier in the text, e.g. "2ab", "a2", "diff"

    @Column(nullable = false)
    private String termLabel; // the word/line to render as interactive button

    @Column(nullable = false)
    private String explanationTitle;

    @Column(length = 2000, nullable = false)
    private String explanationContent;

    private String clipUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "smart_note_id")
    @JsonBackReference
    private SmartNote smartNote;

    public NoteSubExplanation() {}

    public NoteSubExplanation(String termKey, String termLabel, String explanationTitle, String explanationContent, String clipUrl) {
        this.termKey = termKey;
        this.termLabel = termLabel;
        this.explanationTitle = explanationTitle;
        this.explanationContent = explanationContent;
        this.clipUrl = clipUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public SmartNote getSmartNote() { return smartNote; }
    public void setSmartNote(SmartNote smartNote) { this.smartNote = smartNote; }
}
