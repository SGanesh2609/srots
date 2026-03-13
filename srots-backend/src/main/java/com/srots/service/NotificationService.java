package com.srots.service;

import java.time.LocalDate;

import com.srots.model.Event;
import com.srots.model.Job;
import com.srots.model.Notice;
import com.srots.model.User;

/**
 * NotificationService
 *
 * Defines all email notification operations triggered by business events.
 * All methods are fire-and-forget — they do not block the calling transaction.
 *
 * Implementations must be async-safe: batch notifications use
 * CompletableFuture.runAsync() so the caller's transaction commits before
 * the email loop starts. Per-user notifications delegate to EmailService
 * which is already @Async.
 */
public interface NotificationService {

    // ── Job notifications ────────────────────────────────────────────────────

    /**
     * Notify all eligible active students in the job's college about a new job posting.
     * Sent asynchronously in batches after the job is saved.
     */
    void notifyJobCreated(Job job);

    /**
     * Notify all current applicants of a job that it has been updated.
     */
    void notifyJobUpdated(Job job);

    /**
     * Notify the student that their application was received.
     */
    void notifyStudentApplied(User student, Job job);

    /**
     * Notify the student about their round result (cleared / rejected / hired).
     *
     * @param student    the student user
     * @param job        the job they applied to
     * @param roundName  name of the round (e.g. "Aptitude Test")
     * @param status     one of: "Cleared", "Rejected", "Hired"
     */
    void notifyRoundResult(User student, Job job, String roundName, String status);

    /**
     * Notify a specific student about a job deadline approaching.
     * Called by the daily deadline-reminder scheduler for each eligible student.
     */
    void notifyJobDeadlineReminder(User student, Job job);

    // ── Account notifications ────────────────────────────────────────────────

    /**
     * Notify the user that their account has been soft-deleted.
     */
    void notifyAccountSoftDeleted(User user);

    /**
     * Notify the user that their account details have been updated.
     */
    void notifyAccountUpdated(User user);

    /**
     * Notify the student that their premium subscription is expiring/expired.
     *
     * @param user           the student
     * @param premiumEndDate the date the premium expired
     */
    void notifyPremiumExpiryWarning(User user, LocalDate premiumEndDate);

    // ── Event / Notice notifications ─────────────────────────────────────────

    /**
     * Notify all active users in the event's college about a new event.
     * Sent asynchronously in batches.
     */
    void notifyEventCreated(Event event);

    /**
     * Notify all active users in the notice's college about a new notice.
     * Sent asynchronously in batches.
     */
    void notifyNoticeCreated(Notice notice);
}
