package com.srots.repository;

import com.srots.model.CollegeCompanySubscription;
import com.srots.model.SubscriptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CollegeCompanySubscriptionRepository extends JpaRepository<CollegeCompanySubscription, SubscriptionId> {

    // Find all subscriptions for a specific college
    List<CollegeCompanySubscription> findByIdCollegeId(String collegeId);

    // Check if a specific college is already subscribed to a specific company
    boolean existsById(SubscriptionId id);
    
    // Custom delete method if you prefer using IDs directly
    void deleteById(SubscriptionId id);
}