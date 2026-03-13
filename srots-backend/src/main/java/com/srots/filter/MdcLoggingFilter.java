package com.srots.filter;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.srots.service.JwtService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;

/**
 * MdcLoggingFilter
 *
 * Runs for every HTTP request, before Spring Security's filter chain.
 * Populates SLF4J MDC with request context so every log line emitted
 * during that request (controller, service, repository) automatically
 * carries the full context — visible in Kibana without any extra code.
 *
 * ─── MDC fields set per request ─────────────────────────────────────────────
 *
 *   correlationId  — UUID (from X-Correlation-Id header if present, else generated)
 *   userId         — authenticated user's DB ID  (from JWT claim "userId")
 *   username       — authenticated user's login  (from JWT subject)
 *   userRole       — STUDENT | CPH | STAFF | ADMIN | SROTS_DEV (from JWT claim "role")
 *   collegeId      — user's college UUID          (from JWT claim "collegeId")
 *   clientIp       — requester's IP, honours X-Forwarded-For for proxies
 *   httpMethod     — GET | POST | PUT | DELETE | PATCH
 *   requestUri     — e.g. /api/v1/jobs
 *   responseStatus — HTTP status code (set in finally, after response is committed)
 *   responseTimeMs — total request duration in milliseconds
 *
 * ─── How it works ────────────────────────────────────────────────────────────
 *
 *   1. Extracts JWT claims directly from the Authorization header without
 *      calling the SecurityContextHolder (which is not populated yet at this
 *      point in the filter chain). This means full user context is available
 *      from the very first log statement in any controller or service.
 *
 *   2. If no valid token is present (public endpoint, expired token) the
 *      user fields are simply not set — correlationId and IP are always set.
 *
 *   3. The X-Correlation-Id header is echoed back in the response so the
 *      frontend can log it and correlate client and server traces.
 *
 *   4. MDC.clear() is always called in the finally block to prevent MDC
 *      leakage across requests in thread pools.
 *
 * ─── Kibana query examples ───────────────────────────────────────────────────
 *
 *   All logs for one request:  correlationId:"a1b2c3d4-..."
 *   All actions by one user:   username:"SRM_CPH_admin"
 *   All errors for a role:     userRole:"STUDENT" AND level:"ERROR"
 *   Slow requests:             responseTimeMs:>2000
 *   Scheduler tasks only:      schedulerJobName:*
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MdcLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(MdcLoggingFilter.class);

    // ── MDC key constants ─────────────────────────────────────────────────────
    // Referenced by CleanupScheduler to set scheduler-specific MDC fields.

    public static final String MDC_CORRELATION_ID    = "correlationId";
    public static final String MDC_USER_ID           = "userId";
    public static final String MDC_USERNAME          = "username";
    public static final String MDC_USER_ROLE         = "userRole";
    public static final String MDC_COLLEGE_ID        = "collegeId";
    public static final String MDC_CLIENT_IP         = "clientIp";
    public static final String MDC_HTTP_METHOD       = "httpMethod";
    public static final String MDC_REQUEST_URI       = "requestUri";
    public static final String MDC_RESPONSE_STATUS   = "responseStatus";
    public static final String MDC_RESPONSE_TIME_MS  = "responseTimeMs";
    public static final String MDC_SCHEDULER_JOB     = "schedulerJobName";

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest  request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain         filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        try {
            // ── 1. Correlation ID ────────────────────────────────────────────
            // Accept client-supplied ID (useful for frontend-to-backend tracing)
            // or generate a fresh UUID for this request.
            String correlationId = request.getHeader("X-Correlation-Id");
            if (correlationId == null || correlationId.isBlank()) {
                correlationId = UUID.randomUUID().toString();
            }
            MDC.put(MDC_CORRELATION_ID, correlationId);
            response.setHeader("X-Correlation-Id", correlationId); // echo back to client

            // ── 2. Request metadata ──────────────────────────────────────────
            MDC.put(MDC_CLIENT_IP,    extractClientIp(request));
            MDC.put(MDC_HTTP_METHOD,  request.getMethod());
            MDC.put(MDC_REQUEST_URI,  request.getRequestURI());

            // ── 3. User identity from JWT ────────────────────────────────────
            // Parse JWT directly — SecurityContextHolder is not populated yet
            // (JwtFilter runs later in the Spring Security chain), but the token
            // carries all identity fields we need for MDC.
            populateUserMdc(request);

            // ── 4. Execute the full request ──────────────────────────────────
            filterChain.doFilter(request, response);

        } finally {
            // ── 5. Record response metrics and log the completed request ─────
            long durationMs = System.currentTimeMillis() - startTime;
            int  status     = response.getStatus();

            MDC.put(MDC_RESPONSE_STATUS,  String.valueOf(status));
            MDC.put(MDC_RESPONSE_TIME_MS, String.valueOf(durationMs));

            // One structured log line per request — visible in Kibana as a
            // completed-request event with full context.
            log.info("[REQUEST] {} {} | status={} | {}ms | user={} | role={} | ip={}",
                    MDC.get(MDC_HTTP_METHOD),
                    MDC.get(MDC_REQUEST_URI),
                    status,
                    durationMs,
                    orAnon(MDC_USERNAME),
                    orAnon(MDC_USER_ROLE),
                    orAnon(MDC_CLIENT_IP));

            // ── 6. Clear MDC — MUST be in finally to prevent thread pool leaks
            MDC.clear();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Parses the JWT Bearer token from the Authorization header and populates
     * MDC with the user identity claims embedded in the token.
     *
     * The JWT generated by JwtService contains:
     *   subject  → username
     *   "userId"    → user DB ID
     *   "role"      → e.g. "CPH"
     *   "collegeId" → college UUID (null for ADMIN/SROTS_DEV)
     *
     * Fails silently so invalid/expired tokens are handled by JwtFilter normally.
     */
    private void populateUserMdc(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return; // public endpoint or missing token — no user MDC, that's fine
        }
        try {
            String token = authHeader.substring(7);
            Claims claims = jwtService.extractAllClaims(token);

            String username  = claims.getSubject();
            String userId    = claims.get("userId",    String.class);
            String role      = claims.get("role",      String.class);
            String collegeId = claims.get("collegeId", String.class);

            if (username  != null) MDC.put(MDC_USERNAME,   username);
            if (userId    != null) MDC.put(MDC_USER_ID,    userId);
            if (role      != null) MDC.put(MDC_USER_ROLE,  role);
            if (collegeId != null) MDC.put(MDC_COLLEGE_ID, collegeId);

        } catch (Exception e) {
            // Token invalid or expired — JwtFilter will reject the request.
            // We still have correlationId and IP for tracing.
            log.debug("[MDC] JWT parse skipped for MDC enrichment: {}", e.getMessage());
        }
    }

    /**
     * Extracts the real client IP address, honouring standard reverse-proxy headers.
     * Priority: X-Forwarded-For → X-Real-IP → RemoteAddr.
     */
    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim(); // leftmost = original client
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) {
            return xri.trim();
        }
        return request.getRemoteAddr();
    }

    private String orAnon(String mdcKey) {
        String val = MDC.get(mdcKey);
        return (val != null && !val.isBlank()) ? val : "anonymous";
    }
}
