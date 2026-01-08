package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.srots.model.CollegeCompanySubscription;
import com.srots.model.SubscriptionId;

@Repository
public interface SubscriptionRepository extends JpaRepository<CollegeCompanySubscription, SubscriptionId> {
	// Fetch all companies subscribed by a specific college
    List<CollegeCompanySubscription> findByIdCollegeId(String collegeId);
    
    // Check if a specific link already exists
    boolean existsById(SubscriptionId id);
    
    
}