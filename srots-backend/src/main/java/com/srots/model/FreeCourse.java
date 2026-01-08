package com.srots.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "free_courses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FreeCourse {
    @Id 
    // Removed @GeneratedValue because we will set it manually in Service
    @Column(name = "id", length = 36, columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(nullable = false) 
    private String name;

    private String technology;

    @Column(columnDefinition = "TEXT") 
    private String description;
    
    public enum CoursePlatform {
        YOUTUBE, UDEMY, COURSERA, LINKEDIN, OTHER
    }

    @Column(nullable = false, unique = true, length = 512) 
    private String link;

    @Enumerated(EnumType.STRING)
    private CoursePlatform platform; 

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "posted_by_id") 
    private User postedBy; 

    private String postedByName;
    
    public enum CourseStatus {
        ACTIVE, INACTIVE, PENDING
    }
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseStatus status = CourseStatus.ACTIVE;
    
    private LocalDateTime lastVerifiedAt;

    @CreationTimestamp 
    private LocalDateTime createdAt;

	public FreeCourse() {
		super();
		// TODO Auto-generated constructor stub
	}

	public FreeCourse(String id, String name, String technology, String description, String link,
			CoursePlatform platform, User postedBy, String postedByName, LocalDateTime createdAt) {
		super();
		this.id = id;
		this.name = name;
		this.technology = technology;
		this.description = description;
		this.link = link;
		this.platform = platform;
		this.postedBy = postedBy;
		this.postedByName = postedByName;
		this.createdAt = createdAt;
	}
	
	

	public FreeCourse(String id, String name, String technology, String description, String link,
			CoursePlatform platform, User postedBy, String postedByName, CourseStatus status, LocalDateTime createdAt) {
		super();
		this.id = id;
		this.name = name;
		this.technology = technology;
		this.description = description;
		this.link = link;
		this.platform = platform;
		this.postedBy = postedBy;
		this.postedByName = postedByName;
		this.status = status;
		this.createdAt = createdAt;
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

	public User getPostedBy() {
		return postedBy;
	}

	public void setPostedBy(User postedBy) {
		this.postedBy = postedBy;
	}

	public String getPostedByName() {
		return postedByName;
	}

	public void setPostedByName(String postedByName) {
		this.postedByName = postedByName;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
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