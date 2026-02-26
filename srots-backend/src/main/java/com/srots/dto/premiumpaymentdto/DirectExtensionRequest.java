package com.srots.dto.premiumpaymentdto;

/**
 * Request body for the admin direct extension endpoint.
 *
 * POST /api/v1/premium-payments/direct-extension/{studentUserId}
 *
 * JSON body: { "months": 4 }
 *
 * months must be 4, 6, or 12 to match the PremiumMonths enum values,
 * but the service only validates > 0 so other values are technically
 * accepted if needed for special cases.
 */
public class DirectExtensionRequest {

    private int months;

    public DirectExtensionRequest() {}

    public DirectExtensionRequest(int months) {
        this.months = months;
    }

    public int getMonths() {
        return months;
    }

    public void setMonths(int months) {
        this.months = months;
    }
}