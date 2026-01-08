package com.srots.dto.jobdto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JobHiringStatsDTO {
    private String jobId;
    private String jobTitle;
    private int totalRounds;
    private List<JobRoundProgressDTO> rounds;
	public JobHiringStatsDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public JobHiringStatsDTO(String jobId, String jobTitle, int totalRounds, List<JobRoundProgressDTO> rounds) {
		super();
		this.jobId = jobId;
		this.jobTitle = jobTitle;
		this.totalRounds = totalRounds;
		this.rounds = rounds;
	}
	public String getJobId() {
		return jobId;
	}
	public void setJobId(String jobId) {
		this.jobId = jobId;
	}
	public String getJobTitle() {
		return jobTitle;
	}
	public void setJobTitle(String jobTitle) {
		this.jobTitle = jobTitle;
	}
	public int getTotalRounds() {
		return totalRounds;
	}
	public void setTotalRounds(int totalRounds) {
		this.totalRounds = totalRounds;
	}
	public List<JobRoundProgressDTO> getRounds() {
		return rounds;
	}
	public void setRounds(List<JobRoundProgressDTO> rounds) {
		this.rounds = rounds;
	}
    
    
    
    
}
