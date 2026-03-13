package com.srots.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * CleanupProperties
 *
 * Single config file for ALL cleanup scheduler thresholds and schedule settings.
 * Change any value here — or override it in application.properties — without
 * touching business logic in CleanupServiceImpl or CleanupScheduler.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO OVERRIDE IN application.properties:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   srots.cleanup.premium-expiry-days=90
 *   srots.cleanup.post-retention-days=90
 *   srots.cleanup.event-notice-retention-days=120
 *   srots.cleanup.soft-delete-retention-days=60
 *   srots.cleanup.scheduler-cron=0 0 9 * * *
 *   srots.cleanup.scheduler-timezone=Asia/Kolkata
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FIELD DESCRIPTIONS:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  premiumExpiryDays        — Student account is permanently deleted this many days
 *                             AFTER their premiumEndDate. Default: 90 days.
 *                             e.g. premiumEndDate = Jan 1 → deleted on Apr 1 (90 days later)
 *
 *  postRetentionDays        — College posts older than this are permanently deleted.
 *                             Default: 90 days from post creation date.
 *
 *  eventNoticeRetentionDays — Events and Notices older than this are permanently deleted.
 *                             Default: 120 days from creation date.
 *
 *  softDeleteRetentionDays  — Any soft-deleted record (user, job) that has been in the
 *                             soft-deleted state for longer than this is permanently deleted.
 *                             Default: 60 days from the soft-delete timestamp.
 *
 *  schedulerCron            — Spring cron expression for the daily cleanup job.
 *                             Format: seconds minutes hours day-of-month month day-of-week
 *                             Default: "0 0 9 * * *" (09:00:00 every day)
 *
 *  schedulerTimezone        — Timezone used to evaluate the cron expression.
 *                             Default: "Asia/Kolkata" (IST, UTC+05:30)
 */
@Component
@ConfigurationProperties(prefix = "srots.cleanup")
public class CleanupProperties {

    // ── Retention thresholds (all values are in DAYS) ────────────────────────

    /**
     * Days after premiumEndDate before a student account is permanently deleted.
     * Default: 90 — meaning a student whose premium expired on Day 0 is deleted on Day 90.
     */
    private int premiumExpiryDays = 90;

    /**
     * Age (in days from createdAt) at which college posts are permanently deleted.
     * Default: 90 days.
     */
    private int postRetentionDays = 90;

    /**
     * Age (in days from createdAt) at which events and notices are permanently deleted.
     * Default: 120 days.
     */
    private int eventNoticeRetentionDays = 120;

    /**
     * Days a record must remain in soft-deleted state before being permanently deleted.
     * Applies to: Users (isDeleted=true), Jobs (deletedAt IS NOT NULL).
     * Default: 60 days.
     */
    private int softDeleteRetentionDays = 60;

    // ── Scheduler settings ───────────────────────────────────────────────────

    /**
     * Spring cron expression for the daily cleanup job.
     * Format: "seconds minutes hours day-of-month month day-of-week"
     * Default: "0 0 9 * * *" — every day at 09:00:00.
     *
     * Common values:
     *   "0 0 9  * * *"  — every day at 09:00 AM
     *   "0 30 8 * * *"  — every day at 08:30 AM
     *   "0 0 0  * * *"  — every day at midnight
     */
    private String schedulerCron = "0 0 9 * * *";

    /**
     * Timezone in which the schedulerCron is evaluated.
     * Default: "Asia/Kolkata" (IST = UTC+05:30).
     *
     * Other examples: "UTC", "America/New_York", "Europe/London"
     */
    private String schedulerTimezone = "Asia/Kolkata";

    // ── Notification settings ─────────────────────────────────────────────────

    /**
     * Days before a job's applicationDeadline to send reminder emails to eligible students.
     * Default: 5 — send reminders 5 days before the deadline.
     */
    private int jobDeadlineReminderDays = 5;

    /**
     * Days after premium expiry when the daily warning emails START being sent.
     * Default: 10 — start warning on day 10 after premiumEndDate.
     */
    private int premiumWarningStartDays = 10;

    /**
     * Days after premium expiry when the daily warning emails STOP being sent.
     * Default: 20 — stop warning on day 20 after premiumEndDate (10-day window total).
     */
    private int premiumWarningEndDays = 20;

    // ── Getters and Setters (required by @ConfigurationProperties) ───────────

    public int getPremiumExpiryDays() {
        return premiumExpiryDays;
    }

    public void setPremiumExpiryDays(int premiumExpiryDays) {
        this.premiumExpiryDays = premiumExpiryDays;
    }

    public int getPostRetentionDays() {
        return postRetentionDays;
    }

    public void setPostRetentionDays(int postRetentionDays) {
        this.postRetentionDays = postRetentionDays;
    }

    public int getEventNoticeRetentionDays() {
        return eventNoticeRetentionDays;
    }

    public void setEventNoticeRetentionDays(int eventNoticeRetentionDays) {
        this.eventNoticeRetentionDays = eventNoticeRetentionDays;
    }

    public int getSoftDeleteRetentionDays() {
        return softDeleteRetentionDays;
    }

    public void setSoftDeleteRetentionDays(int softDeleteRetentionDays) {
        this.softDeleteRetentionDays = softDeleteRetentionDays;
    }

    public String getSchedulerCron() {
        return schedulerCron;
    }

    public void setSchedulerCron(String schedulerCron) {
        this.schedulerCron = schedulerCron;
    }

    public String getSchedulerTimezone() {
        return schedulerTimezone;
    }

    public void setSchedulerTimezone(String schedulerTimezone) {
        this.schedulerTimezone = schedulerTimezone;
    }

    public int getJobDeadlineReminderDays() {
        return jobDeadlineReminderDays;
    }

    public void setJobDeadlineReminderDays(int jobDeadlineReminderDays) {
        this.jobDeadlineReminderDays = jobDeadlineReminderDays;
    }

    public int getPremiumWarningStartDays() {
        return premiumWarningStartDays;
    }

    public void setPremiumWarningStartDays(int premiumWarningStartDays) {
        this.premiumWarningStartDays = premiumWarningStartDays;
    }

    public int getPremiumWarningEndDays() {
        return premiumWarningEndDays;
    }

    public void setPremiumWarningEndDays(int premiumWarningEndDays) {
        this.premiumWarningEndDays = premiumWarningEndDays;
    }
}
