// JobRepository.java
package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.Job;

@Repository
public interface JobRepository extends JpaRepository<Job, String> {

	List<Job> findByCollegeId(String collegeId);

//    List<Job> findByCollegeIdAndStatus(String collegeId, JobStatus active);

	List<Job> findByCollegeIdOrderByPostedAtDesc(String collegeId);

	// Active jobs for a college
	List<Job> findByCollegeIdAndStatusOrderByPostedAtDesc(String collegeId, String status);

//    long countByCollegeIdAndStatus(String collegeId, String status);

	long countByCollegeIdAndStatus(String collegeId, Job.JobStatus status);

	@Query("SELECT j FROM Job j WHERE j.college.id = :collegeId AND "
			+ "(:query IS NULL OR j.title LIKE %:query% OR j.companyName LIKE %:query%)")
	List<Job> searchJobs(String collegeId, String query);

	List<Job> findByCollegeIdAndPostedById(String collegeId, String userId);

//	    @Query("SELECT j FROM Job j WHERE j.college.id = :collegeId " +
//	            "AND (:postedById IS NULL OR j.postedBy.id = :postedById) " + // STAFF Filter
//	            "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
//	            "AND (:jobType IS NULL OR j.jobType = :jobType) " +
//	            "AND (:workMode IS NULL OR j.workMode = :workMode) " +
//	            "ORDER BY j.postedAt DESC")
//	     List<Job> filterJobsForPortal(
//	         @Param("collegeId") String collegeId, 
//	         @Param("postedById") String postedById, // Pass NULL if CPH, pass userId if STAFF
//	         @Param("query") String query, 
//	         @Param("jobType") Job.JobType jobType, 
//	         @Param("workMode") Job.WorkMode workMode
//	     );

	@Query("SELECT j FROM Job j WHERE j.college.id = :collegeId "
			+ "AND (:postedById IS NULL OR j.postedBy.id = :postedById) "
			+ "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) "
			+ "    OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')) "
			+ "    OR LOWER(j.postedBy.fullName) LIKE LOWER(CONCAT('%', :query, '%'))) " + // Added PostedBy Name Search
			"AND (:jobType IS NULL OR j.jobType = :jobType) " + "AND (:workMode IS NULL OR j.workMode = :workMode) "
			+ "AND (:status IS NULL OR j.status = :status) " + // Added Status Filter
			"ORDER BY j.postedAt DESC")
	List<Job> filterJobsForPortal(@Param("collegeId") String collegeId, @Param("postedById") String postedById,
			@Param("query") String query, @Param("jobType") Job.JobType jobType,
			@Param("workMode") Job.WorkMode workMode, @Param("status") Job.JobStatus status // Added this
	);

	List<Job> findByCollegeIdAndStatus(String collegeId, Job.JobStatus status);

}