// 5. StudentExperience.java
package com.srots.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "student_experience")
@Data
public class StudentExperience {
	@Id @Column(length = 36) private String id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "student_id")
	@JsonBackReference
	private User student;
	private String title;
	private String company;
	private String location;
	private String type;
	private LocalDate startDate;
	private LocalDate endDate;
	private Boolean isCurrent = false;
	private String salaryRange;
	@Column(columnDefinition = "TEXT")
	private String description;

	public StudentExperience() {
		super();
		// TODO Auto-generated constructor stub
	}

	public StudentExperience(String id, User student, String title, String company, String location, String type,
			LocalDate startDate, LocalDate endDate, Boolean isCurrent, String salaryRange, String description) {
		super();
		this.id = id;
		this.student = student;
		this.title = title;
		this.company = company;
		this.location = location;
		this.type = type;
		this.startDate = startDate;
		this.endDate = endDate;
		this.isCurrent = isCurrent;
		this.salaryRange = salaryRange;
		this.description = description;
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

	public String getCompany() {
		return company;
	}

	public void setCompany(String company) {
		this.company = company;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
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

	public String getSalaryRange() {
		return salaryRange;
	}

	public void setSalaryRange(String salaryRange) {
		this.salaryRange = salaryRange;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentExperience)) return false;
        return id != null && id.equals(((StudentExperience) o).id);
    }
    @Override public int hashCode() { return getClass().hashCode(); }

}