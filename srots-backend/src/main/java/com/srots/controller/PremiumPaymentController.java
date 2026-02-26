package com.srots.controller;

import java.util.Map;

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

import com.srots.config.UserInfoUserDetails;
import com.srots.dto.premiumpaymentdto.DirectExtensionRequest;
import com.srots.dto.premiumpaymentdto.PaymentResponse;
import com.srots.dto.premiumpaymentdto.PremiumAccessStatus;
import com.srots.dto.premiumpaymentdto.RejectPaymentRequest;
import com.srots.dto.premiumpaymentdto.SubmitPaymentRequest;
import com.srots.service.FileService;
import com.srots.service.PremiumPaymentService;

/**
 * REST Controller for Premium Payment operations.
 *
 * Base path: /api/v1/premium-payments
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ STUDENT endpoints                                                    │
 * │   POST  /submit                → Submit payment form + screenshot    │
 * │   GET   /my-status             → Check own premium access state      │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ SHARED upload endpoint                                               │
 * │   POST  /upload-screenshot     → Upload screenshot, get URL back     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ ADMIN / SROTS_DEV endpoints                                          │
 * │   GET   /college/{collegeId}   → Paginated payments for a college    │
 * │   PUT   /{id}/verify           → Approve a pending payment           │
 * │   PUT   /{id}/reject           → Reject with reason                  │
 * │   POST  /direct-extension/{studentUserId} → Emergency grant          │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * NOTE: Do NOT use @Slf4j Lombok annotation in this controller.
 * Use the explicit LoggerFactory.getLogger() declaration below.
 * @Slf4j injects the `log` field via Lombok annotation processing.
 * If Lombok is not wired correctly in the IDE/build, it causes
 * "log cannot be resolved" compile errors. The explicit declaration
 * is always safe and works identically.
 */
@RestController
@RequestMapping("/api/v1/premium-payments")
public class PremiumPaymentController {

    // ── Explicit SLF4J logger — do NOT replace with @Slf4j ──────────────────
    private static final Logger logger = LoggerFactory.getLogger(PremiumPaymentController.class);

    @Autowired
    private PremiumPaymentService paymentService;

    @Autowired
    private FileService fileService;

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT: Submit payment (multipart — fields + screenshot in one request)
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

        SubmitPaymentRequest request = new SubmitPaymentRequest();
        request.setUtrNumber(utrNumber.trim());
        request.setPremiumMonths(premiumMonths.trim());
        request.setAmount(new java.math.BigDecimal(amount.trim()));
        request.setUsername(username.trim());

        PaymentResponse response = paymentService.submitPayment(principal.getUserId(), request, screenshot);

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
        logger.info("[PremiumPayment] GET /my-status | userId={} | accessState={}", principal.getUserId(), status.getAccessState());
        return ResponseEntity.ok(status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT: Standalone screenshot upload (optional separate step)
    // Matches the same pattern used by the college upload endpoint.
    // Stores at: uploads/{collegeCode}/premium-payments/{userId}/file_{ts}.ext
    // Returns URL which the frontend can store and include in the submit form.
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping(value = "/upload-screenshot", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> uploadScreenshot(
            @AuthenticationPrincipal UserInfoUserDetails principal,
            @RequestPart("file")        MultipartFile file,
            @RequestPart("collegeCode") String collegeCode) {

        logger.info("[PremiumPayment] POST /upload-screenshot | userId={} | collegeCode={}",
                principal.getUserId(), collegeCode);

        String fileUrl = fileService.uploadFile(file, collegeCode.trim(), "premium-payments", principal.getUserId());

        logger.info("[PremiumPayment] Screenshot uploaded | userId={} | url={}", principal.getUserId(), fileUrl);
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

        Page<PaymentResponse> result = paymentService.getPaymentsByCollege(collegeId, status, query, page, size);

        logger.info("[PremiumPayment] GET /college/{} | totalElements={}", collegeId, result.getTotalElements());
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
    // ADMIN/SROTS_DEV: Reject a payment with reason
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<PaymentResponse> rejectPayment(
            @PathVariable String id,
            @RequestBody RejectPaymentRequest request,
            @AuthenticationPrincipal UserInfoUserDetails principal) {

        logger.info("[PremiumPayment] PUT /{}/reject | adminId={} | reason={}",
                id, principal.getUserId(), request.getRejectionReason());
        PaymentResponse response = paymentService.rejectPayment(id, principal.getUserId(), request.getRejectionReason());
        logger.info("[PremiumPayment] PUT /{}/reject SUCCESS | adminId={}", id, principal.getUserId());
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN/SROTS_DEV: Direct emergency extension — bypasses payment flow entirely.
    // Admin picks months (4, 6 or 12) and clicks confirm in RenewalModal.
    // Premium start/end dates are updated immediately, no UTR or screenshot needed.
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/direct-extension/{studentUserId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<Map<String, String>> grantDirectExtension(
            @PathVariable String studentUserId,
            @RequestBody DirectExtensionRequest request,
            @AuthenticationPrincipal UserInfoUserDetails principal) {

        logger.info("[PremiumPayment] POST /direct-extension/{} | months={} | adminId={}",
                studentUserId, request.getMonths(), principal.getUserId());

        paymentService.grantDirectExtension(studentUserId, request.getMonths(), principal.getUserId());

        logger.info("[PremiumPayment] POST /direct-extension/{} SUCCESS | months={} | adminId={}",
                studentUserId, request.getMonths(), principal.getUserId());

        return ResponseEntity.ok(Map.of(
                "message", "Premium extended by " + request.getMonths() + " month(s) successfully."
        ));
    }
}