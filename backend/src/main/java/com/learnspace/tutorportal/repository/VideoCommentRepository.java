package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.VideoComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoCommentRepository extends JpaRepository<VideoComment, Long> {
    List<VideoComment> findByLessonVideoIdOrderByCreatedAtDesc(Long lessonVideoId);
}
