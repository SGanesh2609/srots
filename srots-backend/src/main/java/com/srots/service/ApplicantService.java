package com.srots.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.jobdto.ApplicationListDTO;
import com.srots.dto.jobdto.JobApplicantsDashboardDTO;
import com.srots.dto.jobdto.JobHiringStatsDTO;
import com.srots.dto.jobdto.TimelineDTO;
import com.srots.model.User;

public interface ApplicantService {
    // --- Dashboard & Management ---
    JobApplicantsDashboardDTO getJobApplicantsDashboard(String jobId) throws Exception;
    List<User> getApplicants(String jobId);
    List<User> getEligibleStudents(String jobId);

    // --- Result Processing & Auto-Application ---
    Map<String, Object> uploadRoundResults(String jobId, int roundIndex, MultipartFile file) throws Exception;
    public JobHiringStatsDTO getJobHiringStats(String jobId) throws Exception;
    void updateApplication(String jobId, String studentId, String status);

    // --- Exports (Excel/CSV) ---
    byte[] exportApplicants(String jobId, String format) throws Exception;
    byte[] exportAllEligibleStudents(String jobId, String format) throws Exception;

    // --- Student Tracking ---
//    List<ApplicationListDTO> getStudentApplications(String studentId);
//    List<TimelineDTO> getHiringTimeline(String jobId, String studentId) throws Exception;
    public List<ApplicationListDTO> getStudentApplications();
    public List<TimelineDTO> getHiringTimeline(String jobId) throws Exception;
}
