//// JobRepository.java
//package com.srots.repository;
//
//import java.util.List;
//import java.util.Optional;
//
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import com.srots.model.Job;
//
//@Repository
//public interface JobRepository extends JpaRepository<Job, String> {
//
//	List<Job> findByCollegeId(String collegeId);
//
////    List<Job> findByCollegeIdAndStatus(String collegeId, JobStatus active);
//
//	List<Job> findByCollegeIdOrderByPostedAtDesc(String collegeId);
//
//	// Active jobs for a college
//	List<Job> findByCollegeIdAndStatusOrderByPostedAtDesc(String collegeId, String status);
//
////    long countByCollegeIdAndStatus(String collegeId, String status);
//
//	long countByCollegeIdAndStatus(String collegeId, Job.JobStatus status);
//
//	@Query("SELECT j FROM Job j WHERE j.college.id = :collegeId AND "
//			+ "(:query IS NULL OR j.title LIKE %:query% OR j.companyName LIKE %:query%)")
//	List<Job> searchJobs(String collegeId, String query);
//
//	List<Job> findByCollegeIdAndPostedById(String collegeId, String userId);
//
////	    @Query("SELECT j FROM Job j WHERE j.college.id = :collegeId " +
////	            "AND (:postedById IS NULL OR j.postedBy.id = :postedById) " + // STAFF Filter
////	            "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
////	            "AND (:jobType IS NULL OR j.jobType = :jobType) " +
////	            "AND (:workMode IS NULL OR j.workMode = :workMode) " +
////	            "ORDER BY j.postedAt DESC")
////	     List<Job> filterJobsForPortal(
////	         @Param("collegeId") String collegeId, 
////	         @Param("postedById") String postedById, // Pass NULL if CPH, pass userId if STAFF
////	         @Param("query") String query, 
////	         @Param("jobType") Job.JobType jobType, 
////	         @Param("workMode") Job.WorkMode workMode
////	     );
//
//	@Query("SELECT j FROM Job j WHERE j.college.id = :collegeId "
//			+ "AND (:postedById IS NULL OR j.postedBy.id = :postedById) "
//			+ "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) "
//			+ "    OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')) "
//			+ "    OR LOWER(j.postedBy.fullName) LIKE LOWER(CONCAT('%', :query, '%'))) " + // Added PostedBy Name Search
//			"AND (:jobType IS NULL OR j.jobType = :jobType) " + "AND (:workMode IS NULL OR j.workMode = :workMode) "
//			+ "AND (:status IS NULL OR j.status = :status) " + // Added Status Filter
//			"ORDER BY j.postedAt DESC")
//	List<Job> filterJobsForPortal(@Param("collegeId") String collegeId, @Param("postedById") String postedById,
//			@Param("query") String query, @Param("jobType") Job.JobType jobType,
//			@Param("workMode") Job.WorkMode workMode, @Param("status") Job.JobStatus status // Added this
//	);
//
//	List<Job> findByCollegeIdAndStatus(String collegeId, Job.JobStatus status);
//	
//	/**
//     * Find job by ID including soft-deleted records.
//     * Default findById from JpaRepository will also return deleted rows unless
//     * you add @Where — add @Where(clause="deleted_at IS NULL") to Job entity
//     * if you want automatic filtering, then use this method for override.
//     */
//    @Query("SELECT j FROM Job j WHERE j.id = :id")
//    Optional<Job> findByIdIncludingDeleted(@Param("id") String id);
//
//    /**
//     * Paginated admin job listing with full filter support.
//     *
//     * includeArchived = false → only non-deleted jobs
//     * includeArchived = true  → all jobs (CPH view)
//     */
//    @Query("""
//        SELECT j FROM Job j
//        WHERE j.college.id = :collegeId
//          AND (:includeArchived = true OR j.deletedAt IS NULL)
//          AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%'))
//               OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')))
//          AND (:jobType IS NULL OR j.jobType = :jobType)
//          AND (:workMode IS NULL OR j.workMode = :workMode)
//          AND (:status IS NULL OR j.status = :status)
//          AND (:postedById IS NULL OR j.postedBy.id = :postedById)
//        ORDER BY j.postedAt DESC
//    """)
//    Page<Job> findAdminJobs(
//            @Param("collegeId")      String collegeId,
//            @Param("query")          String query,
//            @Param("jobType")        Job.JobType jobType,
//            @Param("workMode")       Job.WorkMode workMode,
//            @Param("status")         Job.JobStatus status,
//            @Param("postedById")     String postedById,
//            @Param("includeArchived") boolean includeArchived,
//            Pageable pageable
//    );
//
//}


