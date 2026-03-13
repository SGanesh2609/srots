package com.srots.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

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