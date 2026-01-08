// StudentPublicationRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentPublication;

import jakarta.transaction.Transactional;

@Repository
public interface StudentPublicationRepository extends JpaRepository<StudentPublication, String> {

    List<StudentPublication> findByStudentId(String studentId);
    
    @Query("SELECT p FROM StudentPublication p JOIN FETCH p.student WHERE p.id = :id")
    Optional<StudentPublication> findByIdWithStudent(@Param("id") String id);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentPublication p WHERE p.id = :id AND p.student.id = :studentId")
    int deleteByPublicationIdAndStudentId(@Param("id") String id, @Param("studentId") String studentId);
    
    
}