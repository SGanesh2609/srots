package com.srots.dto;

public class SocialMediaDTO { 
	public String website;
	public String linkedin;
	public String instagram;
	private String facebook;
    private String twitter;
    private String youtube;
	public SocialMediaDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SocialMediaDTO(String website, String linkedin, String instagram, String facebook, String twitter,
			String youtube) {
		super();
		this.website = website;
		this.linkedin = linkedin;
		this.instagram = instagram;
		this.facebook = facebook;
		this.twitter = twitter;
		this.youtube = youtube;
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
	public String getFacebook() {
		return facebook;
	}
	public void setFacebook(String facebook) {
		this.facebook = facebook;
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
    
    
}
