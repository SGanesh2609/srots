package com.srots.dto.studentDTOs;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ExperienceDTO {
    private String id; // UUID
    private String title;
    private String company;
    private String location;
    private String type; // e.g., Internship, Full-time
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
    private String description;
	public ExperienceDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public ExperienceDTO(String id, String title, String company, String location, String type, LocalDate startDate,
			LocalDate endDate, Boolean isCurrent, String description) {
		super();
		this.id = id;
		this.title = title;
		this.company = company;
		this.location = location;
		this.type = type;
		this.startDate = startDate;
		this.endDate = endDate;
		this.isCurrent = isCurrent;
		this.description = description;
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
	public String getCompany() {
		return company;
	}
	public void setCompany(String company) {
		this.company = company;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
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
	public Boolean getIsCurrent() {
		return isCurrent;
	}
	public void setIsCurrent(Boolean isCurrent) {
		this.isCurrent = isCurrent;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
    
    
    
}