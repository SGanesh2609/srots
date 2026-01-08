package com.srots.dto.jobdto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JobApplicantsDashboardDTO {
    private String jobTitle;
    private long totalApplicants;
    private Map<String, Long> stats; // Counts of Hired, Rejected, etc.
    private List<Map<String, Object>> roundSummary;
    private List<String> headers;    // The column names (Full Name, CGPA, etc.)
    private List<Map<String, Object>> students; // The actual row data
	public JobApplicantsDashboardDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
	
	public JobApplicantsDashboardDTO(String jobTitle, long totalApplicants, Map<String, Long> stats,
			List<Map<String, Object>> roundSummary, List<String> headers, List<Map<String, Object>> students) {
		super();
		this.jobTitle = jobTitle;
		this.totalApplicants = totalApplicants;
		this.stats = stats;
		this.roundSummary = roundSummary;
		this.headers = headers;
		this.students = students;
	}



	public String getJobTitle() {
		return jobTitle;
	}
	public void setJobTitle(String jobTitle) {
		this.jobTitle = jobTitle;
	}
	public long getTotalApplicants() {
		return totalApplicants;
	}
	public void setTotalApplicants(long totalApplicants) {
		this.totalApplicants = totalApplicants;
	}
	public Map<String, Long> getStats() {
		return stats;
	}
	public void setStats(Map<String, Long> stats) {
		this.stats = stats;
	}
	public List<String> getHeaders() {
		return headers;
	}
	public void setHeaders(List<String> headers) {
		this.headers = headers;
	}
	public List<Map<String, Object>> getStudents() {
		return students;
	}
	public void setStudents(List<Map<String, Object>> students) {
		this.students = students;
	}



	public List<Map<String, Object>> getRoundSummary() {
		return roundSummary;
	}



	public void setRoundSummary(List<Map<String, Object>> roundSummary) {
		this.roundSummary = roundSummary;
	}
	
	
    
}