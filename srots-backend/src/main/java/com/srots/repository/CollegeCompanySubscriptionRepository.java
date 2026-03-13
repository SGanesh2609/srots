package com.srots.repository;

import com.srots.model.CollegeCompanySubscription;
import com.srots.model.SubscriptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface CollegeCompanySubscriptionRepository extends JpaRepository<CollegeCompanySubscription, SubscriptionId> {

    // Find all subscriptions for a specific college
    List<CollegeCompanySubscription> findByIdCollegeId(String collegeId);

    // Check if a specific college is already subscribed to a specific company
    boolean existsById(SubscriptionId id);
    
    // Custom delete method if you prefer using IDs directly
    void deleteById(SubscriptionId id);

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Delete all subscriptions for a college (for college hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM CollegeCompanySubscription c WHERE c.id.collegeId = :collegeId")
    void deleteByCollegeId(@Param("collegeId") String collegeId);

    /** Nullify addedBy reference when a CPH/STAFF user is deleted (subscriptions are kept) */
    @Modifying
    @Transactional
    @Query("UPDATE CollegeCompanySubscription c SET c.addedBy = null WHERE c.addedBy.id = :userId")
    void clearAddedBy(@Param("userId") String userId);
}