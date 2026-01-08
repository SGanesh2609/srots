package com.srots.model;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "colleges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class College {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 36, columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String code;
    private String type;
    private String email;
    private String phone;
    private String landline;
    private String logoUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String addressJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String socialMedia;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String aboutSections;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String branches;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts;
    
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> jobs; // This ensures Jobs are deleted when College is deleted
    
 // Inside College.java
    @OneToMany(mappedBy = "college")
    @JsonIgnoreProperties({"college", "studentProfile", "educationRecords", "experiences"})
    private List<User> users;

	public College() {
		super();
		// TODO Auto-generated constructor stub
	}



	public College(String id, String name, String code, String type, String email, String phone, String landline,
			String logoUrl, String addressJson, String socialMedia, String aboutSections, String branches,
			LocalDateTime createdAt, LocalDateTime updatedAt, List<Post> posts, List<Job> jobs, List<User> users) {
		super();
		this.id = id;
		this.name = name;
		this.code = code;
		this.type = type;
		this.email = email;
		this.phone = phone;
		this.landline = landline;
		this.logoUrl = logoUrl;
		this.addressJson = addressJson;
		this.socialMedia = socialMedia;
		this.aboutSections = aboutSections;
		this.branches = branches;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.posts = posts;
		this.jobs = jobs;
		this.users = users;
	}




	public List<Job> getJobs() {
		return jobs;
	}



	public void setJobs(List<Job> jobs) {
		this.jobs = jobs;
	}


	public List<User> getUsers() {
		return users;
	}


	public void setUsers(List<User> users) {
		this.users = users;
	}


	public List<Post> getPosts() {
		return posts;
	}



	public void setPosts(List<Post> posts) {
		this.posts = posts;
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

	public String getLandline() {
		return landline;
	}

	public void setLandline(String landline) {
		this.landline = landline;
	}

	public String getLogoUrl() {
		return logoUrl;
	}

	public void setLogoUrl(String logoUrl) {
		this.logoUrl = logoUrl;
	}

	public String getAddressJson() {
		return addressJson;
	}

	public void setAddressJson(String addressJson) {
		this.addressJson = addressJson;
	}

	public String getSocialMedia() {
		return socialMedia;
	}

	public void setSocialMedia(String socialMedia) {
		this.socialMedia = socialMedia;
	}

	public String getAboutSections() {
		return aboutSections;
	}

	public void setAboutSections(String aboutSections) {
		this.aboutSections = aboutSections;
	}

	public String getBranches() {
		return branches;
	}

	public void setBranches(String branches) {
		this.branches = branches;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
    
    
    
}