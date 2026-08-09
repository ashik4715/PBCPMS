package com.pbcpms.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAnalytics {
    private long totalBookings;
    private BigDecimal totalRevenue;
    private long completedBookings;
    private long pendingBookings;
    private List<MonthlyStats> monthlyStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStats {
        private String month;
        private long bookings;
        private BigDecimal revenue;
    }
}
