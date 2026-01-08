package com.srots.dto;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class PostResponse {
    private String id;
    private String collegeId;
    private String authorId;
    private String authorName;
    private String authorRole;
    private String content;
    private List<String> images;
    private List<Map<String, Object>> documents;
    private Integer likes;
 // Add this field to your existing PostResponse
    private Integer commentsCount;
    private Boolean isLikedByMe;
    private List<String> likedBy;
    private Boolean commentsDisabled;
    private String createdAt;
    private List<CommentResponse> comments;
	public PostResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	



	public PostResponse(String id, String collegeId, String authorId, String authorName, String authorRole,
			String content, List<String> images, List<Map<String, Object>> documents, Integer likes,
			Integer commentsCount, Boolean isLikedByMe, List<String> likedBy, Boolean commentsDisabled,
			String createdAt, List<CommentResponse> comments) {
		super();
		this.id = id;
		this.collegeId = collegeId;
		this.authorId = authorId;
		this.authorName = authorName;
		this.authorRole = authorRole;
		this.content = content;
		this.images = images;
		this.documents = documents;
		this.likes = likes;
		this.commentsCount = commentsCount;
		this.isLikedByMe = isLikedByMe;
		this.likedBy = likedBy;
		this.commentsDisabled = commentsDisabled;
		this.createdAt = createdAt;
		this.comments = comments;
	}



	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getCollegeId() {
		return collegeId;
	}
	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
	}
	public String getAuthorId() {
		return authorId;
	}
	public void setAuthorId(String authorId) {
		this.authorId = authorId;
	}
	public String getAuthorName() {
		return authorName;
	}
	public void setAuthorName(String authorName) {
		this.authorName = authorName;
	}
	public String getAuthorRole() {
		return authorRole;
	}
	public void setAuthorRole(String authorRole) {
		this.authorRole = authorRole;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public List<String> getImages() {
		return images;
	}
	public void setImages(List<String> images) {
		this.images = images;
	}
	public List<Map<String, Object>> getDocuments() {
		return documents;
	}
	public void setDocuments(List<Map<String, Object>> documents) {
		this.documents = documents;
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
	public Boolean getCommentsDisabled() {
		return commentsDisabled;
	}
	public void setCommentsDisabled(Boolean commentsDisabled) {
		this.commentsDisabled = commentsDisabled;
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	public List<CommentResponse> getComments() {
		return comments;
	}
	public void setComments(List<CommentResponse> comments) {
		this.comments = comments;
	}

	public Boolean getIsLikedByMe() {
		return isLikedByMe;
	}

	public void setIsLikedByMe(Boolean isLikedByMe) {
		this.isLikedByMe = isLikedByMe;
	}
    

	public Integer getCommentsCount() {
		return commentsCount;
	}



	public void setCommentsCount(Integer commentsCount) {
		this.commentsCount = commentsCount;
	}

    
}