//package com.srots.dto.premiumpaymentdto;
//
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class PremiumAccessStatus {
//    /**
//     * ACTIVE              - premium is valid
//     * PENDING_VERIFICATION - submitted payment awaiting review
//     * REJECTED            - last payment was rejected
//     * EXPIRED             - premium has lapsed and no pending payment
//     */
//    private String accessState;
//    private String message;
//    private String rejectionReason; // only when REJECTED
//	public PremiumAccessStatus() {
//		super();
//		// TODO Auto-generated constructor stub
//	}
//	public PremiumAccessStatus(String accessState, String message, String rejectionReason) {
//		super();
//		this.accessState = accessState;
//		this.message = message;
//		this.rejectionReason = rejectionReason;
//	}
//	public String getAccessState() {
//		return accessState;
//	}
//	public void setAccessState(String accessState) {
//		this.accessState = accessState;
//	}
//	public String getMessage() {
//		return message;
//	}
//	public void setMessage(String message) {
//		this.message = message;
//	}
//	public String getRejectionReason() {
//		return rejectionReason;
//	}
//	public void setRejectionReason(String rejectionReason) {
//		this.rejectionReason = rejectionReason;
//	}
//    
//    
//}


package com.srots.dto.premiumpaymentdto;

/**
 * Returned by AuthController as HTTP 402 when a student's premium is not active.
 * Also returned by GET /my-status for already-logged-in students.
 *
 * ── WHY userId IS ADDED ───────────────────────────────────────────────────────
 *
 * When login returns 402, no JWT is issued. The frontend shows PremiumPaymentPage
 * which must submit to POST /public/submit (a no-JWT endpoint). That endpoint
 * cannot use @AuthenticationPrincipal — it needs userId from somewhere else.
 *
 * We include it in the 402 body here so the frontend can store it in React state
 * (App.tsx: setPremiumUserId) and send it as a multipart form field.
 *
 * The /public/submit endpoint validates that userId exists in the DB and has
 * STUDENT role, so there is no security risk in including it here.
 *
 * The 3-arg constructor (without userId) is preserved for call sites inside
 * PremiumPaymentServiceImpl.checkPremiumAccess() which is called from /my-status
 * (student is already authenticated there — userId not needed in response).
 * AuthController uses the 4-arg constructor when building the 402 response.
 */
public class PremiumAccessStatus {

    /** ACTIVE | PENDING_VERIFICATION | REJECTED | EXPIRED */
    private String accessState;

    /** Human-readable message shown in the frontend. */
    private String message;

    /** Only populated when accessState == REJECTED. */
    private String rejectionReason;

    /**
     * The student's userId — included in 402 responses from AuthController
     * so the frontend can pass it to POST /public/submit.
     * Null in /my-status responses (student already has JWT there).
     */
    private String userId;

    // ── Constructors ──────────────────────────────────────────────────────────

    /** Required by Jackson for deserialization. */
    public PremiumAccessStatus() {}

    /**
     * 3-arg — used by PremiumPaymentServiceImpl.checkPremiumAccess().
     * Called from /my-status (JWT present, userId not needed in response body).
     */
    public PremiumAccessStatus(String accessState, String message, String rejectionReason) {
        this.accessState     = accessState;
        this.message         = message;
        this.rejectionReason = rejectionReason;
    }

    /**
     * 4-arg — used by AuthController when returning HTTP 402.
     * Includes userId so the frontend payment page can call /public/submit.
     */
    public PremiumAccessStatus(String accessState, String message, String rejectionReason, String userId) {
        this.accessState     = accessState;
        this.message         = message;
        this.rejectionReason = rejectionReason;
        this.userId          = userId;
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getAccessState()     { return accessState; }
    public String getMessage()         { return message; }
    public String getRejectionReason() { return rejectionReason; }
    public String getUserId()          { return userId; }

    public void setAccessState(String accessState)         { this.accessState     = accessState; }
    public void setMessage(String message)                 { this.message         = message; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public void setUserId(String userId)                   { this.userId          = userId; }
}