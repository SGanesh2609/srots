package com.srots.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;

@Entity
@Table(name = "notices")
public class Notice {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID) 
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "created_by_user_id")
    private User createdBy; 

    @Column(nullable = false) 
    private String title;

    @Column(columnDefinition = "TEXT") 
    private String description;

    private LocalDate noticeDate;

    @Enumerated(EnumType.STRING) 
    private NoticeType type = NoticeType.Notice;

    /**
     * Expanded Enum to support all common college activities
     * This prevents 'No enum constant' errors when sending "Exam" or "Drive"
     */
    public enum NoticeType { 
        Notice, 
        Time_Table, 
        Exam, 
        Drive, 
        Placement, 
        Holiday, 
        Workshop, 
        Training,
        General 
    }

    private String fileUrl;
    private String fileName;
    
    @CreationTimestamp 
    private LocalDateTime createdAt;

    // --- Constructors ---

    public Notice() {
        super();
    }

    public Notice(String id, College college, User createdBy, String title, String description, LocalDate noticeDate,
            NoticeType type, String fileUrl, String fileName, LocalDateTime createdAt) {
        super();
        this.id = id;
        this.college = college;
        this.createdBy = createdBy;
        this.title = title;
        this.description = description;
        this.noticeDate = noticeDate;
        this.type = type;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.createdAt = createdAt;
    }

    // --- Getters and Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public College getCollege() {
        return college;
    }

    public void setCollege(College college) {
        this.college = college;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getNoticeDate() {
        return noticeDate;
    }

    public void setNoticeDate(LocalDate noticeDate) {
        this.noticeDate = noticeDate;
    }

    public NoticeType getType() {
        return type;
    }

    public void setType(NoticeType type) {
        this.type = type;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}