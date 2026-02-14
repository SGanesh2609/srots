package com.srots.controller;

import com.srots.model.User;
import com.srots.service.AuthenticateService;
import com.srots.service.PlacementToolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tools")
//@PreAuthorize("hasAnyRole('CPH', 'STAFF')")
public class PlacementToolsController {

    @Autowired 
    private PlacementToolService placementToolService;

    @Autowired 
    private AuthenticateService authenticateService;

    private String getAuthenticatedCollegeId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authenticateService.getUserDetails(username);
        if (user == null || user.getCollege() == null) {
            throw new RuntimeException("Unauthorized: User not associated with a college.");
        }
        return user.getCollege().getId();
    }

    // --- 1. RESULT COMPARATOR FLOW ---

    @PostMapping("/compare/headers")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<List<String>> getResultHeaders(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(placementToolService.getFileHeaders(file));
    }

//    @PostMapping(value = "/compare", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
//    public ResponseEntity<Map<String, Object>> compare(
//            @RequestPart("master") MultipartFile master, 
//            @RequestPart("result") MultipartFile result,
//            @RequestParam(value = "compareField", required = false) String compareField) throws Exception {
//        
//        // Log for debugging to see if it reaches here
//        System.out.println("Endpoint reached! Field: " + compareField);
//        
//        return ResponseEntity.ok(placementToolService.compareFiles(master, result, compareField));
//    }
    
    @PostMapping(value = "/compare", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, Object>> compare(
            @RequestParam("master") MultipartFile master, 
            @RequestParam("result") MultipartFile result,
            @RequestParam(value = "compareField", required = false) String compareField) throws Exception {
        
        // Debug Logging
        System.out.println("Comparison Started");
        System.out.println("Master File: " + master.getOriginalFilename() + " Size: " + master.getSize());
        System.out.println("Result File: " + result.getOriginalFilename() + " Size: " + result.getSize());
        System.out.println("Field: " + compareField);

        if (master.isEmpty() || result.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "One or both files are missing content."));
        }
        
        return ResponseEntity.ok(placementToolService.compareFiles(master, result, compareField));
    }

    @PostMapping("/compare/download")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<byte[]> downloadCompare(@RequestBody List<List<String>> exportData,
                                                 @RequestParam(defaultValue = "excel") String format) throws Exception {
        return generateDownloadResponse(exportData, "Comparison_Result", format);
    }

    // --- 2. CUSTOM REPORT (Extract/Clean) ---

    @PostMapping("/extract/headers")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<List<String>> getFileHeaders(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(placementToolService.getFileHeaders(file));
    }

    @PostMapping("/extract")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, Object>> extract(@RequestParam("file") MultipartFile file,
                                                     @RequestParam(required = false, defaultValue = "") String excludeCols, 
                                                     @RequestParam(required = false, defaultValue = "") String excludeIds) throws Exception {
        return ResponseEntity.ok(placementToolService.cleanData(file, excludeCols, excludeIds));
    }

    // --- 3. CUSTOM GATHERING ---

    @GetMapping("/gather/fields")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, List<String>>> getGatheringFields() {
        return ResponseEntity.ok(placementToolService.getAvailableFields());
    }

    @PostMapping("/gather")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, Object>> gather(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(placementToolService.gatherData(request, getAuthenticatedCollegeId()));
    }
    
    @PostMapping("/gather/download")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<byte[]> downloadGathered(@RequestBody List<List<String>> gatheredData, 
                                                  @RequestParam(defaultValue = "excel") String format) throws Exception {
        return generateDownloadResponse(gatheredData, "Gathered_Data", format);
    }

    // --- SHARED DOWNLOAD HANDLER ---

    private ResponseEntity<byte[]> generateDownloadResponse(List<List<String>> data, String prefix, String format) throws Exception {
        byte[] fileContent = placementToolService.exportData(data, format);
        String extension = format.equalsIgnoreCase("csv") ? ".csv" : ".xlsx";
        String fileName = prefix + "_" + System.currentTimeMillis() + extension;
        MediaType mediaType = format.equalsIgnoreCase("csv") 
                ? MediaType.parseMediaType("text/csv") 
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(fileContent);
    }
}