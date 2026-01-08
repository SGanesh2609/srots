package com.srots.controller;

import java.util.List;
import java.util.Map;

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

import com.srots.dto.EventDTO;
import com.srots.dto.NoticeDTO;
import com.srots.dto.UploadResponse;
import com.srots.service.CalendarService;

@RestController
@RequestMapping("/api/v1")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    // --- 1. SHARED / FILE UPLOADS ---
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CPH')")
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "collegeCode", required = false) String collegeCode,
            @RequestParam("category") String category) {
        
        return ResponseEntity.ok(calendarService.uploadFile(file, collegeCode, category));
    }

    // --- 2. EVENTS SECTION ---

 // --- 2. EVENTS SECTION ---

    @GetMapping("/events")
    public ResponseEntity<List<EventDTO>> getEvents(
            @RequestParam String collegeId, 
            @RequestParam(defaultValue = "false") boolean upcoming,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(calendarService.getEvents(collegeId, upcoming, type, search));
    }
    
    @GetMapping("/events/{id}")
    public ResponseEntity<EventDTO> getEventById(
            @PathVariable String id, 
            @RequestParam String collegeId) {
        return ResponseEntity.ok(calendarService.getEventByIdAndCollege(id, collegeId));
    }

    @PostMapping("/events")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #dto.collegeId and principal.isCollegeHead)")
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO dto) {
        return ResponseEntity.ok(calendarService.createEvent(dto));
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #dto.collegeId and principal.isCollegeHead)")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable String id, @RequestBody EventDTO dto) {
        // Force the ID from the URL into the DTO to ensure consistency
        dto.setId(id); 
        return ResponseEntity.ok(calendarService.updateEvent(dto));
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CPH')") 
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Event deleted"));
    }

    // --- 3. NOTICES SECTION ---

 // --- 3. NOTICES SECTION ---

    @GetMapping("/notices")
    public ResponseEntity<List<NoticeDTO>> getNotices(
            @RequestParam String collegeId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(calendarService.getNotices(collegeId, type, search));
    }
    
    @GetMapping("/notices/{id}")
    public ResponseEntity<NoticeDTO> getNoticeById(
            @PathVariable String id, 
            @RequestParam String collegeId) {
        // This ensures a user can't "guess" an ID and see notices from another college
        return ResponseEntity.ok(calendarService.getNoticeByIdAndCollege(id, collegeId));
    }

    @PostMapping("/notices")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #dto.collegeId and principal.isCollegeHead)")
    public ResponseEntity<NoticeDTO> createNotice(@RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(calendarService.createNotice(dto));
    }

    @PutMapping("/notices/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CPH') and principal.collegeId == #dto.collegeId and principal.isCollegeHead)")
    public ResponseEntity<NoticeDTO> updateNotice(@PathVariable String id, @RequestBody NoticeDTO dto) {
        // Standardize: URL ID always overrides body ID
        dto.setId(id);
        return ResponseEntity.ok(calendarService.updateNotice(dto));
    }

    @DeleteMapping("/notices/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CPH')")
    public ResponseEntity<?> deleteNotice(@PathVariable String id) {
        calendarService.deleteNotice(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Notice deleted"));
    }
}