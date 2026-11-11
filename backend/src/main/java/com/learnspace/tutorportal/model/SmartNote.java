package com.learnspace.tutorportal.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "smart_notes")
public class SmartNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject; // Mathematics, Physics, Chemistry, Biology

    private String chapter;

    @Column(nullable = false)
    private String formula; // e.g. (a + b)² = a² + 2ab + b²

    @Column(length = 4000, nullable = false)
    private String content;

    private Long tutorId;
    private String tutorName;

    private int likes = 0;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "smartNote", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<NoteSubExplanation> subExplanations = new ArrayList<>();

    public SmartNote() {}

    public SmartNote(String title, String subject, String chapter, String formula, String content, Long tutorId, String tutorName) {
        this.title = title;
        this.subject = subject;
        this.chapter = chapter;
        this.formula = formula;
        this.content = content;
        this.tutorId = tutorId;
        this.tutorName = tutorName;
        this.likes = 0;
        this.createdAt = LocalDateTime.now();
    }

    public void addSubExplanation(NoteSubExplanation sub) {
        subExplanations.add(sub);
        sub.setSmartNote(this);
    }

    public void removeSubExplanation(NoteSubExplanation sub) {
        subExplanations.remove(sub);
        sub.setSmartNote(null);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<NoteSubExplanation> getSubExplanations() { return subExplanations; }
    public void setSubExplanations(List<NoteSubExplanation> subExplanations) { this.subExplanations = subExplanations; }
}
