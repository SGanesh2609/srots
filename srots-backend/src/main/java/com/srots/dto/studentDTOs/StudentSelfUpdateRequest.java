package com.srots.dto.studentDTOs;

import java.time.LocalDate;

import com.srots.model.StudentProfile;

/**
 * StudentSelfUpdateRequest
 * Path: com.srots.dto.studentDTOs.StudentSelfUpdateRequest
 *
 * DTO for PATCH /api/v1/students/profile/self
 *
 * ─── FIXES ──────────────────────────────────────────────────────────────────
 *
 * 1. preferredContactMethod: was String → now StudentProfile.ContactMethod enum
 *    Jackson maps "Phone" | "Email" | "WhatsApp" → enum automatically.
 *    The service no longer needs to call ContactMethod.fromString() manually.
 *
 * 2. passportIssueDate / passportExpiryDate: was String → now LocalDate
 *    Jackson + jackson-datatype-jsr310 (bundled in Spring Boot) deserialises
 *    ISO-8601 strings ("2020-05-15") to LocalDate automatically.
 *    The entity fields are LocalDate, so this must match.
 *
 * 3. Added communicationEmail — matches new StudentProfile.communicationEmail
 *    column (migration: ALTER TABLE student_profiles ADD communication_email VARCHAR(255)).
 *
 * All fields are nullable — null = "not in request, don't overwrite."
 */
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