package com.srots.dto;

import lombok.Data;

@Data
public class CompanyResponse {
    private String id;
    private String name;
    private String website;
    private String description;
    private String logo;
    private String headquarters;
    private String fullAddress;
    private Object address_json;
	public CompanyResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
	public CompanyResponse(String id, String name, String website, String description, String logo, String headquarters,
			String fullAddress, Object address_json) {
		super();
		this.id = id;
		this.name = name;
		this.website = website;
		this.description = description;
		this.logo = logo;
		this.headquarters = headquarters;
		this.fullAddress = fullAddress;
		this.address_json = address_json;
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
	public String getLogo() {
		return logo;
	}
	public void setLogo(String logo) {
		this.logo = logo;
	}
	public String getHeadquarters() {
		return headquarters;
	}
	public void setHeadquarters(String headquarters) {
		this.headquarters = headquarters;
	}
	public String getFullAddress() {
		return fullAddress;
	}
	public void setFullAddress(String fullAddress) {
		this.fullAddress = fullAddress;
	}
	public Object getAddress_json() {
		return address_json;
	}
	public void setAddress_json(Object address_json) {
		this.address_json = address_json;
	}
    
    
    
}