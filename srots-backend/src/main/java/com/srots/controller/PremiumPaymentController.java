package com.srots.controller;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import com.srots.config.UserInfoUserDetails;
import com.srots.dto.premiumpaymentdto.DirectExtensionRequest;
import com.srots.dto.premiumpaymentdto.PaymentResponse;
import com.srots.dto.premiumpaymentdto.PremiumAccessStatus;
import com.srots.dto.premiumpaymentdto.RejectPaymentRequest;
import com.srots.dto.premiumpaymentdto.SubmitPaymentRequest;
import com.srots.model.User;
import com.srots.repository.UserRepository;
import com.srots.service.FileService;
import com.srots.service.PremiumPaymentService;

/**
 * REST Controller for Premium Payment operations.
 *
 * Base path: /api/v1/premium-payments
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ PUBLIC endpoint (no JWT — student has no token after 402 login block)     │
 * │   POST  /public/submit          → userId from form body, not JWT          │
 * ├───────────────────────────────────────────────────────────────────────────┤
 * │ STUDENT endpoints (JWT required)                                          │
 * │   POST  /submit                 → JWT present (in-app RenewalModal)       │
 * │   GET   /my-status              → Check own premium access state          │
 * │   POST  /upload-screenshot      → Upload screenshot, get URL back         │
 * ├───────────────────────────────────────────────────────────────────────────┤
 * │ ADMIN / SROTS_DEV endpoints (JWT required)                                │
 * │   GET   /college/{collegeId}    → Paginated payments for a college        │
 * │   PUT   /{id}/verify            → Approve a pending payment               │
 * │   PUT   /{id}/reject            → Reject with reason                      │
 * │   POST  /direct-extension/{id}  → Emergency direct grant                  │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * ── WHY TWO SUBMIT ENDPOINTS ─────────────────────────────────────────────────
 *
 * /public/submit (NEW)
 *   Used by: PremiumPaymentPage in App.tsx
 *   Context: Student received HTTP 402 at login → no JWT token was issued.
 *   How:     Takes userId as a multipart form field (from the 402 response body).
 *            Validates userId exists in DB and has STUDENT role.
 *            Calls same PremiumPaymentService.submitPayment() method.
 *   Security: No privilege escalation possible — non-students get 403,
 *             unknown userId gets 400, all business checks still apply.
 *
 * /submit (UNCHANGED)
 *   Used by: In-app RenewalModal (student already logged in, JWT present)
 *   Context: Student is authenticated, @AuthenticationPrincipal works normally.
 *
 * ── NEVER DO THIS ────────────────────────────────────────────────────────────
 * Never put a path in SecurityConfig permitAll() if the controller method uses
 * @AuthenticationPrincipal. permitAll() does not populate the SecurityContext —
 * it only skips the 401 rejection. The principal will still be null,
 * and calling any method on it throws NullPointerException → 403.
 */
