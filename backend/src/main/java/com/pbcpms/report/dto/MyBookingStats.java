package com.pbcpms.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyBookingStats {
    private long totalBookings;
    private long pendingBookings;
    private long approvedBookings;
    private long completedBookings;
    private long rejectedBookings;
    private BigDecimal totalSpent;
    private long activeCoupons;
}
