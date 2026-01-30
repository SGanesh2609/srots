package com.srots.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
// Correct Imports
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.srots.config.UserInfoUserDetails;
import com.srots.dto.FreeCourseRequest;
import com.srots.dto.FreeCourseResponse;
import com.srots.model.FreeCourse.CoursePlatform;
import com.srots.model.FreeCourse.CourseStatus;
import com.srots.model.User;
import com.srots.service.DBMonitoringService;
import com.srots.service.FreeCourseService;

@RestController
@RequestMapping("/api/v1/free-courses")
public class FreeCourseController {

	@Autowired private FreeCourseService service;
	@Autowired private DBMonitoringService monitoringService;

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV','CPH','STAFF','STUDENT')")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    @GetMapping("/platforms")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV','CPH','STAFF','STUDENT')")
    public ResponseEntity<List<String>> getPlatforms() {
        return ResponseEntity.ok(service.getPlatforms());
    }

    
 // Standard public endpoint (Active only)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV','CPH','STAFF','STUDENT')")
    public ResponseEntity<Page<FreeCourseResponse>> getAll(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String technology,
            @RequestParam(required = false) CoursePlatform platform,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.listCourses(query, technology, platform, pageable));
    }

    // New Admin endpoint (All statuses)
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Page<FreeCourseResponse>> getAllForAdmin(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String technology,
            @RequestParam(required = false) CoursePlatform platform,
            @RequestParam(required = false) CourseStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.listCoursesForAdmin(query, technology, platform, status, pageable));
    }

 // Endpoint to verify a link is still working without changing status
    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Void> verifyLink(@PathVariable String id) {
        service.verifyCourse(id);
        return ResponseEntity.ok().build();
    }

    // Toggle status (this already exists in your code, 
    // but the service logic now updates verification date too)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Void> updateStatus(@PathVariable String id, @RequestParam CourseStatus status) {
        service.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<FreeCourseResponse> create(@RequestBody FreeCourseRequest request) {
        return ResponseEntity.ok(service.createCourse(request));
    }
    

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<FreeCourseResponse> update(@PathVariable String id, @RequestBody FreeCourseRequest request) {
        return ResponseEntity.ok(service.updateCourse(id, request));
    }

 // SOFT DELETE: Marks as INACTIVE (Data stays in DB)
    @DeleteMapping("/{id}/soft")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Map<String, String>> softDelete(@PathVariable String id) {
        service.softDeleteCourse(id);
        return ResponseEntity.ok(Map.of("message", "Course deactivated (Soft Delete) successfully"));
    }

    // HARD DELETE: Removes from DB entirely
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Map<String, String>> hardDelete(@PathVariable String id) {
        service.deleteCourse(id);
        return ResponseEntity.ok(Map.of("message", "Course permanently deleted from database"));
    }
    
    
    @GetMapping("/admin/db-health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDbHealth() {
        return ResponseEntity.ok(monitoringService.getConnectionPoolStatus());
    }
}