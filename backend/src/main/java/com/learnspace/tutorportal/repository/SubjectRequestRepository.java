package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.SubjectRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRequestRepository extends JpaRepository<SubjectRequest, Long> {
    List<SubjectRequest> findByOrderByCreatedAtDesc();
    List<SubjectRequest> findByTutorIdOrderByCreatedAtDesc(Long tutorId);
    List<SubjectRequest> findByStatusOrderByCreatedAtDesc(String status);
}
