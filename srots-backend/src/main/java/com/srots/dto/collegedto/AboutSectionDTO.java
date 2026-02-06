package com.srots.dto.collegedto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AboutSectionDTO {
    private String id;
    private String title;
    private String content;
    private String image; // URL
    private String lastModifiedBy;
    private LocalDateTime lastModifiedAt;
	public AboutSectionDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public AboutSectionDTO(String id, String title, String content, String image, String lastModifiedBy,
			LocalDateTime lastModifiedAt) {
		super();
		this.id = id;
		this.title = title;
		this.content = content;
		this.image = image;
		this.lastModifiedBy = lastModifiedBy;
		this.lastModifiedAt = lastModifiedAt;
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
	public String getLastModifiedBy() {
		return lastModifiedBy;
	}
	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}
	public LocalDateTime getLastModifiedAt() {
		return lastModifiedAt;
	}
	public void setLastModifiedAt(LocalDateTime lastModifiedAt) {
		this.lastModifiedAt = lastModifiedAt;
	}
    
    
}
