package com.srots.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.srots.dto.FreeCourseRequest;
import com.srots.dto.FreeCourseResponse;
import com.srots.model.FreeCourse.CoursePlatform;
import com.srots.model.FreeCourse.CourseStatus;

public interface FreeCourseService {
    List<String> getCategories();
    /** Returns technology name → course count for active courses */
    Map<String, Long> getTechWithCounts();
    public List<String> getPlatforms();
    public Page<FreeCourseResponse> listCourses(String query, String tech, CoursePlatform platform, Pageable pageable);
    public Page<FreeCourseResponse> listCoursesForAdmin(String query, String tech, CoursePlatform platform, CourseStatus status, Pageable pageable);
    FreeCourseResponse createCourse(FreeCourseRequest dto);
    FreeCourseResponse updateCourse(String id, FreeCourseRequest dto);
    public void softDeleteCourse(String id);
    void deleteCourse(String id);
    public void verifyCourse(String id);
    public void updateStatus(String id, CourseStatus newStatus);
}