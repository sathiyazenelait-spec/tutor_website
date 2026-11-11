package com.learnspace.tutorportal.config;

import com.learnspace.tutorportal.model.*;
import com.learnspace.tutorportal.repository.*;
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
    private SmartNoteRepository noteRepository;

    @Autowired
    private SubjectEntityRepository subjectRepository;

    @Autowired
    private SubjectRequestRepository subjectRequestRepository;

    @Autowired
    private VideoCommentRepository commentRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            logger.info("Seeding initial demo users and ID card data into H2 Database...");

            User student = new User(
                    "Alex Johnson",
                    "student@learnspace.com",
                    passwordEncoder.encode("Student123!"),
                    Role.ROLE_STUDENT
            );
            student.setIdNumber("LS-STU-2026-001");
            student.setInstitution("Stanford Online High School");
            student.setGrade("Class 11 - Honors STEM");
            student.setSpecialization("Pure Mathematics & Quantum Mechanics");

            User student2 = new User(
                    "Sarah Chen",
                    "sarah@learnspace.com",
                    passwordEncoder.encode("Student123!"),
                    Role.ROLE_STUDENT
            );
            student2.setIdNumber("LS-STU-2026-002");
            student2.setInstitution("MIT Preparatory Academy");
            student2.setGrade("Class 12 - Advanced Placement");
            student2.setSpecialization("Applied Physics & Calculus");

            User tutor = new User(
                    "Dr. Elena Rostova",
                    "tutor@learnspace.com",
                    passwordEncoder.encode("Tutor123!"),
                    Role.ROLE_TUTOR
            );
            tutor.setIdNumber("LS-TUT-2026-002");
            tutor.setInstitution("Department of Pure & Applied Mathematics");
            tutor.setGrade("Distinguished Senior Faculty");
            tutor.setSpecialization("Higher Algebra, Quadratic Analysis & Calculus");

            User admin = new User(
                    "System Administrator",
                    "admin@learnspace.com",
                    passwordEncoder.encode("Admin123!"),
                    Role.ROLE_ADMIN
            );
            admin.setIdNumber("LS-ADM-2026-001");
            admin.setInstitution("LearnSpace Haven Central Administration");
            admin.setGrade("Executive Board");
            admin.setSpecialization("Platform Architecture & Academic Accreditation");

            User savedStudent = userRepository.save(student);
            User savedStudent2 = userRepository.save(student2);
            User savedTutor = userRepository.save(tutor);
            userRepository.save(admin);

            // Seed initial friendship between Alex and Sarah
            friendshipRepository.save(new Friendship(savedStudent.getId(), savedStudent2.getId(), savedStudent2.getName(), savedStudent2.getEmail()));
            friendshipRepository.save(new Friendship(savedStudent2.getId(), savedStudent.getId(), savedStudent.getName(), savedStudent.getEmail()));

            logger.info("Demo users and friendships seeded successfully in H2 DB.");

            // Seed initial subjects
            subjectRepository.save(new SubjectEntity("Mathematics", "Algebra, Geometry, Calculus & Number Theory"));
            subjectRepository.save(new SubjectEntity("Physics", "Classical Mechanics, Optics, Electromagnetism & Quantum"));
            subjectRepository.save(new SubjectEntity("Chemistry", "Organic, Inorganic & Physical Thermodynamics"));
            subjectRepository.save(new SubjectEntity("Biology", "Genetics, Cellular Biology & Physiology"));
            subjectRepository.save(new SubjectEntity("Computer Science", "Algorithms, Data Structures & Python Programming"));

            // Seed a pending tutor subject suggestion for Admin to review
            SubjectRequest aiRequest = new SubjectRequest(
                    "Artificial Intelligence & Machine Learning",
                    "Foundational course covering Neural Networks, Gradient Descent, Matrix Calculus and NLP for high-school honors students.",
                    savedTutor.getId(),
                    savedTutor.getName()
            );
            subjectRequestRepository.save(aiRequest);

            // Seed initial Lesson Videos with Sub-reference Keypoint Formula Clips
            LessonVideo mathLesson = new LessonVideo(
                    "Algebraic Identities & Quadratic Expansions",
                    "Mathematics",
                    "Master core algebraic expansions and quadratic relationships with step-by-step visual proofs.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    "18:24",
                    savedTutor.getId(),
                    savedTutor.getName()
            );
            mathLesson.setLikes(34);
            mathLesson.setRating(4.9);
            mathLesson.setRatingCount(18);

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

            LessonVideo physicsLesson = new LessonVideo(
                    "Classical Dynamics & Newton's Second Law",
                    "Physics",
                    "Understanding force, inertial mass, and acceleration vectors in free-body diagrams.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    "14:50",
                    savedTutor.getId(),
                    savedTutor.getName()
            );
            physicsLesson.setLikes(28);
            physicsLesson.setRating(4.8);
            physicsLesson.setRatingCount(12);

            physicsLesson.addSubReference(new SubReferenceClip(
                    "03:45",
                    "Newton's Second Law Vector Form",
                    "F_net = m · a",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                    "Net vector force is proportional to the rate of change of linear momentum over time."
            ));

            LessonVideo savedMath = videoRepository.save(mathLesson);
            videoRepository.save(physicsLesson);

            // Seed initial student comments
            commentRepository.save(new VideoComment(
                    savedMath.getId(),
                    savedStudent.getId(),
                    savedStudent.getName(),
                    "ROLE_STUDENT",
                    "The attached clip at 02:15 for (a+b)² made the 2ab rectangle area completely intuitive! Thank you Dr. Elena!"
            ));
            commentRepository.save(new VideoComment(
                    savedMath.getId(),
                    savedStudent2.getId(),
                    savedStudent2.getName(),
                    "ROLE_STUDENT",
                    "Shared this with my study group via WhatsApp. The geometric proof is brilliant."
            ));

            // Seed initial Smart Notes
            SmartNote mathNote = new SmartNote(
                    "Square of a Sum (a + b)² Explained",
                    "Mathematics",
                    "Algebraic Identities",
                    "(a + b)² = a² + b² + 2ab",
                    "To square a sum, we multiply the bracket by itself: (a + b)(a + b). Each term in the first bracket multiplies each term in the second, giving four pieces. Two of them are the same — that's where the 2ab comes from. Compare this with the difference of squares, where the middle terms cancel out instead of adding up.",
                    savedTutor.getId(),
                    savedTutor.getName()
            );
            mathNote.setLikes(1240);

            mathNote.addSubExplanation(new NoteSubExplanation(
                    "a2",
                    "a²",
                    "Square of first term (a · a)",
                    "Area of the top-left square with side length a. When multiplying (a+b)(a+b), this is the first term: a × a = a².",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            ));

            mathNote.addSubExplanation(new NoteSubExplanation(
                    "b2",
                    "b²",
                    "Square of second term (b · b)",
                    "Area of the bottom-right corner square with side length b. Formed by multiplying b × b = b².",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
            ));

            mathNote.addSubExplanation(new NoteSubExplanation(
                    "2ab",
                    "2ab",
                    "Two symmetric rectangles: a·b + b·a = 2ab",
                    "When expanding brackets: a × b = ab, and b × a = ba. Since order of multiplication does not change the result, ab + ba = 2ab. Geometrically, these are the two rectangular strips that fill the rest of the square!",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
            ));

            mathNote.addSubExplanation(new NoteSubExplanation(
                    "diff",
                    "difference of squares",
                    "Contrast: (a - b)(a + b) = a² - b²",
                    "In the difference of squares, the cross terms are +ab and -ab. Adding them yields 0, which eliminates the middle term entirely leaving only a² - b².",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
            ));

            noteRepository.save(mathNote);

            logger.info("Complete ecosystem with subjects, friendships, comments, and ID cards seeded into H2 DB!");
        }
    }
}
