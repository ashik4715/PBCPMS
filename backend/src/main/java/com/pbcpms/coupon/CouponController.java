package com.pbcpms.coupon;

import com.pbcpms.shared.dto.ApiResponse;
import com.pbcpms.user.UserRepository;
import com.pbcpms.coupon.dto.CouponIssueRequest;
import com.pbcpms.coupon.dto.CouponResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CouponController {

    private final CouponService couponService;
    private final UserRepository userRepository;

    public CouponController(CouponService couponService, UserRepository userRepository) {
        this.couponService = couponService;
        this.userRepository = userRepository;
    }

    @GetMapping("/coupons/my")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getMyCoupons(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        List<CouponResponse> coupons = couponService.getMyCoupons(ownerId);
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @GetMapping("/admin/coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @PostMapping("/admin/coupons/issue")
    public ResponseEntity<ApiResponse<CouponResponse>> issueCoupon(
            @Valid @RequestBody CouponIssueRequest request) {
        CouponResponse coupon = couponService.issueCoupon(request);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Coupon issued successfully"));
    }
}
