package com.srots.dto;

import java.util.List;

public class CommentResponse {
    private String id;
    private String userId;
    private String user;
    private String role;
    private String text;
    private String date;
    
    // UI Helpers
    private String parentId; // If this is null, it is a parent comment
    private List<CommentResponse> replies; // Nested children
	public CommentResponse(String id, String userId, String user, String role, String text, String date,
			String parentId, List<CommentResponse> replies) {
		super();
		this.id = id;
		this.userId = userId;
		this.user = user;
		this.role = role;
		this.text = text;
		this.date = date;
		this.parentId = parentId;
		this.replies = replies;
	}
	public CommentResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
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
    
    

    // Update your convertComment helper in PostServiceImpl to set parentId:
    // res.setParentId(c.getParentComment() != null ? c.getParentComment().getId() : null);
}