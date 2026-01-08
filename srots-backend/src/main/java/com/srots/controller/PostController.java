package com.srots.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.CommentRequest;
import com.srots.dto.CommentResponse;
import com.srots.dto.PostRequest;
import com.srots.dto.PostResponse;
import com.srots.service.FileService;
import com.srots.service.PostService;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    @Autowired private PostService postService;
    @Autowired private FileService fileService;

    /**
     * Fetch main feed - strictly scoped to collegeId
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponse>> getPosts(
            @RequestParam String collegeId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String authorId,
            @RequestParam String currentUserId) { 
        return ResponseEntity.ok(postService.getPosts(collegeId, query, authorId, currentUserId));
    }
    
    
 // Fetch all comments (Parent + Nested Replies)
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getPostComments(@PathVariable String id) {
        return ResponseEntity.ok(postService.getCommentsByPost(id));
    }
    
    /**
     * Fetch posts by username - now requires collegeId for isolation
     */
    @GetMapping("/user/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponse>> getByUsername(
            @PathVariable String username,
            @RequestParam String collegeId, // Added for isolation
            @RequestParam String currentUserId) {
        return ResponseEntity.ok(postService.getPostsByUsername(username, collegeId, currentUserId));
    }

    /**
     * Search posts by Full Name - now requires collegeId for isolation
     */
    @GetMapping("/search/author")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponse>> getByFullName(
            @RequestParam String fullName,
            @RequestParam String collegeId, // Added for isolation
            @RequestParam String currentUserId) {
        return ResponseEntity.ok(postService.getPostsByFullName(fullName, collegeId, currentUserId));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<List<String>> uploadPostFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam String collegeCode,
            @RequestParam String category) { 
        
        if (files.size() > 5) {
            throw new RuntimeException("Maximum 5 images allowed per upload.");
        }

        List<String> urls = files.stream()
                .map(file -> fileService.uploadFile(file, collegeCode, category))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(urls);
    }

    /**
     * Create Post - The collegeId is inside the PostRequest DTO.
     * The Service layer will use it to link the post to the specific college.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<PostResponse> create(@RequestBody PostRequest request) {
        // request.getCollegeId() is used inside postService.createPost
        return ResponseEntity.ok(postService.createPost(request));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> toggleLike(@PathVariable String id, @RequestBody Map<String, String> body) {
        // userId is used to verify college match inside Service
        postService.toggleLike(id, body.get("userId"));
        return ResponseEntity.ok().build();
    }

 // Add high-level comment (Increments count + Max 1 for student)
    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> addComment(@PathVariable String id, @RequestBody CommentRequest request) {
        postService.addComment(id, request);
        return ResponseEntity.ok().build();
    }

    // Reply to comment (Conversation logic checked in Service)
    @PostMapping("/{id}/comments/{commentId}/reply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> replyToComment(
            @PathVariable String id, 
            @PathVariable String commentId, 
            @RequestBody CommentRequest request) {
        postService.replyToComment(id, commentId, request);
        return ResponseEntity.ok().build();
    }

    // Delete comment (Decrements count if high-level)
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId, 
            @RequestParam String userId, 
            @RequestParam String role) {
        postService.deleteComment(commentId, userId, role);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete Post - We use the post ID to find the record.
     * The Service layer will check if the user has permission based on 
     * their role and their college membership.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<Void> deletePost(
            @PathVariable String id, 
            @RequestParam String userId, 
            @RequestParam String role) {
        postService.deletePost(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    
    @PostMapping("/{id}/comments-toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<Void> toggleComments(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam String role) {
        postService.toggleComments(id, userId, role);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/likes/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable String id) {
        return ResponseEntity.ok(postService.getLikeCount(id));
    }

    @GetMapping("/{id}/comments/count")
    public ResponseEntity<Long> getCommentCount(@PathVariable String id) {
        return ResponseEntity.ok(postService.getCommentCount(id));
    }
}