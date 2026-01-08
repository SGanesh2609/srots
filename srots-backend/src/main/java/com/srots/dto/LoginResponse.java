package com.srots.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String userId;
    private String fullName;
    private String role;
    private String collegeId;
	public LoginResponse(String token, String userId, String fullName, String role, String collegeId) {
		super();
		this.token = token;
		this.userId = userId;
		this.fullName = fullName;
		this.role = role;
		this.collegeId = collegeId;
	}
	public LoginResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getCollegeId() {
		return collegeId;
	}
	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
	}
    
    
}
