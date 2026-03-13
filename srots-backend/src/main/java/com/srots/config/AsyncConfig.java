package com.srots.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * AsyncConfig — Thread pool configuration for 4K-6K concurrent users.
 *
 * Three dedicated pools prevent one workload from starving others:
 *
 *   taskExecutor       — Email sending (high volume, fast tasks)
 *   bulkUploadExecutor — CSV/Excel parsing (slow, file-heavy)
 *   exportExecutor     — Report generation (CPU-heavy)
 *   auditExecutor      — Async audit log writes (background, low priority)
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Email thread pool — handles all outbound SMTP calls.
     * core=10 / max=30 supports up to 30 simultaneous email sends.
     * queue=200 buffers bursts (e.g., mass registration emails).
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(30);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("Email-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Bulk upload pool — CSV/Excel parsing is I/O-bound and slow.
     * Kept separate so a large bulk import cannot block emails.
     */
    @Bean(name = "bulkUploadExecutor")
    public Executor bulkUploadExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(15);
        executor.setQueueCapacity(30);
        executor.setThreadNamePrefix("BulkUpload-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Export pool — Excel/CSV report generation is CPU-bound.
     * Smaller pool prevents GC pressure from multiple concurrent exports.
     */
    @Bean(name = "exportExecutor")
    public Executor exportExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(20);
        executor.setThreadNamePrefix("Export-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Audit log pool — background writes to AuditLog table.
     * CallerRunsPolicy ensures audit events are NEVER dropped.
     */
    @Bean(name = "auditExecutor")
    public Executor auditExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("Audit-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
