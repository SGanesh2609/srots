package com.srots.service;

import com.srots.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface CalendarService {
    // Events
	public List<EventDTO> getEvents(String collegeId, boolean upcoming, String type, String search);
    public EventDTO getEventByIdAndCollege(String id, String collegeId);
    public EventDTO createEvent(EventDTO dto);
    public EventDTO updateEvent(EventDTO dto);
    public void deleteEvent(String id);

    // Notices
    public List<NoticeDTO> getNotices(String collegeId, String type, String search);
    public NoticeDTO getNoticeByIdAndCollege(String id, String collegeId);
    NoticeDTO createNotice(NoticeDTO dto);
    public NoticeDTO updateNotice(NoticeDTO dto);
    void deleteNotice(String id);

    // Upload
    public UploadResponse uploadFile(MultipartFile file, String collegeCode, String category);
}