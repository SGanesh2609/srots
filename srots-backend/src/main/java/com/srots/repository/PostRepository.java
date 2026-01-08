// PostRepository.java
package com.srots.repository;

import com.srots.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {

//    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String username);
//    List<Post> findAuthorFullNameContainingIgnoreCaseOrderByCreatedAtDesc(String fullName);
    
    
	// 1. Search by College ID
    List<Post> findByCollegeIdOrderByCreatedAtDesc(String collegeId);

    // 2. Search by Author's Username (using underscore for clarity)
    List<Post> findByAuthor_UsernameOrderByCreatedAtDesc(String username);

    // 3. Search by Author's Full Name (using underscore for clarity)
    List<Post> findByAuthor_FullNameContainingIgnoreCaseOrderByCreatedAtDesc(String fullName);
    
 // Isolated Search methods
    List<Post> findByAuthor_UsernameAndCollegeIdOrderByCreatedAtDesc(String username, String collegeId);
    List<Post> findByAuthor_FullNameContainingIgnoreCaseAndCollegeIdOrderByCreatedAtDesc(String fullName, String collegeId);
    
}