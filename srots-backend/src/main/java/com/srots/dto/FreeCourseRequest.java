package com.srots.dto;

import com.srots.model.FreeCourse.CoursePlatform;

import lombok.Data;

@Data
public class FreeCourseRequest {
    private String name;
    private String technology;
    private String description;
    private String link;
    private CoursePlatform platform; // UI tells us what platform this is
	public FreeCourseRequest(String name, String technology, String description, String link, CoursePlatform platform) {
		super();
		this.name = name;
		this.technology = technology;
		this.description = description;
		this.link = link;
		this.platform = platform;
	}
	public FreeCourseRequest() {
		super();
		// TODO Auto-generated constructor stub
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
    
    
}