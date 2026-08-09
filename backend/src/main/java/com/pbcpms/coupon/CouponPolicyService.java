package com.pbcpms.coupon;

import com.pbcpms.coupon.exception.CouponAlreadyUsedException;
import com.pbcpms.coupon.exception.CouponExpiredException;
import com.pbcpms.coupon.exception.CouponNotFoundException;
import com.pbcpms.coupon.exception.CouponOwnershipException;
import com.pbcpms.coupon.exception.InsufficientCouponAmountException;
import com.pbcpms.route.Route;
import com.pbcpms.shared.enums.CouponStatus;
import com.pbcpms.user.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CouponPolicyService {

    private final CouponRepository couponRepository;

    public CouponPolicyService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public Coupon validateAndUse(String code, User owner, Route route) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new CouponNotFoundException("Coupon not found: " + code));

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new CouponAlreadyUsedException("Coupon has already been used");
        }

        if (coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new CouponExpiredException("Coupon has expired");
        }

        if (!coupon.getOwner().getId().equals(owner.getId())) {
            throw new CouponOwnershipException("Coupon does not belong to this owner");
        }

        if (coupon.getAmount().compareTo(route.getFee()) > 0) {
            throw new InsufficientCouponAmountException("Coupon amount exceeds the route fare. Please use a coupon with amount less than or equal to $" + route.getFee());
        }

        coupon.setStatus(CouponStatus.USED);
        coupon.setUsedAt(LocalDateTime.now());
        couponRepository.save(coupon);

        return coupon;
    }
}
