package com.srots.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "student_profiles")
@Getter @Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class StudentProfile {

    @Id
    @Column(name = "user_id")
    private String userId; 

    @OneToOne
    @MapsId 
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    private String rollNumber;
    private String branch;
    private String course = "B.Tech";
    private Integer batch;
    private String placementCycle;
    private String careerPath;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    public enum Gender { 
        MALE, FEMALE, OTHER;

        // Confirmation: This helper allows both API and Excel to work safely
        public static Gender fromString(String text) {
            if (text == null || text.isBlank()) return null;
            for (Gender g : Gender.values()) {
                if (g.name().equalsIgnoreCase(text.trim())) {
                    return g;
                }
            }
            return OTHER; // Default fallback
        }
    }

    private LocalDate dob;
    private String nationality;
    private String religion;
    private Boolean dayScholar = false;
    private String aadhaarNumber;
    private String drivingLicense;
    private String passportNumber;
    private LocalDate passportIssueDate;
    private LocalDate passportExpiryDate;

    private String personalEmail;
    private String instituteEmail; 
    private String parentEmail;
    private String whatsappNumber;

    @Enumerated(EnumType.STRING)
    private ContactMethod preferredContactMethod;
    public enum ContactMethod { Phone, Email, WhatsApp }

    private String linkedinProfile;
    private String fatherName;
    private String fatherOccupation;
    private String motherName;
    private String motherOccupation;
    private String parentPhone;
    private String mentor;
    private String advisor;
    private String coordinator;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String currentAddress;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String permanentAddress;

    private Boolean gapInStudies = false;
    private String gapDuration;
    @Column(columnDefinition = "TEXT")
    private String gapReason;

    private LocalDate premiumStartDate;
    private LocalDate premiumEndDate;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

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

	public String getCourse() {
		return course;
	}

	public void setCourse(String course) {
		this.course = course;
	}

	public Integer getBatch() {
		return batch;
	}

	public void setBatch(Integer batch) {
		this.batch = batch;
	}

	public String getPlacementCycle() {
		return placementCycle;
	}

	public void setPlacementCycle(String placementCycle) {
		this.placementCycle = placementCycle;
	}

	public String getCareerPath() {
		return careerPath;
	}

	public void setCareerPath(String careerPath) {
		this.careerPath = careerPath;
	}

	public Gender getGender() {
		return gender;
	}

	public void setGender(Gender gender) {
		this.gender = gender;
	}

	public LocalDate getDob() {
		return dob;
	}

	public void setDob(LocalDate dob) {
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

	public Boolean getDayScholar() {
		return dayScholar;
	}

	public void setDayScholar(Boolean dayScholar) {
		this.dayScholar = dayScholar;
	}

	public String getAadhaarNumber() {
		return aadhaarNumber;
	}

	public void setAadhaarNumber(String aadhaarNumber) {
		this.aadhaarNumber = aadhaarNumber;
	}

	public String getDrivingLicense() {
		return drivingLicense;
	}

	public void setDrivingLicense(String drivingLicense) {
		this.drivingLicense = drivingLicense;
	}

	public String getPassportNumber() {
		return passportNumber;
	}

	public void setPassportNumber(String passportNumber) {
		this.passportNumber = passportNumber;
	}

	public LocalDate getPassportIssueDate() {
		return passportIssueDate;
	}

	public void setPassportIssueDate(LocalDate passportIssueDate) {
		this.passportIssueDate = passportIssueDate;
	}

	public LocalDate getPassportExpiryDate() {
		return passportExpiryDate;
	}

	public void setPassportExpiryDate(LocalDate passportExpiryDate) {
		this.passportExpiryDate = passportExpiryDate;
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

	public String getParentEmail() {
		return parentEmail;
	}

	public void setParentEmail(String parentEmail) {
		this.parentEmail = parentEmail;
	}

	public String getWhatsappNumber() {
		return whatsappNumber;
	}

	public void setWhatsappNumber(String whatsappNumber) {
		this.whatsappNumber = whatsappNumber;
	}

	public ContactMethod getPreferredContactMethod() {
		return preferredContactMethod;
	}

	public void setPreferredContactMethod(ContactMethod preferredContactMethod) {
		this.preferredContactMethod = preferredContactMethod;
	}

	public String getLinkedinProfile() {
		return linkedinProfile;
	}

	public void setLinkedinProfile(String linkedinProfile) {
		this.linkedinProfile = linkedinProfile;
	}

	public String getFatherName() {
		return fatherName;
	}

	public void setFatherName(String fatherName) {
		this.fatherName = fatherName;
	}

	public String getFatherOccupation() {
		return fatherOccupation;
	}

	public void setFatherOccupation(String fatherOccupation) {
		this.fatherOccupation = fatherOccupation;
	}

	public String getMotherName() {
		return motherName;
	}

	public void setMotherName(String motherName) {
		this.motherName = motherName;
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

	public String getCurrentAddress() {
		return currentAddress;
	}

	public void setCurrentAddress(String currentAddress) {
		this.currentAddress = currentAddress;
	}

	public String getPermanentAddress() {
		return permanentAddress;
	}

	public void setPermanentAddress(String permanentAddress) {
		this.permanentAddress = permanentAddress;
	}

	public Boolean getGapInStudies() {
		return gapInStudies;
	}

	public void setGapInStudies(Boolean gapInStudies) {
		this.gapInStudies = gapInStudies;
	}

	public String getGapDuration() {
		return gapDuration;
	}

	public void setGapDuration(String gapDuration) {
		this.gapDuration = gapDuration;
	}

	public String getGapReason() {
		return gapReason;
	}

	public void setGapReason(String gapReason) {
		this.gapReason = gapReason;
	}

	public LocalDate getPremiumStartDate() {
		return premiumStartDate;
	}

	public void setPremiumStartDate(LocalDate premiumStartDate) {
		this.premiumStartDate = premiumStartDate;
	}

	public LocalDate getPremiumEndDate() {
		return premiumEndDate;
	}

	public void setPremiumEndDate(LocalDate premiumEndDate) {
		this.premiumEndDate = premiumEndDate;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
    
    
    
}