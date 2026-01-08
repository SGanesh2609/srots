package com.srots.dto;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class PostRequest {
    private String content;
    private List<String> images;
    private List<Map<String, String>> documents; // [{name, url}]
    private String collegeId;
    private String authorId;
	public PostRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public PostRequest(String content, List<String> images, List<Map<String, String>> documents, String collegeId,
			String authorId) {
		super();
		this.content = content;
		this.images = images;
		this.documents = documents;
		this.collegeId = collegeId;
		this.authorId = authorId;
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
	public List<Map<String, String>> getDocuments() {
		return documents;
	}
	public void setDocuments(List<Map<String, String>> documents) {
		this.documents = documents;
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
    
    
}