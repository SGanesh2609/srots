package com.srots.repository;

import com.srots.dto.analytics.JobTypeDTO;
import com.srots.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobAnalyticsRepository extends JpaRepository<Job, String> {

    // System-wide job type distribution
    @Query("""
                SELECT new com.srots.dto.analytics.JobTypeDTO(
                    j.jobType, COUNT(j.id)
                )
                FROM Job j
                GROUP BY j.jobType
            """)
    List<JobTypeDTO> getJobTypeDistribution();

    // College-scoped job type distribution
    @Query("""
                SELECT new com.srots.dto.analytics.JobTypeDTO(
                    j.jobType, COUNT(j.id)
                )
                FROM Job j
                WHERE j.college.id = :collegeId
                GROUP BY j.jobType
            """)
    List<JobTypeDTO> getJobTypeDistributionByCollege(@Param("collegeId") String collegeId);

    // System-wide recent jobs
    List<Job> findTop5ByOrderByPostedAtDesc();

    // College-scoped recent jobs
    List<Job> findTop5ByCollege_IdOrderByPostedAtDesc(String collegeId);
}
