package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.model.Role;
import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.repository.LessonVideoRepository;
import com.learnspace.tutorportal.repository.SmartNoteRepository;
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

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonVideoRepository videoRepository;

    @Autowired
    private SmartNoteRepository noteRepository;

    @GetMapping("/public/status")
    public ResponseEntity<?> getPublicStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "LearnSpace Tutor Haven Auth Service");
        response.put("database", "H2 In-Memory Database");
        response.put("totalUsers", userRepository.count());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/tutors")
    public ResponseEntity<?> getPublicTutors() {
        List<User> tutors = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_TUTOR)
                .collect(Collectors.toList());

        // Deduplicate tutors by normalized email to strictly prevent any duplicate cards
        Map<String, User> uniqueMap = new LinkedHashMap<>();
        for (User t : tutors) {
            String key = (t.getEmail() != null ? t.getEmail().trim().toLowerCase() : ("id-" + t.getId()));
            uniqueMap.putIfAbsent(key, t);
        }

        // Ensure every author who published videos in the Video Library is included on the Tutors page
        if (videoRepository != null) {
            for (com.learnspace.tutorportal.model.LessonVideo v : videoRepository.findAll()) {
                if (v.getTutorName() != null && !v.getTutorName().isBlank()) {
                    String cleanName = v.getTutorName().trim();
                    boolean exists = uniqueMap.values().stream().anyMatch(u ->
                        (v.getTutorId() != null && u.getId() != null && v.getTutorId().equals(u.getId())) ||
                        (u.getName() != null && u.getName().trim().equalsIgnoreCase(cleanName))
                    );
                    if (!exists) {
                        User pubTutor = new User(
                                cleanName,
                                cleanName.toLowerCase().replaceAll("[^a-z0-9]", ".") + "@learnspace.com",
                                "",
                                Role.ROLE_TUTOR
                        );
                        if (v.getTutorId() != null) {
                            pubTutor.setId(v.getTutorId());
                        }
                        pubTutor.setIdNumber("LS-TUT-2026-" + (v.getTutorId() != null ? String.format("%03d", v.getTutorId()) : "099"));
                        pubTutor.setInstitution("LearnSpace Video Faculty");
                        pubTutor.setGrade("Publishing Faculty");
                        pubTutor.setSpecialization((v.getSubject() != null ? v.getSubject() : "Science") + " & Interactive Video Lessons");
                        uniqueMap.put("video-" + cleanName.toLowerCase(), pubTutor);
                    }
                }
            }
        }

        // Also ensure any smart note authors are included
        if (noteRepository != null) {
            for (com.learnspace.tutorportal.model.SmartNote n : noteRepository.findAll()) {
                if (n.getTutorName() != null && !n.getTutorName().isBlank()) {
                    String cleanName = n.getTutorName().trim();
                    boolean exists = uniqueMap.values().stream().anyMatch(u ->
                        (n.getTutorId() != null && u.getId() != null && n.getTutorId().equals(u.getId())) ||
                        (u.getName() != null && u.getName().trim().equalsIgnoreCase(cleanName))
                    );
                    if (!exists) {
                        User noteTutor = new User(
                                cleanName,
                                cleanName.toLowerCase().replaceAll("[^a-z0-9]", ".") + "@learnspace.com",
                                "",
                                Role.ROLE_TUTOR
                        );
                        if (n.getTutorId() != null) {
                            noteTutor.setId(n.getTutorId());
                        }
                        noteTutor.setIdNumber("LS-TUT-2026-" + (n.getTutorId() != null ? String.format("%03d", n.getTutorId()) : "098"));
                        noteTutor.setInstitution("LearnSpace Faculty");
                        noteTutor.setGrade("Interactive Note Author");
                        noteTutor.setSpecialization((n.getSubject() != null ? n.getSubject() : "Mathematics") + " & Equation Derivations");
                        uniqueMap.put("note-" + cleanName.toLowerCase(), noteTutor);
                    }
                }
            }
        }

        List<Map<String, Object>> result = uniqueMap.values().stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", String.valueOf(t.getId() != null ? t.getId() : Math.abs(t.getName().hashCode())));
            map.put("userId", t.getId());
            map.put("name", t.getName());
            map.put("email", t.getEmail());
            map.put("role", t.getRole().name());
            map.put("idNumber", t.getIdNumber() != null ? t.getIdNumber() : "LS-TUT-2026-" + (t.getId() != null ? String.format("%03d", t.getId()) : "001"));
            map.put("institution", t.getInstitution() != null ? t.getInstitution() : "Faculty of Science & Mathematics");
            map.put("grade", t.getGrade() != null ? t.getGrade() : "Distinguished Faculty");

            String spec = t.getSpecialization() != null && !t.getSpecialization().trim().isEmpty()
                    ? t.getSpecialization()
                    : "Mathematics & Sciences";
            map.put("specialization", spec);

            long videoCount = 0;
            String videoSubject = null;
            if (videoRepository != null) {
                List<com.learnspace.tutorportal.model.LessonVideo> tutorVids = videoRepository.findAll().stream()
                        .filter(v -> (v.getTutorId() != null && t.getId() != null && v.getTutorId().equals(t.getId())) ||
                                     (v.getTutorName() != null && t.getName() != null && v.getTutorName().trim().equalsIgnoreCase(t.getName().trim())))
                        .collect(Collectors.toList());
                videoCount = tutorVids.size();
                if (!tutorVids.isEmpty() && tutorVids.get(0).getSubject() != null) {
                    videoSubject = tutorVids.get(0).getSubject();
                }
            }

            long noteCount = 0;
            if (noteRepository != null) {
                noteCount = noteRepository.findAll().stream()
                        .filter(n -> (n.getTutorId() != null && t.getId() != null && n.getTutorId().equals(t.getId())) ||
                                     (n.getTutorName() != null && t.getName() != null && n.getTutorName().trim().equalsIgnoreCase(t.getName().trim())))
                        .count();
            }

            map.put("subject", videoSubject != null ? videoSubject : deriveSubject(spec));

            long lessonsTotal = videoCount + noteCount;
            map.put("lessons", lessonsTotal > 0 ? lessonsTotal : 2);
            map.put("videoCount", videoCount);
            map.put("noteCount", noteCount);
            map.put("students", 1450 + (t.getId() != null ? t.getId() * 320 : 500));
            map.put("rating", 4.9);
            map.put("headline", t.getGrade() + " · " + t.getInstitution());
            map.put("initials", getInitials(t.getName()));
            map.put("verified", t.isVerified());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private String deriveSubject(String spec) {
        if (spec == null) return "Mathematics";
        String lower = spec.toLowerCase();
        if (lower.contains("physic") || lower.contains("dynamics") || lower.contains("mechanic")) return "Physics";
        if (lower.contains("chem") || lower.contains("thermo") || lower.contains("reaction")) return "Chemistry";
        if (lower.contains("bio") || lower.contains("genetics") || lower.contains("cell")) return "Biology";
        if (lower.contains("computer") || lower.contains("algorithm") || lower.contains("software")) return "Computer Science";
        return "Mathematics";
    }

    private String getInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "TU";
        String clean = name.replace("Dr.", "").replace("Prof.", "").replace("Mr.", "").replace("Ms.", "").trim();
        String[] parts = clean.split("\\s+");
        if (parts.length >= 2) {
            return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
        }
        return clean.substring(0, Math.min(2, clean.length())).toUpperCase();
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

