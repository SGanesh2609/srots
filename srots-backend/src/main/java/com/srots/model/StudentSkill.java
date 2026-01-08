// 7. StudentSkill.java
package com.srots.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "student_skills")
@Getter @Setter 
@NoArgsConstructor
public class StudentSkill {
    @Id 
    @Column(length = 36) // Fixed length for UUID strings
    private String id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "student_id")
    @JsonBackReference
    private User student;

    private String name;

    @Enumerated(EnumType.STRING) 
    private Proficiency proficiency = Proficiency.Beginner;

    public enum Proficiency { Fundamental, Beginner, Intermediate, Advanced, Professional }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentSkill)) return false;
        StudentSkill that = (StudentSkill) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public User getStudent() {
		return student;
	}

	public void setStudent(User student) {
		this.student = student;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Proficiency getProficiency() {
		return proficiency;
	}

	public void setProficiency(Proficiency proficiency) {
		this.proficiency = proficiency;
	}
    
    
    
}