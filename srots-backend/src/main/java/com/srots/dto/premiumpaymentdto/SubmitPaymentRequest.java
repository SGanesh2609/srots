package com.srots.dto.premiumpaymentdto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitPaymentRequest {
    private String utrNumber;
    private String premiumMonths;   // "FOUR_MONTHS" | "SIX_MONTHS" | "TWELVE_MONTHS"
    private BigDecimal amount;
    private String username;        // Username the student confirms payment is for
	public SubmitPaymentRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SubmitPaymentRequest(String utrNumber, String premiumMonths, BigDecimal amount, String username) {
		super();
		this.utrNumber = utrNumber;
		this.premiumMonths = premiumMonths;
		this.amount = amount;
		this.username = username;
	}
	public String getUtrNumber() {
		return utrNumber;
	}
	public void setUtrNumber(String utrNumber) {
		this.utrNumber = utrNumber;
	}
	public String getPremiumMonths() {
		return premiumMonths;
	}
	public void setPremiumMonths(String premiumMonths) {
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
    
    // paymentScreenshotUrl is resolved after file upload; sent as separate multipart field
}