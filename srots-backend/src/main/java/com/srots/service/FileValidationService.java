package com.srots.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * FileValidationService — Centralised file type and size checks.
 *
 * Called before any file is persisted to disk.
 * Throws IllegalArgumentException with a user-friendly message on violation.
 */
@Service
public class FileValidationService {

    @Value("${srots.upload.max-resume-size-mb:5}")
    private int maxResumeMb;

    @Value("${srots.upload.max-profile-photo-size-mb:2}")
    private int maxPhotoMb;

    @Value("${srots.upload.max-bulk-upload-size-mb:50}")
    private int maxBulkMb;

    @Value("${srots.upload.max-post-attachment-size-mb:10}")
    private int maxPostAttachmentMb;

    @Value("${srots.upload.allowed-resume-types:application/pdf}")
    private String allowedResumeTypes;

    @Value("${srots.upload.allowed-photo-types:image/jpeg,image/png,image/webp}")
    private String allowedPhotoTypes;

    @Value("${srots.upload.allowed-document-types:application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document}")
    private String allowedDocumentTypes;

    @Value("${srots.upload.allowed-bulk-types:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/csv}")
    private String allowedBulkTypes;

    public void validateResume(MultipartFile file) {
        validateFile(file, maxResumeMb, allowedResumeTypes, "Resume");
    }

    public void validateProfilePhoto(MultipartFile file) {
        validateFile(file, maxPhotoMb, allowedPhotoTypes, "Profile photo");
    }

    public void validateBulkUpload(MultipartFile file) {
        validateFile(file, maxBulkMb, allowedBulkTypes, "Bulk upload");
    }

    public void validatePostAttachment(MultipartFile file) {
        validateFile(file, maxPostAttachmentMb, allowedDocumentTypes + "," + allowedPhotoTypes, "Post attachment");
    }

    private void validateFile(MultipartFile file, int maxSizeMb, String allowedTypesStr, String fileLabel) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(fileLabel + " file is empty.");
        }

        long maxBytes = (long) maxSizeMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException(
                    fileLabel + " exceeds maximum size of " + maxSizeMb + " MB. " +
                    "Uploaded: " + (file.getSize() / (1024 * 1024)) + " MB.");
        }

        String contentType = file.getContentType();
        List<String> allowed = Arrays.asList(allowedTypesStr.split(","));
        if (contentType == null || !allowed.contains(contentType.trim())) {
            throw new IllegalArgumentException(
                    fileLabel + " has an unsupported file type: '" + contentType + "'. " +
                    "Allowed: " + allowedTypesStr);
        }
    }
}
