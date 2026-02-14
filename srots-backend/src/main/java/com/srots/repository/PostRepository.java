package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.srots.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    
    /**
     * Find all posts in a college, ordered by creation date (newest first)
     */
    List<Post> findByCollegeIdOrderByCreatedAtDesc(String collegeId);
    
    /**
     * Find posts by username within a college
     */
    List<Post> findByAuthor_UsernameAndCollegeIdOrderByCreatedAtDesc(String username, String collegeId);
    
    /**
     * Find posts by full name (case-insensitive contains) within a college
     */
    List<Post> findByAuthor_FullNameContainingIgnoreCaseAndCollegeIdOrderByCreatedAtDesc(String fullName, String collegeId);
}