package com.srots.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.CompanyRequest;
import jakarta.validation.Valid;
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

    /** Paginated endpoint — used by all portals */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<Page<CompanyResponse>> getCompanies(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String collegeId,
            @RequestParam(required = false, defaultValue = "false") boolean linkedOnly,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(companyService.getCompaniesPaged(query, collegeId, linkedOnly, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<CompanyResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/find")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<CompanyResponse> getByName(@RequestParam String name) {
        return ResponseEntity.ok(companyService.getCompanyByName(name));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<UploadResponse> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        String url = fileService.uploadFile(file, null, "Company");
        return ResponseEntity.ok(new UploadResponse(url, file.getOriginalFilename()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(companyService.createCompany(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<CompanyResponse> update(@PathVariable String id, @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(companyService.updateCompany(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(Map.of("message", "Company deleted successfully"));
    }

    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<Map<String, Boolean>> subscribe(@Valid @RequestBody SubscribeRequest request) {
        companyService.subscribe(request);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/subscribe/{collegeId}/{companyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<Map<String, Boolean>> unsubscribe(
            @PathVariable String collegeId,
            @PathVariable String companyId) {
        companyService.unsubscribe(collegeId, companyId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}