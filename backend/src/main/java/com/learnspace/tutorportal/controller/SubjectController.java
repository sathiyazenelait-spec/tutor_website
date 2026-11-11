package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.dto.MessageResponse;
import com.learnspace.tutorportal.model.SubjectEntity;
import com.learnspace.tutorportal.model.SubjectRequest;
import com.learnspace.tutorportal.repository.SubjectEntityRepository;
import com.learnspace.tutorportal.repository.SubjectRequestRepository;
import com.learnspace.tutorportal.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class SubjectController {

    @Autowired
    private SubjectEntityRepository subjectRepository;

    @Autowired
    private SubjectRequestRepository subjectRequestRepository;

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectEntity>> getActiveSubjects() {
        return ResponseEntity.ok(subjectRepository.findByStatusOrderByNameAsc("ACTIVE"));
    }

    // Tutor submits new subject request
    @PostMapping("/tutor/subject-requests")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> submitSubjectRequest(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        String subjectName = payload.get("subjectName");
        String description = payload.get("description");

        if (subjectName == null || subjectName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Subject name is required", false));
        }

        if (subjectRepository.existsByNameIgnoreCase(subjectName.trim())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Subject '" + subjectName + "' already exists in curriculum", false));
        }

        SubjectRequest request = new SubjectRequest(
                subjectName.trim(),
                description != null ? description.trim() : "",
                userDetails.getId(),
                userDetails.getName()
        );

        SubjectRequest saved = subjectRequestRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Subject suggestion submitted to Admin for verification and approval!",
                "request", saved
        ));
    }

    @GetMapping("/tutor/subject-requests")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getTutorSubjectRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(subjectRequestRepository.findByTutorIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    // Admin views all suggestions
    @GetMapping("/admin/subject-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminSubjectRequests() {
        return ResponseEntity.ok(subjectRequestRepository.findByOrderByCreatedAtDesc());
    }

    // Admin approves suggestion
    @PutMapping("/admin/subject-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveSubjectRequest(@PathVariable Long id) {
        return subjectRequestRepository.findById(id).<ResponseEntity<?>>map(req -> {
            req.setStatus("APPROVED");
            req.setAdminFeedback("Verified and approved by Administrator.");
            subjectRequestRepository.save(req);

            // Add to active subjects if not already exists
            if (!subjectRepository.existsByNameIgnoreCase(req.getSubjectName())) {
                SubjectEntity subject = new SubjectEntity(req.getSubjectName(), req.getDescription());
                subjectRepository.save(subject);
            }

            return ResponseEntity.ok(new MessageResponse("Subject '" + req.getSubjectName() + "' approved and added to active curriculum!", true));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Subject request not found", false)));
    }

    // Admin rejects suggestion
    @PutMapping("/admin/subject-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectSubjectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {

        return subjectRequestRepository.findById(id).<ResponseEntity<?>>map(req -> {
            req.setStatus("REJECTED");
            String reason = payload != null ? payload.getOrDefault("reason", "Curriculum quota met or insufficient prerequisite detail.") : "Not approved.";
            req.setAdminFeedback(reason);
            subjectRequestRepository.save(req);
            return ResponseEntity.ok(new MessageResponse("Subject request marked as rejected.", true));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Subject request not found", false)));
    }

    // Admin directly creates subject
    @PostMapping("/admin/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSubjectDirectly(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String desc = payload.get("description");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Subject name is required", false));
        }

        if (subjectRepository.existsByNameIgnoreCase(name.trim())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Subject already exists", false));
        }

        SubjectEntity entity = new SubjectEntity(name.trim(), desc != null ? desc.trim() : "");
        SubjectEntity saved = subjectRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Admin deletes subject
    @DeleteMapping("/admin/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        return subjectRepository.findById(id).<ResponseEntity<?>>map(subj -> {
            subjectRepository.delete(subj);
            return ResponseEntity.ok(new MessageResponse("Subject deleted successfully from H2 database", true));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Subject not found", false)));
    }
}
