package com.srots.filter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * RateLimitFilter — Per-IP rate limiting using Bucket4j token-bucket algorithm.
 *
 * Three tiers:
 *   LOGIN   (/api/v1/auth/**)           — 10 requests/minute per IP
 *   PUBLIC  (/api/v1/premium-payments/public/**) — 30 requests/minute per IP
 *   API     (all other authenticated endpoints)  — 120 requests/minute per IP
 *
 * Buckets are stored in-memory (ConcurrentHashMap).
 * For multi-instance deployments, replace with Redis-backed buckets.
 *
 * Responds with 429 Too Many Requests + Retry-After header when limit exceeded.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    @Value("${srots.rate-limit.login-requests-per-minute:10}")
    private int loginLimit;

    @Value("${srots.rate-limit.public-requests-per-minute:30}")
    private int publicLimit;

    @Value("${srots.rate-limit.api-requests-per-minute:120}")
    private int apiLimit;

    // Separate bucket maps per tier to apply different limits
    private final Map<String, Bucket> loginBuckets  = new ConcurrentHashMap<>();
    private final Map<String, Bucket> publicBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> apiBuckets    = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip  = extractClientIp(request);
        String uri = request.getRequestURI();

        Bucket bucket;
        String tierName;

        if (uri.startsWith("/api/v1/auth/")) {
            bucket   = loginBuckets.computeIfAbsent(ip, k -> buildBucket(loginLimit));
            tierName = "LOGIN";
        } else if (uri.startsWith("/api/v1/premium-payments/public/")) {
            bucket   = publicBuckets.computeIfAbsent(ip, k -> buildBucket(publicLimit));
            tierName = "PUBLIC";
        } else {
            bucket   = apiBuckets.computeIfAbsent(ip, k -> buildBucket(apiLimit));
            tierName = "API";
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("[RateLimit] {} limit exceeded | ip={} | uri={}", tierName, ip, uri);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setHeader("Retry-After", "60");
            response.getWriter().write(
                "{\"status\":429,\"error\":\"Too many requests. Please wait before retrying.\"}");
        }
    }

    /**
     * Build a token bucket that allows `requestsPerMinute` requests,
     * refilled at a steady rate of 1 token per (60/limit) seconds.
     */
    private Bucket buildBucket(int requestsPerMinute) {
        Bandwidth limit = Bandwidth.classic(
                requestsPerMinute,
                Refill.greedy(requestsPerMinute, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();
        return request.getRemoteAddr();
    }
}
