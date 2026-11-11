package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.dto.MessageResponse;
import com.learnspace.tutorportal.dto.SmartNoteRequest;
import com.learnspace.tutorportal.dto.SubExplanationRequest;
import com.learnspace.tutorportal.model.NoteSubExplanation;
import com.learnspace.tutorportal.model.SmartNote;
import com.learnspace.tutorportal.repository.SmartNoteRepository;
import com.learnspace.tutorportal.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class NotesController {

    @Autowired
    private SmartNoteRepository noteRepository;

    @GetMapping("/notes")
    public ResponseEntity<List<SmartNote>> getAllNotes(@RequestParam(required = false) String subject) {
        if (subject != null && !subject.isBlank() && !subject.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(noteRepository.findBySubjectIgnoreCaseOrderByCreatedAtDesc(subject));
        }
        return ResponseEntity.ok(noteRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/notes/{id}")
    public ResponseEntity<?> getNoteById(@PathVariable Long id) {
        return noteRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Smart note not found with id: " + id, false)));
    }

    @PostMapping("/tutor/notes")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createNote(
            @Valid @RequestBody SmartNoteRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        SmartNote note = new SmartNote(
                request.getTitle().trim(),
                request.getSubject().trim(),
                request.getChapter() != null ? request.getChapter().trim() : "Core Formulas",
                request.getFormula().trim(),
                request.getContent().trim(),
                userDetails.getId(),
                userDetails.getName()
        );

        if (request.getSubExplanations() != null) {
            for (SubExplanationRequest subReq : request.getSubExplanations()) {
                if (subReq.getTermLabel() != null && !subReq.getTermLabel().isBlank()) {
                    NoteSubExplanation sub = new NoteSubExplanation(
                            subReq.getTermKey() != null ? subReq.getTermKey().trim() : subReq.getTermLabel().trim(),
                            subReq.getTermLabel().trim(),
                            subReq.getExplanationTitle().trim(),
                            subReq.getExplanationContent().trim(),
                            subReq.getClipUrl()
                    );
                    note.addSubExplanation(sub);
                }
            }
        }

        SmartNote saved = noteRepository.save(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/tutor/notes/{id}")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return noteRepository.findById(id).<ResponseEntity<?>>map(note -> {
            boolean isOwner = note.getTutorId() != null && note.getTutorId().equals(userDetails.getId());
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isOwner && !isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You are not authorized to delete this note", false));
            }

            noteRepository.delete(note);
            return ResponseEntity.ok(new MessageResponse("Smart note deleted successfully", true));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Note not found", false)));
    }

    @PostMapping("/notes/{id}/like")
    public ResponseEntity<?> likeNote(@PathVariable Long id) {
        return noteRepository.findById(id).<ResponseEntity<?>>map(note -> {
            note.setLikes(note.getLikes() + 1);
            noteRepository.save(note);
            return ResponseEntity.ok(note);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Note not found", false)));
    }
}
