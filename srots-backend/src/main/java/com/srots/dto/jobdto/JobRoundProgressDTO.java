package com.srots.dto.jobdto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JobRoundProgressDTO {
    private int roundNumber;
    private String roundName;
    private long passedCount;
    private long rejectedCount;
    private long pendingCount; // Still in this round, not yet processed
    private String status; // e.g., "Completed", "In Progress", "Upcoming"
	public JobRoundProgressDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public JobRoundProgressDTO(int roundNumber, String roundName, long passedCount, long rejectedCount,
			long pendingCount, String status) {
		super();
		this.roundNumber = roundNumber;
		this.roundName = roundName;
		this.passedCount = passedCount;
		this.rejectedCount = rejectedCount;
		this.pendingCount = pendingCount;
		this.status = status;
	}
	public int getRoundNumber() {
		return roundNumber;
	}
	public void setRoundNumber(int roundNumber) {
		this.roundNumber = roundNumber;
	}
	public String getRoundName() {
		return roundName;
	}
	public void setRoundName(String roundName) {
		this.roundName = roundName;
	}
	public long getPassedCount() {
		return passedCount;
	}
	public void setPassedCount(long passedCount) {
		this.passedCount = passedCount;
	}
	public long getRejectedCount() {
		return rejectedCount;
	}
	public void setRejectedCount(long rejectedCount) {
		this.rejectedCount = rejectedCount;
	}
	public long getPendingCount() {
		return pendingCount;
	}
	public void setPendingCount(long pendingCount) {
		this.pendingCount = pendingCount;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
    
    
    
    
}
