package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /**
     * Delete all comments authored by a specific user.
     * user_id is NOT NULL in the DB so we cannot nullify — must delete.
     * The DB ON DELETE CASCADE on parent_comment_id handles child replies automatically.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM PostComment c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") String userId);

    /** Delete all comments authored by a list of users (for college hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PostComment c WHERE c.user.id IN :userIds")
    void deleteByUserIdIn(@Param("userIds") List<String> userIds);

    /** Delete all comments on a list of posts (for post cleanup scheduler) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PostComment c WHERE c.post.id IN :postIds")
    void deleteByPostIdIn(@Param("postIds") List<String> postIds);
}