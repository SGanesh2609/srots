package com.srots.dto;

import lombok.Data;
import java.util.List;

@Data
public class CommentResponse {
    private String id;
    private String userId;
    private String user;
    private String role;
    private String text;
    private String date;
    private Integer likes; // NEW: Added for comment likes
    private List<String> likedBy; // NEW: Added for tracking who liked
    private String parentId; // NEW: Added for nested replies
    private List<CommentResponse> replies; // NEW: Added for nested structure

    public CommentResponse() {
        super();
    }

    // Full constructor
    public CommentResponse(String id, String userId, String user, String role, String text, String date, 
                          Integer likes, List<String> likedBy, String parentId, List<CommentResponse> replies) {
        this.id = id;
        this.userId = userId;
        this.user = user;
        this.role = role;
        this.text = text;
        this.date = date;
        this.likes = likes;
        this.likedBy = likedBy;
        this.parentId = parentId;
        this.replies = replies;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
    }

    public List<String> getLikedBy() {
        return likedBy;
    }

    public void setLikedBy(List<String> likedBy) {
        this.likedBy = likedBy;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public List<CommentResponse> getReplies() {
        return replies;
    }

    public void setReplies(List<CommentResponse> replies) {
        this.replies = replies;
    }
}