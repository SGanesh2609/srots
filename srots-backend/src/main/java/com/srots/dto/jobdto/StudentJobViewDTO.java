package com.srots.dto.jobdto;

import java.time.LocalDate;

import com.srots.model.Job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentJobViewDTO {
//    private JobResponseDTO job;
	private Job job;
    private boolean eligible;
    private String NotEligibilityReason;
    private boolean applied;
    private boolean expired;
	public StudentJobViewDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	

	public StudentJobViewDTO(Job job, boolean eligible, String notEligibilityReason, boolean applied, boolean expired) {
		super();
		this.job = job;
		this.eligible = eligible;
		NotEligibilityReason = notEligibilityReason;
		this.applied = applied;
		this.expired = expired;
	}



	public Job getJob() {
		return job;
	}
	public void setJob(Job job) {
		this.job = job;
	}
	public boolean isEligible() {
		return eligible;
	}
	public void setEligible(boolean eligible) {
		this.eligible = eligible;
	}
	public String getNotEligibilityReason() {
		return NotEligibilityReason;
	}
	public void setNotEligibilityReason(String NotEligibilityReason) {
		this.NotEligibilityReason = NotEligibilityReason;
	}
	public boolean isApplied() {
		return applied;
	}
	public void setApplied(boolean applied) {
		this.applied = applied;
	}

	public boolean isExpired() {
		return expired;
	}

	public void setExpired(boolean expired) {
		this.expired = expired;
	}

}