// StudentLanguageRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentLanguage;

import jakarta.transaction.Transactional;

@Repository
public interface StudentLanguageRepository extends JpaRepository<StudentLanguage, String> {

    List<StudentLanguage> findByStudentId(String studentId);
    
    
    @Query("SELECT l FROM StudentLanguage l JOIN FETCH l.student WHERE l.id = :id")
    Optional<StudentLanguage> findByIdWithStudent(@Param("id") String id);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentLanguage l WHERE l.id = :id AND l.student.id = :studentId")
    int deleteByLanguageIdAndStudentId(@Param("id") String id, @Param("studentId") String studentId);
    
}