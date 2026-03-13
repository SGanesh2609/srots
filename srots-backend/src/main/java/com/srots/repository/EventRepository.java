// EventRepository.java
package com.srots.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.srots.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    List<Event> findByCollegeIdOrderByStartDateDesc(String collegeId);
    
    List<Event> findByCollegeId(String collegeId);
    
    
    List<Event> findByCollegeIdOrderByStartDateAsc(String collegeId);

    @Query("SELECT e FROM Event e WHERE e.college.id = :collegeId AND e.startDate >= :today ORDER BY e.startDate ASC")
    List<Event> findUpcomingEvents(String collegeId, LocalDate today);
    
 // --- NEW SEARCH & FILTER QUERY ---
    @Query("SELECT e FROM Event e WHERE e.college.id = :collegeId " +
           "AND (:type IS NULL OR e.eventType = :type) " +
           "AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.startDate ASC")
    List<Event> searchEvents(
            @Param("collegeId") String collegeId, 
            @Param("type") Event.EventType type, 
            @Param("search") String search);

	boolean existsByIdAndCreatedBy_Id(String id, String userId);

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Delete all events for a college (for college hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM Event e WHERE e.college.id = :collegeId")
    void deleteByCollegeId(@Param("collegeId") String collegeId);

    /** Nullify createdBy on events when a CPH/STAFF user is deleted (events are kept) */
    @Modifying
    @Transactional
    @Query("UPDATE Event e SET e.createdBy = null WHERE e.createdBy.id = :userId")
    void clearCreatedBy(@Param("userId") String userId);

    // ── Scheduler: old event cleanup ──────────────────────────────────────────

    /**
     * Returns all events created before the given cutoff.
     * Used by CleanupScheduler to find events older than 120 days.
     */
    @Query("SELECT e FROM Event e WHERE e.createdAt < :cutoff")
    List<Event> findByCreatedAtBefore(@Param("cutoff") java.time.LocalDateTime cutoff);
}