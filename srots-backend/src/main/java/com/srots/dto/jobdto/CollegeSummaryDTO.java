package com.srots.dto.jobdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollegeSummaryDTO {
    private String id;
    private String name;
    private String code;
    private String type;
    private String logoUrl;
	public CollegeSummaryDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public CollegeSummaryDTO(String id, String name, String code, String type, String logoUrl) {
		super();
		this.id = id;
		this.name = name;
		this.code = code;
		this.type = type;
		this.logoUrl = logoUrl;
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
	public String getLogoUrl() {
		return logoUrl;
	}
	public void setLogoUrl(String logoUrl) {
		this.logoUrl = logoUrl;
	}
    
    
    
}