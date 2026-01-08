package com.srots.dto.studentDTOs;

import lombok.Data;

@Data
public class SkillDTO {
    private String id;
    private String name;
    private int proficiencyLevel; // 1-5 from UI
	public SkillDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SkillDTO(String id, String name, int proficiencyLevel) {
		super();
		this.id = id;
		this.name = name;
		this.proficiencyLevel = proficiencyLevel;
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
	public int getProficiencyLevel() {
		return proficiencyLevel;
	}
	public void setProficiencyLevel(int proficiencyLevel) {
		this.proficiencyLevel = proficiencyLevel;
	}
    
    
}