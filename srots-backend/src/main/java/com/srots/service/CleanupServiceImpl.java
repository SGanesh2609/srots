package com.srots.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.srots.filter.MdcLoggingFilter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.config.CleanupProperties;
import com.srots.model.Application;
import com.srots.model.Event;
import com.srots.model.Job;
import com.srots.model.Notice;
import com.srots.model.Post;
import com.srots.model.StudentProfile;
import com.srots.model.User;
import com.srots.repository.ApplicationRepository;
import com.srots.repository.EventRepository;
import com.srots.repository.JobRepository;
import com.srots.repository.NoticeRepository;
import com.srots.repository.PostCommentRepository;
import com.srots.repository.PostLikeRepository;
import com.srots.repository.PostRepository;
import com.srots.repository.StudentProfileRepository;
import com.srots.repository.UserRepository;

/**
 * CleanupServiceImpl
 *
 * Implements all five automated cleanup rules.
 * All threshold values (days) come from CleanupProperties which is backed
 * by application.properties — change a number there to adjust the retention
 * period without touching this class.
 *
 * Each task is independently transactional — a failure in one does not
 * roll back the others. Per-record exceptions are caught and logged so
 * the rest of the batch still completes.
 */
@Service
public class CleanupServiceImpl implements CleanupService {

    private static final Logger log = LoggerFactory.getLogger(CleanupServiceImpl.class);

    // ── Config (all thresholds come from application.properties) ────────────
    @Autowired private CleanupProperties cleanupProps;

    // ── Service dependencies ─────────────────────────────────────────────────
    @Autowired private UserAccountService    userAccountService;
    @Autowired private FileService           fileService;
    @Autowired private ObjectMapper          objectMapper;
    @Autowired private NotificationService   notificationService;

    // ── Repository dependencies ──────────────────────────────────────────────
    @Autowired private StudentProfileRepository studentProfileRepo;
    @Autowired private UserRepository           userRepo;
    @Autowired private JobRepository            jobRepo;
    @Autowired private PostRepository           postRepo;
    @Autowired private PostLikeRepository       postLikeRepo;
    @Autowired private PostCommentRepository    postCommentRepo;
    @Autowired private EventRepository          eventRepo;
    @Autowired private NoticeRepository         noticeRepo;
    @Autowired private ApplicationRepository    appRepo;

    // ─────────────────────────────────────────────────────────────────────────
    // runAllCleanupTasks — entry point called by CleanupScheduler
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void runAllCleanupTasks() {
        log.info("[CLEANUP] Starting daily cleanup tasks at {} | config: premiumExpiry={}d, posts={}d, events/notices={}d, softDelete={}d",
                 LocalDateTime.now(),
                 cleanupProps.getPremiumExpiryDays(),
                 cleanupProps.getPostRetentionDays(),
                 cleanupProps.getEventNoticeRetentionDays(),
                 cleanupProps.getSoftDeleteRetentionDays());

        int expiredPremium    = safeRun("cleanupExpiredPremiumStudents", this::cleanupExpiredPremiumStudents);
        int oldPosts          = safeRun("cleanupOldPosts",               this::cleanupOldPosts);
        int oldEventsNotices  = safeRun("cleanupOldEventsAndNotices",    this::cleanupOldEventsAndNotices);
        int softDeletedUsers  = safeRun("cleanupSoftDeletedUsers",       this::cleanupSoftDeletedUsers);
        int softDeletedJobs   = safeRun("cleanupSoftDeletedJobs",        this::cleanupSoftDeletedJobs);
        int deadlineReminders = safeRun("sendJobDeadlineReminders",      this::sendJobDeadlineReminders);
        int premiumWarnings   = safeRun("sendPremiumExpiryWarnings",     this::sendPremiumExpiryWarnings);

        log.info("[CLEANUP] Daily cleanup completed | expiredPremiumStudents={} | oldPosts={} | oldEventsNotices={} | softDeletedUsers={} | softDeletedJobs={} | deadlineReminders={} | premiumWarnings={}",
                 expiredPremium, oldPosts, oldEventsNotices, softDeletedUsers, softDeletedJobs, deadlineReminders, premiumWarnings);
    }

