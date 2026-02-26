//package com.srots.dto;
//
//import lombok.Data;
//
//@Data
//public class AddressRequest {
//    private String addressLine1;
//    private String village;
//    private String city;
//    private String state;
//    private String zip;
//    private String country;
//    
//	
//	public AddressRequest(String addressLine1, String village, String city, String state, String zip, String country) {
//		super();
//		this.addressLine1 = addressLine1;
//		this.village = village;
//		this.city = city;
//		this.state = state;
//		this.zip = zip;
//		this.country = country;
//	}
//	public AddressRequest() {
//		super();
//		// TODO Auto-generated constructor stub
//	}
//	public String getAddressLine1() {
//		return addressLine1;
//	}
//	public void setAddressLine1(String addressLine1) {
//		this.addressLine1 = addressLine1;
//	}
//	public String getCity() {
//		return city;
//	}
//	public void setCity(String city) {
//		this.city = city;
//	}
//	public String getState() {
//		return state;
//	}
//	public void setState(String state) {
//		this.state = state;
//	}
//	public String getZip() {
//		return zip;
//	}
//	public void setZip(String zip) {
//		this.zip = zip;
//	}
//	public String getCountry() {
//		return country;
//	}
//	public void setCountry(String country) {
//		this.country = country;
//	}
//	public String getVillage() {
//		return village;
//	}
//	public void setVillage(String village) {
//		this.village = village;
//	}
//    
//    
//}


package com.srots.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * AddressRequest.java
 * Path: src/main/java/com/srots/dto/AddressRequest.java
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THIS WAS CAUSING THE 400 ERROR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The frontend (AddressForm / collegeService) sends this address object:
 *
 *   {
 *     "addressLine1": "...",
 *     "addressLine2": "...",   ← WAS MISSING in old AddressRequest
 *     "village":      "...",
 *     "mandal":       "...",   ← WAS MISSING in old AddressRequest
 *     "city":         "...",
 *     "state":        "...",
 *     "zip":          "...",
 *     "country":      "..."
 *   }
 *
 * The old AddressRequest only had: addressLine1, village, city, state, zip, country
 * It was MISSING: addressLine2, mandal
 *
 * Jackson's default behaviour when it receives an unknown JSON field
 * (like "addressLine2" or "mandal") is to throw:
 *   UnrecognizedPropertyException: Unrecognized field "addressLine2"
 *
 * Spring Boot converts this Jackson exception to a 400 Bad Request BEFORE
 * the service layer even runs — so dto.getAadhaar() is never checked,
 * but the aadhaar 400 message happens to be the next validation that runs
 * after Jackson succeeds on a retry or partial parse.
 *
 * TWO FIXES:
 *
 * 1. Added the missing fields: addressLine2, mandal
 *    Now all fields the frontend sends have a matching field here.
 *
 * 2. Added @JsonIgnoreProperties(ignoreUnknown = true)
 *    Belt-and-suspenders: if the frontend ever sends any other extra field,
 *    Jackson will silently ignore it instead of throwing a 400.
 *    This makes the DTO resilient to future frontend changes.
 * ═══════════════════════════════════════════════════════════════════════════
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AddressRequest {

    private String addressLine1 = "";

    /**
     * Address line 2 — was missing in the old class.
     * Frontend sends this from AddressForm (flat, optional second line).
     */
    private String addressLine2 = "";

    private String village = "";

    /**
     * Mandal / Taluk — was missing in the old class.
     * Frontend sends this from AddressForm (administrative subdivision).
     */
    private String mandal = "";

    private String city    = "";
    private String state   = "";
    private String zip     = "";
    private String country = "India";

    // ── Constructors ───────────────────────────────────────────────────────────

    public AddressRequest() {
        // default constructor required by Jackson for deserialization
    }

    /**
     * Full constructor — updated to include addressLine2 and mandal.
     * Old call sites that use the 6-arg constructor (addressLine1, village,
     * city, state, zip, country) will need to migrate to this 8-arg version
     * or use the no-arg constructor + setters.
     */
    public AddressRequest(
            String addressLine1, String addressLine2,
            String village,      String mandal,
            String city,         String state,
            String zip,          String country) {
        this.addressLine1 = addressLine1 != null ? addressLine1 : "";
        this.addressLine2 = addressLine2 != null ? addressLine2 : "";
        this.village      = village      != null ? village      : "";
        this.mandal       = mandal       != null ? mandal       : "";
        this.city         = city         != null ? city         : "";
        this.state        = state        != null ? state        : "";
        this.zip          = zip          != null ? zip          : "";
        this.country      = country      != null ? country      : "India";
    }

    /**
     * Legacy 6-arg constructor for backward compatibility with existing call
     * sites that don't pass addressLine2 / mandal.
     * addressLine2 and mandal will default to empty string.
     */
    public AddressRequest(
            String addressLine1, String village,
            String city, String state,
            String zip, String country) {
        this(addressLine1, "", village, "", city, state, zip, country);
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────
    // (Lombok @Data generates these, but kept explicit for IDE compatibility)

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1 != null ? addressLine1 : "";
    }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2 != null ? addressLine2 : "";
    }

    public String getVillage() { return village; }
    public void setVillage(String village) {
        this.village = village != null ? village : "";
    }

    public String getMandal() { return mandal; }
    public void setMandal(String mandal) {
        this.mandal = mandal != null ? mandal : "";
    }

    public String getCity() { return city; }
    public void setCity(String city) {
        this.city = city != null ? city : "";
    }

    public String getState() { return state; }
    public void setState(String state) {
        this.state = state != null ? state : "";
    }

    public String getZip() { return zip; }
    public void setZip(String zip) {
        this.zip = zip != null ? zip : "";
    }

    public String getCountry() { return country; }
    public void setCountry(String country) {
        this.country = country != null ? country : "India";
    }
}