package com.srots.dto.collegedto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CollegeResponse {
    
    private String id;
    private String name;
    private String code;
    private String type;
    private String email;
    private String phone;
    private String logoUrl;
    private String address;      
    private Object address_json; 
    private Object socialMedia;
    private List<Object> aboutSections;
    private List<Object> branches;
    private long studentCount;
    private long cphCount;
    private long activeJobs;
	public CollegeResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public String getLogoUrl() {
		return logoUrl;
	}

	public void setLogoUrl(String logoUrl) {
		this.logoUrl = logoUrl;
	}

	public CollegeResponse(String id, String name, String code, String type, String email, String phone, String logoUrl,
			String address, Object address_json, Object socialMedia, List<Object> aboutSections, List<Object> branches,
			long studentCount, long cphCount, long activeJobs) {
		super();
		this.id = id;
		this.name = name;
		this.code = code;
		this.type = type;
		this.email = email;
		this.phone = phone;
		this.logoUrl = logoUrl;
		this.address = address;
		this.address_json = address_json;
		this.socialMedia = socialMedia;
		this.aboutSections = aboutSections;
		this.branches = branches;
		this.studentCount = studentCount;
		this.cphCount = cphCount;
		this.activeJobs = activeJobs;
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
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public Object getAddress_json() {
		return address_json;
	}
	public void setAddress_json(Object address_json) {
		this.address_json = address_json;
	}
	public Object getSocialMedia() {
		return socialMedia;
	}
	public void setSocialMedia(Object socialMedia) {
		this.socialMedia = socialMedia;
	}
	public List<Object> getAboutSections() {
		return aboutSections;
	}
	public void setAboutSections(List<Object> aboutSections) {
		this.aboutSections = aboutSections;
	}
	public List<Object> getBranches() {
		return branches;
	}
	public void setBranches(List<Object> branches) {
		this.branches = branches;
	}
	public long getStudentCount() {
		return studentCount;
	}
	public void setStudentCount(long studentCount) {
		this.studentCount = studentCount;
	}
	public long getCphCount() {
		return cphCount;
	}
	public void setCphCount(long cphCount) {
		this.cphCount = cphCount;
	}
	public long getActiveJobs() {
		return activeJobs;
	}
	public void setActiveJobs(long activeJobs) {
		this.activeJobs = activeJobs;
	}
    
    
    
}