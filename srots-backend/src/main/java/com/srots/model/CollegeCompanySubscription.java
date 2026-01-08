package com.srots.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "college_company_subscriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CollegeCompanySubscription {
    @EmbeddedId
    private SubscriptionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("collegeId")
    @JoinColumn(name = "college_id")
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("companyId")
    @JoinColumn(name = "company_id")
    private GlobalCompany company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_id")
    private User addedBy;

	public CollegeCompanySubscription() {
		super();
		// TODO Auto-generated constructor stub
	}

	public CollegeCompanySubscription(SubscriptionId id, College college, GlobalCompany company, User addedBy) {
		super();
		this.id = id;
		this.college = college;
		this.company = company;
		this.addedBy = addedBy;
	}

	public SubscriptionId getId() {
		return id;
	}

	public void setId(SubscriptionId id) {
		this.id = id;
	}

	public College getCollege() {
		return college;
	}

	public void setCollege(College college) {
		this.college = college;
	}

	public GlobalCompany getCompany() {
		return company;
	}

	public void setCompany(GlobalCompany company) {
		this.company = company;
	}

	public User getAddedBy() {
		return addedBy;
	}

	public void setAddedBy(User addedBy) {
		this.addedBy = addedBy;
	}
    
    
    
}