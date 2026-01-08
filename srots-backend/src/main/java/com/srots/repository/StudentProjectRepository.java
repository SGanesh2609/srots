// StudentProjectRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentProject;

import jakarta.transaction.Transactional;

@Repository
public interface StudentProjectRepository extends JpaRepository<StudentProject, String> {

    List<StudentProject> findByStudentId(String studentId);
    
    
    @Query("SELECT p FROM StudentProject p JOIN FETCH p.student WHERE p.id = :id")
    Optional<StudentProject> findByIdWithStudent(@Param("id") String id);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentProject p WHERE p.id = :id AND p.student.id = :studentId")
    int deleteByProjectIdAndStudentId(@Param("id") String id, @Param("studentId") String studentId);
}