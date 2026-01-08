// StudentCertificationRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentCertification;

import jakarta.transaction.Transactional;

@Repository
public interface StudentCertificationRepository extends JpaRepository<StudentCertification, String> {

    List<StudentCertification> findByStudentId(String studentId);
    
    @Query("SELECT c FROM StudentCertification c JOIN FETCH c.student WHERE c.id = :id")
    Optional<StudentCertification> findByIdWithStudent(@Param("id") String id);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentCertification c WHERE c.id = :id AND c.student.id = :studentId")
    int deleteByCertificationIdAndStudentId(@Param("id") String id, @Param("studentId") String studentId);
}