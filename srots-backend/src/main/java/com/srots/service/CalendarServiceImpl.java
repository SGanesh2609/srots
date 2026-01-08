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
            throw new RuntimeException("Access Denied: Event does not belong to your college");
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
        
        User user = getCurrentUser();
        if (user != null) {
            event.setCreatedBy(user);
        }
        
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
            throw new RuntimeException("Access Denied: Notice does not belong to your college");
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
        notice.setNoticeDate(dto.getDate() != null ? LocalDate.parse(dto.getDate()) : LocalDate.now());
        
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
    public NoticeDTO updateNotice(NoticeDTO dto) {
        Notice notice = noticeRepo.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + dto.getId()));
        
        // --- CLEANUP: Handle physical file deletion ---
        if (notice.getFileUrl() != null && dto.getFileUrl() != null && 
            !notice.getFileUrl().equals(dto.getFileUrl())) {
            fileService.deleteFile(notice.getFileUrl());
        }

        notice.setCollege(collegeRepo.getReferenceById(dto.getCollegeId()));
        notice.setTitle(dto.getTitle());
        notice.setDescription(dto.getDescription());
        notice.setNoticeDate(dto.getDate() != null ? LocalDate.parse(dto.getDate()) : LocalDate.now());
        
        try {
            String typeFormatted = dto.getType().replace(" ", "_");
            notice.setType(Notice.NoticeType.valueOf(typeFormatted));
        } catch (Exception e) {
            notice.setType(Notice.NoticeType.Notice);
        }
        
        notice.setFileUrl(dto.getFileUrl());
        notice.setFileName(dto.getFileName());
        
        User user = getCurrentUser();
        if (user != null) {
            notice.setCreatedBy(user);
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
    public UploadResponse uploadFile(MultipartFile file, String collegeCode, String category) {
        String url = fileService.uploadFile(file, collegeCode, category);
        return new UploadResponse(url, file.getOriginalFilename());
    }

    // --- MAPPERS ---

    private EventDTO mapToEventDTO(Event e) {
        EventDTO dto = new EventDTO();
        dto.setId(e.getId());
        dto.setCollegeId(e.getCollege().getId());
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setDate(e.getStartDate().toString());
        if (e.getEndDate() != null) dto.setEndDate(e.getEndDate().toString());
        dto.setType(e.getEventType().getDisplayName());
        
        if (e.getCreatedBy() != null) {
            dto.setCreatedBy(e.getCreatedBy().getUsername());
        } else {
            dto.setCreatedBy("admin");
        }
        
        DateTimeFormatter tf = DateTimeFormatter.ofPattern("HH:mm:ss");
        dto.setStartTime(e.getStartTime().format(tf));
        dto.setEndTime(e.getEndTime().format(tf));
        
        try {
            if (e.getTargetBranches() != null) 
                dto.setTargetBranches(objectMapper.readValue(e.getTargetBranches(), List.class));
            if (e.getTargetYears() != null) 
                dto.setTargetYears(objectMapper.readValue(e.getTargetYears(), List.class));
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
        e.setCollege(collegeRepo.getReferenceById(dto.getCollegeId()));
        e.setTitle(dto.getTitle());
        e.setDescription(dto.getDescription()); 
        e.setStartDate(LocalDate.parse(dto.getDate()));
        e.setEndDate(dto.getEndDate() != null ? LocalDate.parse(dto.getEndDate()) : LocalDate.parse(dto.getDate()));
        e.setEventType(Event.EventType.valueOf(dto.getType().replace(" ", "_")));
        e.setStartTime(LocalTime.parse(dto.getStartTime()));
        e.setEndTime(LocalTime.parse(dto.getEndTime()));
        
        try {
            e.setTargetBranches(objectMapper.writeValueAsString(dto.getTargetBranches()));
            e.setTargetYears(objectMapper.writeValueAsString(dto.getTargetYears()));
            e.setScheduleJson(objectMapper.writeValueAsString(dto.getSchedule()));
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
            dto.setCreatedBy(n.getCreatedBy().getUsername());
        } else {
            dto.setCreatedBy("admin");
        }
        dto.setType(n.getType().name().replace("_", " "));
        dto.setFileName(n.getFileName());
        dto.setFileUrl(n.getFileUrl());
        return dto;
    }
}