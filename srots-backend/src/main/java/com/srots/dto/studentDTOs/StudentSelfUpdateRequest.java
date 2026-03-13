package com.srots.dto.studentDTOs;

import java.time.LocalDate;

import com.srots.model.StudentProfile;

public class StudentSelfUpdateRequest {

    // ─── ① Contact info ───────────────────────────────────────────────────────

    private String communicationEmail;
    private String personalEmail;

    /**
     * Enum type matches StudentProfile.ContactMethod { Phone, Email, WhatsApp }.
     * Frontend sends string "Phone" / "Email" / "WhatsApp" — Jackson converts.
     */
    private StudentProfile.ContactMethod preferredContactMethod;

    /**
     * LinkedIn URL. Entity column is linkedin_profile (lowercase n).
     * Service maps this via existing.setLinkedinProfile(request.getLinkedInProfile()).
     */
    private String linkedInProfile;

    // ─── ② Education gaps ────────────────────────────────────────────────────

    private Boolean gapInStudies;
    private String  gapDuration;
    private String  gapReason;

    // ─── ③ More info ─────────────────────────────────────────────────────────

    private String    drivingLicense;
    private String    passportNumber;

    /**
     * ISO-8601 dates deserialised directly to LocalDate by Jackson.
     * Entity columns: passport_issue_date, passport_expiry_date (LocalDate).
     */
    private LocalDate passportIssueDate;
    private LocalDate passportExpiryDate;

    private Boolean   dayScholar;

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public String getCommunicationEmail()                                  { return communicationEmail; }
    public void   setCommunicationEmail(String v)                          { this.communicationEmail = v; }

    public String getPersonalEmail()                                       { return personalEmail; }
    public void   setPersonalEmail(String v)                               { this.personalEmail = v; }

    public StudentProfile.ContactMethod getPreferredContactMethod()        { return preferredContactMethod; }
    public void   setPreferredContactMethod(StudentProfile.ContactMethod v){ this.preferredContactMethod = v; }

    public String getLinkedInProfile()                                     { return linkedInProfile; }
    public void   setLinkedInProfile(String v)                             { this.linkedInProfile = v; }

    public Boolean getGapInStudies()                                       { return gapInStudies; }
    public void    setGapInStudies(Boolean v)                              { this.gapInStudies = v; }

    public String getGapDuration()                                         { return gapDuration; }
    public void   setGapDuration(String v)                                 { this.gapDuration = v; }

    public String getGapReason()                                           { return gapReason; }
    public void   setGapReason(String v)                                   { this.gapReason = v; }

    public String getDrivingLicense()                                      { return drivingLicense; }
    public void   setDrivingLicense(String v)                              { this.drivingLicense = v; }

    public String getPassportNumber()                                      { return passportNumber; }
    public void   setPassportNumber(String v)                              { this.passportNumber = v; }

    public LocalDate getPassportIssueDate()                                { return passportIssueDate; }
    public void      setPassportIssueDate(LocalDate v)                     { this.passportIssueDate = v; }

    public LocalDate getPassportExpiryDate()                               { return passportExpiryDate; }
    public void      setPassportExpiryDate(LocalDate v)                    { this.passportExpiryDate = v; }

    public Boolean getDayScholar()                                         { return dayScholar; }
    public void    setDayScholar(Boolean v)                                { this.dayScholar = v; }
}