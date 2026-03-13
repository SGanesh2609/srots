package com.srots.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Upload configuration properties bound from application.properties
 * prefix: srots.upload
 */
@Component
@ConfigurationProperties(prefix = "srots.upload")
public class UploadProperties {

    private int maxResumeSizeMb = 5;
    private int maxProfilePhotoSizeMb = 2;
    private int maxBulkUploadSizeMb = 50;
    private int maxPostAttachmentSizeMb = 10;
    private String allowedResumeTypes = "application/pdf";
    private String allowedPhotoTypes = "image/jpeg,image/png,image/webp";
    private String allowedDocumentTypes = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private String allowedBulkTypes = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/csv";

    public int getMaxResumeSizeMb() { return maxResumeSizeMb; }
    public void setMaxResumeSizeMb(int v) { maxResumeSizeMb = v; }
    public int getMaxProfilePhotoSizeMb() { return maxProfilePhotoSizeMb; }
    public void setMaxProfilePhotoSizeMb(int v) { maxProfilePhotoSizeMb = v; }
    public int getMaxBulkUploadSizeMb() { return maxBulkUploadSizeMb; }
    public void setMaxBulkUploadSizeMb(int v) { maxBulkUploadSizeMb = v; }
    public int getMaxPostAttachmentSizeMb() { return maxPostAttachmentSizeMb; }
    public void setMaxPostAttachmentSizeMb(int v) { maxPostAttachmentSizeMb = v; }
    public String getAllowedResumeTypes() { return allowedResumeTypes; }
    public void setAllowedResumeTypes(String v) { allowedResumeTypes = v; }
    public String getAllowedPhotoTypes() { return allowedPhotoTypes; }
    public void setAllowedPhotoTypes(String v) { allowedPhotoTypes = v; }
    public String getAllowedDocumentTypes() { return allowedDocumentTypes; }
    public void setAllowedDocumentTypes(String v) { allowedDocumentTypes = v; }
    public String getAllowedBulkTypes() { return allowedBulkTypes; }
    public void setAllowedBulkTypes(String v) { allowedBulkTypes = v; }
}
