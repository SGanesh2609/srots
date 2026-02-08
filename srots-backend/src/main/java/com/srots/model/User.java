package com.srots.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "users")
@Getter @Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class User {
    @Id 
    @Column(length = 100)
    private String id; 
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore // CRITICAL: Keep this for security
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING) 
    @Column(nullable = false)
    private Role role;

    public enum Role { ADMIN, SROTS_DEV, CPH, STAFF, STUDENT }
    
    @JsonProperty("collegeId") // This adds a new field "collegeId" to your JSON
    public String getCollegeIdOnly() {
        return (college != null) ? college.getId() : null;
    }

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "college_id")
    @JsonIgnoreProperties({
        "hibernateLazyInitializer", 
        "handler", 
        "users",     // CRITICAL: Stop the college from listing all its users again
        "jobs",      // Stop the college from listing all its jobs again
        "posts"
    })
    private College college;

    private Boolean isRestricted = false;
    private Boolean isCollegeHead = false;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
//    @JsonManagedReference
    @JsonIgnore
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "parent_user_id")
    @JsonIgnore 
    private User parentUser;
    
    private String experience;
    private String education;

    private String avatarUrl;
    private String phone;
    private String alternativeEmail;
    private String alternativePhone;
    private String aadhaarNumber;

    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String department;

    @JdbcTypeCode(SqlTypes.JSON)
    private String addressJson;
    
    //used for the change password when user forget passsword
    private String resetToken;
    private LocalDateTime tokenExpiry;
    
 // Add this to User.java
    private String lastDeviceInfo;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    
 // ... inside User class ...

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true) // Add orphanRemoval
    @JsonIgnoreProperties("student")
    private List<EducationRecord> educationRecords = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<StudentExperience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<StudentProject> projects = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<StudentCertification> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<StudentLanguage> languages = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<StudentSocialLink> socialLinks = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<StudentResume> resumes = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<StudentSkill> skills = new ArrayList<>();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public College getCollege() {
		return college;
	}

	public void setCollege(College college) {
		this.college = college;
	}

	public Boolean getIsRestricted() {
		return isRestricted;
	}

	public void setIsRestricted(Boolean isRestricted) {
		this.isRestricted = isRestricted;
	}

	public Boolean getIsCollegeHead() {
		return isCollegeHead;
	}

	public void setIsCollegeHead(Boolean isCollegeHead) {
		this.isCollegeHead = isCollegeHead;
	}

	public StudentProfile getStudentProfile() {
		return studentProfile;
	}

	public void setStudentProfile(StudentProfile studentProfile) {
		this.studentProfile = studentProfile;
	}

	public User getParentUser() {
		return parentUser;
	}

	public void setParentUser(User parentUser) {
		this.parentUser = parentUser;
	}

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
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

	public String getAadhaarNumber() {
		return aadhaarNumber;
	}

	public void setAadhaarNumber(String aadhaarNumber) {
		this.aadhaarNumber = aadhaarNumber;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public String getAddressJson() {
		return addressJson;
	}

	public void setAddressJson(String addressJson) {
		this.addressJson = addressJson;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public List<EducationRecord> getEducationRecords() {
		return educationRecords;
	}

	public void setEducationRecords(List<EducationRecord> educationRecords) {
		this.educationRecords = educationRecords;
	}

	public List<StudentExperience> getExperiences() {
		return experiences;
	}

	public void setExperiences(List<StudentExperience> experiences) {
		this.experiences = experiences;
	}

	public List<StudentProject> getProjects() {
		return projects;
	}

	public void setProjects(List<StudentProject> projects) {
		this.projects = projects;
	}

	public List<StudentCertification> getCertifications() {
		return certifications;
	}

	public void setCertifications(List<StudentCertification> certifications) {
		this.certifications = certifications;
	}

	public List<StudentLanguage> getLanguages() {
		return languages;
	}

	public void setLanguages(List<StudentLanguage> languages) {
		this.languages = languages;
	}

	public List<StudentSocialLink> getSocialLinks() {
		return socialLinks;
	}

	public void setSocialLinks(List<StudentSocialLink> socialLinks) {
		this.socialLinks = socialLinks;
	}

	public List<StudentResume> getResumes() {
		return resumes;
	}

	public void setResumes(List<StudentResume> resumes) {
		this.resumes = resumes;
	}

	public List<StudentSkill> getSkills() {
		return skills;
	}

	public void setSkills(List<StudentSkill> skills) {
		this.skills = skills;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
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

	public String getResetToken() {
		return resetToken;
	}

	public void setResetToken(String resetToken) {
		this.resetToken = resetToken;
	}

	public LocalDateTime getTokenExpiry() {
		return tokenExpiry;
	}

	public void setTokenExpiry(LocalDateTime tokenExpiry) {
		this.tokenExpiry = tokenExpiry;
	}

	public String getLastDeviceInfo() {
		return lastDeviceInfo;
	}

	public void setLastDeviceInfo(String lastDeviceInfo) {
		this.lastDeviceInfo = lastDeviceInfo;
	}
	
	
}