    /**
     * Runs a task safely; sets MDC schedulerJobName for Kibana tracing,
     * logs outcome, and returns 0 on failure so other tasks still run.
     */
    private int safeRun(String taskName, java.util.function.IntSupplier task) {
        MDC.put(MdcLoggingFilter.MDC_SCHEDULER_JOB, taskName);
        try {
            int result = task.getAsInt();
            log.debug("[CLEANUP][{}] Task completed | result={}", taskName, result);
            return result;
        } catch (Exception e) {
            log.error("[CLEANUP][{}] Task failed: {}", taskName, e.getMessage(), e);
            return 0;
        } finally {
            MDC.remove(MdcLoggingFilter.MDC_SCHEDULER_JOB);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Premium-expired student accounts
    //    Rule: permanently delete student if premiumEndDate + N days < today
    //    N = srots.cleanup.premium-expiry-days (default 90)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public int cleanupExpiredPremiumStudents() {
        int retentionDays = cleanupProps.getPremiumExpiryDays();
        LocalDate cutoff  = LocalDate.now().minusDays(retentionDays);

        List<StudentProfile> expiredProfiles = studentProfileRepo.findPremiumExpiredBefore(cutoff);

        if (expiredProfiles.isEmpty()) {
            log.info("[CLEANUP][PREMIUM_EXPIRY] No expired premium accounts found (cutoff={}, retentionDays={})", cutoff, retentionDays);
            return 0;
        }

        log.info("[CLEANUP][PREMIUM_EXPIRY] Found {} student(s) with premium expired before {} ({} days ago) — deleting accounts",
                 expiredProfiles.size(), cutoff, retentionDays);

        int deleted = 0;
        for (StudentProfile profile : expiredProfiles) {
            String userId = profile.getUserId();
            try {
                // Reuses the existing role-aware hard-delete: handles full cascade cleanup
                // (applications, premium payments, post likes, comments, student sub-tables)
                // and sends a deletion notification email.
                userAccountService.delete(userId);
                deleted++;
                log.info("[CLEANUP][PREMIUM_EXPIRY] Deleted student userId={} | premiumEndDate={}", userId, profile.getPremiumEndDate());
            } catch (Exception e) {
                log.error("[CLEANUP][PREMIUM_EXPIRY] Failed to delete userId={}: {}", userId, e.getMessage());
            }
        }

        log.info("[CLEANUP][PREMIUM_EXPIRY] Completed: {}/{} student account(s) deleted", deleted, expiredProfiles.size());
        return deleted;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Old college posts
    //    Rule: permanently delete posts older than N days from creation
    //    N = srots.cleanup.post-retention-days (default 90)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public int cleanupOldPosts() {
        int retentionDays    = cleanupProps.getPostRetentionDays();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);

        List<Post> oldPosts = postRepo.findByCreatedAtBefore(cutoff);

        if (oldPosts.isEmpty()) {
            log.info("[CLEANUP][OLD_POSTS] No posts older than {} days found", retentionDays);
            return 0;
        }

        log.info("[CLEANUP][OLD_POSTS] Found {} post(s) older than {} days — deleting", oldPosts.size(), retentionDays);

        // Delete attached image/document files from storage
        for (Post post : oldPosts) {
            deletePostFiles(post);
        }

        List<String> postIds = oldPosts.stream().map(Post::getId).collect(Collectors.toList());

        // Must delete child records explicitly before posts (JPQL bulk DML bypasses JPA cascade)
        postLikeRepo.deleteByPostIdIn(postIds);
        postCommentRepo.deleteByPostIdIn(postIds); // DB ON DELETE CASCADE on parent_comment_id handles replies
        postRepo.deleteByIdIn(postIds);

        log.info("[CLEANUP][OLD_POSTS] Deleted {} post(s) with all their likes and comments", postIds.size());
        return postIds.size();
    }

    /** Deletes all image and document files attached to a post from file storage. */
    private void deletePostFiles(Post post) {
        deleteJsonUrlList(post.getImageUrls(),    "post " + post.getId() + " imageUrls");
        deleteJsonUrlList(post.getDocumentUrls(), "post " + post.getId() + " documentUrls");
    }

