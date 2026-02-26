package com.srots.repository;

import com.srots.dto.analytics.PlacementProgressDTO;
import com.srots.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationAnalyticsRepository extends JpaRepository<Application, String> {

    // System-wide monthly placements
    @Query("""
                SELECT new com.srots.dto.analytics.PlacementProgressDTO(
                    FUNCTION('YEAR', a.placedAt),
                    FUNCTION('MONTH', a.placedAt),
                    FUNCTION('MONTHNAME', a.placedAt),
                    COUNT(a.id)
                )
                FROM Application a
                WHERE a.status = :status
                  AND a.placedAt IS NOT NULL
                GROUP BY
                    FUNCTION('YEAR', a.placedAt),
                    FUNCTION('MONTH', a.placedAt),
                    FUNCTION('MONTHNAME', a.placedAt)
                ORDER BY
                    FUNCTION('YEAR', a.placedAt),
                    FUNCTION('MONTH', a.placedAt)
            """)
    List<PlacementProgressDTO> getMonthlyPlacements(@Param("status") Application.AppStatus status);

    // College-scoped monthly placements
    @Query("""
                SELECT new com.srots.dto.analytics.PlacementProgressDTO(
                    FUNCTION('YEAR', a.placedAt),
                    FUNCTION('MONTH', a.placedAt),
                    FUNCTION('MONTHNAME', a.placedAt),
                    COUNT(a.id)
                )
                FROM Application a
                WHERE a.status = :status
                  AND a.placedAt IS NOT NULL
                  AND a.job.college.id = :collegeId
                GROUP BY
                    FUNCTION('YEAR', a.placedAt),
                    FUNCTION('MONTH', a.placedAt),
                    FUNCTION('MONTHNAME', a.placedAt)
                ORDER BY
                    FUNCTION('YEAR', a.placedAt),
                    FUNCTION('MONTH', a.placedAt)
            """)
    List<PlacementProgressDTO> getMonthlyPlacementsByCollege(@Param("status") Application.AppStatus status,
            @Param("collegeId") String collegeId);

    // System-wide counts
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countTotalStudents(@Param("role") com.srots.model.User.Role role);

    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Application a WHERE a.status = :status")
    Long countPlacedStudents(@Param("status") Application.AppStatus status);

    // College-scoped counts
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.college.id = :collegeId")
    Long countTotalStudentsByCollege(@Param("role") com.srots.model.User.Role role,
            @Param("collegeId") String collegeId);

    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Application a WHERE a.status = :status AND a.job.college.id = :collegeId")
    Long countPlacedStudentsByCollege(@Param("status") Application.AppStatus status,
            @Param("collegeId") String collegeId);
}
