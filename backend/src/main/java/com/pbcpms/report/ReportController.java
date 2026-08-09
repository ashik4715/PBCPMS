package com.pbcpms.report;

import com.pbcpms.report.dto.BookingAnalytics;
import com.pbcpms.report.dto.DashboardStats;
import com.pbcpms.report.dto.MyBookingStats;
import com.pbcpms.shared.dto.ApiResponse;
import com.pbcpms.user.UserRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @GetMapping("/admin/reports/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        DashboardStats stats = reportService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/admin/reports/booking-analytics")
    public ResponseEntity<ApiResponse<BookingAnalytics>> getBookingAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        BookingAnalytics analytics = reportService.getBookingAnalytics(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/reports/my-bookings")
    public ResponseEntity<ApiResponse<MyBookingStats>> getMyBookingStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        MyBookingStats stats = reportService.getMyBookingStats(ownerId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
