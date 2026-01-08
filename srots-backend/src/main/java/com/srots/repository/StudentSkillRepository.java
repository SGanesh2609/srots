// StudentSkillRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentSkill;

import jakarta.transaction.Transactional;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, String> {

    List<StudentSkill> findByStudentId(String studentId);
    
    
    @Query("SELECT s FROM StudentSkill s JOIN FETCH s.student WHERE s.id = :id")
    Optional<StudentSkill> findByIdWithStudent(@Param("id") String id);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentSkill s WHERE s.id = :id AND s.student.id = :studentId")
    int deleteBySkillIdAndStudentId(@Param("id") String id, @Param("studentId") String studentId);
}