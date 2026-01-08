// 11. StudentSocialLink.java
package com.srots.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "student_social_links")
@Data @NoArgsConstructor @AllArgsConstructor

public class StudentSocialLink {
	@Id @Column(length = 36) private String id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id")
    @JsonBackReference
    private User student;
    @Enumerated(EnumType.STRING) private Platform platform;
    public enum Platform { LinkedIn, GitHub, Portfolio, YouTube, Other }
    @Column(columnDefinition = "TEXT") private String url;
	public StudentSocialLink() {
		super();
		// TODO Auto-generated constructor stub
	}
	public StudentSocialLink(String id, User student, Platform platform, String url) {
		super();
		this.id = id;
		this.student = student;
		this.platform = platform;
		this.url = url;
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
	public Platform getPlatform() {
		return platform;
	}
	public void setPlatform(Platform platform) {
		this.platform = platform;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
    
	@Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentSocialLink)) return false;
        return id != null && id.equals(((StudentSocialLink) o).id);
    }
    @Override public int hashCode() { return getClass().hashCode(); }
    
}