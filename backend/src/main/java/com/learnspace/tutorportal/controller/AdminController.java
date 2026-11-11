package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.dto.MessageResponse;
import com.learnspace.tutorportal.dto.RegisterRequest;
import com.learnspace.tutorportal.model.Role;
import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.repository.LessonVideoRepository;
import com.learnspace.tutorportal.repository.SmartNoteRepository;
import com.learnspace.tutorportal.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonVideoRepository videoRepository;

    @Autowired
    private SmartNoteRepository noteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        long studentCount = users.stream().filter(u -> u.getRole() == Role.ROLE_STUDENT).count();
        long tutorCount = users.stream().filter(u -> u.getRole() == Role.ROLE_TUTOR).count();
        long adminCount = users.stream().filter(u -> u.getRole() == Role.ROLE_ADMIN).count();

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", users.size());
        response.put("studentCount", studentCount);
        response.put("tutorCount", tutorCount);
        response.put("adminCount", adminCount);
        response.put("users", users.stream().map(u -> Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "createdAt", u.getCreatedAt().toString()
        )).toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUserByAdmin(@Valid @RequestBody RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email already exists!", false));
        }

        Role role = Role.ROLE_STUDENT;
        if (req.getRole() != null) {
            String roleUpper = req.getRole().toUpperCase();
            if (roleUpper.contains("TUTOR")) role = Role.ROLE_TUTOR;
            else if (roleUpper.contains("ADMIN")) role = Role.ROLE_ADMIN;
        }

        User user = new User(
                req.getName().trim(),
                email,
                passwordEncoder.encode(req.getPassword()),
                role
        );

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "name", saved.getName(),
                "email", saved.getEmail(),
                "role", saved.getRole().name(),
                "message", "User created successfully in H2 database"
        ));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {

        return userRepository.findById(id).map(user -> {
            if (updates.containsKey("name") && !updates.get("name").isBlank()) {
                user.setName(updates.get("name").trim());
            }
            if (updates.containsKey("role") && !updates.get("role").isBlank()) {
                String roleStr = updates.get("role").toUpperCase();
                if (roleStr.contains("TUTOR")) user.setRole(Role.ROLE_TUTOR);
                else if (roleStr.contains("STUDENT")) user.setRole(Role.ROLE_STUDENT);
                else if (roleStr.contains("ADMIN")) user.setRole(Role.ROLE_ADMIN);
            }
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User updated successfully in H2 database", true));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("User not found with id: " + id, false)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            if (user.getRole() == Role.ROLE_ADMIN && user.getEmail().equals("admin@learnspace.com")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Cannot delete root system administrator account", false));
            }
            userRepository.delete(user);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully from H2 database", true));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("User not found with id: " + id, false)));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalVideos", videoRepository.count());
        stats.put("totalNotes", noteRepository.count());
        stats.put("database", "H2 In-Memory (jdbc:h2:mem:tutorspacedb)");
        return ResponseEntity.ok(stats);
    }
}