@RestController
@RequestMapping("/api/v1/premium-payments")
public class PremiumPaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PremiumPaymentController.class);

    // ── Per-user rate limiting on payment submission ───────────────────────────
    // Prevents students from submitting multiple payments in quick succession.
    // Limit: 3 submissions per userId within a 10-minute sliding window.
    private static final int    RATE_LIMIT_MAX      = 3;
    private static final long   RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000L; // 10 minutes

    /** userId → array of submission timestamps (epoch ms) within the current window */
    private final ConcurrentHashMap<String, long[]> submissionTimestamps = new ConcurrentHashMap<>();

    /**
     * Returns true if the user has exceeded the submission rate limit.
     * Cleans up timestamps outside the current window on each call.
     */
    private boolean isRateLimited(String userId) {
        long now = Instant.now().toEpochMilli();
        long windowStart = now - RATE_LIMIT_WINDOW_MS;

        submissionTimestamps.compute(userId, (k, existing) -> {
            if (existing == null) return new long[]{ now };
            // Keep only timestamps within the window
            long[] recent = java.util.Arrays.stream(existing)
                    .filter(t -> t > windowStart)
                    .toArray();
            // Append current timestamp
            long[] updated = java.util.Arrays.copyOf(recent, recent.length + 1);
            updated[recent.length] = now;
            return updated;
        });

        long[] timestamps = submissionTimestamps.get(userId);
        return timestamps != null && timestamps.length > RATE_LIMIT_MAX;
    }

    @Autowired
    private PremiumPaymentService paymentService;

    @Autowired
    private FileService fileService;

    // Needed only by /public/submit to validate userId without a JWT
    @Autowired
    private UserRepository userRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC: Submit payment — NO JWT required.
    //
    // Student arrives here after HTTP 402 at login (no JWT was issued).
    // userId comes from the 402 response body (AuthController now includes it
    // in PremiumAccessStatus). App.tsx stores it in premiumUserId state and
    // passes it down to PremiumPaymentPage as a prop, which sends it here.
    //
    // SecurityConfig: /api/v1/premium-payments/public/** → permitAll()
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping(value = "/public/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitPaymentPublic(
            @RequestPart("userId")        String userId,
            @RequestPart("utrNumber")     String utrNumber,
            @RequestPart("premiumMonths") String premiumMonths,
            @RequestPart("amount")        String amount,
            @RequestPart("username")      String username,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {

        logger.info("[PremiumPayment] POST /public/submit | userId={} | utr={} | plan={} | amount={}",
                userId, utrNumber, premiumMonths, amount);

        // Per-user rate limit check
        if (isRateLimited(userId.trim())) {
            logger.warn("[PremiumPayment] /public/submit RATE LIMITED | userId={}", userId);
            return ResponseEntity.status(429)
                    .body(Map.of("message",
                            "Too many payment submissions. Please wait 10 minutes before trying again."));
        }

        // Validate userId — must exist in DB and be a STUDENT
        User user = userRepository.findById(userId.trim()).orElse(null);
        if (user == null) {
            logger.warn("[PremiumPayment] /public/submit — userId not found | userId={}", userId);
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Invalid user ID. Please go back and try logging in again."));
        }
        if (user.getRole() != User.Role.STUDENT) {
            logger.warn("[PremiumPayment] /public/submit — non-student | userId={} | role={}",
                    userId, user.getRole());
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Only students can submit premium payments."));
        }

        SubmitPaymentRequest request = new SubmitPaymentRequest();
        request.setUtrNumber(utrNumber.trim());
        request.setPremiumMonths(premiumMonths.trim());
        request.setAmount(new java.math.BigDecimal(amount.trim()));
        request.setUsername(username.trim());

        try {
            PaymentResponse response =
                    paymentService.submitPayment(userId.trim(), request, screenshot);
            logger.info("[PremiumPayment] POST /public/submit SUCCESS | userId={} | paymentId={}",
                    userId, response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[PremiumPayment] POST /public/submit FAILED | userId={} | error={}",
                    userId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT: Submit payment — JWT required.
    // Used by in-app RenewalModal (student already authenticated).
    // Identical to original — NOT changed.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitPayment(
            @AuthenticationPrincipal UserInfoUserDetails principal,
            @RequestPart("utrNumber")     String utrNumber,
            @RequestPart("premiumMonths") String premiumMonths,
            @RequestPart("amount")        String amount,
            @RequestPart("username")      String username,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {

        logger.info("[PremiumPayment] POST /submit | userId={} | utr={} | plan={} | amount={}",
                principal.getUserId(), utrNumber, premiumMonths, amount);

        // Per-user rate limit check (same window applies to both submit endpoints)
        if (isRateLimited(principal.getUserId())) {
            logger.warn("[PremiumPayment] /submit RATE LIMITED | userId={}", principal.getUserId());
            return ResponseEntity.status(429)
                    .body(Map.of("message",
                            "Too many payment submissions. Please wait 10 minutes before trying again."));
        }

        SubmitPaymentRequest request = new SubmitPaymentRequest();
        request.setUtrNumber(utrNumber.trim());
        request.setPremiumMonths(premiumMonths.trim());
        request.setAmount(new java.math.BigDecimal(amount.trim()));
        request.setUsername(username.trim());

        PaymentResponse response =
                paymentService.submitPayment(principal.getUserId(), request, screenshot);

        logger.info("[PremiumPayment] POST /submit SUCCESS | userId={} | paymentId={}",
                principal.getUserId(), response.getId());

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT: Check own premium status
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/my-status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PremiumAccessStatus> checkMyStatus(
            @AuthenticationPrincipal UserInfoUserDetails principal) {

        logger.info("[PremiumPayment] GET /my-status | userId={}", principal.getUserId());
        PremiumAccessStatus status = paymentService.checkPremiumAccess(principal.getUserId());
        logger.info("[PremiumPayment] GET /my-status | userId={} | accessState={}",
                principal.getUserId(), status.getAccessState());
        return ResponseEntity.ok(status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT: Standalone screenshot upload
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping(value = "/upload-screenshot", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> uploadScreenshot(
            @AuthenticationPrincipal UserInfoUserDetails principal,
            @RequestPart("file")        MultipartFile file,
            @RequestPart("collegeCode") String collegeCode) {

        logger.info("[PremiumPayment] POST /upload-screenshot | userId={} | collegeCode={}",
                principal.getUserId(), collegeCode);

        String fileUrl = fileService.uploadFile(
                file, collegeCode.trim(), "premium-payments", principal.getUserId());

        logger.info("[PremiumPayment] Screenshot uploaded | userId={} | url={}",
                principal.getUserId(), fileUrl);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN/SROTS_DEV: Paginated payments for a college
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/college/{collegeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Page<PaymentResponse>> getCollegePayments(
            @PathVariable String collegeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("[PremiumPayment] GET /college/{} | page={} | size={} | status={} | query={}",
                collegeId, page, size, status, query);

        Page<PaymentResponse> result =
                paymentService.getPaymentsByCollege(collegeId, status, query, page, size);

        logger.info("[PremiumPayment] GET /college/{} | totalElements={}",
                collegeId, result.getTotalElements());
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN/SROTS_DEV: Verify a payment
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @PathVariable String id,
            @AuthenticationPrincipal UserInfoUserDetails principal) {

        logger.info("[PremiumPayment] PUT /{}/verify | adminId={}", id, principal.getUserId());
        PaymentResponse response = paymentService.verifyPayment(id, principal.getUserId());
        logger.info("[PremiumPayment] PUT /{}/verify SUCCESS | adminId={}", id, principal.getUserId());
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN/SROTS_DEV: Reject a payment
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<PaymentResponse> rejectPayment(
            @PathVariable String id,
            @Valid @RequestBody RejectPaymentRequest request,
            @AuthenticationPrincipal UserInfoUserDetails principal) {

        logger.info("[PremiumPayment] PUT /{}/reject | adminId={} | reason={}",
                id, principal.getUserId(), request.getRejectionReason());
        PaymentResponse response = paymentService.rejectPayment(
                id, principal.getUserId(), request.getRejectionReason());
        logger.info("[PremiumPayment] PUT /{}/reject SUCCESS | adminId={}", id, principal.getUserId());
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN/SROTS_DEV: Direct emergency extension
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/direct-extension/{studentUserId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Map<String, String>> grantDirectExtension(
            @PathVariable String studentUserId,
            @Valid @RequestBody DirectExtensionRequest request,
            @AuthenticationPrincipal UserInfoUserDetails principal) {

        logger.info("[PremiumPayment] POST /direct-extension/{} | months={} | adminId={}",
                studentUserId, request.getMonths(), principal.getUserId());

        paymentService.grantDirectExtension(
                studentUserId, request.getMonths(), principal.getUserId());

        logger.info("[PremiumPayment] POST /direct-extension/{} SUCCESS | adminId={}",
                studentUserId, principal.getUserId());

        return ResponseEntity.ok(Map.of(
                "message",
                "Premium extended by " + request.getMonths() + " month(s) successfully."));
    }
}