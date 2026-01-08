// StudentSocialLinkRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentSocialLink;

import jakarta.transaction.Transactional;

@Repository
public interface StudentSocialLinkRepository extends JpaRepository<StudentSocialLink, String> {

    List<StudentSocialLink> findByStudentId(String studentId);
    
    
    @Query("SELECT s FROM StudentSocialLink s JOIN FETCH s.student WHERE s.id = :id")
    Optional<StudentSocialLink> findByIdWithStudent(@Param("id") String id);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentSocialLink s WHERE s.id = :id AND s.student.id = :studentId")
    int deleteBySocialLinkIdAndStudentId(@Param("id") String id, @Param("studentId") String studentId);
}