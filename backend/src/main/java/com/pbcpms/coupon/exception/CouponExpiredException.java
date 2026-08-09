package com.pbcpms.coupon.exception;

public class CouponExpiredException extends RuntimeException {
    public CouponExpiredException(String message) {
        super(message);
    }
}
