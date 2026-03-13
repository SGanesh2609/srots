// ApplicationRepository.java
package com.srots.repository;

import com.srots.model.Application;
import com.srots.model.Application.AppStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {

    List<Application> findByStudentId(String studentId);

    List<Application> findByStudentIdOrderByAppliedAtDesc(String studentId);

    List<Application> findByJobIdOrderByAppliedAtAsc(String jobId);
    
    Optional<Application> findByJobIdAndStudentId(String jobId, String studentId);
    List<Application> findByJobId(String jobId);
    List<Application> findByJobIdAndStatus(String jobId, AppStatus status);
    long countByJobIdAndCurrentRoundStatus(String jobId, String status);

	long countByJobId(String id);
	
	
	// Count students currently in or past a specific round with a specific status
    long countByJobIdAndCurrentRoundAndStatus(String jobId, Integer currentRound, Application.AppStatus status);

    // Count specifically based on the currentRoundStatus string (e.g., "Round 1 Cleared")
    long countByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(String jobId, Integer currentRound, String statusPart);

	long countByJobIdAndStatus(String jobId, AppStatus hired);

	boolean existsByJobIdAndCurrentRoundGreaterThan(String jobId, int roundNum);

	boolean existsByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(String jobId, int prevRound, String string);

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Delete all applications submitted by a specific student (for student hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM Application a WHERE a.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") String studentId);

    /** Delete all applications for any job belonging to a college (for college hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM Application a WHERE a.job.college.id = :collegeId")
    void deleteByJobCollegeId(@Param("collegeId") String collegeId);

    /** Delete all applications for a list of student IDs (for college hard delete, cross-college applied jobs) */
    @Modifying
    @Transactional
    @Query("DELETE FROM Application a WHERE a.student.id IN :studentIds")
    void deleteByStudentIdIn(@Param("studentIds") List<String> studentIds);

    /** Delete all applications for a specific job (for job hard delete via scheduler) */
    @Modifying
    @Transactional
    @Query("DELETE FROM Application a WHERE a.job.id = :jobId")
    void deleteByJobId(@Param("jobId") String jobId);
}