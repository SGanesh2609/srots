// 9. StudentCertification.java
package com.srots.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity @Table(name = "student_certifications")
@Data public class StudentCertification {
    
    @Id @Column(length = 36) private String id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id") @JsonBackReference
    private User student;
    private String name;
    private String organizer;
    @Column(columnDefinition = "TEXT") private String credentialUrl;
    private LocalDate issueDate;
    private Boolean hasExpiry = false;
    private LocalDate expiryDate;
    private String score;
    private String licenseNumber;
	public StudentCertification() {
		super();
		// TODO Auto-generated constructor stub
	}
	public StudentCertification(String id, User student, String name, String organizer, String credentialUrl,
			LocalDate issueDate, Boolean hasExpiry, LocalDate expiryDate, String score, String licenseNumber) {
		super();
		this.id = id;
		this.student = student;
		this.name = name;
		this.organizer = organizer;
		this.credentialUrl = credentialUrl;
		this.issueDate = issueDate;
		this.hasExpiry = hasExpiry;
		this.expiryDate = expiryDate;
		this.score = score;
		this.licenseNumber = licenseNumber;
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
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getOrganizer() {
		return organizer;
	}
	public void setOrganizer(String organizer) {
		this.organizer = organizer;
	}
	public String getCredentialUrl() {
		return credentialUrl;
	}
	public void setCredentialUrl(String credentialUrl) {
		this.credentialUrl = credentialUrl;
	}
	public LocalDate getIssueDate() {
		return issueDate;
	}
	public void setIssueDate(LocalDate issueDate) {
		this.issueDate = issueDate;
	}
	public Boolean getHasExpiry() {
		return hasExpiry;
	}
	public void setHasExpiry(Boolean hasExpiry) {
		this.hasExpiry = hasExpiry;
	}
	public LocalDate getExpiryDate() {
		return expiryDate;
	}
	public void setExpiryDate(LocalDate expiryDate) {
		this.expiryDate = expiryDate;
	}
	public String getScore() {
		return score;
	}
	public void setScore(String score) {
		this.score = score;
	}
	public String getLicenseNumber() {
		return licenseNumber;
	}
	public void setLicenseNumber(String licenseNumber) {
		this.licenseNumber = licenseNumber;
	}
    
	@Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentCertification)) return false;
        return id != null && id.equals(((StudentCertification) o).id);
    }
    @Override public int hashCode() { return getClass().hashCode(); }
}