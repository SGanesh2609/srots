package com.srots.dto.studentDTOs;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ProjectDTO {
    private String id;
    private String title;
    private String domain;
    private String techUsed;
    private String projectLink;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
	public ProjectDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public ProjectDTO(String id, String title, String domain, String techUsed, String projectLink, String description,
			LocalDate startDate, LocalDate endDate) {
		super();
		this.id = id;
		this.title = title;
		this.domain = domain;
		this.techUsed = techUsed;
		this.projectLink = projectLink;
		this.description = description;
		this.startDate = startDate;
		this.endDate = endDate;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDomain() {
		return domain;
	}
	public void setDomain(String domain) {
		this.domain = domain;
	}
	public String getTechUsed() {
		return techUsed;
	}
	public void setTechUsed(String techUsed) {
		this.techUsed = techUsed;
	}
	public String getProjectLink() {
		return projectLink;
	}
	public void setProjectLink(String projectLink) {
		this.projectLink = projectLink;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public LocalDate getStartDate() {
		return startDate;
	}
	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}
	public LocalDate getEndDate() {
		return endDate;
	}
	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}
    
    
}