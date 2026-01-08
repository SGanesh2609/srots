package com.srots.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;      // e.g., "SOFT_DELETE", "HARD_DELETE", "STATUS_CHANGE"
    private String targetId;    // The ID of the Course
    private String targetName;  // The Name of the Course (useful if course is hard deleted)
    private String performedBy; // Admin Email or Username
    
    @Column(columnDefinition = "TEXT")
    private String details;     // Any extra info (e.g., "Changed status from PENDING to ACTIVE")

    @CreationTimestamp
    private LocalDateTime timestamp;

	public AuditLog() {
		super();
		// TODO Auto-generated constructor stub
	}

	public AuditLog(Long id, String action, String targetId, String targetName, String performedBy, String details,
			LocalDateTime timestamp) {
		super();
		this.id = id;
		this.action = action;
		this.targetId = targetId;
		this.targetName = targetName;
		this.performedBy = performedBy;
		this.details = details;
		this.timestamp = timestamp;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public String getTargetId() {
		return targetId;
	}

	public void setTargetId(String targetId) {
		this.targetId = targetId;
	}

	public String getTargetName() {
		return targetName;
	}

	public void setTargetName(String targetName) {
		this.targetName = targetName;
	}

	public String getPerformedBy() {
		return performedBy;
	}

	public void setPerformedBy(String performedBy) {
		this.performedBy = performedBy;
	}

	public String getDetails() {
		return details;
	}

	public void setDetails(String details) {
		this.details = details;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
    
    
}