package com.srots.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
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
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV') or hasAnyRole('CPH','STAFF')")
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "collegeId", required = false) String collegeId,
            @RequestParam("category") String category) {

        return ResponseEntity.ok(calendarService.uploadFile(file, collegeId, category));
    }

    // --- 2. EVENTS SECTION ---

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<List<EventDTO>> getEvents(
            @RequestParam String collegeId, 
            @RequestParam(defaultValue = "false") boolean upcoming,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(calendarService.getEvents(collegeId, upcoming, type, search));
    }
    
    @GetMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<EventDTO> getEventById(
            @PathVariable String id, 
            @RequestParam String collegeId) {
        return ResponseEntity.ok(calendarService.getEventByIdAndCollege(id, collegeId));
    }

    @PostMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV') or (hasAnyRole('CPH', 'STAFF') and principal.collegeId == #dto.collegeId)")
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO dto) {
        return ResponseEntity.ok(calendarService.createEvent(dto));
    }

    
    @PutMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV') or " +
        "(hasRole('CPH') and principal.collegeId == #dto.collegeId) or " +
        "(hasRole('STAFF') and principal.collegeId == #dto.collegeId and @calendarService.isEventOwnerByUsername(#id, principal.username))")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable String id, @RequestBody EventDTO dto) {
        dto.setId(id); 
        return ResponseEntity.ok(calendarService.updateEvent(dto));
    }



//    @DeleteMapping("/events/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV') or " +
//        "(hasRole('CPH') and @calendarService.getUserCollegeId(principal.username) == @calendarService.getEventCollegeId(#id)) or " +
//        "(hasRole('STAFF') and @calendarService.isEventOwnerByUsername(#id, principal.username))")
//    public ResponseEntity<?> deleteEvent(@P("id") @PathVariable String id) { 
//        calendarService.deleteEvent(id);
//        return ResponseEntity.ok(Map.of("success", true, "message", "Event deleted"));
//    }
    
    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF')")
    public ResponseEntity<?> deleteEvent(@PathVariable String id, Principal principal) { 
        // We do the heavy lifting inside the service now
        calendarService.secureDeleteEvent(id, principal.getName());
        return ResponseEntity.ok(Map.of("success", true, "message", "Event deleted"));
    }

    // --- 3. NOTICES SECTION ---

    @GetMapping("/notices")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<List<NoticeDTO>> getNotices(
            @RequestParam String collegeId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(calendarService.getNotices(collegeId, type, search));
    }
    
    @GetMapping("/notices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<NoticeDTO> getNoticeById(
            @PathVariable String id, 
            @RequestParam String collegeId) {
        // This ensures a user can't "guess" an ID and see notices from another college
        return ResponseEntity.ok(calendarService.getNoticeByIdAndCollege(id, collegeId));
    }

    @PostMapping("/notices")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV') or (hasAnyRole('CPH', 'STAFF') and principal.collegeId == #dto.collegeId)")
    public ResponseEntity<NoticeDTO> createNotice(@RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(calendarService.createNotice(dto));
    }

//    @PutMapping("/notices/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV') or " +
//            "(hasRole('CPH') and @calendarService.getUserCollegeId(principal.username) == #dto.collegeId) or " +
//            "(hasRole('STAFF') and @calendarService.getUserCollegeId(principal.username) == #dto.collegeId and @calendarService.isNoticeOwnerByUsername(#id, principal.username))")
//    public ResponseEntity<NoticeDTO> updateNotice(@PathVariable String id, @RequestBody NoticeDTO dto) {
//        dto.setId(id);
//        return ResponseEntity.ok(calendarService.updateNotice(dto));
//    }
    


    @PutMapping("/notices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<NoticeDTO> updateNotice(
        @PathVariable String id, 
        @RequestBody NoticeDTO dto, 
        Principal principal
    ) {
        dto.setId(id); // Ensure ID consistency
        return ResponseEntity.ok(calendarService.secureUpdateNotice(id, dto, principal.getName()));
    }

//    @DeleteMapping("/notices/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV') or (hasAnyRole('CPH', 'STAFF') and @calendarService.getUserCollegeId(principal) == @calendarService.getNoticeCollegeId(#id) and (@calendarService.isNoticeOwnerByUsername(#id, principal) or hasRole('CPH')))")
//    public ResponseEntity<?> deleteNotice(@PathVariable String id) {
//        calendarService.deleteNotice(id);
//        return ResponseEntity.ok(Map.of("success", true, "message", "Notice deleted"));
//    }
    
    @DeleteMapping("/notices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF')")
    public ResponseEntity<?> deleteNotice(@PathVariable String id, Principal principal) { 
        // We do the heavy lifting inside the service now
        calendarService.secureDeleteNotice(id, principal.getName());
        return ResponseEntity.ok(Map.of("success", true, "message", "Event deleted"));
    }
    
    
}
