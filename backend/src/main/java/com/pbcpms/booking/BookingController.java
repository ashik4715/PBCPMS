package com.pbcpms.booking;

import com.pbcpms.booking.dto.ApplyCouponRequest;
import com.pbcpms.booking.dto.AssignPilotRequest;
import com.pbcpms.booking.dto.BookingRequest;
import com.pbcpms.booking.dto.BookingResponse;
import com.pbcpms.shared.dto.ApiResponse;
import com.pbcpms.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        List<BookingResponse> bookings = bookingService.getMyBookings(ownerId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        BookingResponse booking = bookingService.createBooking(request, ownerId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking created successfully"));
    }

    @PostMapping("/bookings/{id}/apply-coupon")
    public ResponseEntity<ApiResponse<BookingResponse>> applyCoupon(
            @PathVariable Long id,
            @Valid @RequestBody ApplyCouponRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        BookingResponse booking = bookingService.applyCoupon(id, request, ownerId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Coupon applied successfully"));
    }

    @PostMapping("/bookings/validate-coupon")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> validateCoupon(
            @RequestBody java.util.Map<String, Object> request,
            @RequestParam Long routeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        String couponCode = (String) request.get("couponCode");
        java.util.Map<String, Object> result = bookingService.validateCouponForPreview(couponCode, ownerId, routeId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/admin/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @PutMapping("/admin/bookings/{id}/approve")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        BookingResponse booking = bookingService.approveBooking(id, adminId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking approved"));
    }

    @PutMapping("/admin/bookings/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        BookingResponse booking = bookingService.rejectBooking(id, adminId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking rejected"));
    }

    @PutMapping("/admin/bookings/{id}/assign-pilot")
    public ResponseEntity<ApiResponse<BookingResponse>> assignPilot(
            @PathVariable Long id,
            @Valid @RequestBody AssignPilotRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        BookingResponse booking = bookingService.assignPilot(id, request, adminId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Pilot assigned successfully"));
    }

    @PutMapping("/admin/bookings/{id}/start-service")
    public ResponseEntity<ApiResponse<BookingResponse>> startService(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        BookingResponse booking = bookingService.startService(id, adminId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Service started"));
    }

    @PutMapping("/admin/bookings/{id}/complete-service")
    public ResponseEntity<ApiResponse<BookingResponse>> completeService(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        BookingResponse booking = bookingService.completeService(id, adminId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Service completed"));
    }
}
