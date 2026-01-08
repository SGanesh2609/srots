package com.srots.dto;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileRequest {
    // Basic Academic
    private String rollNumber;
    private String branch;
    private Integer batch;
    private String course;
    private String gender;

    // Administrative Fields
    private String mentor;
    private String advisor;
    private String coordinator;
    private String placementCycle;

    // Personal / Contact
    private String dob; // String to be parsed as LocalDate
    private String nationality;
    private String religion;
    private String personalEmail;
    private String instituteEmail;
    private String whatsappNumber;
    
    
    // Parents
    private String fatherName;
    private String motherName;
    private String fatherOccupation;
    private String motherOccupation;
    private String parentPhone;
    private String parentEmail;

    // Address (Objects will be converted to JSON strings)
    private Object currentAddress;
    private Object permanentAddress;

    // Education History (List for the loop)
    private List<EducationHistoryDTO> educationHistory;

	public String getRollNumber() {
		return rollNumber;
	}

	public void setRollNumber(String rollNumber) {
		this.rollNumber = rollNumber;
	}

	public String getBranch() {
		return branch;
	}

	public void setBranch(String branch) {
		this.branch = branch;
	}

	public Integer getBatch() {
		return batch;
	}

	public void setBatch(Integer batch) {
		this.batch = batch;
	}

	public String getCourse() {
		return course;
	}

	public void setCourse(String course) {
		this.course = course;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getMentor() {
		return mentor;
	}

	public void setMentor(String mentor) {
		this.mentor = mentor;
	}

	public String getAdvisor() {
		return advisor;
	}

	public void setAdvisor(String advisor) {
		this.advisor = advisor;
	}

	public String getCoordinator() {
		return coordinator;
	}

	public void setCoordinator(String coordinator) {
		this.coordinator = coordinator;
	}

	public String getPlacementCycle() {
		return placementCycle;
	}

	public void setPlacementCycle(String placementCycle) {
		this.placementCycle = placementCycle;
	}

	public String getDob() {
		return dob;
	}

	public void setDob(String dob) {
		this.dob = dob;
	}

	public String getNationality() {
		return nationality;
	}

	public void setNationality(String nationality) {
		this.nationality = nationality;
	}

	public String getReligion() {
		return religion;
	}

	public void setReligion(String religion) {
		this.religion = religion;
	}

	public String getPersonalEmail() {
		return personalEmail;
	}

	public void setPersonalEmail(String personalEmail) {
		this.personalEmail = personalEmail;
	}

	public String getInstituteEmail() {
		return instituteEmail;
	}

	public void setInstituteEmail(String instituteEmail) {
		this.instituteEmail = instituteEmail;
	}

	public String getWhatsappNumber() {
		return whatsappNumber;
	}

	public void setWhatsappNumber(String whatsappNumber) {
		this.whatsappNumber = whatsappNumber;
	}

	public String getFatherName() {
		return fatherName;
	}

	public void setFatherName(String fatherName) {
		this.fatherName = fatherName;
	}

	public String getMotherName() {
		return motherName;
	}

	public void setMotherName(String motherName) {
		this.motherName = motherName;
	}

	public Object getCurrentAddress() {
		return currentAddress;
	}

	public void setCurrentAddress(Object currentAddress) {
		this.currentAddress = currentAddress;
	}

	public Object getPermanentAddress() {
		return permanentAddress;
	}

	public void setPermanentAddress(Object permanentAddress) {
		this.permanentAddress = permanentAddress;
	}

	public List<EducationHistoryDTO> getEducationHistory() {
		return educationHistory;
	}

	public void setEducationHistory(List<EducationHistoryDTO> educationHistory) {
		this.educationHistory = educationHistory;
	}

	public String getFatherOccupation() {
		return fatherOccupation;
	}

	public void setFatherOccupation(String fatherOccupation) {
		this.fatherOccupation = fatherOccupation;
	}

	public String getMotherOccupation() {
		return motherOccupation;
	}

	public void setMotherOccupation(String motherOccupation) {
		this.motherOccupation = motherOccupation;
	}

	public String getParentPhone() {
		return parentPhone;
	}

	public void setParentPhone(String parentPhone) {
		this.parentPhone = parentPhone;
	}

	public String getParentEmail() {
		return parentEmail;
	}

	public void setParentEmail(String parentEmail) {
		this.parentEmail = parentEmail;
	}

    
    
    
}