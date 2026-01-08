package com.srots.dto;

import lombok.Data;

@Data
public class AddressRequest {
    private String addressLine1;
    private String village;
    private String city;
    private String state;
    private String zip;
    private String country;
    
	
	public AddressRequest(String addressLine1, String village, String city, String state, String zip, String country) {
		super();
		this.addressLine1 = addressLine1;
		this.village = village;
		this.city = city;
		this.state = state;
		this.zip = zip;
		this.country = country;
	}
	public AddressRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public String getAddressLine1() {
		return addressLine1;
	}
	public void setAddressLine1(String addressLine1) {
		this.addressLine1 = addressLine1;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getZip() {
		return zip;
	}
	public void setZip(String zip) {
		this.zip = zip;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public String getVillage() {
		return village;
	}
	public void setVillage(String village) {
		this.village = village;
	}
    
    
}
