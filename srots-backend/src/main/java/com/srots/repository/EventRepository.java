// EventRepository.java
package com.srots.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    
}