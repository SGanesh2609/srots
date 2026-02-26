package com.srots.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.premiumpaymentdto.PaymentResponse;
import com.srots.dto.premiumpaymentdto.PremiumAccessStatus;
import com.srots.dto.premiumpaymentdto.SubmitPaymentRequest;
import com.srots.model.College;
import com.srots.model.PremiumPayment;
import com.srots.model.PremiumPayment.PaymentStatus;
import com.srots.model.PremiumPayment.PremiumMonths;
import com.srots.model.StudentProfile;
import com.srots.model.User;
import com.srots.repository.PremiumPaymentRepository;
import com.srots.repository.StudentProfileRepository;
import com.srots.repository.UserRepository;

@Service
public class PremiumPaymentServiceImpl implements PremiumPaymentService {

    // ── Explicit SLF4J logger — DO NOT use @Slf4j Lombok annotation.
    // @Slf4j requires Lombok to inject the `log` field at compile time.
    // If Lombok is not configured correctly in the IDE or build tool,
    // it causes "log cannot be resolved" errors. This explicit declaration
    // always works regardless of Lombok setup.
    private static final Logger logger = LoggerFactory.getLogger(PremiumPaymentServiceImpl.class);

    // Category name used for all premium payment screenshot uploads.
    // LocalFileServiceImpl will store at: uploads/{collegeCode}/premium-payments/{userId}/file_ts.ext
    // Returned URL:                       /api/v1/files/{collegeCode}/premium-payments/{userId}/file_ts.ext
    private static final String PAYMENT_CATEGORY = "premium-payments";

    @Autowired
    private PremiumPaymentRepository paymentRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private StudentProfileRepository profileRepo;

    // ── Inject as FileService interface, NOT FileStorageService. ────────────
    // FileStorageService does NOT exist in this codebase.
    // LocalFileServiceImpl implements FileService — that is the correct bean.
    // When you later swap to cloud storage, only the @Service implementation
    // changes; this class stays identical.
    @Autowired
    private FileService fileService;

    @Autowired
    private EmailService emailService;

