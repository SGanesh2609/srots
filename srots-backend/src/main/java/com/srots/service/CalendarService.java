package com.srots.service;

import com.srots.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

//public interface CalendarService {
//    // Events
//	public List<EventDTO> getEvents(String collegeId, boolean upcoming, String type, String search);
//    public EventDTO getEventByIdAndCollege(String id, String collegeId);
//    public EventDTO createEvent(EventDTO dto);
//    public EventDTO updateEvent(EventDTO dto);
//    public void deleteEvent(String id);
//
//    // Notices
//    public List<NoticeDTO> getNotices(String collegeId, String type, String search);
//    public NoticeDTO getNoticeByIdAndCollege(String id, String collegeId);
//    NoticeDTO createNotice(NoticeDTO dto);
//    public NoticeDTO updateNotice(NoticeDTO dto);
//    void deleteNotice(String id);
//
//    // Upload
//    public UploadResponse uploadFile(MultipartFile file, String collegeCode, String category);
//    
//    
//    public boolean isNoticeOwner(String id, String userId);
//    public boolean isEventOwner(String id, String userId);

public interface CalendarService {

    List<EventDTO> getEvents(String collegeId, boolean upcoming, String type, String search);

    EventDTO getEventByIdAndCollege(String id, String collegeId);

    EventDTO createEvent(EventDTO dto);

    EventDTO updateEvent(EventDTO dto);

    void deleteEvent(String id);

    boolean isEventOwnerByUsername(String id, String username);

    String getEventCollegeId(String eventId);

    List<NoticeDTO> getNotices(String collegeId, String type, String search);

    NoticeDTO getNoticeByIdAndCollege(String id, String collegeId);

    NoticeDTO createNotice(NoticeDTO dto);

//    NoticeDTO updateNotice(NoticeDTO dto);

    void deleteNotice(String id);

    UploadResponse uploadFile(MultipartFile file, String collegeId, String category);

    boolean isNoticeOwnerByUsername(String id, String username);

    String getNoticeCollegeId(String noticeId);

    String getUserCollegeId(String username);
    
    void secureDeleteEvent(String eventId, String username);
    
    public void secureDeleteNotice(String eventId, String username);
    
    public NoticeDTO secureUpdateNotice(String noticeId, NoticeDTO dto, String username);
}