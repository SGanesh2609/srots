// 10. StudentPublication.java
package com.srots.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity @Table(name = "student_publications")
@Data public class StudentPublication {
	@Id @Column(length = 36) private String id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id")
    @JsonBackReference
    private User student;
    private String title;
    private String publisher;
    @Column(columnDefinition = "TEXT") private String publicationUrl;
    private LocalDate publishDate;
	public StudentPublication() {
		super();
		// TODO Auto-generated constructor stub
	}
	public StudentPublication(String id, User student, String title, String publisher, String publicationUrl,
			LocalDate publishDate) {
		super();
		this.id = id;
		this.student = student;
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
	public User getStudent() {
		return student;
	}
	public void setStudent(User student) {
		this.student = student;
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
	
	@Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentPublication)) return false;
        return id != null && id.equals(((StudentPublication) o).id);
    }
    @Override public int hashCode() { return getClass().hashCode(); }
    
    
}