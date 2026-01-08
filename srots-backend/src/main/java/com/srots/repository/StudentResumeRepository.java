package com.srots.repository;

import com.srots.model.StudentProfile;
import com.srots.model.StudentResume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentResumeRepository extends JpaRepository<StudentResume, String> {

    List<StudentResume> findByStudentId(String studentId);

    // Added the second parameter to match the "AndIsDefault" part of the method name
    Optional<StudentResume> findByStudentIdAndIsDefault(String studentId, boolean isDefault);
    
    long countByStudent_Id(String studentId);

 // Ensure this returns StudentResume, not StudentProfile!
    Optional<StudentResume> findFirstByStudent_Id(String studentId);
    
    
    List<StudentResume> findAllByStudent_Id(String studentId);
}