package com.srots.repository;

import com.srots.model.Job;
import com.srots.model.Job.JobStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, String> {

    // ══════════════════════════════════════════════════════════════════════════
    // ✅ CRITICAL FIX: MISSING METHOD CAUSING PAGINATION FAILURE
    // This method is called by JobSearchServiceImpl.getAdminJobsPaged()
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Enterprise pagination query with full filtering support.
     * LEFT JOIN FETCH j.postedBy prevents N+1 queries when JobMapper accesses
     * postedBy for each row. A separate countQuery is required because Spring
     * Data JPA cannot auto-derive COUNT from a FETCH JOIN query.
     *
     * Supports:
     * - College scoping
     * - Soft-delete awareness (includeArchived flag)
     * - Full-text search (title + companyName)
     * - Enum filters (jobType, workMode, status)
     * - "My Jobs" filter (postedById)
     * - Server-side pagination + sorting
     */
    @Query(
        value = """
            SELECT j FROM Job j LEFT JOIN FETCH j.postedBy
            WHERE j.college.id = :collegeId
            AND (:includeArchived = true OR j.deletedAt IS NULL)
            AND (:query IS NULL OR :query = '' OR
                 LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
                 LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')))
            AND (:jobType IS NULL OR j.jobType = :jobType)
            AND (:workMode IS NULL OR j.workMode = :workMode)
            AND (:status IS NULL OR j.status = :status)
            AND (:postedById IS NULL OR :postedById = '' OR j.postedBy.id = :postedById)
        """,
        countQuery = """
            SELECT COUNT(j) FROM Job j
            WHERE j.college.id = :collegeId
            AND (:includeArchived = true OR j.deletedAt IS NULL)
            AND (:query IS NULL OR :query = '' OR
                 LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
                 LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')))
            AND (:jobType IS NULL OR j.jobType = :jobType)
            AND (:workMode IS NULL OR j.workMode = :workMode)
            AND (:status IS NULL OR j.status = :status)
            AND (:postedById IS NULL OR :postedById = '' OR j.postedBy.id = :postedById)
        """
    )
    Page<Job> findAdminJobs(
        @Param("collegeId") String collegeId,
        @Param("query") String query,
        @Param("jobType") Job.JobType jobType,
        @Param("workMode") Job.WorkMode workMode,
        @Param("status") Job.JobStatus status,
        @Param("postedById") String postedById,
        @Param("includeArchived") boolean includeArchived,
        Pageable pageable
    );

    // ══════════════════════════════════════════════════════════════════════════
    // NON-PAGINATED QUERIES (legacy, for backward compat)
    // ══════════════════════════════════════════════════════════════════════════

    @Query("""
        SELECT j FROM Job j
        WHERE j.college.id = :collegeId
        AND (:postedById IS NULL OR :postedById = '' OR j.postedBy.id = :postedById)
        AND (:query IS NULL OR :query = '' OR 
             LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR 
             LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')))
        AND (:jobType IS NULL OR j.jobType = :jobType)
        AND (:workMode IS NULL OR j.workMode = :workMode)
        AND (:status IS NULL OR j.status = :status)
        AND j.deletedAt IS NULL
    """)
    List<Job> filterJobsForPortal(
        @Param("collegeId") String collegeId,
        @Param("postedById") String postedById,
        @Param("query") String query,
        @Param("jobType") Job.JobType jobType,
        @Param("workMode") Job.WorkMode workMode,
        @Param("status") Job.JobStatus status
    );

    // ══════════════════════════════════════════════════════════════════════════
    // BASIC QUERIES
    // ══════════════════════════════════════════════════════════════════════════

    @Query("SELECT j FROM Job j WHERE j.college.id = :collegeId AND j.deletedAt IS NULL")
    List<Job> findByCollegeId(@Param("collegeId") String collegeId);

    @Query("SELECT j FROM Job j WHERE j.id = :id")
    Optional<Job> findByIdIncludingDeleted(@Param("id") String id);

    // ══════════════════════════════════════════════════════════════════════════
    // COUNT QUERIES
    // ══════════════════════════════════════════════════════════════════════════

    @Query("SELECT COUNT(j) FROM Job j WHERE j.college.id = :collegeId AND j.deletedAt IS NULL AND j.status = 'Active'")
    long countActiveJobsByCollegeId(@Param("collegeId") String collegeId);

    // ══════════════════════════════════════════════════════════════════════════
    // ROUND VALIDATION HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM Application a " +
           "WHERE a.job.id = :jobId AND a.currentRound = :roundNum " +
           "AND a.currentRoundStatus LIKE %:statusKeyword%")
    boolean existsByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(
        @Param("jobId") String jobId,
        @Param("roundNum") int roundNum,
        @Param("statusKeyword") String statusKeyword
    );

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM Application a " +
           "WHERE a.job.id = :jobId AND a.currentRound > :roundNum")
    boolean existsByJobIdAndCurrentRoundGreaterThan(
        @Param("jobId") String jobId,
        @Param("roundNum") int roundNum
    );

	long countByCollegeIdAndStatus(String id, JobStatus active);

	long countByCollegeId(String collegeId);

    // ── Hard Delete Support — Nullify user references on jobs ─────────────────
    // Jobs are preserved; only the FK references to the deleted user are cleared.

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.postedBy = null WHERE j.postedBy.id = :userId")
    void clearPostedBy(@Param("userId") String userId);

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.updatedBy = null WHERE j.updatedBy.id = :userId")
    void clearUpdatedBy(@Param("userId") String userId);

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.deletedBy = null WHERE j.deletedBy.id = :userId")
    void clearDeletedBy(@Param("userId") String userId);

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.restoredBy = null WHERE j.restoredBy.id = :userId")
    void clearRestoredBy(@Param("userId") String userId);

    // Bulk variants for college hard delete (all users in a college at once)

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.postedBy = null WHERE j.postedBy.id IN :userIds")
    void clearPostedByIn(@Param("userIds") List<String> userIds);

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.updatedBy = null WHERE j.updatedBy.id IN :userIds")
    void clearUpdatedByIn(@Param("userIds") List<String> userIds);

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.deletedBy = null WHERE j.deletedBy.id IN :userIds")
    void clearDeletedByIn(@Param("userIds") List<String> userIds);

    @Modifying @Transactional
    @Query("UPDATE Job j SET j.restoredBy = null WHERE j.restoredBy.id IN :userIds")
    void clearRestoredByIn(@Param("userIds") List<String> userIds);

    // ── Scheduler: soft-deleted jobs past retention period ────────────────────

    /**
     * Returns soft-deleted jobs whose deletedAt is older than the given cutoff.
     * Used by CleanupScheduler to permanently remove stale soft-deleted jobs.
     */
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NOT NULL AND j.deletedAt < :cutoff")
    List<Job> findSoftDeletedBefore(@Param("cutoff") java.time.LocalDateTime cutoff);

    // ── Notification: job deadline reminder ───────────────────────────────────

    /**
     * Returns active, non-deleted jobs whose applicationDeadline matches the given date.
     * Used by the daily deadline-reminder scheduler to find jobs expiring in N days.
     */
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = :status AND j.applicationDeadline = :deadline")
    List<Job> findActiveJobsExpiringOn(
            @Param("deadline") java.time.LocalDate deadline,
            @Param("status") Job.JobStatus status);
}