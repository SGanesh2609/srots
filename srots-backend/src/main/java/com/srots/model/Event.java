package com.srots.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.*;

@Entity
@Table(name = "events", indexes = {
    @Index(name = "idx_event_college_id", columnList = "college_id"),
    @Index(name = "idx_event_type",       columnList = "event_type"),
    @Index(name = "idx_event_start_date", columnList = "start_date")
})
@Data @NoArgsConstructor @AllArgsConstructor
public class Event {
    @Id 
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    private String title;
    @Column(columnDefinition = "TEXT") private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type")
    private EventType eventType;

    public enum EventType { 
        Drive, Class, Exam, Holiday, Meeting, Time_Table, Training, Workshop;
        public String getDisplayName() { return name().replace("_", " "); }
    }

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @JdbcTypeCode(SqlTypes.JSON)
    private String targetBranches; 

    @JdbcTypeCode(SqlTypes.JSON)
    private String targetYears; // Added to match DB: target_years

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "schedule_json")
    private String scheduleJson; 

    private LocalDateTime createdAt = LocalDateTime.now();


	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public College getCollege() {
		return college;
	}

	public void setCollege(College college) {
		this.college = college;
	}

	public User getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(User createdBy) {
		this.createdBy = createdBy;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public EventType getEventType() {
		return eventType;
	}

	public void setEventType(EventType eventType) {
		this.eventType = eventType;
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

	public LocalTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalTime startTime) {
		this.startTime = startTime;
	}

	public LocalTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalTime endTime) {
		this.endTime = endTime;
	}

	public String getTargetBranches() {
		return targetBranches;
	}

	public void setTargetBranches(String targetBranches) {
		this.targetBranches = targetBranches;
	}

	public String getTargetYears() {
		return targetYears;
	}

	public void setTargetYears(String targetYears) {
		this.targetYears = targetYears;
	}

	public String getScheduleJson() {
		return scheduleJson;
	}

	public void setScheduleJson(String scheduleJson) {
		this.scheduleJson = scheduleJson;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
    
    

    // Standard getters, setters, and constructors...
}