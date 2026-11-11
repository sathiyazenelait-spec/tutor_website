package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.LessonVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonVideoRepository extends JpaRepository<LessonVideo, Long> {
    List<LessonVideo> findAllByOrderByCreatedAtDesc();
    List<LessonVideo> findBySubjectIgnoreCaseOrderByCreatedAtDesc(String subject);
    List<LessonVideo> findByTutorIdOrderByCreatedAtDesc(Long tutorId);
}
