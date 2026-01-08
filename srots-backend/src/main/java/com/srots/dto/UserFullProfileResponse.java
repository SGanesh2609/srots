package com.srots.dto;

import com.srots.model.StudentProfile;
import com.srots.model.EducationRecord;
import com.srots.model.User;
import lombok.Data;
import java.util.List;

@Data
public class UserFullProfileResponse {
    private User user; // Basic User details
    private StudentProfile profile; // Detailed Academic Profile
    private List<EducationRecord> educationHistory; // Full Education History
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public StudentProfile getProfile() {
		return profile;
	}
	public void setProfile(StudentProfile profile) {
		this.profile = profile;
	}
	public List<EducationRecord> getEducationHistory() {
		return educationHistory;
	}
	public void setEducationHistory(List<EducationRecord> educationHistory) {
		this.educationHistory = educationHistory;
	}
    
    
    
}