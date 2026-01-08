package com.srots.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.srots.model.College;

@Repository
public interface CollegeRepository extends JpaRepository<College, String> {
    
    @Query("SELECT c FROM College c WHERE :q IS NULL OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<College> searchColleges(@Param("q") String query);
    
    boolean existsByCode(String code);

    // I have deleted the countByCollegeIdAndRole line from here completely.
}