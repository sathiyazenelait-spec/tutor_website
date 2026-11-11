package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.SubReferenceClip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubReferenceClipRepository extends JpaRepository<SubReferenceClip, Long> {
    List<SubReferenceClip> findByLessonVideoId(Long lessonVideoId);
}

