package com.srots.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private String text;
    private UserInfo user; // {id, name, role}
    
    @Data
    public static class UserInfo {
        private String id;
        private String name;
        private String role;
		public UserInfo() {
			super();
			// TODO Auto-generated constructor stub
		}
		public UserInfo(String id, String name, String role) {
			super();
			this.id = id;
			this.name = name;
			this.role = role;
		}
		public String getId() {
			return id;
		}
		public void setId(String id) {
			this.id = id;
		}
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public String getRole() {
			return role;
		}
		public void setRole(String role) {
			this.role = role;
		}
        
        
    }

	public CommentRequest() {
		super();
		// TODO Auto-generated constructor stub
	}

	public CommentRequest(String text, UserInfo user) {
		super();
		this.text = text;
		this.user = user;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public UserInfo getUser() {
		return user;
	}

	public void setUser(UserInfo user) {
		this.user = user;
	}
    
    
}
