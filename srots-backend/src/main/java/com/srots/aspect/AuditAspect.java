package com.srots.aspect;

import java.util.Arrays;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.srots.util.AuditLogger;

/**
 * AuditAspect — Automatically records audit events for sensitive operations.
 *
 * Usage: annotate any controller or service method with @Auditable:
 *
 *   @Auditable(event = "CREATE_JOB")
 *   public ResponseEntity<?> createJob(@RequestBody JobRequest req) { ... }
 *
 * The aspect intercepts the call, extracts the authenticated user,
 * logs start/success/failure, and records elapsed time.
 * All logging is delegated to AuditLogger (Kibana-compatible JSON).
 *
 * The audit write itself is async (auditExecutor pool) to add zero latency
 * to the calling thread.
 */
@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    @Autowired
    private AuditLogger auditLogger;

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String actor  = resolveActor();
        String event  = auditable.event();
        String method = joinPoint.getSignature().toShortString();
        long   start  = System.currentTimeMillis();

        String args = auditable.logArgs()
                ? Arrays.toString(joinPoint.getArgs())
                : "(args hidden)";

        try {
            Object result = joinPoint.proceed();
            long elapsed  = System.currentTimeMillis() - start;
            writeAuditAsync(event, actor,
                    "method=" + method + " | args=" + args + " | elapsed=" + elapsed + "ms | result=SUCCESS");
            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - start;
            auditLogger.logSecurityEvent(event + "_FAILED", actor,
                    "method=" + method + " | error=" + ex.getMessage() + " | elapsed=" + elapsed + "ms");
            throw ex;
        }
    }

    @Async("auditExecutor")
    protected void writeAuditAsync(String event, String actor, String details) {
        auditLogger.log(event, actor, details);
    }

    private String resolveActor() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "ANONYMOUS";
    }
}
