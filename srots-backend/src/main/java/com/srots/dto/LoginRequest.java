package com.srots.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private String deviceInfo;
    
	public LoginRequest() {
		super();
		// TODO Auto-generated constructor stub
	}

	public LoginRequest(String username, String password, String deviceInfo) {
		super();
		this.username = username;
		this.password = password;
		this.deviceInfo = deviceInfo;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getDeviceInfo() {
		return deviceInfo;
	}

	public void setDeviceInfo(String deviceInfo) {
		this.deviceInfo = deviceInfo;
	}
	
    
}
