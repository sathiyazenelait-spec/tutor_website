package com.learnspace.tutorportal.config;

import com.learnspace.tutorportal.model.LessonVideo;
import com.learnspace.tutorportal.model.Role;
import com.learnspace.tutorportal.model.SubReferenceClip;
import com.learnspace.tutorportal.model.User;
import com.learnspace.tutorportal.repository.LessonVideoRepository;
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
    private LessonVideoRepository videoRepository;

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
            User savedTutor = userRepository.save(tutor);
            userRepository.save(admin);

            logger.info("Demo users seeded successfully in H2 DB.");

            // Seed initial Lesson Videos with Sub-reference Keypoint Formula Clips
            logger.info("Seeding initial Lesson Videos with Sub-reference Clips into H2 Database...");

            LessonVideo mathLesson = new LessonVideo(
                    "Algebraic Identities & Quadratic Expansions",
                    "Mathematics",
                    "Master core algebraic expansions and quadratic relationships with step-by-step visual proofs.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    "18:24",
                    savedTutor.getId(),
                    savedTutor.getName()
            );

            mathLesson.addSubReference(new SubReferenceClip(
                    "02:15",
                    "Binomial Expansion Square Proof",
                    "(a + b)² = a² + 2ab + b²",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                    "Geometric proof showing area of side (a+b) decomposing into a², two ab rectangles, and b² square."
            ));

            mathLesson.addSubReference(new SubReferenceClip(
                    "05:40",
                    "Difference of Squares Identity",
                    "(a - b)(a + b) = a² - b²",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                    "Cross-multiplying terms shows +ab and -ab cancel out completely, yielding a² - b²."
            ));

            mathLesson.addSubReference(new SubReferenceClip(
                    "11:10",
                    "Quadratic Formula Derivation",
                    "x = (-b ± √(b² - 4ac)) / (2a)",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
                    "Applying completing-the-square method to the canonical equation ax² + bx + c = 0."
            ));

            LessonVideo physicsLesson = new LessonVideo(
                    "Classical Dynamics & Newton's Second Law",
                    "Physics",
                    "Understanding force, inertial mass, and acceleration vectors in free-body diagrams.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    "14:50",
                    savedTutor.getId(),
                    savedTutor.getName()
            );

            physicsLesson.addSubReference(new SubReferenceClip(
                    "03:45",
                    "Newton's Second Law Vector Form",
                    "F_net = m · a",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                    "Net vector force is proportional to the rate of change of linear momentum over time."
            ));

            physicsLesson.addSubReference(new SubReferenceClip(
                    "08:15",
                    "Kinetic Energy Work Theorem",
                    "W_net = ΔK = ½mv_f² - ½mv_i²",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                    "Integrating force with respect to displacement demonstrates change in kinetic energy."
            ));

            LessonVideo chemLesson = new LessonVideo(
                    "Gas Laws & Molecular Thermodynamics",
                    "Chemistry",
                    "Explaining pressure, temperature, volume, and molar distribution in ideal gas states.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    "16:10",
                    savedTutor.getId(),
                    savedTutor.getName()
            );

            chemLesson.addSubReference(new SubReferenceClip(
                    "04:30",
                    "Ideal Gas Equation",
                    "P · V = n · R · T",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
                    "Synthesis of Boyle's Law, Charles's Law, and Avogadro's Principle into a unified equation of state."
            ));

            videoRepository.save(mathLesson);
            videoRepository.save(physicsLesson);
            videoRepository.save(chemLesson);

            logger.info("Lesson videos and sub-reference clips successfully seeded into H2 Database!");
        }
    }
}
