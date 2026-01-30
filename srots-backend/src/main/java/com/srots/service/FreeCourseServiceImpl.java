package com.srots.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.srots.config.UserInfoUserDetails;
import com.srots.dto.FreeCourseRequest;
import com.srots.dto.FreeCourseResponse;
import com.srots.exception.ResourceNotFoundException;
import com.srots.model.AuditLog;
import com.srots.model.FreeCourse;
import com.srots.model.FreeCourse.CoursePlatform;
import com.srots.model.User;
import com.srots.repository.AuditLogRepository;
import com.srots.repository.FreeCourseRepository;
import com.srots.repository.UserRepository;

@Service
public class FreeCourseServiceImpl implements FreeCourseService {

    @Autowired private FreeCourseRepository repo;
    @Autowired private UserRepository userRepository;
    @Autowired private AuditLogRepository auditRepo;
    @Autowired private EmailService emailService;

    private static final int EMAIL_BATCH_SIZE = 500; 
    private static final long BATCH_DELAY_MS = 2000;

    @Override
    @Cacheable(value = "courseCategories") 
    public List<String> getCategories() {
        List<String> categories = repo.findUniqueCategories();
        if (categories == null) categories = new ArrayList<>();
        if (!categories.contains("All")) categories.add(0, "All");
        return categories;
    }

    @Override
    public List<String> getPlatforms() {
        return Stream.of(CoursePlatform.values()).map(Enum::name).collect(Collectors.toList());
    }

    @Override
    public Page<FreeCourseResponse> listCourses(String query, String tech, CoursePlatform platform, Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query : null;
        String techFilter = (tech == null || "All".equalsIgnoreCase(tech)) ? null : tech;
        
        return repo.searchActiveCourses(cleanQuery, techFilter, platform, FreeCourse.CourseStatus.ACTIVE, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public Page<FreeCourseResponse> listCoursesForAdmin(String query, String tech, CoursePlatform platform, FreeCourse.CourseStatus status, Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query : null;
        String techFilter = (tech == null || "All".equalsIgnoreCase(tech)) ? null : tech;
        
        return repo.searchAllCoursesForAdmin(cleanQuery, techFilter, platform, status, pageable)
                .map(this::convertToResponse);
    }

    /**
     * FIX: Safe Audit Logging
     * Prevents ClassCastException by checking principal type.
     */
    private void logAction(String action, FreeCourse course, String details) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userEmail = "System";

        if (principal instanceof UserInfoUserDetails detailsObj) {
            userEmail = detailsObj.getUsername();
        }
        
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setTargetId(course.getId());
        log.setTargetName(course.getName());
        log.setPerformedBy(userEmail);
        log.setDetails(details);
        auditRepo.save(log);
    }

    @Transactional
    public void softDeleteCourse(String id) {
        FreeCourse course = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        course.setStatus(FreeCourse.CourseStatus.INACTIVE);
        repo.save(course);
        logAction("SOFT_DELETE", course, "Course deactivated by Admin");
    }

    @Override
    @Transactional
    public void deleteCourse(String id) {
        FreeCourse course = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        logAction("HARD_DELETE", course, "Course permanently removed from database");
        repo.delete(course);
    }

    @Transactional
    public void verifyCourse(String id) {
        FreeCourse course = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        course.setLastVerifiedAt(LocalDateTime.now());
        repo.save(course);
    }

    @Transactional
    public void updateStatus(String id, FreeCourse.CourseStatus newStatus) {
        FreeCourse course = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        course.setStatus(newStatus);
        if (newStatus == FreeCourse.CourseStatus.ACTIVE) {
            course.setLastVerifiedAt(LocalDateTime.now());
        }
        repo.save(course);
    }

    /**
     * FIX: Secure Course Creation
     * Resolves the 400 Bad Request by fetching the actual User Entity.
     */
    @Override
    @Transactional
    @CacheEvict(value = "courseCategories", allEntries = true) 
    public FreeCourseResponse createCourse(FreeCourseRequest dto) {
        validateLinkPlatform(dto.getLink(), dto.getPlatform());

        if (repo.existsByLink(dto.getLink())) {
            throw new RuntimeException("This course link already exists.");
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserInfoUserDetails userDetails)) {
            throw new RuntimeException("User session invalid or expired");
        }
        
        User currentUser = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user entity not found"));

        FreeCourse course = new FreeCourse();
        course.setId(UUID.randomUUID().toString()); 
        course.setName(dto.getName());
        course.setTechnology(dto.getTechnology());
        course.setDescription(dto.getDescription());
        course.setLink(dto.getLink());
        course.setPlatform(dto.getPlatform());
        course.setPostedBy(currentUser); 
        course.setPostedByName(currentUser.getFullName());

        FreeCourse savedCourse = repo.save(course);
        
        CompletableFuture.runAsync(() -> notifyUsersInBatches(savedCourse));

        return convertToResponse(savedCourse);
    }

