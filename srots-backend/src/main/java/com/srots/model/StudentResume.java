// 12. StudentResume.java
package com.srots.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_resumes")
@Data @NoArgsConstructor @AllArgsConstructor
public class StudentResume {
    @Id @GeneratedValue(strategy = GenerationType.UUID) @Column(columnDefinition = "CHAR(36)")
    private String id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id")
    @JsonBackReference
    private User student;
    private String fileName;
    @Column(columnDefinition = "TEXT") private String fileUrl;
    private Boolean isDefault = false;
    @CreationTimestamp private LocalDateTime uploadedAt;
	public StudentResume() {
		super();
		// TODO Auto-generated constructor stub
	}
	public StudentResume(String id, User student, String fileName, String fileUrl, Boolean isDefault,
			LocalDateTime uploadedAt) {
		super();
		this.id = id;
		this.student = student;
		this.fileName = fileName;
		this.fileUrl = fileUrl;
		this.isDefault = isDefault;
		this.uploadedAt = uploadedAt;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public User getStudent() {
		return student;
	}
	public void setStudent(User student) {
		this.student = student;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getFileUrl() {
		return fileUrl;
	}
	public void setFileUrl(String fileUrl) {
		this.fileUrl = fileUrl;
	}
	public Boolean getIsDefault() {
		return isDefault;
	}
	public void setIsDefault(Boolean isDefault) {
		this.isDefault = isDefault;
	}
	public LocalDateTime getUploadedAt() {
		return uploadedAt;
	}
	public void setUploadedAt(LocalDateTime uploadedAt) {
		this.uploadedAt = uploadedAt;
	}
    
    
    
}