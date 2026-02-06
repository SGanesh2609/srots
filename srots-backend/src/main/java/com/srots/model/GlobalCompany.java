//package com.srots.model;
//
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.JdbcTypeCode;
//import org.hibernate.type.SqlTypes;
//import java.util.List;
//
//@Entity
//@Table(name = "global_companies")
//@Getter 
//@Setter 
//@NoArgsConstructor // Required by Hibernate
//@AllArgsConstructor
//public class GlobalCompany {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    @Column(name = "id", length = 36, columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
//    private String id;
//
//    @Column(nullable = false, unique = true)
//    private String name;
//    
//    private String website;
//    private String logoUrl;
//    
//    @Column(columnDefinition = "TEXT")
//    private String description;
//
//    @JdbcTypeCode(SqlTypes.JSON)
//    @Column(name = "address_json", columnDefinition = "json")
//    private String addressJson;
//
//    private String headquarters;
//    private String fullAddress;
//
//    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<CollegeCompanySubscription> subscriptions;
//    
//    
//
//	public GlobalCompany() {
//		super();
//		// TODO Auto-generated constructor stub
//	}
//
//	public GlobalCompany(String id, String name, String website, String logoUrl, String description, String addressJson,
//			String headquarters, String fullAddress, List<CollegeCompanySubscription> subscriptions) {
//		super();
//		this.id = id;
//		this.name = name;
//		this.website = website;
//		this.logoUrl = logoUrl;
//		this.description = description;
//		this.addressJson = addressJson;
//		this.headquarters = headquarters;
//		this.fullAddress = fullAddress;
//		this.subscriptions = subscriptions;
//	}
//
//	public String getId() {
//		return id;
//	}
//
//	public void setId(String id) {
//		this.id = id;
//	}
//
//	public String getName() {
//		return name;
//	}
//
//	public void setName(String name) {
//		this.name = name;
//	}
//
//	public String getWebsite() {
//		return website;
//	}
//
//	public void setWebsite(String website) {
//		this.website = website;
//	}
//
//	public String getLogoUrl() {
//		return logoUrl;
//	}
//
//	public void setLogoUrl(String logoUrl) {
//		this.logoUrl = logoUrl;
//	}
//
//	public String getDescription() {
//		return description;
//	}
//
//	public void setDescription(String description) {
//		this.description = description;
//	}
//
//	public String getAddressJson() {
//		return addressJson;
//	}
//
//	public void setAddressJson(String addressJson) {
//		this.addressJson = addressJson;
//	}
//
//	public String getHeadquarters() {
//		return headquarters;
//	}
//
//	public void setHeadquarters(String headquarters) {
//		this.headquarters = headquarters;
//	}
//
//	public String getFullAddress() {
//		return fullAddress;
//	}
//
//	public void setFullAddress(String fullAddress) {
//		this.fullAddress = fullAddress;
//	}
//
//	public List<CollegeCompanySubscription> getSubscriptions() {
//		return subscriptions;
//	}
//
//	public void setSubscriptions(List<CollegeCompanySubscription> subscriptions) {
//		this.subscriptions = subscriptions;
//	}
//    
//    
//    
//}


package com.srots.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "global_companies", indexes = {
    @Index(name = "idx_company_name", columnList = "name"),
    @Index(name = "idx_company_headquarters", columnList = "headquarters")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GlobalCompany {

    @Id
    @Column(name = "id", length = 36, columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    private String website;
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "address_json", columnDefinition = "json")
    private String addressJson;

    private String headquarters;
    private String fullAddress;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CollegeCompanySubscription> subscriptions;

	public GlobalCompany() {
		super();
		// TODO Auto-generated constructor stub
	}

	public GlobalCompany(String id, String name, String website, String logoUrl, String description, String addressJson,
			String headquarters, String fullAddress, List<CollegeCompanySubscription> subscriptions) {
		super();
		this.id = id;
		this.name = name;
		this.website = website;
		this.logoUrl = logoUrl;
		this.description = description;
		this.addressJson = addressJson;
		this.headquarters = headquarters;
		this.fullAddress = fullAddress;
		this.subscriptions = subscriptions;
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

	public String getWebsite() {
		return website;
	}

	public void setWebsite(String website) {
		this.website = website;
	}

	public String getLogoUrl() {
		return logoUrl;
	}

	public void setLogoUrl(String logoUrl) {
		this.logoUrl = logoUrl;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getAddressJson() {
		return addressJson;
	}

	public void setAddressJson(String addressJson) {
		this.addressJson = addressJson;
	}

	public String getHeadquarters() {
		return headquarters;
	}

	public void setHeadquarters(String headquarters) {
		this.headquarters = headquarters;
	}

	public String getFullAddress() {
		return fullAddress;
	}

	public void setFullAddress(String fullAddress) {
		this.fullAddress = fullAddress;
	}

	public List<CollegeCompanySubscription> getSubscriptions() {
		return subscriptions;
	}

	public void setSubscriptions(List<CollegeCompanySubscription> subscriptions) {
		this.subscriptions = subscriptions;
	}
    
    
    
}