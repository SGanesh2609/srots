package com.srots.dto;

import lombok.Data;

@Data
public class NoticeDTO {
    private String id;
    private String collegeId;
    private String title;
    private String description;
    private String date;
//    private String postedBy;
    private String createdBy;
    private String type;
    private String fileName;
    private String fileUrl;
    
    
	public NoticeDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public NoticeDTO(String id, String collegeId, String title, String description, String date, String createdBy,
			String type, String fileName, String fileUrl) {
		super();
		this.id = id;
		this.collegeId = collegeId;
		this.title = title;
		this.description = description;
		this.date = date;
		this.createdBy = createdBy;
		this.type = type;
		this.fileName = fileName;
		this.fileUrl = fileUrl;
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
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
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
    
    
    
}
