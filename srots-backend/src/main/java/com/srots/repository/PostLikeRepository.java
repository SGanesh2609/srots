package com.srots.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.PostLike;
import com.srots.model.PostLikeId; // Crucial Import

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
    
    
    // Count total likes for a post
    long countByIdPostId(String postId);

    // Delete a specific like (Unlike)
    void deleteByIdPostIdAndIdUserId(String postId, String userId);

    
    boolean existsByIdPostIdAndIdUserId(String postId, String userId);
    
    @Query("SELECT l.id.userId FROM PostLike l WHERE l.id.postId = :postId")
    List<String> findUserIdsByPostId(@Param("postId") String postId);

	long countByPostId(String postId);
	
}