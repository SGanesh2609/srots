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
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, String> {

    // ══════════════════════════════════════════════════════════════════════════
    // ✅ CRITICAL FIX: MISSING METHOD CAUSING PAGINATION FAILURE
    // This method is called by JobSearchServiceImpl.getAdminJobsPaged()
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Enterprise pagination query with full filtering support.
     * 
     * Supports:
     * - College scoping
     * - Soft-delete awareness (includeArchived flag)
     * - Full-text search (title + companyName)
     * - Enum filters (jobType, workMode, status)
     * - "My Jobs" filter (postedById)
     * - Server-side pagination + sorting
     */
    @Query("""
        SELECT j FROM Job j
        WHERE j.college.id = :collegeId
        AND (:includeArchived = true OR j.deletedAt IS NULL)
        AND (:query IS NULL OR :query = '' OR 
             LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR 
             LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')))
        AND (:jobType IS NULL OR j.jobType = :jobType)
        AND (:workMode IS NULL OR j.workMode = :workMode)
        AND (:status IS NULL OR j.status = :status)
        AND (:postedById IS NULL OR :postedById = '' OR j.postedBy.id = :postedById)
    """)
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
}