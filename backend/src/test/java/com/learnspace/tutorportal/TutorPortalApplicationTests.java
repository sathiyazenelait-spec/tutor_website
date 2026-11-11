package com.learnspace.tutorportal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnspace.tutorportal.dto.LoginRequest;
import com.learnspace.tutorportal.dto.RegisterRequest;
import com.learnspace.tutorportal.model.Role;
import com.learnspace.tutorportal.repository.LessonVideoRepository;
import com.learnspace.tutorportal.repository.SmartNoteRepository;
import com.learnspace.tutorportal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TutorPortalApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonVideoRepository videoRepository;

    @Autowired
    private SmartNoteRepository noteRepository;

    @Test
    void contextLoads() {
        assertThat(userRepository).isNotNull();
        assertThat(videoRepository).isNotNull();
        assertThat(noteRepository).isNotNull();
    }

    @Test
    void testH2DatabaseInitialSeed() {
        assertThat(userRepository.count()).isGreaterThanOrEqualTo(3);
        assertThat(videoRepository.count()).isGreaterThanOrEqualTo(1);
        assertThat(noteRepository.count()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void testStudentLogin() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student@learnspace.com", "Student123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"))
                .andExpect(jsonPath("$.email").value("student@learnspace.com"));
    }

    @Test
    void testTutorLoginAndVideoRetrieval() throws Exception {
        LoginRequest loginRequest = new LoginRequest("tutor@learnspace.com", "Tutor123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        // Access tutor dashboard
        mockMvc.perform(get("/api/tutor/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("TUTOR"));

        // Fetch videos with sub-references from H2 DB
        mockMvc.perform(get("/api/videos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].subReferences").isArray());
    }

    @Test
    void testSmartNotesRetrievalWithSubExplanations() throws Exception {
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].subExplanations").isArray())
                .andExpect(jsonPath("$[0].formula").isNotEmpty());
    }

    @Test
    void testAdminUserMaintenance() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@learnspace.com", "Admin123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();

        // Admin gets all users
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.studentCount").isNumber())
                .andExpect(jsonPath("$.tutorCount").isNumber());

        // Admin creates a new student user
        RegisterRequest newUser = new RegisterRequest("Test Student", "teststudent@learnspace.com", "Password123!", "ROLE_STUDENT");
        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("teststudent@learnspace.com"));
    }
}
