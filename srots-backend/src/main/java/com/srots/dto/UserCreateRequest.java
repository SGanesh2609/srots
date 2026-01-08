package com.srots.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String username; 
    private String name;
    private String email;
    private String phone;
    private String department;
    @JsonProperty("aadhaarNumber")
    private String aadhaar;
    
    // New Fields for CP and Srots Users
    private String alternativeEmail;
    private String alternativePhone;
    private String bio;
    private String experience; // e.g., "12+ Years"
    private String education;  // e.g., "M.Tech, MBA"
    private String avatarUrl;  // To store the link to the profile photo
    
    private AddressRequest address; 
    
    // College/Role context
    private String collegeId;
    private Boolean isCollegeHead;
    
    // Student specific data
    private StudentProfileRequest studentProfile;

	public UserCreateRequest() {
		super();
		// TODO Auto-generated constructor stub
	}

	public UserCreateRequest(String username, String name, String email, String phone, String department,
			String aadhaar, String alternativeEmail, String alternativePhone, String bio, String experience,
			String education, String avatarUrl, AddressRequest address, String collegeId, Boolean isCollegeHead,
			StudentProfileRequest studentProfile) {
		super();
		this.username = username;
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.department = department;
		this.aadhaar = aadhaar;
		this.alternativeEmail = alternativeEmail;
		this.alternativePhone = alternativePhone;
		this.bio = bio;
		this.experience = experience;
		this.education = education;
		this.avatarUrl = avatarUrl;
		this.address = address;
		this.collegeId = collegeId;
		this.isCollegeHead = isCollegeHead;
		this.studentProfile = studentProfile;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public String getAadhaar() {
		return aadhaar;
	}

	public void setAadhaar(String aadhaar) {
		this.aadhaar = aadhaar;
	}

	public String getAlternativeEmail() {
		return alternativeEmail;
	}

	public void setAlternativeEmail(String alternativeEmail) {
		this.alternativeEmail = alternativeEmail;
	}

	public String getAlternativePhone() {
		return alternativePhone;
	}

	public void setAlternativePhone(String alternativePhone) {
		this.alternativePhone = alternativePhone;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public String getExperience() {
		return experience;
	}

	public void setExperience(String experience) {
		this.experience = experience;
	}

	public String getEducation() {
		return education;
	}

	public void setEducation(String education) {
		this.education = education;
	}

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}

	public AddressRequest getAddress() {
		return address;
	}

	public void setAddress(AddressRequest address) {
		this.address = address;
	}

	public String getCollegeId() {
		return collegeId;
	}

	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
	}

	public Boolean getIsCollegeHead() {
		return isCollegeHead;
	}

	public void setIsCollegeHead(Boolean isCollegeHead) {
		this.isCollegeHead = isCollegeHead;
	}

	public StudentProfileRequest getStudentProfile() {
		return studentProfile;
	}

	public void setStudentProfile(StudentProfileRequest studentProfile) {
		this.studentProfile = studentProfile;
	}
    
    
    
}
