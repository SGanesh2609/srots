package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.srots.model.StudentProfile;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, String> {

    boolean existsByRollNumber(String rollNumber);
    
    // CHANGED: studentId was causing the crash. It must match the field name 'userId'
    List<StudentProfile> findByUserId(String userId);
    
    Optional<StudentProfile> findByRollNumberIgnoreCase(String rollNumber);
    
    Optional<StudentProfile> findByRollNumberAndUserCollegeId(String rollNumber, String collegeId);

	Optional<StudentProfile> findByRollNumber(String rollNumber);
    
    
}