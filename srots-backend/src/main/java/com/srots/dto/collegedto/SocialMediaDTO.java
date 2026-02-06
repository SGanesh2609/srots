package com.srots.dto.collegedto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SocialMediaDTO {
    private String website;
    private String linkedin;
    private String instagram;
    private String twitter;
    private String youtube;
    private String facebook;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedAt;
	public SocialMediaDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SocialMediaDTO(String website, String linkedin, String instagram, String twitter, String youtube,
			String facebook, String lastModifiedBy, LocalDateTime lastModifiedAt) {
		super();
		this.website = website;
		this.linkedin = linkedin;
		this.instagram = instagram;
		this.twitter = twitter;
		this.youtube = youtube;
		this.facebook = facebook;
		this.lastModifiedBy = lastModifiedBy;
		this.lastModifiedAt = lastModifiedAt;
	}
	public String getWebsite() {
		return website;
	}
	public void setWebsite(String website) {
		this.website = website;
	}
	public String getLinkedin() {
		return linkedin;
	}
	public void setLinkedin(String linkedin) {
		this.linkedin = linkedin;
	}
	public String getInstagram() {
		return instagram;
	}
	public void setInstagram(String instagram) {
		this.instagram = instagram;
	}
	public String getTwitter() {
		return twitter;
	}
	public void setTwitter(String twitter) {
		this.twitter = twitter;
	}
	public String getYoutube() {
		return youtube;
	}
	public void setYoutube(String youtube) {
		this.youtube = youtube;
	}
	public String getFacebook() {
		return facebook;
	}
	public void setFacebook(String facebook) {
		this.facebook = facebook;
	}
	public String getLastModifiedBy() {
		return lastModifiedBy;
	}
	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}
	public LocalDateTime getLastModifiedAt() {
		return lastModifiedAt;
	}
	public void setLastModifiedAt(LocalDateTime lastModifiedAt) {
		this.lastModifiedAt = lastModifiedAt;
	}
    
    
}
