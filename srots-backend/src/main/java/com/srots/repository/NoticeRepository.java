// NoticeRepository.java
package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    
//    List<Notice> findByCollegeIdOrderByNoticeDateDesc(String collegeId);
    
}