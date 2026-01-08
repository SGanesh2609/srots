// 6. StudentProject.java
package com.srots.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity @Table(name = "student_projects")
@Data public class StudentProject {
	@Id @Column(length = 36) private String id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id")
    @JsonBackReference
    private User student;
    private String title;
    private String domain;
    @Column(columnDefinition = "TEXT") private String techUsed;
    @Column(columnDefinition = "TEXT") private String projectLink;
    @Column(columnDefinition = "TEXT") private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent = false;
	public StudentProject() {
		super();
		// TODO Auto-generated constructor stub
	}
	public StudentProject(String id, User student, String title, String domain, String techUsed, String projectLink,
			String description, LocalDate startDate, LocalDate endDate, Boolean isCurrent) {
		super();
		this.id = id;
		this.student = student;
		this.title = title;
		this.domain = domain;
		this.techUsed = techUsed;
		this.projectLink = projectLink;
		this.description = description;
		this.startDate = startDate;
		this.endDate = endDate;
		this.isCurrent = isCurrent;
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
	public Boolean getIsCurrent() {
		return isCurrent;
	}
	public void setIsCurrent(Boolean isCurrent) {
		this.isCurrent = isCurrent;
	}
    
	@Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentProject)) return false;
        return id != null && id.equals(((StudentProject) o).id);
    }
    @Override public int hashCode() { return getClass().hashCode(); }
    
}