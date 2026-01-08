package com.srots.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class CompanyRequest {
    private String name;
    private String website;
    private String description;
    @JsonProperty("logoUrl")
    private String logoUrl;
    private Map<String, String> address;
	public CompanyRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public CompanyRequest(String name, String website, String description, String logoUrl,
			Map<String, String> address) {
		super();
		this.name = name;
		this.website = website;
		this.description = description;
		this.logoUrl = logoUrl;
		this.address = address;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getWebsite() {
		return website;
	}
	public void setWebsite(String website) {
		this.website = website;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	@JsonProperty("logoUrl")
	public String getLogoUrl() {
		return logoUrl;
	}
	@JsonProperty("logoUrl")
	public void setLogoUrl(String logoUrl) {
		this.logoUrl = logoUrl;
	}
	public Map<String, String> getAddress() {
		return address;
	}
	public void setAddress(Map<String, String> address) {
		this.address = address;
	} 
    
    
    
}