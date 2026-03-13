package com.srots.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

//	Optional<StudentProfile> findByCollegeId(String collegeId);
	
	
	/**
     * Returns all StudentProfile records belonging to a college, with the
     * associated User entity JOIN FETCH-ed to avoid N+1 queries.
     *
     * The JOIN goes through: student_profiles.user_id → users.id → users.college_id
     *
     * @param collegeId  the College UUID
     */
    @Query("SELECT sp FROM StudentProfile sp JOIN FETCH sp.user u WHERE u.college.id = :collegeId AND u.isDeleted = false")
    List<StudentProfile> findByCollegeId(@Param("collegeId") String collegeId);

    // ─── NEW: Required for BulkUploadService preview methods ─────────────────

    /**
     * Finds a StudentProfile by roll number within a specific college.
     * Used as a fallback in bulk preview when username lookup fails.
     *
     * @param rollNumber  the student's roll number (e.g. "21701A0501")
     * @param collegeId   the College UUID
     */
    @Query("SELECT sp FROM StudentProfile sp JOIN sp.user u WHERE sp.rollNumber = :rollNumber AND u.college.id = :collegeId AND u.isDeleted = false")
    Optional<StudentProfile> findByRollNumberAndCollegeId(
            @Param("rollNumber") String rollNumber,
            @Param("collegeId") String collegeId);

    // ─── Useful extras (add if not already present) ───────────────────────────

    /**
     * Count of profiles in a college — useful for dashboard metrics.
     */
    @Query("SELECT COUNT(sp) FROM StudentProfile sp JOIN sp.user u WHERE u.college.id = :collegeId AND u.isDeleted = false")
    long countByCollegeId(@Param("collegeId") String collegeId);

    /**
     * Find profiles with premiumEndDate before a given cutoff — useful for
     * scheduled deletion jobs if you add one later.
     */
    @Query("SELECT sp FROM StudentProfile sp JOIN sp.user u WHERE u.college.id = :collegeId AND sp.premiumEndDate IS NOT NULL AND sp.premiumEndDate < :cutoff AND u.isDeleted = false")
    List<StudentProfile> findExpiredByCollegeId(
            @Param("collegeId") String collegeId,
            @Param("cutoff") LocalDate cutoff);

    // ── Scheduler: global premium-expiry cleanup ──────────────────────────────

    /**
     * Returns ALL StudentProfile records where premiumEndDate < cutoff.
     * Used by CleanupScheduler to find accounts whose premium expired > N days ago.
     * e.g. cutoff = today.minusDays(90) → expired more than 90 days ago.
     */
    @Query("SELECT sp FROM StudentProfile sp WHERE sp.premiumEndDate IS NOT NULL AND sp.premiumEndDate < :cutoff")
    List<StudentProfile> findPremiumExpiredBefore(@Param("cutoff") LocalDate cutoff);

    // ── Scheduler: premium-expiry warning window ──────────────────────────────

    /**
     * Returns StudentProfile records where premiumEndDate is within the warning window.
     * Used by the daily warning scheduler to notify students whose premium expired
     * between warningStartDays and warningEndDays ago.
     * e.g. warningStart=today-20days, warningEnd=today-10days → expired 10–20 days ago.
     */
    @Query("SELECT sp FROM StudentProfile sp JOIN FETCH sp.user u WHERE sp.premiumEndDate IS NOT NULL AND sp.premiumEndDate >= :warningStart AND sp.premiumEndDate < :warningEnd AND u.isDeleted = false")
    List<StudentProfile> findPremiumExpiredBetween(
            @Param("warningStart") LocalDate warningStart,
            @Param("warningEnd") LocalDate warningEnd);
}