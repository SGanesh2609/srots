package com.srots.dto.premiumpaymentdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentRequest {
    private String paymentId;
    // No extra fields needed; premium dates computed from PremiumMonths

	public VerifyPaymentRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public VerifyPaymentRequest(String paymentId) {
		super();
		this.paymentId = paymentId;
	}
	public String getPaymentId() {
		return paymentId;
	}
	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}
    
    
}
