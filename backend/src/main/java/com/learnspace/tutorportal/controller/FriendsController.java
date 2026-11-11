package com.learnspace.tutorportal.controller;

import com.learnspace.tutorportal.dto.MessageResponse;
import com.learnspace.tutorportal.model.Friendship;
import com.learnspace.tutorportal.model.Role;
import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.repository.FriendshipRepository;
import com.learnspace.tutorportal.repository.UserRepository;
import com.learnspace.tutorportal.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/friends")
public class FriendsController {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getMyFriends(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
        List<Friendship> friends = friendshipRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchStudents(
            @RequestParam(required = false, defaultValue = "") String name,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long currentUserId = userDetails != null ? userDetails.getId() : -1L;
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_STUDENT)
                .filter(u -> !u.getId().equals(currentUserId))
                .filter(u -> name.isBlank() || u.getName().toLowerCase().contains(name.toLowerCase()) || u.getEmail().toLowerCase().contains(name.toLowerCase()))
                .toList();

        List<Map<String, Object>> result = students.stream().map(s -> {
            boolean isAlreadyFriend = userDetails != null && friendshipRepository.existsByUserIdAndFriendId(currentUserId, s.getId());
            return Map.<String, Object>of(
                    "id", s.getId(),
                    "name", s.getName(),
                    "email", s.getEmail(),
                    "grade", s.getGrade(),
                    "isFriend", isAlreadyFriend
            );
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/add/{targetUserId}")
    public ResponseEntity<?> addFriend(
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Please sign in to add friends", false));
        }

        if (userDetails.getId().equals(targetUserId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("You cannot add yourself as a friend", false));
        }

        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found", false));
        }

        if (friendshipRepository.existsByUserIdAndFriendId(userDetails.getId(), targetUserId)) {
            return ResponseEntity.badRequest().body(new MessageResponse(targetUser.getName() + " is already in your friends list", false));
        }

        Friendship friendship = new Friendship(userDetails.getId(), targetUser.getId(), targetUser.getName(), targetUser.getEmail());
        friendshipRepository.save(friendship);

        // Mutual friendship connection
        if (!friendshipRepository.existsByUserIdAndFriendId(targetUser.getId(), userDetails.getId())) {
            Friendship mutual = new Friendship(targetUser.getId(), userDetails.getId(), userDetails.getName(), userDetails.getUsername());
            friendshipRepository.save(mutual);
        }

        return ResponseEntity.ok(new MessageResponse("Added " + targetUser.getName() + " as friend!", true));
    }
}
