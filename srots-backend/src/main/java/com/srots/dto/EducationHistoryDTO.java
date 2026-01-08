package com.srots.dto;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationHistoryDTO {
    private String level;         // e.g., "Class 10" or "Undergraduate"
    private String institution;
    private String board;
    private String yearOfPassing;
    private String score;
    private String scoreType;     // e.g., "CGPA", "Percentage"
    
    private Integer currentArrears;
    
	private String specialization; // Added to match entity
    private List<Map<String, Object>> semesters;
    
    
    
    
    
	public EducationHistoryDTO(String level, String institution, String board, String yearOfPassing, String score,
			String scoreType, Integer currentArrears, String specialization, List<Map<String, Object>> semesters) {
		super();
		this.level = level;
		this.institution = institution;
		this.board = board;
		this.yearOfPassing = yearOfPassing;
		this.score = score;
		this.scoreType = scoreType;
		this.currentArrears = currentArrears;
		this.specialization = specialization;
		this.semesters = semesters;
	}
	public EducationHistoryDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
	public EducationHistoryDTO(String level, String institution, String board, String yearOfPassing, String score, String scoreType) {
	    this.level = level;
	    this.institution = institution;
	    this.board = board;
	    this.yearOfPassing = yearOfPassing;
	    this.score = score;
	    this.scoreType = scoreType;
	    this.currentArrears = 0; // Default value
	}
	
	public String getLevel() {
		return level;
	}
	public void setLevel(String level) {
		this.level = level;
	}
	public String getInstitution() {
		return institution;
	}
	public void setInstitution(String institution) {
		this.institution = institution;
	}
	public String getBoard() {
		return board;
	}
	public void setBoard(String board) {
		this.board = board;
	}
	public String getYearOfPassing() {
		return yearOfPassing;
	}
	public void setYearOfPassing(String yearOfPassing) {
		this.yearOfPassing = yearOfPassing;
	}
	public String getScore() {
		return score;
	}
	public void setScore(String score) {
		this.score = score;
	}
	public String getScoreType() {
		return scoreType;
	}
	public void setScoreType(String scoreType) {
		this.scoreType = scoreType;
	}
	public String getSpecialization() {
		return specialization;
	}
	public void setSpecialization(String specialization) {
		this.specialization = specialization;
	}
	public List<Map<String, Object>> getSemesters() {
		return semesters;
	}
	public void setSemesters(List<Map<String, Object>> semesters) {
		this.semesters = semesters;
	}
    
	public Integer getCurrentArrears() {
		return currentArrears;
	}
	public void setCurrentArrears(Integer currentArrears) {
		this.currentArrears = currentArrears;
	}
    
    
}