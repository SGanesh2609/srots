package com.srots.dto.studentDTOs;

import lombok.Data;

@Data
public class LanguageDTO {
    private String id;
    private String name;
    private String proficiency; // Maps to LangProficiency Enum
	public LanguageDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public LanguageDTO(String id, String name, String proficiency) {
		super();
		this.id = id;
		this.name = name;
		this.proficiency = proficiency;
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
	public String getProficiency() {
		return proficiency;
	}
	public void setProficiency(String proficiency) {
		this.proficiency = proficiency;
	}
    
    
    
}