    @Override
    @Transactional
    @CacheEvict(value = "courseCategories", allEntries = true) // Added cache eviction for updates
    public FreeCourseResponse updateCourse(String id, FreeCourseRequest dto) {
        FreeCourse course = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        String linkToValidate = (dto.getLink() != null) ? dto.getLink() : course.getLink();
        CoursePlatform platToValidate = (dto.getPlatform() != null) ? dto.getPlatform() : course.getPlatform();
        validateLinkPlatform(linkToValidate, platToValidate);

        if (dto.getLink() != null && !dto.getLink().equals(course.getLink()) && repo.existsByLink(dto.getLink())) {
            throw new RuntimeException("Link already exists.");
        }

        if (dto.getName() != null) course.setName(dto.getName());
        if (dto.getTechnology() != null) course.setTechnology(dto.getTechnology());
        if (dto.getPlatform() != null) course.setPlatform(dto.getPlatform());
        if (dto.getLink() != null) course.setLink(dto.getLink());
        if (dto.getDescription() != null) course.setDescription(dto.getDescription());

        return convertToResponse(repo.save(course));
    }

    private void notifyUsersInBatches(FreeCourse course) {
        int pageNumber = 0;
        Page<User> userPage;
        String subject = "New Course: " + course.getName();
        String body = "Hi, a new course in " + course.getTechnology() + " is available. Check it out: " + course.getLink();

        do {
            userPage = userRepository.findAll(PageRequest.of(pageNumber, EMAIL_BATCH_SIZE));
            for (User user : userPage.getContent()) {
                if (user.getEmail() != null && !user.getEmail().isBlank()) {
                    emailService.sendEmail(user.getEmail(), subject, body);
                }
            }
            pageNumber++;
            try { Thread.sleep(BATCH_DELAY_MS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        } while (userPage.hasNext());
    }

    private void validateLinkPlatform(String link, CoursePlatform platform) {
        if (link == null || platform == null) return;
        String regex = switch (platform) {
            case YOUTUBE -> "^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be)/.+$";
            case UDEMY -> "^(https?://)?(www\\.)?udemy\\.com/.+$";
            case COURSERA -> "^(https?://)?(www\\.)?coursera\\.org/.+$";
            case LINKEDIN -> "^(https?://)?(www\\.)?linkedin\\.com/.+$";
            default -> "http.*";
        };
        if (!link.matches(regex)) throw new IllegalArgumentException("Invalid " + platform + " URL");
    }

    private FreeCourseResponse convertToResponse(FreeCourse entity) {
        FreeCourseResponse res = new FreeCourseResponse();
        res.setId(entity.getId());
        res.setName(entity.getName());
        res.setTechnology(entity.getTechnology());
        res.setDescription(entity.getDescription());
        res.setLink(entity.getLink());
        res.setPlatform(entity.getPlatform());
        res.setPostedBy(entity.getPostedByName());
        res.setCreated_at(entity.getCreatedAt());
        res.setStatus(entity.getStatus()); 
        res.setLastVerifiedAt(entity.getLastVerifiedAt());
        return res;
    }
}