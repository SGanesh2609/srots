package com.srots.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.BranchDTO;
import com.srots.dto.CollegeRequest;
import com.srots.dto.CollegeResponse;
import com.srots.dto.UploadResponse;
import com.srots.service.CollegeService;

@RestController
@RequestMapping("/api/v1/colleges")
public class CollegeController {

    @Autowired private CollegeService collegeService;
    
    
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CPH')")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam("collegeCode") String collegeCode,
                                    @RequestParam("category") String category) {
        
        String fileUrl = collegeService.uploadFile(file, collegeCode, category);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    @GetMapping
    public ResponseEntity<List<CollegeResponse>> getAll(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(collegeService.getColleges(query));
    }
    

    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.collegeId == #id)")
    public ResponseEntity<CollegeResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(collegeService.getCollegeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<CollegeResponse> create(@RequestBody CollegeRequest request) {
        return ResponseEntity.ok(collegeService.createCollege(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<CollegeResponse> update(@PathVariable String id, @RequestBody CollegeRequest request) {
        return ResponseEntity.ok(collegeService.updateCollege(id, request));
    }

    @PostMapping("/{id}/branches")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<CollegeResponse> addBranch(@PathVariable String id, @RequestBody BranchDTO branch) {
        return ResponseEntity.ok(collegeService.addBranch(id, branch));
    }
    
    
 // 1. Get Branches Only (Useful for registration dropdowns)
    @GetMapping("/{id}/branches")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<List<Object>> getBranches(@PathVariable String id) {
        return ResponseEntity.ok(collegeService.getBranchesByCollegeId(id));
    }

    // 2. Get Social Media Only
    @GetMapping("/{id}/social-media")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<Object> getSocialMedia(@PathVariable String id) {
        return ResponseEntity.ok(collegeService.getSocialMediaByCollegeId(id));
    }

    // 3. Get About Sections Only
    @GetMapping("/{id}/about")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<List<Object>> getAbout(@PathVariable String id) {
        return ResponseEntity.ok(collegeService.getAboutSectionsByCollegeId(id));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        collegeService.deleteCollege(id);
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", "College and associated media files deleted successfully"
        ));
    }
}