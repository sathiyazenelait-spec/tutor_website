package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.dto.MessageResponse;
import com.learnspace.tutorportal.model.LessonVideo;
import com.learnspace.tutorportal.model.SharedLesson;
import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.model.VideoComment;
import com.learnspace.tutorportal.model.VideoRating;
import com.learnspace.tutorportal.repository.LessonVideoRepository;
import com.learnspace.tutorportal.repository.SharedLessonRepository;
import com.learnspace.tutorportal.repository.UserRepository;
import com.learnspace.tutorportal.repository.VideoCommentRepository;
import com.learnspace.tutorportal.repository.VideoRatingRepository;
import com.learnspace.tutorportal.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class SocialController {

    @Autowired
    private LessonVideoRepository videoRepository;

    @Autowired
    private VideoCommentRepository commentRepository;

    @Autowired
    private VideoRatingRepository ratingRepository;

    @Autowired
    private SharedLessonRepository sharedLessonRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/videos/{id}/like")
    public ResponseEntity<?> likeVideo(@PathVariable Long id) {
        return videoRepository.findById(id).<ResponseEntity<?>>map(video -> {
            video.setLikes(video.getLikes() + 1);
            videoRepository.save(video);
            return ResponseEntity.ok(Map.of("likes", video.getLikes(), "message", "Video liked!"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Video not found", false)));
    }

    @PostMapping("/videos/{id}/rate")
    public ResponseEntity<?> rateVideo(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        int ratingValue = payload.getOrDefault("rating", 5);
        if (ratingValue < 1) ratingValue = 1;
        if (ratingValue > 5) ratingValue = 5;

        final int finalRating = ratingValue;
        return videoRepository.findById(id).<ResponseEntity<?>>map(video -> {
            Long userId = userDetails != null ? userDetails.getId() : 1L;

            ratingRepository.findByLessonVideoIdAndUserId(id, userId).ifPresentOrElse(existing -> {
                existing.setRatingValue(finalRating);
                ratingRepository.save(existing);
            }, () -> {
                VideoRating newRating = new VideoRating(id, userId, finalRating);
                ratingRepository.save(newRating);
                video.setRatingCount(video.getRatingCount() + 1);
            });

            // Recalculate average
            double currentRating = video.getRating();
            double newAvg = Math.round(((currentRating + finalRating) / 2.0) * 10.0) / 10.0;
            video.setRating(newAvg);
            videoRepository.save(video);

            return ResponseEntity.ok(Map.of("rating", video.getRating(), "ratingCount", video.getRatingCount(), "message", "Rating submitted!"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Video not found", false)));
    }

    @GetMapping("/videos/{id}/comments")
    public ResponseEntity<List<VideoComment>> getVideoComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentRepository.findByLessonVideoIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/videos/{id}/comments")
    public ResponseEntity<?> postComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Comment content cannot be empty", false));
        }

        Long userId = userDetails != null ? userDetails.getId() : 1L;
        String userName = userDetails != null ? userDetails.getName() : "Anonymous Student";
        String userRole = userDetails != null ? userDetails.getRole() : "ROLE_STUDENT";

        VideoComment comment = new VideoComment(id, userId, userName, userRole, content.trim());
        VideoComment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/videos/{id}/share")
    public ResponseEntity<?> shareLessonWithFriend(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Please log in to share lessons with friends", false));
        }

        Number receiverIdNum = (Number) payload.get("receiverId");
        if (receiverIdNum == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Receiver friend ID is required", false));
        }
        Long receiverId = receiverIdNum.longValue();
        String message = (String) payload.getOrDefault("message", "Check out this lesson with interactive formula clips!");

        LessonVideo video = videoRepository.findById(id).orElse(null);
        if (video == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Video not found", false));
        }

        User friend = userRepository.findById(receiverId).orElse(null);
        if (friend == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Friend not found", false));
        }

        SharedLesson shared = new SharedLesson(
                userDetails.getId(),
                userDetails.getName(),
                friend.getId(),
                friend.getName(),
                video.getId(),
                video.getTitle(),
                video.getSubject(),
                message
        );

        sharedLessonRepository.save(shared);
        return ResponseEntity.ok(Map.of("message", "Lesson shared successfully with " + friend.getName() + "!", "shared", shared));
    }

    @GetMapping("/social/shared-with-me")
    public ResponseEntity<?> getSharedWithMe(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(sharedLessonRepository.findByReceiverIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @GetMapping("/social/recent-sent")
    public ResponseEntity<?> getRecentSentFriends(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) return ResponseEntity.ok(List.of());
        List<SharedLesson> sent = sharedLessonRepository.findBySenderIdOrderByCreatedAtDesc(userDetails.getId());
        List<Map<String, Object>> recents = sent.stream()
                .map(s -> Map.<String, Object>of("friendId", s.getReceiverId(), "friendName", s.getReceiverName()))
                .distinct()
                .limit(5)
                .toList();
        return ResponseEntity.ok(recents);
    }
}
