package com.srots.dto.studentDTOs;

import java.time.LocalDate;

import lombok.Data;

@Data
public class PublicationDTO {
    private String id;
    private String title;
    private String publisher;
    private String publicationUrl;
    private LocalDate publishDate;
	public PublicationDTO(String id, String title, String publisher, String publicationUrl, LocalDate publishDate) {
		super();
		this.id = id;
		this.title = title;
		this.publisher = publisher;
		this.publicationUrl = publicationUrl;
		this.publishDate = publishDate;
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
	public String getPublisher() {
		return publisher;
	}
	public void setPublisher(String publisher) {
		this.publisher = publisher;
	}
	public String getPublicationUrl() {
		return publicationUrl;
	}
	public void setPublicationUrl(String publicationUrl) {
		this.publicationUrl = publicationUrl;
	}
	public LocalDate getPublishDate() {
		return publishDate;
	}
	public void setPublishDate(LocalDate publishDate) {
		this.publishDate = publishDate;
	}
    
    
    
}