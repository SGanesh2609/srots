package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Nullify author on posts when a user is deleted (posts are kept, author becomes null) */
    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.author = null WHERE p.author.id = :userId")
    void clearAuthor(@Param("userId") String userId);

    /** Nullify author on posts for a list of users (for college hard delete) */
    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.author = null WHERE p.author.id IN :userIds")
    void clearAuthorIn(@Param("userIds") List<String> userIds);

    // ── Scheduler: old post cleanup ────────────────────────────────────────────

    /**
     * Returns all posts created before the given cutoff date.
     * Used by CleanupScheduler to find posts older than 90 days.
     */
    @Query("SELECT p FROM Post p WHERE p.createdAt < :cutoff")
    List<Post> findByCreatedAtBefore(@Param("cutoff") java.time.LocalDateTime cutoff);

    /**
     * Bulk JPQL delete for posts by ID list.
     * Called AFTER likes and comments have been explicitly deleted first.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Post p WHERE p.id IN :ids")
    void deleteByIdIn(@Param("ids") List<String> ids);
}