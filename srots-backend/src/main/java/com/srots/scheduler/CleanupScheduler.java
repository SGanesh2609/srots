package com.srots.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.srots.config.CleanupProperties;
import com.srots.filter.MdcLoggingFilter;
import com.srots.service.CleanupService;

/**
 * CleanupScheduler
 *
 * Fires the daily data-cleanup job at the time configured in application.properties.
 *
 * Schedule is controlled by:
 *   srots.cleanup.scheduler-cron     (default: "0 0 9 * * *" = 09:00 every day)
 *   srots.cleanup.scheduler-timezone (default: "Asia/Kolkata" = IST)
 *
 * Rules enforced (all thresholds configurable in application.properties):
 *   - Student accounts with premium expired > 90 days → hard delete
 *   - College posts older than 90 days               → hard delete
 *   - Events and notices older than 120 days          → hard delete
 *   - Soft-deleted users older than 60 days           → permanent delete
 *   - Soft-deleted jobs older than 60 days            → permanent delete
 *
 * To change the run time without redeploying, update application.properties:
 *   srots.cleanup.scheduler-cron=0 30 8 * * *   (run at 08:30 instead)
 */
@Component
public class CleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(CleanupScheduler.class);

    @Autowired
    private CleanupService cleanupService;

    @Autowired
    private CleanupProperties cleanupProps;

    /**
     * Triggered daily at the time defined by srots.cleanup.scheduler-cron
     * in the timezone defined by srots.cleanup.scheduler-timezone.
     *
     * Default: 09:00:00 AM IST (Asia/Kolkata).
     * Both values can be overridden in application.properties without code changes.
     */
    @Scheduled(
        cron = "${srots.cleanup.scheduler-cron}",
        zone = "${srots.cleanup.scheduler-timezone}"
    )
    public void runDailyCleanup() {
        // ── Set scheduler MDC so every log line in this run is traceable in Kibana ──
        String runId = java.util.UUID.randomUUID().toString();
        MDC.put(MdcLoggingFilter.MDC_CORRELATION_ID, "scheduler-" + runId);
        MDC.put(MdcLoggingFilter.MDC_USERNAME,       "SYSTEM");
        MDC.put(MdcLoggingFilter.MDC_USER_ROLE,      "SCHEDULER");
        MDC.put(MdcLoggingFilter.MDC_SCHEDULER_JOB,  "DailyCleanup");

        try {
            log.info("[SCHEDULER] Daily cleanup triggered | cron='{}' | timezone='{}' | runId={}",
                     cleanupProps.getSchedulerCron(), cleanupProps.getSchedulerTimezone(), runId);
            cleanupService.runAllCleanupTasks();
            log.info("[SCHEDULER] Daily cleanup finished | runId={}", runId);
        } finally {
            MDC.clear(); // always clean up scheduler thread MDC
        }
    }
}
