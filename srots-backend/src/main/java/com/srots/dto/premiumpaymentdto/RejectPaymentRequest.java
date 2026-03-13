package com.srots.dto.premiumpaymentdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
// @NoArgsConstructor
// @AllArgsConstructor
public class RejectPaymentRequest {
	private String paymentId;
	private String rejectionReason;

	public RejectPaymentRequest() {
		super();
		// TODO Auto-generated constructor stub
	}

	public RejectPaymentRequest(String paymentId, String rejectionReason) {
		super();
		this.paymentId = paymentId;
		this.rejectionReason = rejectionReason;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}

}
