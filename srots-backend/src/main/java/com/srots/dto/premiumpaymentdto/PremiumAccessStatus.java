package com.srots.dto.premiumpaymentdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PremiumAccessStatus {
    /**
     * ACTIVE              - premium is valid
     * PENDING_VERIFICATION - submitted payment awaiting review
     * REJECTED            - last payment was rejected
     * EXPIRED             - premium has lapsed and no pending payment
     */
    private String accessState;
    private String message;
    private String rejectionReason; // only when REJECTED
	public PremiumAccessStatus() {
		super();
		// TODO Auto-generated constructor stub
	}
	public PremiumAccessStatus(String accessState, String message, String rejectionReason) {
		super();
		this.accessState = accessState;
		this.message = message;
		this.rejectionReason = rejectionReason;
	}
	public String getAccessState() {
		return accessState;
	}
	public void setAccessState(String accessState) {
		this.accessState = accessState;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getRejectionReason() {
		return rejectionReason;
	}
	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}
    
    
}