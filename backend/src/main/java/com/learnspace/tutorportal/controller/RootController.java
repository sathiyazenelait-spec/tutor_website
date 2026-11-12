package com.learnspace.tutorportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class RootController {

    @GetMapping({"/", "/healthz"})
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "UP");
        resp.put("service", "LearnSpace Tutor Haven Backend");
        resp.put("message", "API available at /api/** and H2 console at /h2-console");
        return ResponseEntity.ok(resp);
    }
}

