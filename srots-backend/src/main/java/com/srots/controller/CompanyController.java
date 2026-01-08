package com.srots.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.CompanyRequest;
import com.srots.dto.CompanyResponse;
import com.srots.dto.SubscribeRequest;
import com.srots.dto.UploadResponse;
import com.srots.service.CompanyService;
import com.srots.service.FileService;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    @Autowired private CompanyService companyService;
    @Autowired private FileService fileService;

    // 1. Get Companies
    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getCompanies(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String collegeId) {
        return ResponseEntity.ok(companyService.getCompanies(query, collegeId));
    }
    
 // 1. Get Company by ID
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    // 2. Get Company by Name (Exact match, ignore case)
    // URL Example: /api/v1/companies/find?name=Google
    @GetMapping("/find")
    public ResponseEntity<CompanyResponse> getByName(@RequestParam String name) {
        return ResponseEntity.ok(companyService.getCompanyByName(name));
    }

    // 2. Upload Company Logo
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<UploadResponse> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        // Companies are global, so we pass null for collegeCode and "Company" for category
        String url = fileService.uploadFile(file, null, "Company");
        return ResponseEntity.ok(new UploadResponse(url, file.getOriginalFilename()));
    }

    // 3. Global Management
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<CompanyResponse> create(@RequestBody CompanyRequest request) {
        return ResponseEntity.ok(companyService.createCompany(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<CompanyResponse> update(@PathVariable String id, @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(companyService.updateCompany(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(Map.of("message", "Company deleted successfully"));
    }

    // 4. Subscription Management
    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<Map<String, Boolean>> subscribe(@RequestBody SubscribeRequest request) {
        companyService.subscribe(request);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/subscribe/{collegeId}/{companyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<Map<String, Boolean>> unsubscribe(
            @PathVariable String collegeId, 
            @PathVariable String companyId) {
        companyService.unsubscribe(collegeId, companyId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}