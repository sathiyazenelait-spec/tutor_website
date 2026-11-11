package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.SmartNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmartNoteRepository extends JpaRepository<SmartNote, Long> {
    List<SmartNote> findAllByOrderByCreatedAtDesc();
    List<SmartNote> findBySubjectIgnoreCaseOrderByCreatedAtDesc(String subject);
    List<SmartNote> findByTutorIdOrderByCreatedAtDesc(Long tutorId);
}
