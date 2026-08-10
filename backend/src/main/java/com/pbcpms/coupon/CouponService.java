package com.pbcpms.coupon;

import com.pbcpms.shared.exception.ResourceNotFoundException;
import com.pbcpms.user.User;
import com.pbcpms.user.UserRepository;
import com.pbcpms.coupon.dto.CouponPurchaseRequest;
import com.pbcpms.coupon.dto.CouponResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    public CouponService(CouponRepository couponRepository, UserRepository userRepository) {
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
    }

    public List<CouponResponse> getMyCoupons(Long ownerId) {
        return couponRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CouponResponse> getCouponPurchaseHistory() {
        return couponRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CouponResponse purchaseCoupon(CouponPurchaseRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String code;
        do {
            code = "CPN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (couponRepository.existsByCode(code));

        Coupon coupon = Coupon.builder()
                .code(code)
                .owner(owner)
                .amount(request.getAmount())
                .expiresAt(request.getExpiresAt())
                .purchasedAt(LocalDateTime.now())
                .build();

        couponRepository.save(coupon);
        return toResponse(coupon);
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .ownerId(coupon.getOwner().getId())
                .ownerName(coupon.getOwner().getFullName())
                .amount(coupon.getAmount())
                .status(coupon.getStatus())
                .issuedAt(coupon.getIssuedAt())
                .purchasedAt(coupon.getPurchasedAt())
                .usedAt(coupon.getUsedAt())
                .expiresAt(coupon.getExpiresAt())
                .build();
    }
}
