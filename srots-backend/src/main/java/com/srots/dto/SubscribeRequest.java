package com.srots.dto;

import lombok.Data;

@Data
public class SubscribeRequest {
    private String collegeId;
    private String companyId;
    
    
    
	public SubscribeRequest(String collegeId, String companyId) {
		super();
		this.collegeId = collegeId;
		this.companyId = companyId;
	}
	public SubscribeRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public String getCollegeId() {
		return collegeId;
	}
	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
	}
	public String getCompanyId() {
		return companyId;
	}
	public void setCompanyId(String companyId) {
		this.companyId = companyId;
	}
    
    
    
}
