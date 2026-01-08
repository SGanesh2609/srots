package com.srots.dto;

import com.srots.model.*;
import lombok.Data;
import java.util.List;

@Data
public class Student360Response {
    // Basic & Profile Info (from users & student_profiles)
    private User user;
    private StudentProfile profile;

    // Academic & Skills (from education_records, student_skills, student_languages)
    private List<EducationRecord> education;
    private List<StudentSkill> skills;
    private List<StudentLanguage> languages;

    // Professional Portfolio (from student_experience, projects, publications, certifications)
    private List<StudentExperience> experience;
    private List<StudentProject> projects;
    private List<StudentPublication> publications;
    private List<StudentCertification> certifications;

    // Online Presence & Files (from student_social_links, student_resumes)
    private List<StudentSocialLink> socialLinks;
    private List<StudentResume> resumes;

    // Career Activity (from applications)
    private List<Application> applications;

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public StudentProfile getProfile() {
		return profile;
	}

	public void setProfile(StudentProfile profile) {
		this.profile = profile;
	}

	public List<EducationRecord> getEducation() {
		return education;
	}

	public void setEducation(List<EducationRecord> education) {
		this.education = education;
	}

	public List<StudentSkill> getSkills() {
		return skills;
	}

	public void setSkills(List<StudentSkill> skills) {
		this.skills = skills;
	}

	public List<StudentLanguage> getLanguages() {
		return languages;
	}

	public void setLanguages(List<StudentLanguage> languages) {
		this.languages = languages;
	}

	public List<StudentExperience> getExperience() {
		return experience;
	}

	public void setExperience(List<StudentExperience> experience) {
		this.experience = experience;
	}

	public List<StudentProject> getProjects() {
		return projects;
	}

	public void setProjects(List<StudentProject> projects) {
		this.projects = projects;
	}

	public List<StudentPublication> getPublications() {
		return publications;
	}

	public void setPublications(List<StudentPublication> publications) {
		this.publications = publications;
	}

	public List<StudentCertification> getCertifications() {
		return certifications;
	}

	public void setCertifications(List<StudentCertification> certifications) {
		this.certifications = certifications;
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

	public List<Application> getApplications() {
		return applications;
	}

	public void setApplications(List<Application> applications) {
		this.applications = applications;
	}
    
    
    
    
}