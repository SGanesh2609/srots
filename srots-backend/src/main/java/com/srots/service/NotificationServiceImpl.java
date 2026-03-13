package com.srots.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.srots.model.Application;
import com.srots.model.Event;
import com.srots.model.Job;
import com.srots.model.Notice;
import com.srots.model.User;
import com.srots.repository.ApplicationRepository;
import com.srots.repository.UserRepository;

/**
 * NotificationServiceImpl
 *
 * Sends transactional email notifications triggered by business events.
 *
 * Design decisions:
 *  - Per-user emails (apply, round result, soft delete, update) call
 *    emailService.sendEmail() which is already @Async — no extra wrapping needed.
 *  - Batch emails (job created, event/notice created) use
 *    CompletableFuture.runAsync() to avoid blocking the caller's transaction,
 *    then iterate paginated DB queries (PAGE_SIZE = 500) to limit memory usage.
 *  - All methods swallow exceptions after logging so a broken email never
 *    rolls back a business operation.
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    /** How many users to load per batch when sending college-wide notifications. */
    private static final int PAGE_SIZE = 500;

    /** Milliseconds to sleep between batch pages to avoid overwhelming the SMTP server. */
    private static final long BATCH_DELAY_MS = 2_000;

    @Autowired private EmailService        emailService;
    @Autowired private UserRepository      userRepo;
    @Autowired private ApplicationRepository appRepo;

    // ════════════════════════════════════════════════════════════════════════
    // JOB NOTIFICATIONS
    // ════════════════════════════════════════════════════════════════════════

    @Override
    public void notifyJobCreated(Job job) {
        if (job.getCollege() == null) return;
        String collegeId = job.getCollege().getId();
        log.info("[NOTIFY][JOB_CREATED] Scheduling batch email | jobId={} college={}", job.getId(), collegeId);

        CompletableFuture.runAsync(() -> {
            long totalUsers  = userRepo.findByCollegeIdAndRoleAndIsDeletedFalse(
                    collegeId, User.Role.STUDENT, PageRequest.of(0, 1)).getTotalElements();
            int  totalPages  = (int) Math.ceil((double) totalUsers / PAGE_SIZE);
            int  sent        = 0;

            for (int page = 0; page < totalPages; page++) {
                List<User> students = userRepo.findByCollegeIdAndRoleAndIsDeletedFalse(
                        collegeId, User.Role.STUDENT, PageRequest.of(page, PAGE_SIZE)).getContent();
                for (User student : students) {
                    try {
                        emailService.sendEmail(student.getEmail(),
                                "New Job Opportunity: " + job.getTitle() + " at " + job.getCompanyName(),
                                buildJobCreatedBody(student, job));
                        sent++;
                    } catch (Exception e) {
                        log.warn("[NOTIFY][JOB_CREATED] Failed to email userId={}: {}", student.getId(), e.getMessage());
                    }
                }
                sleepBetweenBatches();
            }
            log.info("[NOTIFY][JOB_CREATED] Batch complete | jobId={} | sent={}/{}", job.getId(), sent, totalUsers);
        });
    }

    @Override
    public void notifyJobUpdated(Job job) {
        if (job == null || job.getId() == null) return;
        log.info("[NOTIFY][JOB_UPDATED] Notifying applicants | jobId={}", job.getId());

        CompletableFuture.runAsync(() -> {
            List<Application> apps = appRepo.findByJobId(job.getId());
            int sent = 0;
            for (Application app : apps) {
                User student = app.getStudent();
                if (student == null || Boolean.TRUE.equals(student.getIsDeleted())) continue;
                try {
                    emailService.sendEmail(student.getEmail(),
                            "Job Update: " + job.getTitle() + " at " + job.getCompanyName(),
                            buildJobUpdatedBody(student, job));
                    sent++;
                } catch (Exception e) {
                    log.warn("[NOTIFY][JOB_UPDATED] Failed to email userId={}: {}", student.getId(), e.getMessage());
                }
            }
            log.info("[NOTIFY][JOB_UPDATED] Notified {}/{} applicants | jobId={}", sent, apps.size(), job.getId());
        });
    }

    @Override
    public void notifyStudentApplied(User student, Job job) {
        if (student == null || job == null) return;
        try {
            emailService.sendEmail(student.getEmail(),
                    "Application Submitted: " + job.getTitle() + " at " + job.getCompanyName(),
                    buildAppliedBody(student, job));
            log.info("[NOTIFY][APPLIED] Email sent | userId={} jobId={}", student.getId(), job.getId());
        } catch (Exception e) {
            log.warn("[NOTIFY][APPLIED] Failed | userId={} jobId={}: {}", student.getId(), job.getId(), e.getMessage());
        }
    }

    @Override
    public void notifyRoundResult(User student, Job job, String roundName, String status) {
        if (student == null || job == null) return;
        try {
            String subject = buildRoundResultSubject(job, roundName, status);
            emailService.sendEmail(student.getEmail(), subject,
                    buildRoundResultBody(student, job, roundName, status));
            log.info("[NOTIFY][ROUND_RESULT] Email sent | userId={} jobId={} round='{}' status={}",
                    student.getId(), job.getId(), roundName, status);
        } catch (Exception e) {
            log.warn("[NOTIFY][ROUND_RESULT] Failed | userId={} jobId={}: {}", student.getId(), job.getId(), e.getMessage());
        }
    }

    @Override
    public void notifyJobDeadlineReminder(User student, Job job) {
        if (student == null || job == null) return;
        try {
            emailService.sendEmail(student.getEmail(),
                    "Application Deadline Reminder: " + job.getTitle() + " at " + job.getCompanyName(),
                    buildDeadlineReminderBody(student, job));
            log.info("[NOTIFY][DEADLINE_REMINDER] Email sent | userId={} jobId={}", student.getId(), job.getId());
        } catch (Exception e) {
            log.warn("[NOTIFY][DEADLINE_REMINDER] Failed | userId={} jobId={}: {}", student.getId(), job.getId(), e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // ACCOUNT NOTIFICATIONS
    // ════════════════════════════════════════════════════════════════════════

    @Override
    public void notifyAccountSoftDeleted(User user) {
        if (user == null) return;
        try {
            emailService.sendEmail(user.getEmail(),
                    "Your SROTS Account Has Been Deactivated",
                    buildSoftDeletedBody(user));
            log.info("[NOTIFY][SOFT_DELETED] Email sent | userId={}", user.getId());
        } catch (Exception e) {
            log.warn("[NOTIFY][SOFT_DELETED] Failed | userId={}: {}", user.getId(), e.getMessage());
        }
    }

    @Override
    public void notifyAccountUpdated(User user) {
        if (user == null) return;
        try {
            emailService.sendEmail(user.getEmail(),
                    "Your SROTS Account Has Been Updated",
                    buildAccountUpdatedBody(user));
            log.info("[NOTIFY][ACCOUNT_UPDATED] Email sent | userId={}", user.getId());
        } catch (Exception e) {
            log.warn("[NOTIFY][ACCOUNT_UPDATED] Failed | userId={}: {}", user.getId(), e.getMessage());
        }
    }

    @Override
    public void notifyPremiumExpiryWarning(User user, LocalDate premiumEndDate) {
        if (user == null) return;
        try {
            emailService.sendEmail(user.getEmail(),
                    "Action Required: Your SROTS Premium Has Expired",
                    buildPremiumExpiryBody(user, premiumEndDate));
            log.info("[NOTIFY][PREMIUM_EXPIRY] Warning email sent | userId={} | expiredOn={}", user.getId(), premiumEndDate);
        } catch (Exception e) {
            log.warn("[NOTIFY][PREMIUM_EXPIRY] Failed | userId={}: {}", user.getId(), e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // EVENT / NOTICE NOTIFICATIONS
    // ════════════════════════════════════════════════════════════════════════

    @Override
    public void notifyEventCreated(Event event) {
        if (event.getCollege() == null) return;
        String collegeId = event.getCollege().getId();
        log.info("[NOTIFY][EVENT_CREATED] Scheduling batch email | eventId={} college={}", event.getId(), collegeId);

        CompletableFuture.runAsync(() -> {
            List<User> allUsers = userRepo.findByCollegeIdAndIsDeletedFalse(collegeId);
            int sent = 0;
            for (int i = 0; i < allUsers.size(); i += PAGE_SIZE) {
                List<User> batch = allUsers.subList(i, Math.min(i + PAGE_SIZE, allUsers.size()));
                for (User user : batch) {
                    try {
                        emailService.sendEmail(user.getEmail(),
                                "New Event: " + event.getTitle(),
                                buildEventCreatedBody(user, event));
                        sent++;
                    } catch (Exception e) {
                        log.warn("[NOTIFY][EVENT_CREATED] Failed to email userId={}: {}", user.getId(), e.getMessage());
                    }
                }
                sleepBetweenBatches();
            }
            log.info("[NOTIFY][EVENT_CREATED] Batch complete | eventId={} | sent={}/{}", event.getId(), sent, allUsers.size());
        });
    }

    @Override
    public void notifyNoticeCreated(Notice notice) {
        if (notice.getCollege() == null) return;
        String collegeId = notice.getCollege().getId();
        log.info("[NOTIFY][NOTICE_CREATED] Scheduling batch email | noticeId={} college={}", notice.getId(), collegeId);

        CompletableFuture.runAsync(() -> {
            List<User> allUsers = userRepo.findByCollegeIdAndIsDeletedFalse(collegeId);
            int sent = 0;
            for (int i = 0; i < allUsers.size(); i += PAGE_SIZE) {
                List<User> batch = allUsers.subList(i, Math.min(i + PAGE_SIZE, allUsers.size()));
                for (User user : batch) {
                    try {
                        emailService.sendEmail(user.getEmail(),
                                "New Notice: " + notice.getTitle(),
                                buildNoticeCreatedBody(user, notice));
                        sent++;
                    } catch (Exception e) {
                        log.warn("[NOTIFY][NOTICE_CREATED] Failed to email userId={}: {}", user.getId(), e.getMessage());
                    }
                }
                sleepBetweenBatches();
            }
            log.info("[NOTIFY][NOTICE_CREATED] Batch complete | noticeId={} | sent={}/{}", notice.getId(), sent, allUsers.size());
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ════════════════════════════════════════════════════════════════════════

    private void sleepBetweenBatches() {
        try { Thread.sleep(BATCH_DELAY_MS); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
    }

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    // ── Email body builders ───────────────────────────────────────────────────

    private String buildJobCreatedBody(User student, Job job) {
        String deadline = job.getApplicationDeadline() != null
                ? job.getApplicationDeadline().format(DATE_FMT) : "Not specified";
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#1a73e8'>New Job Opportunity!</h2>"
                + "<p>Hi <strong>" + student.getFullName() + "</strong>,</p>"
                + "<p>A new job has been posted at your college placement portal.</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Position</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getTitle() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Company</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getCompanyName() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Type</b></td><td style='padding:8px;border:1px solid #ddd'>" + (job.getJobType() != null ? job.getJobType().getDisplay() : "N/A") + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Location</b></td><td style='padding:8px;border:1px solid #ddd'>" + (job.getLocation() != null ? job.getLocation() : "N/A") + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Application Deadline</b></td><td style='padding:8px;border:1px solid #ddd'>" + deadline + "</td></tr>"
                + "</table>"
                + "<p>Log in to the placement portal to view details and apply.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildJobUpdatedBody(User student, Job job) {
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#f57c00'>Job Update</h2>"
                + "<p>Hi <strong>" + student.getFullName() + "</strong>,</p>"
                + "<p>The job you applied to has been updated. Please log in to review the latest details.</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Position</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getTitle() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Company</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getCompanyName() + "</td></tr>"
                + "</table>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildAppliedBody(User student, Job job) {
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#388e3c'>Application Submitted Successfully!</h2>"
                + "<p>Hi <strong>" + student.getFullName() + "</strong>,</p>"
                + "<p>Your application has been successfully submitted. Here are your application details:</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Position</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getTitle() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Company</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getCompanyName() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Status</b></td><td style='padding:8px;border:1px solid #ddd'>Application Received — Pending Review</td></tr>"
                + "</table>"
                + "<p>We will notify you as the recruitment process progresses. Good luck!</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildRoundResultSubject(Job job, String roundName, String status) {
        return switch (status) {
            case "Hired"    -> "Congratulations! You've been Selected — " + job.getCompanyName();
            case "Cleared"  -> "Round Cleared: " + roundName + " — " + job.getCompanyName();
            default         -> "Round Result: " + roundName + " — " + job.getCompanyName();
        };
    }

    private String buildRoundResultBody(User student, Job job, String roundName, String status) {
        String color = switch (status) {
            case "Hired"   -> "#388e3c";
            case "Cleared" -> "#1a73e8";
            default        -> "#d32f2f";
        };
        String message = switch (status) {
            case "Hired"   -> "Congratulations! You have successfully completed all rounds and have been <strong>selected</strong> for the position.";
            case "Cleared" -> "You have <strong>cleared</strong> the <em>" + roundName + "</em> round. Prepare for the next stage!";
            default        -> "We regret to inform you that your application was not shortlisted after the <em>" + roundName + "</em> round. Keep applying!";
        };
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:" + color + "'>Recruitment Update — " + job.getCompanyName() + "</h2>"
                + "<p>Hi <strong>" + student.getFullName() + "</strong>,</p>"
                + "<p>" + message + "</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Position</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getTitle() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Company</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getCompanyName() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Round</b></td><td style='padding:8px;border:1px solid #ddd'>" + roundName + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Result</b></td><td style='padding:8px;border:1px solid #ddd;color:" + color + "'><b>" + status + "</b></td></tr>"
                + "</table>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildDeadlineReminderBody(User student, Job job) {
        String deadline = job.getApplicationDeadline() != null
                ? job.getApplicationDeadline().format(DATE_FMT) : "soon";
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#e64a19'>Application Deadline Approaching!</h2>"
                + "<p>Hi <strong>" + student.getFullName() + "</strong>,</p>"
                + "<p>The application deadline for the following job is approaching. Don't miss this opportunity!</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Position</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getTitle() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Company</b></td><td style='padding:8px;border:1px solid #ddd'>" + job.getCompanyName() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Deadline</b></td><td style='padding:8px;border:1px solid #ddd;color:#e64a19'><b>" + deadline + "</b></td></tr>"
                + "</table>"
                + "<p>Log in to the placement portal to apply before the deadline.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildSoftDeletedBody(User user) {
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#d32f2f'>Account Deactivated</h2>"
                + "<p>Hi <strong>" + user.getFullName() + "</strong>,</p>"
                + "<p>Your SROTS account (<strong>" + user.getUsername() + "</strong>) has been deactivated by the administration.</p>"
                + "<p>If you believe this is a mistake or need further assistance, please contact your college placement office.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildAccountUpdatedBody(User user) {
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#1a73e8'>Account Updated</h2>"
                + "<p>Hi <strong>" + user.getFullName() + "</strong>,</p>"
                + "<p>Your SROTS account details have been successfully updated.</p>"
                + "<p>If you did not request this change, please contact your college placement office immediately.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildPremiumExpiryBody(User user, LocalDate premiumEndDate) {
        String expiredOn = premiumEndDate != null ? premiumEndDate.format(DATE_FMT) : "recently";
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#f57c00'>Your Premium Subscription Has Expired</h2>"
                + "<p>Hi <strong>" + user.getFullName() + "</strong>,</p>"
                + "<p>Your SROTS Premium subscription expired on <strong>" + expiredOn + "</strong>.</p>"
                + "<p>To continue accessing premium features and job opportunities, please renew your subscription as soon as possible.</p>"
                + "<p><strong>Note:</strong> Accounts with expired premium may be permanently removed after a grace period.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildEventCreatedBody(User user, Event event) {
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#7b1fa2'>New Event at Your College</h2>"
                + "<p>Hi <strong>" + user.getFullName() + "</strong>,</p>"
                + "<p>A new event has been added to your college calendar.</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Event</b></td><td style='padding:8px;border:1px solid #ddd'>" + event.getTitle() + "</td></tr>"
                + (event.getDescription() != null ? "<tr><td style='padding:8px;border:1px solid #ddd'><b>Description</b></td><td style='padding:8px;border:1px solid #ddd'>" + event.getDescription() + "</td></tr>" : "")
                + "</table>"
                + "<p>Log in to the placement portal for full event details.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }

    private String buildNoticeCreatedBody(User user, Notice notice) {
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#0288d1'>New Notice Posted</h2>"
                + "<p>Hi <strong>" + user.getFullName() + "</strong>,</p>"
                + "<p>A new notice has been posted on your college portal.</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Title</b></td><td style='padding:8px;border:1px solid #ddd'>" + notice.getTitle() + "</td></tr>"
                + (notice.getDescription() != null ? "<tr><td style='padding:8px;border:1px solid #ddd'><b>Description</b></td><td style='padding:8px;border:1px solid #ddd'>" + notice.getDescription() + "</td></tr>" : "")
                + "</table>"
                + "<p>Log in to the placement portal to read the full notice.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated notification from SROTS.</p>"
                + "</body></html>";
    }
}
