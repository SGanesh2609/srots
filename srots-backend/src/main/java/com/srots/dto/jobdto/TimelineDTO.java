package com.srots.dto.jobdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimelineDTO {
    private String roundName;
    private String status; // Qualified, Not Selected, Pending, Wait for Update
    private String date;
	public TimelineDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public TimelineDTO(String roundName, String status, String date) {
		super();
		this.roundName = roundName;
		this.status = status;
		this.date = date;
	}
	public String getRoundName() {
		return roundName;
	}
	public void setRoundName(String roundName) {
		this.roundName = roundName;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
    
    
}