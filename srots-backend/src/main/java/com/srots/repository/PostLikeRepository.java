package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.srots.model.PostLike;
import com.srots.model.PostLikeId;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
    
    /**
     * Count total likes for a post
     */
    long countByPostId(String postId);
    
    /**
     * Check if a specific user has liked a specific post
     */
    boolean existsByIdPostIdAndIdUserId(String postId, String userId);
    
    /**
     * Get list of user IDs who liked a post
     */
    @Query("SELECT pl.id.userId FROM PostLike pl WHERE pl.id.postId = :postId")
    List<String> findUserIdsByPostId(@Param("postId") String postId);

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Delete all likes by a specific user (for any user hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PostLike pl WHERE pl.id.userId = :userId")
    void deleteByUserId(@Param("userId") String userId);

    /** Delete all likes by a list of users (for college hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PostLike pl WHERE pl.id.userId IN :userIds")
    void deleteByUserIdIn(@Param("userIds") List<String> userIds);

    /** Delete all likes on a list of posts (for post cleanup scheduler) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PostLike pl WHERE pl.post.id IN :postIds")
    void deleteByPostIdIn(@Param("postIds") List<String> postIds);
}