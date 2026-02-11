package com.srots.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.EventDTO;
import com.srots.dto.NoticeDTO;
import com.srots.dto.UploadResponse;
import com.srots.model.Event;
import com.srots.model.Notice;
import com.srots.model.User;
import com.srots.repository.CollegeRepository;
import com.srots.repository.EventRepository;
import com.srots.repository.NoticeRepository;
import com.srots.repository.UserRepository;

@Service
public class CalendarServiceImpl implements CalendarService {

    private final EventRepository eventRepo;
    private final NoticeRepository noticeRepo;
    private final CollegeRepository collegeRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;
    private final FileService fileService;

    public CalendarServiceImpl(EventRepository eventRepo, NoticeRepository noticeRepo,
                               CollegeRepository collegeRepo, UserRepository userRepo,
                               ObjectMapper objectMapper, FileService fileService) {
        this.eventRepo = eventRepo;
        this.noticeRepo = noticeRepo;
        this.collegeRepo = collegeRepo;
        this.userRepo = userRepo;
        this.objectMapper = objectMapper;
        this.fileService = fileService;
    }

    private User getCurrentUser() {
        String principalName = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(principalName)
                .orElseGet(() -> userRepo.findByUsername(principalName).orElse(null));
    }

    // --- 1. EVENTS LOGIC ---

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getEvents(String collegeId, boolean upcoming, String type, String search) {
        if ((type != null && !type.isEmpty()) || (search != null && !search.isEmpty())) {
            Event.EventType eventType = null;
            if (type != null && !type.isEmpty()) {
                try {
                    eventType = Event.EventType.valueOf(type.replace(" ", "_"));
                } catch (IllegalArgumentException e) {
                    eventType = null;
                }
            }
            return eventRepo.searchEvents(collegeId, eventType, search)
                    .stream().map(this::mapToEventDTO).collect(Collectors.toList());
        }

        List<Event> events = upcoming
                ? eventRepo.findUpcomingEvents(collegeId, LocalDate.now())
                : eventRepo.findByCollegeIdOrderByStartDateAsc(collegeId);

        return events.stream().map(this::mapToEventDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventDTO getEventByIdAndCollege(String id, String collegeId) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        if (!event.getCollege().getId().equals(collegeId)) {
            throw new RuntimeException("Access Denied: Event not belong to your college");
        }

        return mapToEventDTO(event);
    }

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO dto) {
        Event event = new Event();
        event.setId(UUID.randomUUID().toString());
        event.setCreatedBy(getCurrentUser());
        mapDtoToEvent(dto, event);
        return mapToEventDTO(eventRepo.save(event));
    }

