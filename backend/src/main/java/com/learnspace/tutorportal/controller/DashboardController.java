package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.repository.UserRepository;
import com.learnspace.tutorportal.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/public/status")
    public ResponseEntity<?> getPublicStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "LearnSpace Tutor Haven Auth Service");
        response.put("database", "H2 In-Memory Database");
        response.put("totalUsers", userRepository.count());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/dashboard")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getStudentDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "STUDENT");
        data.put("userId", userDetails.getId());
        data.put("name", userDetails.getName());
        data.put("enrolledSessions", 4);
        data.put("completedLessons", 12);
        data.put("upcomingLesson", Map.of(
                "subject", "Advanced Calculus & Linear Algebra",
                "tutor", "Dr. Elena Rostova",
                "time", "Today, 4:00 PM",
                "roomUrl", "https://learnspace.live/room/calc-301"
        ));
        data.put("recentNotes", List.of(
                "Derivative shortcuts & Chain Rule",
                "Quantum Harmonic Oscillator summary",
                "Organic Chemistry Reaction Mechanisms"
        ));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/tutor/dashboard")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getTutorDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "TUTOR");
        data.put("userId", userDetails.getId());
        data.put("name", userDetails.getName());
        data.put("activeStudents", 28);
        data.put("scheduledClassesToday", 3);
        data.put("rating", 4.95);
        data.put("monthlyEarnings", "$3,420");
        data.put("pendingRequests", List.of(
                Map.of("student", "Alex Morgan", "subject", "AP Physics", "requestedSlot", "Tomorrow 3:00 PM"),
                Map.of("student", "Sarah Chen", "subject", "Multivariable Calculus", "requestedSlot", "Friday 5:00 PM")
        ));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "ADMIN");
        data.put("userId", userDetails.getId());
        data.put("name", userDetails.getName());
        List<User> allUsers = userRepository.findAll();
        data.put("totalUsers", allUsers.size());
        data.put("systemHealth", "OPTIMAL");
        data.put("h2ConsoleUrl", "http://localhost:8081/h2-console");
        data.put("users", allUsers.stream().map(u -> Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "createdAt", u.getCreatedAt().toString()
        )).toList());
        return ResponseEntity.ok(data);
    }
}

