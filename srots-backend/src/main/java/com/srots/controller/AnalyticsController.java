package com.srots.controller;

import com.srots.dto.analytics.AnalyticsOverviewDTO;
import com.srots.dto.analytics.SystemAnalyticsDTO;
import com.srots.model.User;
import com.srots.repository.UserRepository;
import com.srots.service.AnalyticsService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/v1/analytics/overview
     * - ADMIN / SROTS_DEV → system-wide data
     * - CPH / STAFF       → college-scoped data (resolved from JWT subject)
     */
    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF')")
    public ResponseEntity<AnalyticsOverviewDTO> getAnalytics(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            AnalyticsOverviewDTO result;

            if (user.getRole() == User.Role.CPH || user.getRole() == User.Role.STAFF) {
                String collegeId = user.getCollegeIdOnly();
                if (collegeId == null || collegeId.isBlank()) {
                    log.warn("CPH/STAFF user '{}' has no collegeId — falling back to system-wide analytics", username);
                    result = analyticsService.getOverview();
                } else {
                    result = analyticsService.getOverviewByCollege(collegeId);
                }
            } else {
                result = analyticsService.getOverview();
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error in GET /analytics/overview: {}", e.getMessage(), e);
            throw e; // Let the global exception handler return a proper 500 payload
        }
    }

    /**
     * GET /api/v1/analytics/system
     * Only for ADMIN and SROTS_DEV roles.
     */
    @GetMapping("/system")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<SystemAnalyticsDTO> getSystemAnalytics() {
        try {
            SystemAnalyticsDTO result = analyticsService.getSystemAnalytics();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error in GET /analytics/system: {}", e.getMessage(), e);
            throw e;
        }
    }
}