    @Override
    @Transactional
    public EventDTO updateEvent(EventDTO dto) {
        Event event = eventRepo.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + dto.getId()));

        mapDtoToEvent(dto, event);

        return mapToEventDTO(eventRepo.save(event));
    }

    @Override
    @Transactional
    public void deleteEvent(String id) {
        if (!eventRepo.existsById(id)) {
            throw new RuntimeException("Cannot delete: Event not found with ID: " + id);
        }
        eventRepo.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEventOwnerByUsername(String id, String username) {
        return eventRepo.findById(id)
                .map(event -> event.getCreatedBy() != null && 
                     event.getCreatedBy().getUsername().equals(username))
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public String getEventCollegeId(String eventId) {
        System.out.println("Checking college for event ID: " + eventId); // DEBUG LOG
        return eventRepo.findById(eventId)
                .map(event -> event.getCollege().getId())
                .orElse(null);
    }
    
    @Override
    @Transactional
    public void secureDeleteEvent(String eventId, String username) {
        // 1. Find the user
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find the event
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 3. Manual Permission Check
        boolean isAdmin = user.getRole().name().equals("ADMIN") || user.getRole().name().equals("SROTS_DEV");
        boolean isCPH = user.getRole().name().equals("ROLE_CPH") || user.getRole().name().equals("CPH");
        boolean isStaff = user.getRole().name().equals("ROLE_STAFF") || user.getRole().name().equals("STAFF");

        if (isAdmin) {
            // Full access
        } else if (isCPH) {
            // Check if event belongs to CPH's college
            if (!event.getCollege().getId().equals(user.getCollege().getId())) {
                throw new RuntimeException("Access Denied: You can only delete events for your college");
            }
        } else if (isStaff) {
            // Check if Staff is the creator
            if (!event.getCreatedBy().getUsername().equals(username)) {
                throw new RuntimeException("Access Denied: You can only delete events you created");
            }
        } else {
            throw new RuntimeException("Access Denied: Insufficient permissions");
        }

        // 4. Perform the delete
        eventRepo.delete(event);
    }

    // --- 2. NOTICES LOGIC ---

    @Override
    @Transactional(readOnly = true)
    public List<NoticeDTO> getNotices(String collegeId, String type, String search) {
        Notice.NoticeType noticeType = null;
        if (type != null && !type.isEmpty()) {
            try {
                noticeType = Notice.NoticeType.valueOf(type.replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                noticeType = null;
            }
        }

        List<Notice> notices = noticeRepo.searchNotices(collegeId, noticeType, search);
        return notices.stream().map(this::mapToNoticeDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NoticeDTO getNoticeByIdAndCollege(String id, String collegeId) {
        Notice notice = noticeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + id));

        if (!notice.getCollege().getId().equals(collegeId)) {
            throw new RuntimeException("Access Denied: Notice not belong to your college");
        }

        return mapToNoticeDTO(notice);
    }

    @Override
    @Transactional
    public NoticeDTO createNotice(NoticeDTO dto) {
        Notice notice = new Notice();
        notice.setCollege(collegeRepo.getReferenceById(dto.getCollegeId()));
        notice.setCreatedBy(getCurrentUser());

        notice.setTitle(dto.getTitle());
        notice.setDescription(dto.getDescription());
        notice.setNoticeDate((dto.getDate() != null && !dto.getDate().isBlank()) ? LocalDate.parse(dto.getDate()) : LocalDate.now());

        try {
            String typeFormatted = dto.getType().replace(" ", "_");
            notice.setType(Notice.NoticeType.valueOf(typeFormatted));
        } catch (Exception e) {
            notice.setType(Notice.NoticeType.Notice);
        }

        notice.setFileUrl(dto.getFileUrl());
        notice.setFileName(dto.getFileName());
        return mapToNoticeDTO(noticeRepo.save(notice));
    }
    
    @Override
    @Transactional
    public NoticeDTO secureUpdateNotice(String noticeId, NoticeDTO dto, String username) {
        // 1. Find User and Notice
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Notice notice = noticeRepo.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + noticeId));

        // 2. Extract Roles and IDs
        String role = user.getRole().name();
        String userCollegeId = user.getCollege().getId();
        String noticeCollegeId = notice.getCollege().getId();
        
        boolean isAdmin = role.equals("ROLE_ADMIN") || role.equals("ROLE_SROTS_DEV");
        boolean isCPH = role.contains("CPH");
        boolean isStaff = role.contains("STAFF");

        // 3. Permission Logic
        if (isAdmin) {
            // Full access for SROTS_DEV and ADMIN
        } else if (isCPH) {
            // CPH: Must belong to the same college as the notice
            if (!userCollegeId.equals(noticeCollegeId)) {
                throw new RuntimeException("Access Denied: CPH college mismatch. You can only manage notices for your own college.");
            }
        } else if (isStaff) {
            // STAFF: Must be the owner AND from the same college
            boolean isOwner = notice.getCreatedBy() != null && notice.getCreatedBy().getUsername().equals(username);
            boolean isSameCollege = userCollegeId.equals(noticeCollegeId);

            if (!isOwner) {
                throw new RuntimeException("Access Denied: You are not the creator of this notice.");
            }
            if (!isSameCollege) {
                throw new RuntimeException("Access Denied: Staff college mismatch.");
            }
        } else {
            throw new RuntimeException("Access Denied: Insufficient permissions to update notices.");
        }

        // 4. File Cleanup (Handle storage before DB update)
        if (notice.getFileUrl() != null && (dto.getFileUrl() == null || !notice.getFileUrl().equals(dto.getFileUrl()))) {
            try {
                fileService.deleteFile(notice.getFileUrl());
            } catch (Exception e) {
                System.err.println("Non-critical error: Failed to delete old file " + notice.getFileUrl());
            }
        }

        // 5. Update Fields
        notice.setTitle(dto.getTitle());
        notice.setDescription(dto.getDescription());
        notice.setFileUrl(dto.getFileUrl());
        notice.setFileName(dto.getFileName());

        // Date formatting (ISO to LocalDate)
        if (dto.getDate() != null && !dto.getDate().isBlank()) {
            String cleanDate = dto.getDate().contains("T") ? dto.getDate().split("T")[0] : dto.getDate();
            notice.setNoticeDate(LocalDate.parse(cleanDate));
        }

        // Enum Mapping
        try {
            String typeFormatted = dto.getType().trim().replace(" ", "_");
            notice.setType(Notice.NoticeType.valueOf(typeFormatted));
        } catch (Exception e) {
            notice.setType(Notice.NoticeType.Notice);
        }

        return mapToNoticeDTO(noticeRepo.save(notice));
    }
    

    @Override
    @Transactional
    public void deleteNotice(String id) {
        Notice notice = noticeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + id));

        // Delete file from disk/S3 first
        if (notice.getFileUrl() != null) {
            fileService.deleteFile(notice.getFileUrl());
        }

        noticeRepo.delete(notice);
    }

    @Override
    public UploadResponse uploadFile(MultipartFile file, String collegeId, String category) {
        String url = fileService.uploadFile(file, collegeId, category);
        return new UploadResponse(url, file.getOriginalFilename());
    }

