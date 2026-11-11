package com.learnspace.tutorportal.config;

import com.learnspace.tutorportal.model.Role;
import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            logger.info("Seeding initial demo users into H2 Database...");

            User student = new User(
                    "Alex Johnson",
                    "student@learnspace.com",
                    passwordEncoder.encode("Student123!"),
                    Role.ROLE_STUDENT
            );

            User tutor = new User(
                    "Dr. Elena Rostova",
                    "tutor@learnspace.com",
                    passwordEncoder.encode("Tutor123!"),
                    Role.ROLE_TUTOR
            );

            User admin = new User(
                    "System Administrator",
                    "admin@learnspace.com",
                    passwordEncoder.encode("Admin123!"),
                    Role.ROLE_ADMIN
            );

            userRepository.save(student);
            userRepository.save(tutor);
            userRepository.save(admin);

            logger.info("Demo users seeded successfully:");
            logger.info("-> Student: student@learnspace.com / Student123!");
            logger.info("-> Tutor:   tutor@learnspace.com / Tutor123!");
            logger.info("-> Admin:   admin@learnspace.com / Admin123!");
        }
    }
}

