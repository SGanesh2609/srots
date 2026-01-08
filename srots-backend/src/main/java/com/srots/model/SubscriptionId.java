package com.srots.model;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter 
@Setter
@NoArgsConstructor // Required by Hibernate
@AllArgsConstructor
@EqualsAndHashCode // Explicitly added to satisfy Hibernate warnings
public class SubscriptionId implements Serializable {
    
    @Column(name = "college_id", length = 36, columnDefinition = "VARCHAR(36)")
    private String collegeId;

    @Column(name = "company_id", length = 36, columnDefinition = "VARCHAR(36)")
    private String companyId;
    
    

	public SubscriptionId() {
		super();
		// TODO Auto-generated constructor stub
	}

	public SubscriptionId(String collegeId, String companyId) {
		super();
		this.collegeId = collegeId;
		this.companyId = companyId;
	}

	public String getCollegeId() {
		return collegeId;
	}

	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
	}

	public String getCompanyId() {
		return companyId;
	}

	public void setCompanyId(String companyId) {
		this.companyId = companyId;
	}
    
    
    
}