//    @Override
//    @Transactional(readOnly = true)
//    public boolean isNoticeOwnerByUsername(String id, String username) {
//        return noticeRepo.findById(id)
//                .map(notice -> notice.getCreatedBy().getUsername().equals(username))
//                .orElse(false);
//    }
    

    @Override
    @Transactional(readOnly = true)
    public boolean isNoticeOwnerByUsername(String id, String username) {
        if (id == null || username == null) return false;
        return noticeRepo.findById(id)
                .map(notice -> notice.getCreatedBy() != null && 
                     notice.getCreatedBy().getUsername().equals(username))
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public String getUserCollegeId(String username) {
        if (username == null) return null;
        return userRepo.findByUsername(username)
                .map(u -> u.getCollege().getId()) // Adjust based on your User entity structure
                .orElse(null);
    }
    
    @Override
    @Transactional(readOnly = true)
    public String getNoticeCollegeId(String noticeId) {
        return noticeRepo.findById(noticeId).map(notice -> notice.getCollege().getId()).orElse(null);
    }

//    @Override
//    @Transactional(readOnly = true)
//    public String getUserCollegeId(String username) {
//        return userRepo.findByUsername(username).map(User::getCollegeIdOnly).orElse(null);
//    }
    
    
    @Override
    @Transactional
    public void secureDeleteNotice(String noticeId, String username) {
        // 1. Find User and Notice
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Notice notice = noticeRepo.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + noticeId));

        // 2. Extract Roles and IDs
        String role = user.getRole().name();
        String userCollegeId = user.getCollege().getId();
        String noticeCollegeId = notice.getCollege().getId();
        
        boolean isAdmin = role.equals("ROLE_ADMIN") || role.equals("ROLE_SROTS_DEV");
        boolean isCPH = role.contains("CPH");
        boolean isStaff = role.contains("STAFF");

        // 3. Permission Logic (Strict Verification)
        if (isAdmin) {
            // Full access for SROTS_DEV and ADMIN
        } else if (isCPH) {
            // CPH: Must belong to the same college as the notice
            if (!userCollegeId.equals(noticeCollegeId)) {
                throw new RuntimeException("Access Denied: CPH college mismatch. You can only delete notices for your own college.");
            }
        } else if (isStaff) {
            // STAFF: Must be the owner AND from the same college
            boolean isOwner = notice.getCreatedBy() != null && notice.getCreatedBy().getUsername().equals(username);
            boolean isSameCollege = userCollegeId.equals(noticeCollegeId);

            if (!isOwner) {
                throw new RuntimeException("Access Denied: You are not the creator of this notice.");
            }
            if (!isSameCollege) {
                throw new RuntimeException("Access Denied: Staff college mismatch.");
            }
        } else {
            // Students or other unauthorized roles
            throw new RuntimeException("Access Denied: Insufficient permissions to delete notices.");
        }

        // 4. Physical File Cleanup
        // Logic: Delete the file from the storage system before removing the database entry
        if (notice.getFileUrl() != null && !notice.getFileUrl().isBlank()) {
            try {
                fileService.deleteFile(notice.getFileUrl());
            } catch (Exception e) {
                // We log the error but proceed with record deletion to avoid "zombie" database entries
                System.err.println("Warning: Could not delete physical file for notice " + noticeId + ": " + e.getMessage());
            }
        }

        // 5. Delete from Repository
        noticeRepo.delete(notice);
    }

    // --- MAPPERS ---

    private EventDTO mapToEventDTO(Event e) {
        EventDTO dto = new EventDTO();
        dto.setId(e.getId());
        dto.setCollegeId(e.getCollege() != null ? e.getCollege().getId() : null);
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setDate(e.getStartDate().toString());
        if (e.getEndDate() != null) dto.setEndDate(e.getEndDate().toString());
        dto.setType(e.getEventType().getDisplayName());

        if (e.getCreatedBy() != null) {
            dto.setCreatedById(e.getCreatedBy().getId());
            dto.setCreatedBy(e.getCreatedBy().getUsername());
        } else {
            dto.setCreatedById(null);
            dto.setCreatedBy("admin");
        }

        DateTimeFormatter tf = DateTimeFormatter.ofPattern("HH:mm:ss");
        dto.setStartTime(e.getStartTime() != null ? e.getStartTime().format(tf) : "");
        dto.setEndTime(e.getEndTime() != null ? e.getEndTime().format(tf) : "");

        try {
            if (e.getTargetBranches() != null)
                dto.setTargetBranches(objectMapper.readValue(e.getTargetBranches(), new TypeReference<List<String>>() {}));
            if (e.getTargetYears() != null)
                dto.setTargetYears(objectMapper.readValue(e.getTargetYears(), new TypeReference<List<Integer>>() {}));
            if (e.getScheduleJson() != null)
                dto.setSchedule(objectMapper.readValue(e.getScheduleJson(), Object.class));
        } catch (Exception ex) {
            dto.setTargetBranches(Collections.emptyList());
            dto.setTargetYears(Collections.emptyList());
            dto.setSchedule(Collections.emptyList());
        }
        return dto;
    }

    private void mapDtoToEvent(EventDTO dto, Event e) {
        if (dto.getCollegeId() != null) {
            e.setCollege(collegeRepo.getReferenceById(dto.getCollegeId()));
        } else {
            throw new IllegalArgumentException("College ID is required");
        }
        e.setTitle(dto.getTitle());
        e.setDescription(dto.getDescription());
        if (dto.getDate() != null && !dto.getDate().isBlank()) {
            e.setStartDate(LocalDate.parse(dto.getDate()));
        } else {
            throw new IllegalArgumentException("Start date is required");
        }
        e.setEndDate((dto.getEndDate() != null && !dto.getEndDate().isBlank()) ? LocalDate.parse(dto.getEndDate()) : e.getStartDate());
        e.setEventType(Event.EventType.valueOf(dto.getType().replace(" ", "_")));
        e.setStartTime((dto.getStartTime() != null && !dto.getStartTime().isBlank()) ? LocalTime.parse(dto.getStartTime()) : null);
        e.setEndTime((dto.getEndTime() != null && !dto.getEndTime().isBlank()) ? LocalTime.parse(dto.getEndTime()) : null);

        try {
            e.setTargetBranches(dto.getTargetBranches() != null ? objectMapper.writeValueAsString(dto.getTargetBranches()) : "[]");
            e.setTargetYears(dto.getTargetYears() != null ? objectMapper.writeValueAsString(dto.getTargetYears()) : "[]");
            e.setScheduleJson(dto.getSchedule() != null ? objectMapper.writeValueAsString(dto.getSchedule()) : "[]");
        } catch (Exception ex) {
            e.setTargetBranches("[]");
            e.setTargetYears("[]");
            e.setScheduleJson("[]");
        }
    }

    private NoticeDTO mapToNoticeDTO(Notice n) {
        NoticeDTO dto = new NoticeDTO();
        dto.setId(n.getId());
        dto.setCollegeId(n.getCollege().getId());
        dto.setTitle(n.getTitle());
        dto.setDescription(n.getDescription());
        dto.setDate(n.getNoticeDate().toString());
        if (n.getCreatedBy() != null) {
            dto.setCreatedById(n.getCreatedBy().getId());
            dto.setCreatedBy(n.getCreatedBy().getUsername());
        } else {
            dto.setCreatedById(null);
            dto.setCreatedBy("admin");
        }
        dto.setType(n.getType().name().replace("_", " "));
        dto.setFileName(n.getFileName());
        dto.setFileUrl(n.getFileUrl());
        return dto;
    }

//	@Override
//	public NoticeDTO updateNotice(NoticeDTO dto) {
//		// TODO Auto-generated method stub
//		return null;
//	}
}