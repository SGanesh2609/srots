package com.srots.dto;

import java.time.LocalDateTime;

import com.srots.model.FreeCourse.CoursePlatform;
import com.srots.model.FreeCourse.CourseStatus;

import lombok.Data;

@Data
public class FreeCourseResponse {
    private String id;
    private String name;
    private String technology;
    private String description;
    private String link;
    private CoursePlatform platform; 
    private String postedBy;
    private LocalDateTime created_at;
    private CourseStatus status;        // Added
    private LocalDateTime lastVerifiedAt; // Added
	public FreeCourseResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
	public FreeCourseResponse(String id, String name, String technology, String description, String link,
			CoursePlatform platform, String postedBy, LocalDateTime created_at, CourseStatus status,
			LocalDateTime lastVerifiedAt) {
		super();
		this.id = id;
		this.name = name;
		this.technology = technology;
		this.description = description;
		this.link = link;
		this.platform = platform;
		this.postedBy = postedBy;
		this.created_at = created_at;
		this.status = status;
		this.lastVerifiedAt = lastVerifiedAt;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getTechnology() {
		return technology;
	}
	public void setTechnology(String technology) {
		this.technology = technology;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getLink() {
		return link;
	}
	public void setLink(String link) {
		this.link = link;
	}
	public CoursePlatform getPlatform() {
		return platform;
	}
	public void setPlatform(CoursePlatform platform) {
		this.platform = platform;
	}
	public String getPostedBy() {
		return postedBy;
	}
	public void setPostedBy(String postedBy) {
		this.postedBy = postedBy;
	}
	public LocalDateTime getCreated_at() {
		return created_at;
	}
	public void setCreated_at(LocalDateTime created_at) {
		this.created_at = created_at;
	}
	public CourseStatus getStatus() {
		return status;
	}
	public void setStatus(CourseStatus status) {
		this.status = status;
	}
	public LocalDateTime getLastVerifiedAt() {
		return lastVerifiedAt;
	}
	public void setLastVerifiedAt(LocalDateTime lastVerifiedAt) {
		this.lastVerifiedAt = lastVerifiedAt;
	}
    
    
    
}