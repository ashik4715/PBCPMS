package com.pbcpms.coupon.exception;

public class CouponAlreadyUsedException extends RuntimeException {
    public CouponAlreadyUsedException(String message) {
        super(message);
    }
}
