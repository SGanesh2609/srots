package com.srots.service;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.premiumpaymentdto.PaymentResponse;
import com.srots.dto.premiumpaymentdto.PremiumAccessStatus;
import com.srots.dto.premiumpaymentdto.SubmitPaymentRequest;

public interface PremiumPaymentService {

    /**
     * Student submits a new payment with UTR, amount, plan and screenshot.
     * Validates: UTR uniqueness, no duplicate pending, plan amount correctness.
     * Uploads screenshot via FileService and persists the payment record.
     */
    PaymentResponse submitPayment(String userId, SubmitPaymentRequest request, MultipartFile screenshot);

    /**
     * Called by AuthController during student login.
     * Returns: ACTIVE | PENDING_VERIFICATION | REJECTED | EXPIRED
     */
    PremiumAccessStatus checkPremiumAccess(String userId);

    /**
     * Admin/SROTS Dev: Paginated list of payments for a specific college.
     * Optionally filtered by status (PENDING/VERIFIED/REJECTED) or search query (username/UTR).
     */
    Page<PaymentResponse> getPaymentsByCollege(String collegeId, String status, String query, int page, int size);

    /**
     * Admin/SROTS Dev: Approve a PENDING payment.
     * Updates StudentProfile.premiumStartDate = today, premiumEndDate = today + plan months.
     * Sends activation email to student.
     */
    PaymentResponse verifyPayment(String paymentId, String adminId);

    /**
     * Admin/SROTS Dev: Reject a PENDING payment with a mandatory reason.
     * Sends rejection email to student.
     */
    PaymentResponse rejectPayment(String paymentId, String adminId, String reason);

    /**
     * Admin/SROTS Dev: Emergency direct extension — NO payment flow required.
     * If student already has active premium, months are STACKED onto current end date.
     * If premium has lapsed or never existed, starts from today.
     * Sends grant notification email to student.
     *
     * @param studentUserId  The student's user ID to extend.
     * @param months         Number of months to extend (must be > 0).
     * @param adminId        The admin/dev performing the action (for audit logging).
     */
    void grantDirectExtension(String studentUserId, int months, String adminId);
}