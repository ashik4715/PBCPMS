package com.pbcpms.report;

import com.pbcpms.booking.BookingRepository;
import com.pbcpms.coupon.CouponRepository;
import com.pbcpms.shared.enums.CouponStatus;
import com.pbcpms.pilot.PilotRepository;
import com.pbcpms.report.dto.BookingAnalytics;
import com.pbcpms.report.dto.DashboardStats;
import com.pbcpms.report.dto.MyBookingStats;
import com.pbcpms.shared.enums.BookingStatus;
import com.pbcpms.user.UserRepository;
import com.pbcpms.vessel.VesselRepository;
import com.pbcpms.shared.enums.VesselStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PilotRepository pilotRepository;
    private final VesselRepository vesselRepository;
    private final CouponRepository couponRepository;

    public ReportService(BookingRepository bookingRepository,
                         UserRepository userRepository,
                         PilotRepository pilotRepository,
                         VesselRepository vesselRepository,
                         CouponRepository couponRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.pilotRepository = pilotRepository;
        this.vesselRepository = vesselRepository;
        this.couponRepository = couponRepository;
    }

    public DashboardStats getDashboardStats() {
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long approvedBookings = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long rejectedBookings = bookingRepository.countByStatus(BookingStatus.REJECTED);
        long totalUsers = userRepository.count();
        long totalPilots = pilotRepository.count();
        long activePilots = pilotRepository.findByIsAvailableTrue().size();
        long totalVessels = vesselRepository.count();
        long pendingVessels = vesselRepository.findByStatus(VesselStatus.PENDING).size();

        BigDecimal totalRevenueAmount = bookingRepository.sumFeesByDateRange(
                LocalDateTime.of(2000, 1, 1, 0, 0),
                LocalDateTime.now()
        );

        return DashboardStats.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .approvedBookings(approvedBookings)
                .completedBookings(completedBookings)
                .rejectedBookings(rejectedBookings)
                .totalUsers(totalUsers)
                .totalPilots(totalPilots)
                .activePilots(activePilots)
                .totalVessels(totalVessels)
                .pendingVessels(pendingVessels)
                .totalRevenue(totalBookings)
                .totalRevenueAmount(totalRevenueAmount)
                .build();
    }

    public BookingAnalytics getBookingAnalytics(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        long totalBookings = bookingRepository.countByDateRange(start, end);
        BigDecimal totalRevenue = bookingRepository.sumFeesByDateRange(start, end);

        List<BookingAnalytics.MonthlyStats> monthlyStats = new ArrayList<>();
        YearMonth current = YearMonth.from(startDate);
        YearMonth endMonth = YearMonth.from(endDate);

        while (!current.isAfter(endMonth)) {
            LocalDateTime monthStart = current.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = current.atEndOfMonth().atTime(23, 59, 59);

            long monthBookings = bookingRepository.countByDateRange(monthStart, monthEnd);
            BigDecimal monthRevenue = bookingRepository.sumFeesByDateRange(monthStart, monthEnd);

            monthlyStats.add(BookingAnalytics.MonthlyStats.builder()
                    .month(current.format(DateTimeFormatter.ofPattern("yyyy-MM")))
                    .bookings(monthBookings)
                    .revenue(monthRevenue)
                    .build());

            current = current.plusMonths(1);
        }

        return BookingAnalytics.builder()
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .monthlyStats(monthlyStats)
                .build();
    }

    public MyBookingStats getMyBookingStats(Long ownerId) {
        long totalBookings = bookingRepository.findByOwnerId(ownerId).size();
        long pendingBookings = bookingRepository.findByOwnerIdAndStatus(ownerId, BookingStatus.PENDING).size();
        long approvedBookings = bookingRepository.findByOwnerIdAndStatus(ownerId, BookingStatus.APPROVED).size();
        long completedBookings = bookingRepository.findByOwnerIdAndStatus(ownerId, BookingStatus.COMPLETED).size();
        long rejectedBookings = bookingRepository.findByOwnerIdAndStatus(ownerId, BookingStatus.REJECTED).size();

        BigDecimal totalSpent = bookingRepository.findByOwnerId(ownerId).stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> b.getTotalFee())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeCoupons = couponRepository.findByOwnerId(ownerId).stream()
                .filter(c -> c.getStatus() == CouponStatus.ACTIVE)
                .count();

        return MyBookingStats.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .approvedBookings(approvedBookings)
                .completedBookings(completedBookings)
                .rejectedBookings(rejectedBookings)
                .totalSpent(totalSpent)
                .activeCoupons(activeCoupons)
                .build();
    }
}
