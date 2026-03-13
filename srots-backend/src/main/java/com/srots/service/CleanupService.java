package com.srots.service;

/**
 * CleanupService
 *
 * Defines the automated data cleanup operations run by the scheduled task.
 * Each method targets one specific cleanup rule and returns the count of
 * records processed/deleted for logging and audit purposes.
 *
 * Rules:
 *  - Premium-expired student accounts: hard-delete after 90 days beyond premium end date
 *  - Old college posts:                hard-delete after 90 days from creation
 *  - Old events and notices:           hard-delete after 120 days from creation
 *  - Soft-deleted users:               hard-delete after 60 days from soft-delete date
 *  - Soft-deleted jobs:                hard-delete after 60 days from soft-delete date
 */
public interface CleanupService {

    /**
     * Run all five cleanup tasks in sequence.
     * Failures in one task do not abort the others.
     */
    void runAllCleanupTasks();

    /**
     * Permanently delete student accounts whose premium has been expired for
     * more than 90 days.
     * Premium end date is stored in StudentProfile.premiumEndDate (LocalDate).
     *
     * @return number of student accounts deleted
     */
    int cleanupExpiredPremiumStudents();

    /**
     * Permanently delete college posts that are older than 90 days.
     * Deletes associated likes and comments first, then the post itself.
     * Also deletes any attached image/document files from storage.
     *
     * @return number of posts deleted
     */
    int cleanupOldPosts();

    /**
     * Permanently delete events and notices that are older than 120 days.
     * Cleans up any attached files for notices.
     *
     * @return total number of events + notices deleted
     */
    int cleanupOldEventsAndNotices();

    /**
     * Permanently hard-delete any user account that has been soft-deleted
     * for more than 60 days. Uses the same role-based cascade logic as the
     * manual hard-delete endpoint.
     *
     * @return number of user accounts permanently deleted
     */
    int cleanupSoftDeletedUsers();

    /**
     * Permanently hard-delete any job that has been soft-deleted for more
     * than 60 days. Deletes related applications before removing the job.
     *
     * @return number of jobs permanently deleted
     */
    int cleanupSoftDeletedJobs();

    /**
     * Send application-deadline reminder emails to eligible students who have NOT
     * yet applied to jobs whose deadline falls exactly N days from today.
     * N = srots.cleanup.job-deadline-reminder-days (default 5).
     *
     * @return number of reminder emails sent
     */
    int sendJobDeadlineReminders();

    /**
     * Send premium-expiry warning emails to students whose premiumEndDate fell
     * within the warning window (between warningStartDays and warningEndDays ago).
     * Default window: 10–20 days after expiry (one email per day for 10 days).
     *
     * @return number of warning emails sent
     */
    int sendPremiumExpiryWarnings();
}
