// PostCommentRepository.java
package com.srots.repository;

import com.srots.model.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, String> {

    List<PostComment> findByPostIdOrderByCreatedAtAsc(String postId);

    List<PostComment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(String postId);
    
    
 // Fetch only top-level comments (where parent is null) for the post feed
    List<PostComment> findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(String postId);
    
    // Fetch replies for a specific comment
    List<PostComment> findByParentCommentId(String parentCommentId);
    
    // Total count for the "Comment Count" API
    long countByPostId(String postId);
    
    // Business Rule: Check if student already made a top-level comment
    boolean existsByPostIdAndUserIdAndParentCommentIsNull(String postId, String userId);

    // Helper methods
    List<PostComment> findByPostId(String postId);
    
    // General check if user interacted at all
    boolean existsByPostIdAndUserId(String postId, String userId);
    
    long countByPostIdAndParentCommentIsNull(String postId);
    
    
}