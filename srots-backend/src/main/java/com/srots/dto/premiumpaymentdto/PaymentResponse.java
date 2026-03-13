package com.srots.dto.premiumpaymentdto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String id;
    private String userId;
    private String userFullName;
    private String username;
    private String collegeId;
    private String collegeName;
    private String utrNumber;
    private String paymentScreenshotUrl;
    private String premiumMonths;      // enum name
    private String premiumMonthsLabel; // "4 Months — ₹300"
    private int    premiumMonthsCount;
    private BigDecimal amount;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
    private String verifiedByAdminId;
    private String verifiedByAdminName;
    private String rejectionReason;

	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getUserFullName() {
		return userFullName;
	}
	public void setUserFullName(String userFullName) {
		this.userFullName = userFullName;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getCollegeId() {
		return collegeId;
	}
	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
	}
	public String getCollegeName() {
		return collegeName;
	}
	public void setCollegeName(String collegeName) {
		this.collegeName = collegeName;
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
	public String getPremiumMonths() {
		return premiumMonths;
	}
	public void setPremiumMonths(String premiumMonths) {
		this.premiumMonths = premiumMonths;
	}
	public String getPremiumMonthsLabel() {
		return premiumMonthsLabel;
	}
	public void setPremiumMonthsLabel(String premiumMonthsLabel) {
		this.premiumMonthsLabel = premiumMonthsLabel;
	}
	public int getPremiumMonthsCount() {
		return premiumMonthsCount;
	}
	public void setPremiumMonthsCount(int premiumMonthsCount) {
		this.premiumMonthsCount = premiumMonthsCount;
	}
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
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
	public String getVerifiedByAdminId() {
		return verifiedByAdminId;
	}
	public void setVerifiedByAdminId(String verifiedByAdminId) {
		this.verifiedByAdminId = verifiedByAdminId;
	}
	public String getVerifiedByAdminName() {
		return verifiedByAdminName;
	}
	public void setVerifiedByAdminName(String verifiedByAdminName) {
		this.verifiedByAdminName = verifiedByAdminName;
	}
	public String getRejectionReason() {
		return rejectionReason;
	}
	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}
    
    
}
