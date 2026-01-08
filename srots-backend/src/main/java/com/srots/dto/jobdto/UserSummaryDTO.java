package com.srots.dto.jobdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private String id;
    private String fullName;
    private String email;
    private String username;
    private String role;
    private String avatarUrl;
	public UserSummaryDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public UserSummaryDTO(String id, String fullName, String email, String username, String role, String avatarUrl) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.email = email;
		this.username = username;
		this.role = role;
		this.avatarUrl = avatarUrl;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getAvatarUrl() {
		return avatarUrl;
	}
	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}
    
    
    
}