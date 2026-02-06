package com.srots.dto.collegedto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CollegeRequest {    
    
    private String name;
    private String code;
    private String type;
    private String email;
    private String phone;
    private String landline;
    private String logoUrl; // Path received after upload
    private Map<String, Object> address; 
    private Map<String, String> socialMedia;
    private List<Object> aboutSections;
    
	public CollegeRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public String getLogoUrl() {
		return logoUrl;
	}

	public void setLogoUrl(String logoUrl) {
		this.logoUrl = logoUrl;
	}

	public CollegeRequest(String name, String code, String type, String email, String phone, String landline,
			String logoUrl, Map<String, Object> address, Map<String, String> socialMedia, List<Object> aboutSections) {
		super();
		this.name = name;
		this.code = code;
		this.type = type;
		this.email = email;
		this.phone = phone;
		this.landline = landline;
		this.logoUrl = logoUrl;
		this.address = address;
		this.socialMedia = socialMedia;
		this.aboutSections = aboutSections;
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getLandline() {
		return landline;
	}
	public void setLandline(String landline) {
		this.landline = landline;
	}
	public Map<String, Object> getAddress() {
		return address;
	}
	public void setAddress(Map<String, Object> address) {
		this.address = address;
	}
	public Map<String, String> getSocialMedia() {
		return socialMedia;
	}
	public void setSocialMedia(Map<String, String> socialMedia) {
		this.socialMedia = socialMedia;
	}
	public List<Object> getAboutSections() {
		return aboutSections;
	}
	public void setAboutSections(List<Object> aboutSections) {
		this.aboutSections = aboutSections;
	}
    
    
    
}