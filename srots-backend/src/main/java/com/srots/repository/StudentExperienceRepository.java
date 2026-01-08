// StudentExperienceRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentExperience;

import jakarta.transaction.Transactional;

@Repository
public interface StudentExperienceRepository extends JpaRepository<StudentExperience, String> {

    List<StudentExperience> findByStudentId(String studentId);

    List<StudentExperience> findByStudentIdOrderByStartDateDesc(String studentId);
    
    @Query("SELECT e FROM StudentExperience e JOIN FETCH e.student WHERE e.id = :id")
    Optional<StudentExperience> findByIdWithStudent(@Param("id") String id);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentExperience e WHERE e.id = :id AND e.student.id = :studentId")
    int deleteByExperienceIdAndStudentId(@Param("id") String id, @Param("studentId") String studentId);
}