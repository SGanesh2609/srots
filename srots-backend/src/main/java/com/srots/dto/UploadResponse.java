package com.srots.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class UploadResponse {
    private String url;
    private String name;
	public UploadResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
	public UploadResponse(String url, String name) {
		super();
		this.url = url;
		this.name = name;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
    
}