    /** Parses a JSON array of URL strings and deletes each file. Failures are logged but not thrown. */
    private void deleteJsonUrlList(String jsonUrls, String context) {
        if (jsonUrls == null || jsonUrls.isBlank()) return;
        try {
            List<String> urls = objectMapper.readValue(jsonUrls, new TypeReference<List<String>>() {});
            for (String url : urls) {
                if (url != null && !url.isBlank()) {
                    try {
                        fileService.deleteFile(url);
                    } catch (Exception e) {
                        log.warn("[CLEANUP] Failed to delete file '{}' for {}: {}", url, context, e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[CLEANUP] Could not parse JSON URLs for {}: {}", context, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Old events and notices
    //    Rule: permanently delete if older than N days from creation
    //    N = srots.cleanup.event-notice-retention-days (default 120)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public int cleanupOldEventsAndNotices() {
        int retentionDays    = cleanupProps.getEventNoticeRetentionDays();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        int total = 0;

        // ── Events ────────────────────────────────────────────────────────────
        List<Event> oldEvents = eventRepo.findByCreatedAtBefore(cutoff);
        if (!oldEvents.isEmpty()) {
            // Events have no child FK tables and no file attachments — safe to delete directly
            eventRepo.deleteAll(oldEvents);
            log.info("[CLEANUP][OLD_EVENTS] Deleted {} event(s) older than {} days", oldEvents.size(), retentionDays);
            total += oldEvents.size();
        } else {
            log.info("[CLEANUP][OLD_EVENTS] No events older than {} days found", retentionDays);
        }

        // ── Notices ───────────────────────────────────────────────────────────
        List<Notice> oldNotices = noticeRepo.findByCreatedAtBefore(cutoff);
        if (!oldNotices.isEmpty()) {
            // Delete notice file attachments from storage before removing the DB records
            for (Notice notice : oldNotices) {
                if (notice.getFileUrl() != null && !notice.getFileUrl().isBlank()) {
                    try {
                        fileService.deleteFile(notice.getFileUrl());
                    } catch (Exception e) {
                        log.warn("[CLEANUP][OLD_NOTICES] Failed to delete file for noticeId={}: {}", notice.getId(), e.getMessage());
                    }
                }
            }
            noticeRepo.deleteAll(oldNotices);
            log.info("[CLEANUP][OLD_NOTICES] Deleted {} notice(s) older than {} days", oldNotices.size(), retentionDays);
            total += oldNotices.size();
        } else {
            log.info("[CLEANUP][OLD_NOTICES] No notices older than {} days found", retentionDays);
        }

        return total;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Soft-deleted users — permanent delete after N days
    //    Rule: user.isDeleted=true AND user.deletedAt < now - N days
    //    N = srots.cleanup.soft-delete-retention-days (default 60)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public int cleanupSoftDeletedUsers() {
        int retentionDays    = cleanupProps.getSoftDeleteRetentionDays();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);

        List<User> staleUsers = userRepo.findSoftDeletedBefore(cutoff);

        if (staleUsers.isEmpty()) {
            log.info("[CLEANUP][SOFT_DELETE_USERS] No soft-deleted users past {} days retention", retentionDays);
            return 0;
        }

        log.info("[CLEANUP][SOFT_DELETE_USERS] Found {} user(s) soft-deleted more than {} days ago — permanently deleting",
                 staleUsers.size(), retentionDays);

        int deleted = 0;
        for (User user : staleUsers) {
            String userId = user.getId();
            try {
                // Reuses existing role-aware hard-delete: handles cascade by role + email notification
                userAccountService.delete(userId);
                deleted++;
                log.info("[CLEANUP][SOFT_DELETE_USERS] Permanently deleted userId={} | role={} | softDeletedAt={}",
                         userId, user.getRole(), user.getDeletedAt());
            } catch (Exception e) {
                log.error("[CLEANUP][SOFT_DELETE_USERS] Failed to permanently delete userId={}: {}", userId, e.getMessage());
            }
        }

        log.info("[CLEANUP][SOFT_DELETE_USERS] Completed: {}/{} user(s) permanently deleted", deleted, staleUsers.size());
        return deleted;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Soft-deleted jobs — permanent delete after N days
    //    Rule: job.deletedAt IS NOT NULL AND job.deletedAt < now - N days
    //    N = srots.cleanup.soft-delete-retention-days (default 60)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public int cleanupSoftDeletedJobs() {
        int retentionDays    = cleanupProps.getSoftDeleteRetentionDays();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);

        List<Job> staleJobs = jobRepo.findSoftDeletedBefore(cutoff);

        if (staleJobs.isEmpty()) {
            log.info("[CLEANUP][SOFT_DELETE_JOBS] No soft-deleted jobs past {} days retention", retentionDays);
            return 0;
        }

        log.info("[CLEANUP][SOFT_DELETE_JOBS] Found {} job(s) soft-deleted more than {} days ago — permanently deleting",
                 staleJobs.size(), retentionDays);

        int deleted = 0;
        for (Job job : staleJobs) {
            String jobId = job.getId();
            try {
                deleteJobPermanently(job);
                deleted++;
                log.info("[CLEANUP][SOFT_DELETE_JOBS] Permanently deleted jobId={} | title={} | softDeletedAt={}",
                         jobId, job.getTitle(), job.getDeletedAt());
            } catch (Exception e) {
                log.error("[CLEANUP][SOFT_DELETE_JOBS] Failed to permanently delete jobId={}: {}", jobId, e.getMessage());
            }
        }

        log.info("[CLEANUP][SOFT_DELETE_JOBS] Completed: {}/{} job(s) permanently deleted", deleted, staleJobs.size());
        return deleted;
    }

    /**
     * Hard-deletes a single job.
     * 1. Delete all applications for this job (FK: applications.job_id → jobs.id, no DB cascade)
     * 2. Delete the job record itself
     */
    @Transactional
    private void deleteJobPermanently(Job job) {
        appRepo.deleteByJobId(job.getId());
        jobRepo.delete(job);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Job deadline reminders
    //    Rule: for each active job whose deadline = today + N days, notify
    //          eligible students who have NOT yet applied.
    //    N = srots.cleanup.job-deadline-reminder-days (default 5)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public int sendJobDeadlineReminders() {
        int reminderDays   = cleanupProps.getJobDeadlineReminderDays();
        LocalDate deadline = LocalDate.now().plusDays(reminderDays);

        List<Job> jobs = jobRepo.findActiveJobsExpiringOn(deadline, Job.JobStatus.Active);

        if (jobs.isEmpty()) {
            log.info("[CLEANUP][DEADLINE_REMINDER] No active jobs expiring in {} days (date={})", reminderDays, deadline);
            return 0;
        }

        log.info("[CLEANUP][DEADLINE_REMINDER] Found {} job(s) expiring on {} — sending reminders", jobs.size(), deadline);

        int totalSent = 0;
        for (Job job : jobs) {
            if (job.getCollege() == null) continue;
            String collegeId = job.getCollege().getId();

            // Collect student IDs who have already applied so we can skip them
            List<Application> existing = appRepo.findByJobId(job.getId());
            List<String> appliedStudentIds = existing.stream()
                    .filter(a -> a.getStudent() != null)
                    .map(a -> a.getStudent().getId())
                    .collect(java.util.stream.Collectors.toList());

            // Notify active students in the college who haven't applied yet
            List<User> allStudents = userRepo.findByCollegeIdAndRoleAndIsDeletedFalse(collegeId, User.Role.STUDENT);
            for (User student : allStudents) {
                if (appliedStudentIds.contains(student.getId())) continue;
                try {
                    notificationService.notifyJobDeadlineReminder(student, job);
                    totalSent++;
                } catch (Exception e) {
                    log.warn("[CLEANUP][DEADLINE_REMINDER] Failed for userId={} jobId={}: {}", student.getId(), job.getId(), e.getMessage());
                }
            }
            log.info("[CLEANUP][DEADLINE_REMINDER] jobId={} | notified {} student(s)", job.getId(), allStudents.size() - appliedStudentIds.size());
        }

        log.info("[CLEANUP][DEADLINE_REMINDER] Completed: {} reminder email(s) sent", totalSent);
        return totalSent;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Premium expiry warnings
    //    Rule: for each student whose premium expired between warningStartDays
    //          and warningEndDays ago, send one warning email today.
    //    warningStartDays = srots.cleanup.premium-warning-start-days (default 10)
    //    warningEndDays   = srots.cleanup.premium-warning-end-days   (default 20)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public int sendPremiumExpiryWarnings() {
        int startDays       = cleanupProps.getPremiumWarningStartDays();
        int endDays         = cleanupProps.getPremiumWarningEndDays();
        LocalDate warningEnd   = LocalDate.now().minusDays(startDays); // expired at least startDays ago
        LocalDate warningStart = LocalDate.now().minusDays(endDays);   // expired no more than endDays ago

        List<StudentProfile> profiles = studentProfileRepo.findPremiumExpiredBetween(warningStart, warningEnd);

        if (profiles.isEmpty()) {
            log.info("[CLEANUP][PREMIUM_WARNING] No students in warning window ({}-{} days after expiry)", startDays, endDays);
            return 0;
        }

        log.info("[CLEANUP][PREMIUM_WARNING] Found {} student(s) in premium expiry warning window — sending reminders", profiles.size());

        int sent = 0;
        for (StudentProfile profile : profiles) {
            User user = profile.getUser();
            if (user == null || Boolean.TRUE.equals(user.getIsDeleted())) continue;
            try {
                notificationService.notifyPremiumExpiryWarning(user, profile.getPremiumEndDate());
                sent++;
                log.info("[CLEANUP][PREMIUM_WARNING] Sent warning to userId={} | premiumEndDate={}", user.getId(), profile.getPremiumEndDate());
            } catch (Exception e) {
                log.warn("[CLEANUP][PREMIUM_WARNING] Failed for userId={}: {}", user.getId(), e.getMessage());
            }
        }

        log.info("[CLEANUP][PREMIUM_WARNING] Completed: {}/{} premium expiry warning(s) sent", sent, profiles.size());
        return sent;
    }
}
