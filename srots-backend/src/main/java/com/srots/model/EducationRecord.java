package com.srots.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "education_records")
@Data 
@NoArgsConstructor 
@AllArgsConstructor
public class EducationRecord {

	public enum EducationLevel {
	    Class_10("Class 10"), 
	    Class_12("Class 12"), 
	    Diploma("Diploma"), 
	    Undergraduate("Undergraduate"), 
	    Postgraduate("Postgraduate");

	    private final String databaseValue;
	    EducationLevel(String value) { this.databaseValue = value; }

	    @Override
	    @JsonValue
	    public String toString() { return this.databaseValue; }
	    public String getDatabaseValue() { return this.databaseValue; }

	    public static EducationLevel fromString(String text) {
	        if (text == null || text.isBlank()) return null;
	        String clean = text.trim().toUpperCase().replace(" ", "");
	        
	        // Handle common aliases from CSV/Excel
	        
	        if (clean.contains("10") || clean.equals("10TH") || clean.equals("SSC")) return Class_10;
	        if (clean.contains("12") || clean.equals("12TH") || clean.equals("HSC") || clean.equals("INTERMEDIATE")) return Class_12;
	        if (clean.equals("DIPLOMA")) return Diploma;
	        if (clean.contains("UNDERGRAD") || clean.equals("BTECH") || clean.equals("BE")) return Undergraduate;
	        if (clean.contains("POSTGRAD") || clean.equals("MTECH") || clean.equals("MBA")) return Postgraduate;

	        for (EducationLevel b : EducationLevel.values()) {
	            if (b.databaseValue.equalsIgnoreCase(clean) || 
	                b.name().equalsIgnoreCase(clean.replace(" ", "_"))) {
	                return b;
	            }
	        }
	        return null; 
	    }
	}

    @Converter(autoApply = true)
    public static class EducationLevelConverter implements AttributeConverter<EducationLevel, String> {
        @Override
        public String convertToDatabaseColumn(EducationLevel attribute) {
            return (attribute == null) ? null : attribute.getDatabaseValue();
        }
        @Override
        public EducationLevel convertToEntityAttribute(String dbData) {
            return EducationLevel.fromString(dbData);
        }
    }

    public enum ScoreType {
        Percentage, CGPA, Grade, Marks;

        public static ScoreType fromString(String text) {
            if (text == null || text.isBlank()) return null;
            String clean = text.trim();
            for (ScoreType s : ScoreType.values()) {
                if (s.name().equalsIgnoreCase(clean)) return s;
            }
            return null; 
        }
    }

    @Id
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @Convert(converter = EducationLevelConverter.class)
    @Column(nullable = false)
    private EducationLevel level;

    private String institution;
    private String board;

    @Column(name = "year_of_passing")
    private String yearOfPassing;

    @Column(name = "score_display")
    private String scoreDisplay;

    @Enumerated(EnumType.STRING)
    @Column(name = "score_type")
    private ScoreType scoreType;

    @Column(name = "percentage_equiv", precision = 5, scale = 2)
    private BigDecimal percentageEquiv;

    private String specialization;

    @Column(name = "current_arrears")
    private Integer currentArrears = 0;

    @JdbcTypeCode(SqlTypes.JSON) 
    @Column(name = "semesters_data", columnDefinition = "JSON")
    private String semestersData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;
    
 
	public EducationRecord() {
		super();
		// TODO Auto-generated constructor stub
	}

	

	public EducationRecord(String id, EducationLevel level, String institution, String board, String yearOfPassing,
			String scoreDisplay, ScoreType scoreType, BigDecimal percentageEquiv, String specialization,
			Integer currentArrears, String semestersData, User student) {
		super();
		this.id = id;
		this.level = level;
		this.institution = institution;
		this.board = board;
		this.yearOfPassing = yearOfPassing;
		this.scoreDisplay = scoreDisplay;
		this.scoreType = scoreType;
		this.percentageEquiv = percentageEquiv;
		this.specialization = specialization;
		this.currentArrears = currentArrears;
		this.semestersData = semestersData;
		this.student = student;
	}



	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public EducationLevel getLevel() {
		return level;
	}

	public void setLevel(EducationLevel level) {
		this.level = level;
	}

	public String getInstitution() {
		return institution;
	}

	public void setInstitution(String institution) {
		this.institution = institution;
	}

	public String getBoard() {
		return board;
	}

	public void setBoard(String board) {
		this.board = board;
	}

	public String getYearOfPassing() {
		return yearOfPassing;
	}

	public void setYearOfPassing(String yearOfPassing) {
		this.yearOfPassing = yearOfPassing;
	}

	public String getScoreDisplay() {
		return scoreDisplay;
	}

	public void setScoreDisplay(String scoreDisplay) {
		this.scoreDisplay = scoreDisplay;
	}

	public ScoreType getScoreType() {
		return scoreType;
	}

	public void setScoreType(ScoreType scoreType) {
		this.scoreType = scoreType;
	}

	public BigDecimal getPercentageEquiv() {
		return percentageEquiv;
	}

	public void setPercentageEquiv(BigDecimal percentageEquiv) {
		this.percentageEquiv = percentageEquiv;
	}

	public String getSpecialization() {
		return specialization;
	}

	public void setSpecialization(String specialization) {
		this.specialization = specialization;
	}

	public Integer getCurrentArrears() {
		return currentArrears;
	}

	public void setCurrentArrears(Integer currentArrears) {
		this.currentArrears = currentArrears;
	}

	public String getSemestersData() {
		return semestersData;
	}

	public void setSemestersData(String semestersData) {
		this.semestersData = semestersData;
	}

	public User getStudent() {
		return student;
	}

	public void setStudent(User student) {
		this.student = student;
	}

    
    
    
}