    // ─────────────────────────────────────────────────────────────────────────
    // Student: Submit Payment
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PaymentResponse submitPayment(String userId,
                                         SubmitPaymentRequest request,
                                         MultipartFile screenshot) {

        logger.info("[PremiumPayment] submitPayment START | userId={} | utr={} | plan={} | amount={}",
                userId, request.getUtrNumber(), request.getPremiumMonths(), request.getAmount());

        // 1. Load user — must exist
        User user = userRepo.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("[PremiumPayment] User not found | userId={}", userId);
                    return new RuntimeException("User not found: " + userId);
                });

        College college = user.getCollege();
        if (college == null) {
            logger.warn("[PremiumPayment] User has no college assigned | userId={}", userId);
            throw new RuntimeException("Your account is not linked to any college. Please contact support.");
        }

        // 2. Prevent duplicate UTR — unique constraint in DB catches it too,
        //    but this gives a cleaner error message before hitting the DB constraint.
        if (paymentRepo.existsByUtrNumber(request.getUtrNumber().trim())) {
            logger.warn("[PremiumPayment] Duplicate UTR blocked | utr={} | userId={}", request.getUtrNumber(), userId);
            throw new RuntimeException("A payment with this UTR number already exists. Please verify your transaction ID.");
        }

        // 3. Prevent a second submission while one is already PENDING
        paymentRepo.findTopByUser_IdAndStatusOrderBySubmittedAtDesc(userId, PaymentStatus.PENDING)
                .ifPresent(existing -> {
                    logger.warn("[PremiumPayment] Duplicate PENDING blocked | userId={} | existingPaymentId={}",
                            userId, existing.getId());
                    throw new RuntimeException(
                            "You already have a payment under review (submitted on "
                            + existing.getSubmittedAt().toLocalDate() + "). "
                            + "Please wait for the SROTS team to process it before submitting again.");
                });

        // 4. Parse premium plan enum — case-insensitive for safety
        PremiumMonths premiumMonths;
        try {
            premiumMonths = PremiumMonths.valueOf(request.getPremiumMonths().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("[PremiumPayment] Invalid plan value | value={} | userId={}", request.getPremiumMonths(), userId);
            throw new RuntimeException("Invalid plan selected: '" + request.getPremiumMonths()
                    + "'. Valid values: FOUR_MONTHS, SIX_MONTHS, TWELVE_MONTHS.");
        }

        // 5. Server-side amount validation — the client must not be trusted for pricing
        BigDecimal expectedAmount = premiumMonths.getExpectedAmount();
        if (request.getAmount() == null || request.getAmount().compareTo(expectedAmount) != 0) {
            logger.warn("[PremiumPayment] Amount mismatch | userId={} | plan={} | expected={} | received={}",
                    userId, premiumMonths.name(), expectedAmount, request.getAmount());
            throw new RuntimeException("Amount mismatch. For " + premiumMonths.getMonths()
                    + " months the expected amount is ₹" + expectedAmount.toPlainString()
                    + " but received ₹" + (request.getAmount() != null ? request.getAmount().toPlainString() : "null"));
        }

        // 6. Upload screenshot via FileService
        //    Uses: uploadFile(file, collegeCode, category, userId)
        //    → Path: uploads/{collegeCode}/premium-payments/{userId}/file_{ts}.ext
        //    → URL stored in DB: /api/v1/files/{collegeCode}/premium-payments/{userId}/file_{ts}.ext
        String screenshotUrl = null;
        if (screenshot != null && !screenshot.isEmpty()) {
            try {
                String collegeCode = college.getCode();
                screenshotUrl = fileService.uploadFile(screenshot, collegeCode, PAYMENT_CATEGORY, userId);
                logger.info("[PremiumPayment] Screenshot uploaded | userId={} | url={}", userId, screenshotUrl);
            } catch (Exception e) {
                logger.error("[PremiumPayment] Screenshot upload FAILED | userId={} | error={}", userId, e.getMessage(), e);
                throw new RuntimeException("Failed to upload payment screenshot: " + e.getMessage());
            }
        } else {
            logger.info("[PremiumPayment] No screenshot provided | userId={}", userId);
        }

        // 7. Persist PremiumPayment record
        PremiumPayment payment = new PremiumPayment();
        payment.setUser(user);
        payment.setCollege(college);
        payment.setUtrNumber(request.getUtrNumber().trim());
        payment.setPaymentScreenshotUrl(screenshotUrl);
        payment.setPremiumMonths(premiumMonths);
        payment.setAmount(request.getAmount());
        payment.setUsername(request.getUsername().trim());
        payment.setStatus(PaymentStatus.PENDING);

        PremiumPayment saved = paymentRepo.save(payment);
        logger.info("[PremiumPayment] Payment record saved | paymentId={} | userId={} | college={} | plan={} | amount={}",
                saved.getId(), userId, college.getCode(), premiumMonths.name(), request.getAmount());

        // 8. Confirmation email — wrapped so email failure never rolls back the submission
        try {
            sendSubmissionConfirmationEmail(user, premiumMonths);
        } catch (Exception e) {
            logger.error("[PremiumPayment] Confirmation email FAILED (non-fatal) | userId={} | error={}", userId, e.getMessage());
        }

        return toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Login: Check Premium Access State
    // Called by AuthController during login for STUDENT role.
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public PremiumAccessStatus checkPremiumAccess(String userId) {
        logger.debug("[PremiumPayment] checkPremiumAccess | userId={}", userId);

        // 1. Check StudentProfile.premiumEndDate
        StudentProfile profile = profileRepo.findById(userId).orElse(null);
        if (profile != null
                && profile.getPremiumEndDate() != null
                && !profile.getPremiumEndDate().isBefore(LocalDate.now())) {
            logger.debug("[PremiumPayment] ACTIVE | userId={} | endDate={}", userId, profile.getPremiumEndDate());
            return new PremiumAccessStatus(
                    "ACTIVE",
                    "Premium active until " + profile.getPremiumEndDate() + ".",
                    null);
        }

        // 2. Check the most recent payment record
        Optional<PremiumPayment> latest = paymentRepo.findTopByUser_IdOrderBySubmittedAtDesc(userId);
        if (latest.isPresent()) {
            PremiumPayment lp = latest.get();
            logger.debug("[PremiumPayment] Latest payment found | userId={} | status={} | paymentId={}",
                    userId, lp.getStatus(), lp.getId());

            if (lp.getStatus() == PaymentStatus.PENDING) {
                return new PremiumAccessStatus(
                        "PENDING_VERIFICATION",
                        "Your payment is currently under review by the SROTS team. We will notify you once verified.",
                        null);
            }
            if (lp.getStatus() == PaymentStatus.REJECTED) {
                return new PremiumAccessStatus(
                        "REJECTED",
                        "Your last payment was rejected. Please submit a new payment to continue.",
                        lp.getRejectionReason());
            }
        }

        logger.debug("[PremiumPayment] EXPIRED | userId={}", userId);
        return new PremiumAccessStatus(
                "EXPIRED",
                "Your premium subscription has expired. Please renew to continue accessing SROTS.",
                null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin: Get Paginated Payments for a College
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public Page<PaymentResponse> getPaymentsByCollege(
            String collegeId, String statusStr, String query, int page, int size) {

        logger.info("[PremiumPayment] getPaymentsByCollege | collegeId={} | status={} | query={} | page={} | size={}",
                collegeId, statusStr, query, page, size);

        PageRequest pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());

        if (StringUtils.hasText(query)) {
            return paymentRepo.searchByCollegeId(collegeId, query.trim(), pageable).map(this::toResponse);
        }

        if (StringUtils.hasText(statusStr)) {
            try {
                PaymentStatus status = PaymentStatus.valueOf(statusStr.toUpperCase());
                return paymentRepo.findByCollege_IdAndStatusOrderBySubmittedAtDesc(collegeId, status, pageable)
                        .map(this::toResponse);
            } catch (IllegalArgumentException ignored) {
                logger.warn("[PremiumPayment] Unknown status filter '{}', returning unfiltered", statusStr);
            }
        }

        return paymentRepo.findByCollege_IdOrderBySubmittedAtDesc(collegeId, pageable).map(this::toResponse);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin: Verify Payment
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PaymentResponse verifyPayment(String paymentId, String adminId) {
        logger.info("[PremiumPayment] verifyPayment START | paymentId={} | adminId={}", paymentId, adminId);

        PremiumPayment payment = findPaymentOrThrow(paymentId);

        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> {
                    logger.warn("[PremiumPayment] Admin not found | adminId={}", adminId);
                    return new RuntimeException("Admin user not found: " + adminId);
                });

        if (payment.getStatus() != PaymentStatus.PENDING) {
            logger.warn("[PremiumPayment] Verify rejected — payment not PENDING | paymentId={} | currentStatus={}",
                    paymentId, payment.getStatus());
            throw new RuntimeException("Only PENDING payments can be verified. Current status: " + payment.getStatus());
        }

        // Mark payment verified
        payment.setStatus(PaymentStatus.VERIFIED);
        payment.setVerifiedAt(LocalDateTime.now());
        payment.setVerifiedByAdmin(admin);

        // Update StudentProfile premium dates
        String userId = payment.getUser().getId();
        StudentProfile profile = profileRepo.findById(userId)
                .orElseThrow(() -> {
                    logger.error("[PremiumPayment] StudentProfile not found during verify | userId={}", userId);
                    return new RuntimeException("StudentProfile not found for userId: " + userId);
                });

        LocalDate startDate = LocalDate.now();
        LocalDate endDate   = startDate.plusMonths(payment.getPremiumMonths().getMonths());
        profile.setPremiumStartDate(startDate);
        profile.setPremiumEndDate(endDate);
        profileRepo.save(profile);

        PremiumPayment saved = paymentRepo.save(payment);
        logger.info("[PremiumPayment] VERIFIED | paymentId={} | userId={} | adminId={} | premiumUntil={}",
                paymentId, userId, adminId, endDate);

        try {
            sendVerificationEmail(payment.getUser(), endDate);
        } catch (Exception e) {
            logger.error("[PremiumPayment] Verification email FAILED (non-fatal) | userId={} | error={}", userId, e.getMessage());
        }

        return toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin: Reject Payment
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PaymentResponse rejectPayment(String paymentId, String adminId, String reason) {
        logger.info("[PremiumPayment] rejectPayment START | paymentId={} | adminId={} | reason={}",
                paymentId, adminId, reason);

        if (!StringUtils.hasText(reason)) {
            throw new RuntimeException("Rejection reason is required and cannot be empty.");
        }

        PremiumPayment payment = findPaymentOrThrow(paymentId);

        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> {
                    logger.warn("[PremiumPayment] Admin not found | adminId={}", adminId);
                    return new RuntimeException("Admin user not found: " + adminId);
                });

        if (payment.getStatus() != PaymentStatus.PENDING) {
            logger.warn("[PremiumPayment] Reject blocked — payment not PENDING | paymentId={} | currentStatus={}",
                    paymentId, payment.getStatus());
            throw new RuntimeException("Only PENDING payments can be rejected. Current status: " + payment.getStatus());
        }

        payment.setStatus(PaymentStatus.REJECTED);
        payment.setVerifiedAt(LocalDateTime.now());  // tracks when the action was taken
        payment.setVerifiedByAdmin(admin);
        payment.setRejectionReason(reason.trim());

        PremiumPayment saved = paymentRepo.save(payment);
        logger.info("[PremiumPayment] REJECTED | paymentId={} | userId={} | adminId={} | reason={}",
                paymentId, payment.getUser().getId(), adminId, reason);

        try {
            sendRejectionEmail(payment.getUser(), reason);
        } catch (Exception e) {
            logger.error("[PremiumPayment] Rejection email FAILED (non-fatal) | userId={} | error={}",
                    payment.getUser().getId(), e.getMessage());
        }

        return toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin: Direct Emergency Extension — NO payment verification needed.
    // SROTS Admin / Dev can call this to bypass the payment flow entirely.
    // If the student already has active premium, the new months are STACKED
    // on top of the existing end date. Otherwise starts from today.
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void grantDirectExtension(String studentUserId, int months, String adminId) {
        logger.info("[PremiumPayment] grantDirectExtension START | studentUserId={} | months={} | adminId={}",
                studentUserId, months, adminId);

        if (months <= 0) {
            throw new RuntimeException("Extension months must be greater than 0.");
        }

        // Verify admin exists
        userRepo.findById(adminId).orElseThrow(() -> {
            logger.warn("[PremiumPayment] Admin not found for direct extension | adminId={}", adminId);
            return new RuntimeException("Admin user not found: " + adminId);
        });

        // Verify student exists
        User student = userRepo.findById(studentUserId).orElseThrow(() -> {
            logger.warn("[PremiumPayment] Student not found for direct extension | studentUserId={}", studentUserId);
            return new RuntimeException("Student not found: " + studentUserId);
        });

        StudentProfile profile = profileRepo.findById(studentUserId).orElseThrow(() -> {
            logger.error("[PremiumPayment] StudentProfile not found for direct extension | studentUserId={}", studentUserId);
            return new RuntimeException("StudentProfile not found for user: " + studentUserId);
        });

        // If student already has active premium → extend FROM existing end date (stack, not overwrite).
        // If lapsed or never set → start from today.
        LocalDate baseDate;
        if (profile.getPremiumEndDate() != null && profile.getPremiumEndDate().isAfter(LocalDate.now())) {
            baseDate = profile.getPremiumEndDate();
            logger.info("[PremiumPayment] Stacking onto existing premium | studentUserId={} | currentEndDate={}",
                    studentUserId, baseDate);
        } else {
            baseDate = LocalDate.now();
            logger.info("[PremiumPayment] No active premium, starting from today | studentUserId={}", studentUserId);
        }

        LocalDate newEndDate = baseDate.plusMonths(months);

        // Only set premiumStartDate if it was never set before
        if (profile.getPremiumStartDate() == null) {
            profile.setPremiumStartDate(LocalDate.now());
        }
        profile.setPremiumEndDate(newEndDate);
        profileRepo.save(profile);

        logger.info("[PremiumPayment] Direct extension GRANTED | studentUserId={} | adminId={} | months={} | newEndDate={}",
                studentUserId, adminId, months, newEndDate);

        try {
            sendDirectGrantEmail(student, months, newEndDate);
        } catch (Exception e) {
            logger.error("[PremiumPayment] Direct grant email FAILED (non-fatal) | studentUserId={} | error={}",
                    studentUserId, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private PremiumPayment findPaymentOrThrow(String id) {
        return paymentRepo.findById(id).orElseThrow(() -> {
            logger.warn("[PremiumPayment] Payment not found | paymentId={}", id);
            return new RuntimeException("Payment record not found: " + id);
        });
    }

    private PaymentResponse toResponse(PremiumPayment p) {
        PaymentResponse r = new PaymentResponse();
        r.setId(p.getId());
        r.setUserId(p.getUser().getId());
        r.setUserFullName(p.getUser().getFullName());
        r.setUsername(p.getUsername());
        r.setCollegeId(p.getCollege().getId());
        r.setCollegeName(p.getCollege().getName());
        r.setUtrNumber(p.getUtrNumber());
        r.setPaymentScreenshotUrl(p.getPaymentScreenshotUrl());
        r.setPremiumMonths(p.getPremiumMonths().name());
        r.setPremiumMonthsLabel(p.getPremiumMonths().getDisplayLabel());
        r.setPremiumMonthsCount(p.getPremiumMonths().getMonths());
        r.setAmount(p.getAmount());
        r.setStatus(p.getStatus().name());
        r.setSubmittedAt(p.getSubmittedAt());
        r.setVerifiedAt(p.getVerifiedAt());
        if (p.getVerifiedByAdmin() != null) {
            r.setVerifiedByAdminId(p.getVerifiedByAdmin().getId());
            r.setVerifiedByAdminName(p.getVerifiedByAdmin().getFullName());
        }
        r.setRejectionReason(p.getRejectionReason());
        return r;
    }

    // ── Email Templates ────────────────────────────────────────────────────────

    private void sendSubmissionConfirmationEmail(User user, PremiumMonths months) {
        String html = "<div style='font-family:Arial,sans-serif;max-width:600px;border:1px solid #eee;padding:24px;border-radius:8px;'>"
                + "<h2 style='color:#2563eb;'>✅ Payment Submitted Successfully</h2>"
                + "<p>Hello <b>" + user.getFullName() + "</b>,</p>"
                + "<p>Your payment request for <b>" + months.getDisplayLabel() + "</b> of SROTS Premium has been received and is now under review.</p>"
                + "<div style='background:#f0f9ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;'>"
                + "⏳ Our team will review your payment shortly and notify you once verified."
                + "</div>"
                + "<p>If you have any questions, please contact your college placement office.</p>"
                + "<br><p>Best Regards,<br><b>SROTS Team</b></p></div>";
        emailService.sendEmail(user.getEmail(), "SROTS Premium — Payment Under Review", html);
    }

    private void sendVerificationEmail(User user, LocalDate endDate) {
        String html = "<div style='font-family:Arial,sans-serif;max-width:600px;border:1px solid #eee;padding:24px;border-radius:8px;'>"
                + "<h2 style='color:#16a34a;'>🎉 Premium Activated!</h2>"
                + "<p>Hello <b>" + user.getFullName() + "</b>,</p>"
                + "<p>Your payment has been <b>verified</b> by the SROTS team. Your premium subscription is now active!</p>"
                + "<table style='width:100%;background:#f0fdf4;padding:12px;border-radius:6px;border-collapse:collapse;'>"
                + "<tr><td style='padding:6px;'><b>Premium Valid Until:</b></td>"
                + "<td style='padding:6px;'><b style='color:#16a34a;'>" + endDate + "</b></td></tr>"
                + "</table>"
                + "<p style='margin-top:16px;'>You can now log in and access all SROTS premium features.</p>"
                + "<br><p>Best Regards,<br><b>SROTS Team</b></p></div>";
        emailService.sendEmail(user.getEmail(), "SROTS Premium — Account Activated ✅", html);
    }

    private void sendRejectionEmail(User user, String reason) {
        String html = "<div style='font-family:Arial,sans-serif;max-width:600px;border:1px solid #eee;padding:24px;border-radius:8px;'>"
                + "<h2 style='color:#dc2626;'>❌ Payment Rejected</h2>"
                + "<p>Hello <b>" + user.getFullName() + "</b>,</p>"
                + "<p>Unfortunately, your payment submission has been <b>rejected</b> by the SROTS team.</p>"
                + "<div style='background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0;'>"
                + "<b>Reason:</b> " + reason + "</div>"
                + "<p>Please review the reason above and re-submit a corrected payment. "
                + "If you believe this is an error, contact your college placement office.</p>"
                + "<br><p>Best Regards,<br><b>SROTS Team</b></p></div>";
        emailService.sendEmail(user.getEmail(), "SROTS Premium — Payment Rejected", html);
    }

    private void sendDirectGrantEmail(User user, int months, LocalDate endDate) {
        String html = "<div style='font-family:Arial,sans-serif;max-width:600px;border:1px solid #eee;padding:24px;border-radius:8px;'>"
                + "<h2 style='color:#7c3aed;'>🎁 Premium Extended!</h2>"
                + "<p>Hello <b>" + user.getFullName() + "</b>,</p>"
                + "<p>Your SROTS Premium subscription has been extended by <b>" + months + " month(s)</b> by the SROTS administration.</p>"
                + "<table style='width:100%;background:#f5f3ff;padding:12px;border-radius:6px;border-collapse:collapse;'>"
                + "<tr><td style='padding:6px;'><b>Extended By:</b></td><td style='padding:6px;'>" + months + " Month(s)</td></tr>"
                + "<tr><td style='padding:6px;'><b>New Expiry Date:</b></td>"
                + "<td style='padding:6px;'><b style='color:#7c3aed;'>" + endDate + "</b></td></tr>"
                + "</table>"
                + "<p style='margin-top:16px;'>You can continue accessing all SROTS premium features until the above date.</p>"
                + "<br><p>Best Regards,<br><b>SROTS Team</b></p></div>";
        emailService.sendEmail(user.getEmail(), "SROTS Premium — Subscription Extended 🎁", html);
    }
}