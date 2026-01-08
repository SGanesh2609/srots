package com.srots.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class LocalFileServiceImpl implements FileService {

    private final Path rootLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String collegeCode, String category) {
        try {
            if (file.isEmpty()) throw new RuntimeException("Failed to store empty file.");
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            
            if (originalFilename.contains("..")) throw new RuntimeException("Path escape attempt!");

            String safeCollegeCode = (collegeCode == null || collegeCode.isEmpty()) ? "General" : collegeCode;
            Path destinationDir = this.rootLocation.resolve(safeCollegeCode).resolve(category).normalize();

            Files.createDirectories(destinationDir);

            String fileName = UUID.randomUUID() + "_" + originalFilename;
            Path filePath = destinationDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            return "/api/v1/files/" + String.join("/", safeCollegeCode, category, fileName);
        } catch (IOException e) {
            throw new RuntimeException("Upload Failed: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/api/v1/files/")) return;
        try {
            String relativePath = fileUrl.replace("/api/v1/files/", "");
            Path filePath = rootLocation.resolve(relativePath).normalize();
            if (filePath.startsWith(rootLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            System.err.println("Delete Failed: " + e.getMessage());
        }
    }

    @Override
    public InputStream getFileStream(String fileUrl) {
        try {
            String relativePath = fileUrl.replace("/api/v1/files/", "");
            Path filePath = rootLocation.resolve(relativePath).normalize();
            if (!Files.exists(filePath) || !filePath.startsWith(rootLocation)) throw new RuntimeException("File not found");
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    @Override
    public String uploadFile(MultipartFile file, String collegeCode, String category, String userId) {
        try {
            if (file.isEmpty()) throw new RuntimeException("Failed to store empty file.");
            
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));

            // Use DB college code or "SROTS" for global users
            String rootFolder = (collegeCode == null || collegeCode.isEmpty()) ? "SROTS" : collegeCode;
            
            // Path: uploads/{collegeCode}/{category}/{userId}/
            Path destinationDir = this.rootLocation.resolve(rootFolder)
                                              .resolve(category) // Dynamic: e.g., "profiles"
                                              .resolve(userId)
                                              .normalize();

            Files.createDirectories(destinationDir);

            String fileName = "file_" + System.currentTimeMillis() + extension;
            Path filePath = destinationDir.resolve(fileName);
            
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return internal URL for DB storage
            return "/api/v1/files/" + rootFolder + "/" + category + "/" + userId + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Upload Failed: " + e.getMessage());
        }
    }
}