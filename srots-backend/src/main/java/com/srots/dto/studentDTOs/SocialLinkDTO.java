package com.srots.dto.studentDTOs;

import lombok.Data;

@Data
public class SocialLinkDTO {
    private String id;
    private String platform; // LinkedIn, GitHub, etc.
    private String url;
	public SocialLinkDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SocialLinkDTO(String id, String platform, String url) {
		super();
		this.id = id;
		this.platform = platform;
		this.url = url;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getPlatform() {
		return platform;
	}
	public void setPlatform(String platform) {
		this.platform = platform;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
    
    
}