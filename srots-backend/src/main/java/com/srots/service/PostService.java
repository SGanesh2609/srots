package com.srots.service;

import java.util.List;
import com.srots.dto.CommentRequest;
import com.srots.dto.CommentResponse;
import com.srots.dto.PostRequest;
import com.srots.dto.PostResponse;

public interface PostService {
    // Added currentUserId to identify if the viewer has liked the posts
    List<PostResponse> getPosts(String collegeId, String query, String authorId, String currentUserId);
    
    PostResponse createPost(PostRequest dto);
    void toggleLike(String postId, String userId);
    public void toggleComments(String postId, String userId, String role);
    void addComment(String postId, CommentRequest dto);
    void replyToComment(String postId, String commentId, CommentRequest dto);
    void deletePost(String postId, String userId, String role);
    void deleteComment(String commentId, String userId, String role);
    
    long getLikeCount(String postId);
    long getCommentCount(String postId);
    public List<CommentResponse> getCommentsByPost(String postId);
    
    
    public List<PostResponse> getPostsByUsername(String username, String collegeId, String currentUserId);
    public List<PostResponse> getPostsByFullName(String fullName, String collegeId, String currentUserId);
}