// NoticeRepository.java
package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.srots.model.Notice;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, String> {

    List<Notice> findByCollegeIdOrderByCreatedAtDesc(String collegeId);

    List<Notice> findByCollegeIdOrderByNoticeDateDesc(String collegeId);
    
    List<Notice> findByCollegeId(String collegeId);
    
    
 // SEARCH & FILTER METHOD
    @Query("SELECT n FROM Notice n WHERE n.college.id = :collegeId " +
           "AND (:type IS NULL OR n.type = :type) " +
           "AND (:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY n.noticeDate DESC")
    List<Notice> searchNotices(
            @Param("collegeId") String collegeId, 
            @Param("type") Notice.NoticeType type, 
            @Param("search") String search);

	boolean existsByIdAndCreatedBy_Id(String id, String userId);

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Delete all notices for a college (for college hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM Notice n WHERE n.college.id = :collegeId")
    void deleteByCollegeId(@Param("collegeId") String collegeId);

    /** Nullify createdBy on notices when a CPH/STAFF user is deleted (notices are kept) */
    @Modifying
    @Transactional
    @Query("UPDATE Notice n SET n.createdBy = null WHERE n.createdBy.id = :userId")
    void clearCreatedBy(@Param("userId") String userId);

    // ── Scheduler: old notice cleanup ─────────────────────────────────────────

    /**
     * Returns all notices created before the given cutoff.
     * Used by CleanupScheduler to find notices older than 120 days.
     */
    @Query("SELECT n FROM Notice n WHERE n.createdAt < :cutoff")
    List<Notice> findByCreatedAtBefore(@Param("cutoff") java.time.LocalDateTime cutoff);
}