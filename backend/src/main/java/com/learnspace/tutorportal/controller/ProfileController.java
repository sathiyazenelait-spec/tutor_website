package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.dto.MessageResponse;
import com.learnspace.tutorportal.model.Role;
import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.repository.LessonVideoRepository;
import com.learnspace.tutorportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonVideoRepository videoRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        return userRepository.findById(userId).<ResponseEntity<?>>map(user -> {
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("name", user.getName());
            profile.put("email", user.getEmail());
            profile.put("role", user.getRole().name());
            profile.put("idNumber", user.getIdNumber() != null ? user.getIdNumber() :
                    (user.getRole() == Role.ROLE_TUTOR ? "LS-TUT-2026-" + String.format("%03d", user.getId()) : "LS-STU-2026-" + String.format("%03d", user.getId())));
            profile.put("institution", user.getInstitution());
            profile.put("grade", user.getGrade());
            profile.put("specialization", user.getSpecialization());
            profile.put("verified", user.isVerified());
            profile.put("createdAt", user.getCreatedAt().toString());

            if (user.getRole() == Role.ROLE_TUTOR) {
                profile.put("totalUploadedLessons", videoRepository.findByTutorIdOrderByCreatedAtDesc(user.getId()).size());
                profile.put("rating", 4.9);
                profile.put("accreditation", "Certified LearnSpace Haven Master Educator");
            } else {
                profile.put("studentLevel", "High School Honor Scholar");
            }

            return ResponseEntity.ok(profile);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Profile not found", false)));
    }
}
