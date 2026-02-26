package com.srots.repository;

import com.srots.dto.analytics.BranchDistributionDTO;
import com.srots.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnalyticsRepository extends JpaRepository<StudentProfile, String> {

    // System-wide branch distribution (admin view)
    @Query("""
                SELECT new com.srots.dto.analytics.BranchDistributionDTO(
                    sp.branch, COUNT(sp.userId)
                )
                FROM StudentProfile sp
                WHERE sp.branch IS NOT NULL
                GROUP BY sp.branch
            """)
    List<BranchDistributionDTO> getBranchDistribution();

    // College-scoped branch distribution (CPH/STAFF view)
    @Query("""
                SELECT new com.srots.dto.analytics.BranchDistributionDTO(
                    sp.branch, COUNT(sp.userId)
                )
                FROM StudentProfile sp
                JOIN sp.user u
                WHERE sp.branch IS NOT NULL
                  AND u.college.id = :collegeId
                GROUP BY sp.branch
            """)
    List<BranchDistributionDTO> getBranchDistributionByCollege(@Param("collegeId") String collegeId);
}
