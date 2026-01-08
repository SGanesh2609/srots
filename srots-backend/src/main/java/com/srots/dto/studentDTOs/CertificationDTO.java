package com.srots.dto.studentDTOs;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CertificationDTO {
	private String id;
	private String name;
	private String organizer;
	private String credentialUrl;
	private LocalDate issueDate;
	private Boolean hasExpiry;
	private LocalDate expiryDate;

	public CertificationDTO() {
		super();
		// TODO Auto-generated constructor stub
	}

	public CertificationDTO(String id, String name, String organizer, String credentialUrl, LocalDate issueDate,
			Boolean hasExpiry, LocalDate expiryDate) {
		super();
		this.id = id;
		this.name = name;
		this.organizer = organizer;
		this.credentialUrl = credentialUrl;
		this.issueDate = issueDate;
		this.hasExpiry = hasExpiry;
		this.expiryDate = expiryDate;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
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

}
