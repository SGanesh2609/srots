package com.srots.dto;

import lombok.Data;
import java.util.List;

@Data
public class EventDTO {
    private String id;
    private String collegeId;
    private String title;
    private String description;
    private String date; // YYYY-MM-DD
    private String endDate;
    private String type;
    private String startTime;
    private String endTime;
    private List<String> targetBranches;
    private List<Integer> targetYears;
    private String createdBy;
    private String createdById;
    private Object schedule;
    
    
    
	public EventDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public EventDTO(String id, String collegeId, String title, String description, String date, String endDate,
			String type, String startTime, String endTime, List<String> targetBranches, List<Integer> targetYears,
			String createdBy, String createdById, Object schedule) {
		super();
		this.id = id;
		this.collegeId = collegeId;
		this.title = title;
		this.description = description;
		this.date = date;
		this.endDate = endDate;
		this.type = type;
		this.startTime = startTime;
		this.endTime = endTime;
		this.targetBranches = targetBranches;
		this.targetYears = targetYears;
		this.createdBy = createdBy;
		this.createdById = createdById;
		this.schedule = schedule;
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
	public String getEndDate() {
		return endDate;
	}
	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getStartTime() {
		return startTime;
	}
	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}
	public String getEndTime() {
		return endTime;
	}
	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}
	public List<String> getTargetBranches() {
		return targetBranches;
	}
	public void setTargetBranches(List<String> targetBranches) {
		this.targetBranches = targetBranches;
	}
	
	
	public List<Integer> getTargetYears() {
		return targetYears;
	}
	public void setTargetYears(List<Integer> list) {
		this.targetYears = list;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public Object getSchedule() {
		return schedule;
	}
	public void setSchedule(Object schedule) {
		this.schedule = schedule;
	}

	public String getCreatedById() {
		return createdById;
	}

	public void setCreatedById(String createdById) {
		this.createdById = createdById;
	} 
    
    
    
}