package com.srots.dto;

import lombok.Data;

@Data
public class AboutSectionDTO {
    private String id;      // Unique identifier for the section (e.g., "sec_1")
    private String title;   // Section Heading
    private String content; // Long text description
    private String image;   // URL to a section-specific image
	public AboutSectionDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public AboutSectionDTO(String id, String title, String content, String image) {
		super();
		this.id = id;
		this.title = title;
		this.content = content;
		this.image = image;
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
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
    
    
    
}
