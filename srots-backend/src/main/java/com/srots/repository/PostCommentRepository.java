package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.srots.model.PostComment;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, String> {
    
    /**
     * Find all top-level comments for a post (no parent)
     */
    List<PostComment> findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(String postId);
    
    /**
     * Count only top-level comments (no parent)
     */
    long countByPostIdAndParentCommentIsNull(String postId);
    
    /**
     * Check if a student has already commented on a post (top-level only)
     */
    boolean existsByPostIdAndUserIdAndParentCommentIsNull(String postId, String userId);
    
    /**
     * Find all replies to a specific comment
     */
    List<PostComment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);
}