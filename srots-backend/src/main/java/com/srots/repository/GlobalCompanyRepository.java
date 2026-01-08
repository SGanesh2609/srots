// GlobalCompanyRepository.java
package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.srots.model.GlobalCompany;

@Repository
public interface GlobalCompanyRepository extends JpaRepository<GlobalCompany, String> {
    // Used to search companies to subscribe to
    List<GlobalCompany> findByNameContainingIgnoreCase(String name);
    
 // Check if a company already exists by name to prevent duplicates
    boolean existsByNameIgnoreCase(String name);
    
    Optional<GlobalCompany> findByNameIgnoreCase(String name); // Add this
    
    
    
    
}