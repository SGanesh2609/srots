package com.srots.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stores student premium subscription payment submissions.
 * A student submits UTR, screenshot, and months desired.
 * SROTS Admin/Dev verifies or rejects the payment.
 * On verification, premiumStartDate and premiumEndDate in StudentProfile are updated.
 */
@Entity
@Table(
    name = "premium_payment_data",
    indexes = {
        @Index(name = "idx_payment_user_status", columnList = "user_id, status"),
        @Index(name = "idx_payment_college",     columnList = "college_id"),
        @Index(name = "idx_payment_submitted",   columnList = "submitted_at")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class PremiumPayment {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    // ── Submitter ──────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "studentProfile",
                           "educationRecords", "experiences", "projects", "certifications",
                           "languages", "socialLinks", "resumes", "skills", "college"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "users", "jobs", "posts"})
    private College college;

    // ── Payment Details ────────────────────────────────────────────────────────
    @Column(name = "utr_number", length = 100, nullable = false, unique = true)
    private String utrNumber;

    @Column(name = "payment_screenshot_url", columnDefinition = "TEXT")
    private String paymentScreenshotUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "premium_months", nullable = false)
    private PremiumMonths premiumMonths;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /** The username the student entered in the payment form (confirms who they paid for). */
    @Column(nullable = false, length = 100)
    private String username;

    // ── Status ─────────────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_admin_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "studentProfile",
                           "educationRecords", "experiences", "projects", "certifications",
                           "languages", "socialLinks", "resumes", "skills", "college"})
    private User verifiedByAdmin;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // ── Enums ──────────────────────────────────────────────────────────────────
    public enum PaymentStatus {
        PENDING, VERIFIED, REJECTED
    }

    public enum PremiumMonths {
        FOUR_MONTHS(4, new java.math.BigDecimal("300")),
        SIX_MONTHS(6, new java.math.BigDecimal("400")),
        TWELVE_MONTHS(12, new java.math.BigDecimal("700"));

        private final int months;
        private final java.math.BigDecimal expectedAmount;

        PremiumMonths(int months, java.math.BigDecimal expectedAmount) {
            this.months = months;
            this.expectedAmount = expectedAmount;
        }

        public int getMonths() { return months; }
        public java.math.BigDecimal getExpectedAmount() { return expectedAmount; }

        public String getDisplayLabel() {
            return months + " Months — ₹" + expectedAmount.toPlainString();
        }
    }

	public PremiumPayment() {
		super();
		// TODO Auto-generated constructor stub
	}

	public PremiumPayment(String id, User user, College college, String utrNumber, String paymentScreenshotUrl,
			PremiumMonths premiumMonths, BigDecimal amount, String username, PaymentStatus status,
			LocalDateTime submittedAt, LocalDateTime verifiedAt, User verifiedByAdmin, String rejectionReason) {
		super();
		this.id = id;
		this.user = user;
		this.college = college;
		this.utrNumber = utrNumber;
		this.paymentScreenshotUrl = paymentScreenshotUrl;
		this.premiumMonths = premiumMonths;
		this.amount = amount;
		this.username = username;
		this.status = status;
		this.submittedAt = submittedAt;
		this.verifiedAt = verifiedAt;
		this.verifiedByAdmin = verifiedByAdmin;
		this.rejectionReason = rejectionReason;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public College getCollege() {
		return college;
	}

	public void setCollege(College college) {
		this.college = college;
	}

	public String getUtrNumber() {
		return utrNumber;
	}

	public void setUtrNumber(String utrNumber) {
		this.utrNumber = utrNumber;
	}

	public String getPaymentScreenshotUrl() {
		return paymentScreenshotUrl;
	}

	public void setPaymentScreenshotUrl(String paymentScreenshotUrl) {
		this.paymentScreenshotUrl = paymentScreenshotUrl;
	}

	public PremiumMonths getPremiumMonths() {
		return premiumMonths;
	}

	public void setPremiumMonths(PremiumMonths premiumMonths) {
		this.premiumMonths = premiumMonths;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public PaymentStatus getStatus() {
		return status;
	}

	public void setStatus(PaymentStatus status) {
		this.status = status;
	}

	public LocalDateTime getSubmittedAt() {
		return submittedAt;
	}

	public void setSubmittedAt(LocalDateTime submittedAt) {
		this.submittedAt = submittedAt;
	}

	public LocalDateTime getVerifiedAt() {
		return verifiedAt;
	}

	public void setVerifiedAt(LocalDateTime verifiedAt) {
		this.verifiedAt = verifiedAt;
	}

	public User getVerifiedByAdmin() {
		return verifiedByAdmin;
	}

	public void setVerifiedByAdmin(User verifiedByAdmin) {
		this.verifiedByAdmin = verifiedByAdmin;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}

	
}