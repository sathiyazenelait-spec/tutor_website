package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.VideoRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRatingRepository extends JpaRepository<VideoRating, Long> {
    Optional<VideoRating> findByLessonVideoIdAndUserId(Long lessonVideoId, Long userId);
}
