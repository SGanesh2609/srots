package com.srots.service;

import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    /**
     * Uploads a file to the storage system.
     * @return The URL string to be stored in the database.
     */
    String uploadFile(MultipartFile file, String collegeCode, String category);

    /**
     * Deletes a file from the storage system based on its URL.
     */
    void deleteFile(String fileUrl);
    
    
    /**
     * Retrieves an InputStream for a file based on its stored URL.
     */
    InputStream getFileStream(String fileUrl);
    
    
    String uploadFile(MultipartFile file, String collegeCode, String category, String userId);
    
    
    
    
}