package com.pbcpms.booking;

import com.pbcpms.booking.dto.ApplyCouponRequest;
import com.pbcpms.booking.dto.AssignPilotRequest;
import com.pbcpms.booking.dto.BookingRequest;
import com.pbcpms.booking.dto.BookingResponse;
import com.pbcpms.booking.exception.VesselNotApprovedException;
import com.pbcpms.coupon.Coupon;
import com.pbcpms.coupon.CouponPolicyService;
import com.pbcpms.coupon.CouponRepository;
import com.pbcpms.pilot.Pilot;
import com.pbcpms.pilot.PilotRepository;
import com.pbcpms.route.Route;
import com.pbcpms.route.RouteRepository;
import com.pbcpms.shared.enums.BookingStatus;
import com.pbcpms.shared.enums.CouponStatus;
import com.pbcpms.shared.enums.VesselStatus;
import com.pbcpms.shared.exception.ResourceNotFoundException;
import com.pbcpms.user.User;
import com.pbcpms.user.UserRepository;
import com.pbcpms.vessel.Vessel;
import com.pbcpms.vessel.VesselRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingEventRepository bookingEventRepository;
    private final BookingStateMachine stateMachine;
    private final VesselRepository vesselRepository;
    private final RouteRepository routeRepository;
    private final PilotRepository pilotRepository;
    private final UserRepository userRepository;
    private final CouponPolicyService couponPolicyService;
    private final CouponRepository couponRepository;

    public BookingService(BookingRepository bookingRepository,
                          BookingEventRepository bookingEventRepository,
                          BookingStateMachine stateMachine,
                          VesselRepository vesselRepository,
                          RouteRepository routeRepository,
                          PilotRepository pilotRepository,
                          UserRepository userRepository,
                          CouponPolicyService couponPolicyService,
                          CouponRepository couponRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingEventRepository = bookingEventRepository;
        this.stateMachine = stateMachine;
        this.vesselRepository = vesselRepository;
        this.routeRepository = routeRepository;
        this.pilotRepository = pilotRepository;
        this.userRepository = userRepository;
        this.couponPolicyService = couponPolicyService;
        this.couponRepository = couponRepository;
    }

    public List<BookingResponse> getMyBookings(Long ownerId) {
        return bookingRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Vessel vessel = vesselRepository.findById(request.getVesselId())
                .orElseThrow(() -> new ResourceNotFoundException("Vessel not found"));

        if (vessel.getStatus() != VesselStatus.APPROVED) {
            throw new VesselNotApprovedException("Vessel must be approved before booking");
        }

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));

        Booking booking = Booking.builder()
                .owner(owner)
                .vessel(vessel)
                .route(route)
                .status(BookingStatus.PENDING)
                .totalFee(route.getFee())
                .build();

        bookingRepository.save(booking);

        recordEvent(booking, null, BookingStatus.PENDING, owner, "Booking created");

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse approveBooking(Long bookingId, Long adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.APPROVED);
        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.APPROVED);
        bookingRepository.save(booking);

        recordEvent(booking, previousStatus, BookingStatus.APPROVED, admin, "Booking approved");

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse rejectBooking(Long bookingId, Long adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.REJECTED);
        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.REJECTED);
        bookingRepository.save(booking);

        recordEvent(booking, previousStatus, BookingStatus.REJECTED, admin, "Booking rejected");

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse assignPilot(Long bookingId, AssignPilotRequest request, Long adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        Pilot pilot = pilotRepository.findById(request.getPilotId())
                .orElseThrow(() -> new ResourceNotFoundException("Pilot not found"));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.ASSIGNED);
        BookingStatus previousStatus = booking.getStatus();
        booking.setPilot(pilot);
        booking.setStatus(BookingStatus.ASSIGNED);
        bookingRepository.save(booking);

        recordEvent(booking, previousStatus, BookingStatus.ASSIGNED, admin,
                "Pilot " + pilot.getName() + " assigned");

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse startService(Long bookingId, Long pilotId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.IN_PROGRESS);
        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.IN_PROGRESS);
        bookingRepository.save(booking);

        User pilotUser = userRepository.findById(pilotId).orElse(null);
        if (pilotUser != null) {
            recordEvent(booking, previousStatus, BookingStatus.IN_PROGRESS, pilotUser, "Service started");
        }

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse completeService(Long bookingId, Long pilotId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.COMPLETED);
        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        User pilotUser = userRepository.findById(pilotId).orElse(null);
        if (pilotUser != null) {
            recordEvent(booking, previousStatus, BookingStatus.COMPLETED, pilotUser, "Service completed");
        }

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse applyCoupon(Long bookingId, ApplyCouponRequest request, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getOwner().getId().equals(ownerId)) {
            throw new com.pbcpms.shared.exception.ForbiddenException("Not authorized to modify this booking");
        }

        if (booking.getCoupon() != null) {
            throw new com.pbcpms.shared.exception.BadRequestException("A coupon is already applied to this booking");
        }

        Coupon coupon = couponPolicyService.validateAndUse(request.getCouponCode(), owner, booking.getRoute());
        booking.setCoupon(coupon);

        BigDecimal originalFee = booking.getRoute().getFee();
        BigDecimal discount = coupon.getAmount().min(originalFee);
        BigDecimal finalFee = originalFee.subtract(discount);
        booking.setTotalFee(finalFee);

        bookingRepository.save(booking);

        return toResponse(booking);
    }

    public Map<String, Object> validateCouponForPreview(String couponCode, Long ownerId, Long routeId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));

        java.util.Optional<Coupon> couponOpt = couponRepository.findByCode(couponCode);

        Map<String, Object> result = new HashMap<>();
        result.put("valid", false);
        result.put("routeFee", route.getFee());
        result.put("message", "");

        if (couponOpt.isEmpty()) {
            result.put("couponCode", couponCode);
            result.put("couponAmount", null);
            result.put("message", "Coupon not found: " + couponCode);
            return result;
        }

        Coupon coupon = couponOpt.get();
        result.put("couponCode", coupon.getCode());
        result.put("couponAmount", coupon.getAmount());

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            result.put("message", "Coupon has already been used");
            return result;
        }
        if (coupon.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            result.put("message", "Coupon has expired");
            return result;
        }
        if (!coupon.getOwner().getId().equals(ownerId)) {
            result.put("message", "Coupon does not belong to this owner");
            return result;
        }
        if (coupon.getAmount().compareTo(route.getFee()) > 0) {
            result.put("message", "Coupon amount ($" + coupon.getAmount() + ") exceeds the route fare ($" + route.getFee() + "). Please use a smaller coupon.");
            return result;
        }

        result.put("valid", true);
        BigDecimal discount = coupon.getAmount().min(route.getFee());
        result.put("discount", discount);
        result.put("finalAmount", route.getFee().subtract(discount));
        result.put("message", "Coupon applied successfully");
        return result;
    }

    private void recordEvent(Booking booking, BookingStatus fromStatus, BookingStatus toStatus,
                             User changedBy, String note) {
        BookingEvent event = BookingEvent.builder()
                .booking(booking)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .changedBy(changedBy)
                .note(note)
                .build();
        bookingEventRepository.save(event);
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .ownerId(booking.getOwner().getId())
                .ownerName(booking.getOwner().getFullName())
                .vesselId(booking.getVessel().getId())
                .vesselName(booking.getVessel().getName())
                .routeId(booking.getRoute().getId())
                .routeName(booking.getRoute().getName())
                .pilotId(booking.getPilot() != null ? booking.getPilot().getId() : null)
                .pilotName(booking.getPilot() != null ? booking.getPilot().getName() : null)
                .couponId(booking.getCoupon() != null ? booking.getCoupon().getId() : null)
                .couponCode(booking.getCoupon() != null ? booking.getCoupon().getCode() : null)
                .status(booking.getStatus())
                .totalFee(booking.getTotalFee())
                .couponAmount(booking.getCoupon() != null ? booking.getCoupon().getAmount() : null)
                .originalFee(booking.getCoupon() != null ? booking.getRoute().getFee() : null)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
