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
public class DashboardStats {
    private long totalBookings;
    private long pendingBookings;
    private long approvedBookings;
    private long completedBookings;
    private long rejectedBookings;
    private long totalUsers;
    private long totalPilots;
    private long activePilots;
    private long totalVessels;
    private long pendingVessels;
    private long totalRevenue;
    private BigDecimal totalRevenueAmount;
}
