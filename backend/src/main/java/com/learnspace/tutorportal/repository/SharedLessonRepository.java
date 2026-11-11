package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.SharedLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedLessonRepository extends JpaRepository<SharedLesson, Long> {
    List<SharedLesson> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<SharedLesson> findBySenderIdOrderByCreatedAtDesc(Long senderId);
}
