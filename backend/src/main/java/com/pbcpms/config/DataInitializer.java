package com.pbcpms.config;

import com.pbcpms.booking.Booking;
import com.pbcpms.booking.BookingRepository;
import com.pbcpms.coupon.Coupon;
import com.pbcpms.coupon.CouponRepository;
import com.pbcpms.pilot.Pilot;
import com.pbcpms.pilot.PilotRepository;
import com.pbcpms.route.Route;
import com.pbcpms.route.RouteRepository;
import com.pbcpms.shared.enums.BookingStatus;
import com.pbcpms.shared.enums.UserRole;
import com.pbcpms.user.User;
import com.pbcpms.user.UserRepository;
import com.pbcpms.vessel.Vessel;
import com.pbcpms.vessel.VesselRepository;
import com.pbcpms.shared.enums.VesselStatus;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VesselRepository vesselRepository;
    private final RouteRepository routeRepository;
    private final PilotRepository pilotRepository;
    private final CouponRepository couponRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           VesselRepository vesselRepository,
                           RouteRepository routeRepository,
                           PilotRepository pilotRepository,
                           CouponRepository couponRepository,
                           BookingRepository bookingRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vesselRepository = vesselRepository;
        this.routeRepository = routeRepository;
        this.pilotRepository = pilotRepository;
        this.couponRepository = couponRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        User admin = userRepository.save(User.builder()
                .email("admin@pbcpms.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .fullName("Admin User")
                .phone("+1234567890")
                .role(UserRole.ADMIN)
                .build());

        User owner = userRepository.save(User.builder()
                .email("owner@pbcpms.com")
                .passwordHash(passwordEncoder.encode("owner123"))
                .fullName("John Owner")
                .phone("+0987654321")
                .role(UserRole.OWNER)
                .build());

        Vessel vessel1 = vesselRepository.save(Vessel.builder()
                .owner(owner)
                .name("MV Ocean Star")
                .type("Vessel")
                .registrationNumber("REG-001")
                .status(VesselStatus.APPROVED)
                .build());

        Vessel vessel2 = vesselRepository.save(Vessel.builder()
                .owner(owner)
                .name("Truck Alpha")
                .type("Vehicle")
                .registrationNumber("REG-002")
                .status(VesselStatus.APPROVED)
                .build());

        Vessel vessel3 = vesselRepository.save(Vessel.builder()
                .owner(owner)
                .name("MV Sea Breeze")
                .type("Vessel")
                .registrationNumber("REG-003")
                .status(VesselStatus.PENDING)
                .build());

        Route route1 = routeRepository.save(Route.builder()
                .name("Dhaka - Chittagong")
                .origin("Dhaka")
                .destination("Chittagong")
                .distanceKm(new BigDecimal("264.00"))
                .fee(new BigDecimal("500.00"))
                .isActive(true)
                .build());

        Route route2 = routeRepository.save(Route.builder()
                .name("Dhaka - Sylhet")
                .origin("Dhaka")
                .destination("Sylhet")
                .distanceKm(new BigDecimal("196.00"))
                .fee(new BigDecimal("350.00"))
                .isActive(true)
                .build());

        Route route3 = routeRepository.save(Route.builder()
                .name("Chittagong - Cox's Bazar")
                .origin("Chittagong")
                .destination("Cox's Bazar")
                .distanceKm(new BigDecimal("150.00"))
                .fee(new BigDecimal("250.00"))
                .isActive(true)
                .build());

        Route route4 = routeRepository.save(Route.builder()
                .name("Dhaka - Rajshahi")
                .origin("Dhaka")
                .destination("Rajshahi")
                .distanceKm(new BigDecimal("230.00"))
                .fee(new BigDecimal("400.00"))
                .isActive(true)
                .build());

        Route route5 = routeRepository.save(Route.builder()
                .name("Dhaka - Khulna")
                .origin("Dhaka")
                .destination("Khulna")
                .distanceKm(new BigDecimal("200.00"))
                .fee(new BigDecimal("300.00"))
                .isActive(true)
                .build());

        Pilot pilot1 = pilotRepository.save(Pilot.builder()
                .name("Captain Rahman")
                .email("rahman@pbcpms.com")
                .phone("+1122334455")
                .licenseNumber("LIC-001")
                .isAvailable(true)
                .build());

        Pilot pilot2 = pilotRepository.save(Pilot.builder()
                .name("First Officer Ahmed")
                .email("ahmed@pbcpms.com")
                .phone("+2233445566")
                .licenseNumber("LIC-002")
                .isAvailable(true)
                .build());

        Pilot pilot3 = pilotRepository.save(Pilot.builder()
                .name("Pilot Khan")
                .email("khan@pbcpms.com")
                .phone("+3344556677")
                .licenseNumber("LIC-003")
                .isAvailable(false)
                .build());

        for (int i = 1; i <= 10; i++) {
            couponRepository.save(Coupon.builder()
                    .code("CPN-SAMPLE-" + String.format("%03d", i))
                    .owner(owner)
                    .amount(new BigDecimal(100 * i + ".00"))
                    .expiresAt(LocalDateTime.now().plusMonths(6))
                    .build());
        }

        Booking booking1 = bookingRepository.save(Booking.builder()
                .owner(owner)
                .vessel(vessel1)
                .route(route1)
                .pilot(pilot1)
                .status(BookingStatus.COMPLETED)
                .totalFee(new BigDecimal("500.00"))
                .build());

        Booking booking2 = bookingRepository.save(Booking.builder()
                .owner(owner)
                .vessel(vessel2)
                .route(route2)
                .pilot(pilot2)
                .status(BookingStatus.IN_PROGRESS)
                .totalFee(new BigDecimal("350.00"))
                .build());

        Booking booking3 = bookingRepository.save(Booking.builder()
                .owner(owner)
                .vessel(vessel1)
                .route(route3)
                .status(BookingStatus.ASSIGNED)
                .totalFee(new BigDecimal("250.00"))
                .build());

        Booking booking4 = bookingRepository.save(Booking.builder()
                .owner(owner)
                .vessel(vessel2)
                .route(route4)
                .status(BookingStatus.APPROVED)
                .totalFee(new BigDecimal("400.00"))
                .build());

        Booking booking5 = bookingRepository.save(Booking.builder()
                .owner(owner)
                .vessel(vessel1)
                .route(route5)
                .status(BookingStatus.PENDING)
                .totalFee(new BigDecimal("300.00"))
                .build());
    }
}
