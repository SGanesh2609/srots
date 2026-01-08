package com.srots.model;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(columnDefinition = "CHAR(36)")
	private String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "job_id", nullable = false)
	private Job job;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "student_id", nullable = false)
	private User student;

	@Enumerated(EnumType.STRING)
	private AppStatus status = AppStatus.Applied;

	public enum AppStatus {
		Applied, Shortlisted, Rejected, Hired, Not_Interested, Offer_Released
	}

	private String currentRoundStatus;
	
	private Integer currentRound;

	@CreationTimestamp
	private LocalDateTime appliedAt;
	
	@Enumerated(EnumType.STRING)
	private AppliedBy appliedBy = AppliedBy.Self; // Default

	public enum AppliedBy {
	    Self, CP_Admin, CP_Staff
	}

	

	public Application() {
		super();
		// TODO Auto-generated constructor stub
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Job getJob() {
		return job;
	}

	public void setJob(Job job) {
		this.job = job;
	}

	public User getStudent() {
		return student;
	}

	public void setStudent(User student) {
		this.student = student;
	}

	public AppStatus getStatus() {
		return status;
	}

	public void setStatus(AppStatus status) {
		this.status = status;
	}

	public String getCurrentRoundStatus() {
		return currentRoundStatus;
	}

	public void setCurrentRoundStatus(String currentRoundStatus) {
		this.currentRoundStatus = currentRoundStatus;
	}

	public LocalDateTime getAppliedAt() {
		return appliedAt;
	}

	public void setAppliedAt(LocalDateTime appliedAt) {
		this.appliedAt = appliedAt;
	}

	
	

	public AppliedBy getAppliedBy() {
		return appliedBy;
	}

	public void setAppliedBy(AppliedBy appliedBy) {
		this.appliedBy = appliedBy;
	}

		// --- MANUAL BUILDER (Fixes the "builder() is undefined" error) ---
		public static ApplicationBuilder builder() {
			return new ApplicationBuilder();
		}

	public static class ApplicationBuilder {
		private Job job;
		private User student;
		private AppStatus status;
		private String currentRoundStatus;
		private Integer currentRound;
		private AppliedBy appliedby;

		public ApplicationBuilder job(Job job) {
			this.job = job;
			return this;
		}

		public ApplicationBuilder student(User student) {
			this.student = student;
			return this;
		}

		public ApplicationBuilder status(AppStatus status) {
			this.status = status;
			return this;
		}

		public ApplicationBuilder currentRoundStatus(String status) {
			this.currentRoundStatus = status;
			return this;
		}

		public Application build() {
			Application app = new Application();
			app.setJob(this.job);
			app.setStudent(this.student);
			app.setStatus(this.status != null ? this.status : AppStatus.Applied);
			app.setCurrentRoundStatus(this.currentRoundStatus);
			app.setCurrentRound(this.currentRound);
			app.setAppliedBy(this.appliedby);
			return app;
		}
	}

	public Integer getCurrentRound() {
		return currentRound;
	}

	public void setCurrentRound(Integer currentRound) {
		this.currentRound = currentRound;
	}
	
	
}