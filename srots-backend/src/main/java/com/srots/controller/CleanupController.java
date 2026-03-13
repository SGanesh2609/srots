package com.srots.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.srots.service.CleanupService;

/**
 * CleanupController
 *
 * Provides ADMIN / SROTS_DEV endpoints to manually trigger the cleanup
 * scheduler tasks without waiting for the 09:00 IST cron.
 *
 * All endpoints are restricted to ROLE_ADMIN and ROLE_SROTS_DEV.
 */
@RestController
@RequestMapping("/api/admin/cleanup")
@PreAuthorize("hasRole('ADMIN') or hasRole('SROTS_DEV')")
public class CleanupController {

    private static final Logger log = LoggerFactory.getLogger(CleanupController.class);

    @Autowired
    private CleanupService cleanupService;

    // ── Run all tasks ─────────────────────────────────────────────────────────

    /**
     * POST /api/admin/cleanup/run-all
     * Manually trigger all five cleanup tasks in sequence.
     */
    @PostMapping("/run-all")
    public ResponseEntity<Map<String, Object>> runAll() {
        log.info("[CLEANUP_CTRL] Manual run-all triggered");
        cleanupService.runAllCleanupTasks();
        return ok("All cleanup tasks completed successfully");
    }

    // ── Individual tasks ──────────────────────────────────────────────────────

    /**
     * POST /api/admin/cleanup/expired-premium-students
     * Permanently delete student accounts whose premium expired > 90 days ago.
     */
    @PostMapping("/expired-premium-students")
    public ResponseEntity<Map<String, Object>> runExpiredPremiumStudents() {
        log.info("[CLEANUP_CTRL] Manual expired-premium-students cleanup triggered");
        int count = cleanupService.cleanupExpiredPremiumStudents();
        return ok(count + " expired premium student account(s) permanently deleted");
    }

    /**
     * POST /api/admin/cleanup/old-posts
     * Permanently delete college posts older than 90 days.
     */
    @PostMapping("/old-posts")
    public ResponseEntity<Map<String, Object>> runOldPosts() {
        log.info("[CLEANUP_CTRL] Manual old-posts cleanup triggered");
        int count = cleanupService.cleanupOldPosts();
        return ok(count + " old post(s) permanently deleted");
    }

    /**
     * POST /api/admin/cleanup/old-events-notices
     * Permanently delete events and notices older than 120 days.
     */
    @PostMapping("/old-events-notices")
    public ResponseEntity<Map<String, Object>> runOldEventsNotices() {
        log.info("[CLEANUP_CTRL] Manual old-events-notices cleanup triggered");
        int count = cleanupService.cleanupOldEventsAndNotices();
        return ok(count + " old event(s) and notice(s) permanently deleted");
    }

    /**
     * POST /api/admin/cleanup/soft-deleted-users
     * Permanently delete user accounts that have been soft-deleted for > 60 days.
     */
    @PostMapping("/soft-deleted-users")
    public ResponseEntity<Map<String, Object>> runSoftDeletedUsers() {
        log.info("[CLEANUP_CTRL] Manual soft-deleted-users cleanup triggered");
        int count = cleanupService.cleanupSoftDeletedUsers();
        return ok(count + " soft-deleted user account(s) permanently deleted");
    }

    /**
     * POST /api/admin/cleanup/soft-deleted-jobs
     * Permanently delete jobs that have been soft-deleted for > 60 days.
     */
    @PostMapping("/soft-deleted-jobs")
    public ResponseEntity<Map<String, Object>> runSoftDeletedJobs() {
        log.info("[CLEANUP_CTRL] Manual soft-deleted-jobs cleanup triggered");
        int count = cleanupService.cleanupSoftDeletedJobs();
        return ok(count + " soft-deleted job(s) permanently deleted");
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> ok(String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(body);
    }
}
