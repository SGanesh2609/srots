package com.srots.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import com.srots.dto.collegedto.AboutSectionDTO;
import com.srots.dto.collegedto.BranchDTO;
import com.srots.dto.collegedto.CollegeRequest;
import com.srots.dto.collegedto.CollegeResponse;
import com.srots.dto.collegedto.SocialMediaDTO;
import com.srots.service.CollegeService;

@RestController
@RequestMapping("/api/v1/colleges")
public class CollegeController {
	
	private static final Logger logger = LoggerFactory.getLogger(CollegeController.class);

    @Autowired private CollegeService collegeService;
    
    
//    @PostMapping("/upload")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('CPH')")
//    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
//                                    @RequestParam("collegeCode") String collegeCode,
//                                    @RequestParam("category") String category) {
//        
//        String fileUrl = collegeService.uploadFile(file, collegeCode, category);
//        return ResponseEntity.ok(Map.of("url", fileUrl));
//    }
//
//    @GetMapping
//    public ResponseEntity<List<CollegeResponse>> getAll(@RequestParam(required = false) String query) {
//        return ResponseEntity.ok(collegeService.getColleges(query));
//    }
//    
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasAnyRole('CPH', 'STAFF', 'STUDENT') and principal.collegeId == #id)")
//    public ResponseEntity<CollegeResponse> getById(@PathVariable String id) {
//        return ResponseEntity.ok(collegeService.getCollegeById(id));
//    }
//
//    @PostMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
//    public ResponseEntity<CollegeResponse> create(@RequestBody CollegeRequest request) {
//        return ResponseEntity.ok(collegeService.createCollege(request));
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
//    public ResponseEntity<CollegeResponse> update(@PathVariable String id, @RequestBody CollegeRequest request) {
//        return ResponseEntity.ok(collegeService.updateCollege(id, request));
//    }
    
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CPH')")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam("collegeCode") String collegeCode,
                                    @RequestParam("category") String category) {
        logger.info("Uploading file for collegeCode: {}, category: {}", collegeCode, category);
        String fileUrl = collegeService.uploadFile(file, collegeCode, category);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    @GetMapping
    public ResponseEntity<Page<CollegeResponse>> getAll(@RequestParam(required = false) String query,
                                                        @RequestParam(defaultValue = "false") boolean includeInactive,
                                                        Pageable pageable) {
        logger.info("Fetching colleges with query: {}, includeInactive: {}", query, includeInactive);
        return ResponseEntity.ok(collegeService.getColleges(query, includeInactive, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasAnyRole('CPH', 'STAFF', 'STUDENT') and principal.collegeId == #id)")
    public ResponseEntity<CollegeResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(collegeService.getCollegeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<CollegeResponse> create(@RequestBody CollegeRequest request) {
        logger.info("Creating college with code: {}", request.getCode());
        return ResponseEntity.ok(collegeService.createCollege(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<CollegeResponse> update(@PathVariable String id, @RequestBody CollegeRequest request) {
        logger.info("Updating college id: {}", id);
        return ResponseEntity.ok(collegeService.updateCollege(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<?> delete(@PathVariable String id, @RequestParam(defaultValue = "false") boolean permanent) {
        logger.info("Deleting college id: {}, permanent: {}", id, permanent);
        if (permanent) {
            collegeService.permanentDelete(id);
        } else {
            collegeService.softDelete(id);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "College " + (permanent ? "permanently" : "soft") + " deleted successfully"));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<?> activate(@PathVariable String id) {
        logger.info("Activating college id: {}", id);
        collegeService.activate(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "College activated"));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<?> deactivate(@PathVariable String id) {
        logger.info("Deactivating college id: {}", id);
        collegeService.deactivate(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "College deactivated"));
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
    
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
//    public ResponseEntity<?> delete(@PathVariable String id) {
//        collegeService.deleteCollege(id);
//        return ResponseEntity.ok(Map.of(
//            "success", true, 
//            "message", "College and associated media files deleted successfully"
//        ));
//    }
    
    // NEW THINGS
    
 // Update Logo
    @PostMapping("/{id}/logo")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<String> updateLogo(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        String newUrl = collegeService.updateCollegeLogo(id, file);
        return ResponseEntity.ok(newUrl);
    }

    // Update Social Media
    @PutMapping("/{id}/social")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<SocialMediaDTO> updateSocial(
            @PathVariable String id,
            @RequestBody SocialMediaDTO dto) {
        return ResponseEntity.ok(collegeService.updateSocialMedia(id, dto));
    }

    // Add About Section
    @PostMapping("/{id}/about")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<AboutSectionDTO> addAboutSection(
            @PathVariable String id,
            @RequestBody AboutSectionDTO dto) {
        return ResponseEntity.ok(collegeService.addAboutSection(id, dto));
    }

    // Update One About Section
    @PutMapping("/{id}/about/{sectionId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<AboutSectionDTO> updateAboutSection(
            @PathVariable String id,
            @PathVariable String sectionId,
            @RequestBody AboutSectionDTO dto) {
        return ResponseEntity.ok(collegeService.updateAboutSection(id, sectionId, dto));
    }

    // Delete One About Section
    @DeleteMapping("/{id}/about/{sectionId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id and principal.isCollegeHead)")
    public ResponseEntity<?> deleteAboutSection(
            @PathVariable String id,
            @PathVariable String sectionId) {
        collegeService.deleteAboutSection(id, sectionId);
        return ResponseEntity.ok(Map.of("message", "Section deleted"));
    }
    
 // 1. Get Branches
    @GetMapping("/{id}/branches")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF')")
    public ResponseEntity<List<Object>> getBranches(@PathVariable String id) {
        return ResponseEntity.ok(collegeService.getBranchesByCollegeId(id));
    }

    // 2. Add Branch
    @PostMapping("/{id}/branches")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id)")
    public ResponseEntity<CollegeResponse> addBranch(@PathVariable String id, @RequestBody BranchDTO branch) {
        return ResponseEntity.ok(collegeService.addBranch(id, branch));
    }

    // 3. Update Branch (Based on Code)
    @PutMapping("/{id}/branches/{branchCode}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id)")
    public ResponseEntity<CollegeResponse> updateBranch(
            @PathVariable String id, 
            @PathVariable String branchCode, 
            @RequestBody BranchDTO branch) {
        return ResponseEntity.ok(collegeService.updateBranch(id, branchCode, branch));
    }

    // 4. Delete Branch
    @DeleteMapping("/{id}/branches/{branchCode}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #id)")
    public ResponseEntity<CollegeResponse> deleteBranch(@PathVariable String id, @PathVariable String branchCode) {
        return ResponseEntity.ok(collegeService.deleteBranch(id, branchCode));
    }
}