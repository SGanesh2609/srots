package com.srots.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.srots.model.FreeCourse;
import com.srots.model.FreeCourse.CoursePlatform;

@Repository
public interface FreeCourseRepository extends JpaRepository<FreeCourse, String> {
    
    boolean existsByLink(String link);

    /** Returns [technology, count] for ACTIVE courses — used to build filter pills with counts */
    @Query("SELECT f.technology, COUNT(f) FROM FreeCourse f WHERE f.status = :status AND f.technology IS NOT NULL AND f.technology <> '' GROUP BY f.technology ORDER BY COUNT(f) DESC")
    List<Object[]> findTechWithCounts(@Param("status") FreeCourse.CourseStatus status);

    @Query("SELECT DISTINCT f.technology FROM FreeCourse f WHERE f.technology IS NOT NULL")
    List<String> findUniqueCategories();

    // PUBLIC: Pass the 'ACTIVE' status as a parameter from the service
    @Query("SELECT f FROM FreeCourse f WHERE " +
           "f.status = :activeStatus AND " +
           "(:tech IS NULL OR f.technology = :tech) AND " +
           "(:plat IS NULL OR f.platform = :plat) AND " +
           "(:query IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.technology) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<FreeCourse> searchActiveCourses(@Param("query") String query, 
                                         @Param("tech") String tech, 
                                         @Param("plat") FreeCourse.CoursePlatform plat, 
                                         @Param("activeStatus") FreeCourse.CourseStatus activeStatus,
                                         Pageable pageable);

    // ADMIN: Includes all statuses
    @Query("SELECT f FROM FreeCourse f WHERE " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:tech IS NULL OR f.technology = :tech) AND " +
           "(:plat IS NULL OR f.platform = :plat) AND " +
           "(:query IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<FreeCourse> searchAllCoursesForAdmin(@Param("query") String query,
                                              @Param("tech") String tech,
                                              @Param("plat") FreeCourse.CoursePlatform plat,
                                              @Param("status") FreeCourse.CourseStatus status,
                                              Pageable pageable);

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Nullify postedBy when an ADMIN/SROTS_DEV user is deleted (courses are kept) */
    @Modifying
    @Transactional
    @Query("UPDATE FreeCourse f SET f.postedBy = null WHERE f.postedBy.id = :userId")
    void clearPostedBy(@Param("userId") String userId);
}