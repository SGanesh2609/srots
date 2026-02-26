package com.srots.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * AuditLogger — Kibana-compatible structured audit logging.
 *
 * Every operation log entry is emitted as a single JSON line to the
 * "audit" SLF4J logger, which is routed by Logback to a dedicated file
 * (e.g., /var/log/srots/audit.log). Filebeat picks up that file and
 * ships events to Elasticsearch/Kibana.
 *
 * Log format (per line):
 * {
 *   "@timestamp": "2026-02-21T10:30:00.123Z",
 *   "service":    "srots-backend",
 *   "type":       "AUDIT",
 *   "event":      "CREATE_STUDENT",
 *   "actor":      "SRM_CPADMIN_john",
 *   "details":    "roll=20701A0501, collegeId=abc123",
 *   "ip":         "10.0.0.5",
 *   "userAgent":  "Mozilla/5.0 ...",
 *   "requestId":  "a1b2c3d4"
 * }
 *
 * Kibana dashboards can filter on:
 *   - event: for specific operation analytics
 *   - actor: per-user activity timeline
 *   - @timestamp: time-based visualizations
 */
@Component
public class AuditLogger {

    /** Dedicated logger — configure Logback appender for this name */
    private static final Logger AUDIT_LOG = LoggerFactory.getLogger("audit");
    private static final Logger APP_LOG   = LoggerFactory.getLogger(AuditLogger.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Log an auditable operation.
     *
     * @param event   Short event name in SCREAMING_SNAKE_CASE, e.g. "CREATE_STUDENT"
     * @param actor   Username of the person performing the action
     * @param details Free-form detail string, e.g. "roll=20701A0501, collegeId=abc"
     */
    public void log(String event, String actor, String details) {
        try {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("@timestamp",  Instant.now().toString());
            entry.put("service",     "srots-backend");
            entry.put("type",        "AUDIT");
            entry.put("event",       event);
            entry.put("actor",       actor != null ? actor : "SYSTEM");
            entry.put("details",     details);

            // Attempt to extract HTTP request context (IP, User-Agent, request ID)
            try {
                ServletRequestAttributes attrs =
                        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attrs != null) {
                    HttpServletRequest req = attrs.getRequest();
                    entry.put("ip",        getClientIp(req));
                    entry.put("userAgent", req.getHeader("User-Agent"));
                    String rid = req.getHeader("X-Request-ID");
                    if (rid != null && !rid.isBlank()) entry.put("requestId", rid);
                    entry.put("method",   req.getMethod());
                    entry.put("path",     req.getRequestURI());
                }
            } catch (Exception ignored) {
                // Running outside an HTTP request context (e.g., scheduled job)
            }

            AUDIT_LOG.info(objectMapper.writeValueAsString(entry));

        } catch (Exception ex) {
            APP_LOG.error("AuditLogger failed to write audit event '{}' for actor '{}': {}",
                    event, actor, ex.getMessage());
        }
    }

    /**
     * Log a system-initiated event (no human actor).
     */
    public void logSystem(String event, String details) {
        log(event, "SYSTEM", details);
    }

    /**
     * Log a failed/security-relevant event with severity marker.
     */
    public void logSecurityEvent(String event, String actor, String details) {
        try {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("@timestamp", Instant.now().toString());
            entry.put("service",    "srots-backend");
            entry.put("type",       "SECURITY");
            entry.put("severity",   "HIGH");
            entry.put("event",      event);
            entry.put("actor",      actor != null ? actor : "ANONYMOUS");
            entry.put("details",    details);

            try {
                ServletRequestAttributes attrs =
                        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attrs != null) {
                    HttpServletRequest req = attrs.getRequest();
                    entry.put("ip",        getClientIp(req));
                    entry.put("userAgent", req.getHeader("User-Agent"));
                }
            } catch (Exception ignored) {}

            AUDIT_LOG.warn(objectMapper.writeValueAsString(entry));

        } catch (Exception ex) {
            APP_LOG.error("AuditLogger failed to write security event: {}", ex.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP",
            "WL-Proxy-Client-IP", "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"
        };
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}