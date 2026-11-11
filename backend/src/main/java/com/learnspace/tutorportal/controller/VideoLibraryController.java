package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.dto.LessonVideoRequest;
import com.learnspace.tutorportal.dto.MessageResponse;
import com.learnspace.tutorportal.dto.SubReferenceRequest;
import com.learnspace.tutorportal.model.LessonVideo;
import com.learnspace.tutorportal.model.SubReferenceClip;
import com.learnspace.tutorportal.repository.LessonVideoRepository;
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
public class VideoLibraryController {

    @Autowired
    private LessonVideoRepository videoRepository;

    @GetMapping("/videos")
    public ResponseEntity<List<LessonVideo>> getAllVideos(@RequestParam(required = false) String subject) {
        List<LessonVideo> videos;
        if (subject != null && !subject.isBlank() && !subject.equalsIgnoreCase("All")) {
            videos = videoRepository.findBySubjectIgnoreCaseOrderByCreatedAtDesc(subject);
        } else {
            videos = videoRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/videos/{id}")
    public ResponseEntity<?> getVideoById(@PathVariable Long id) {
        return videoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Video lesson not found with id: " + id, false)));
    }

    @PostMapping("/tutor/videos")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createVideoLesson(
            @Valid @RequestBody LessonVideoRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        LessonVideo video = new LessonVideo(
                request.getTitle().trim(),
                request.getSubject().trim(),
                request.getDescription(),
                request.getVideoUrl().trim(),
                request.getDuration() != null ? request.getDuration() : "15:00",
                userDetails.getId(),
                userDetails.getName()
        );

        if (request.getSubReferences() != null) {
            for (SubReferenceRequest subReq : request.getSubReferences()) {
                if (subReq.getKeypointTitle() != null && !subReq.getKeypointTitle().isBlank()) {
                    SubReferenceClip clip = new SubReferenceClip(
                            subReq.getTimestamp(),
                            subReq.getKeypointTitle().trim(),
                            subReq.getFormulaOrConcept().trim(),
                            subReq.getClipVideoUrl(),
                            subReq.getExplanation()
                    );
                    video.addSubReference(clip);
                }
            }
        }

        LessonVideo saved = videoRepository.save(video);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/tutor/videos/{id}/subreferences")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addSubReference(
            @PathVariable Long id,
            @Valid @RequestBody SubReferenceRequest subReq) {

        return videoRepository.findById(id).<ResponseEntity<?>>map(video -> {
            SubReferenceClip clip = new SubReferenceClip(
                    subReq.getTimestamp(),
                    subReq.getKeypointTitle().trim(),
                    subReq.getFormulaOrConcept().trim(),
                    subReq.getClipVideoUrl(),
                    subReq.getExplanation()
            );
            video.addSubReference(clip);
            videoRepository.save(video);
            return ResponseEntity.ok(video);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Video not found", false)));
    }

    @DeleteMapping("/tutor/videos/{id}")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteVideoLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return videoRepository.findById(id).<ResponseEntity<?>>map(video -> {
            boolean isOwner = video.getTutorId() != null && video.getTutorId().equals(userDetails.getId());
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isOwner && !isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You are not authorized to delete this video", false));
            }

            videoRepository.delete(video);
            return ResponseEntity.ok(new MessageResponse("Video lesson deleted successfully", true));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Video not found", false)));
    }
}
