package com.learnspace.tutorportal.repository;

import com.learnspace.tutorportal.model.SubjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectEntityRepository extends JpaRepository<SubjectEntity, Long> {
    List<SubjectEntity> findByStatusOrderByNameAsc(String status);
    Optional<SubjectEntity> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
