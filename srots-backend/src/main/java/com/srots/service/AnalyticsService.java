package com.srots.service;

import com.srots.dto.analytics.AnalyticsOverviewDTO;
import com.srots.dto.analytics.SystemAnalyticsDTO;

public interface AnalyticsService {
    /** System-wide overview (ADMIN/SROTS_DEV) */
    AnalyticsOverviewDTO getOverview();

    /** College-scoped overview (CPH/STAFF) */
    AnalyticsOverviewDTO getOverviewByCollege(String collegeId);

    SystemAnalyticsDTO getSystemAnalytics();
}
