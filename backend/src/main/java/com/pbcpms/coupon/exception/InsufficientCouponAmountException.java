package com.pbcpms.coupon.exception;

public class InsufficientCouponAmountException extends RuntimeException {
    public InsufficientCouponAmountException(String message) {
        super(message);
    }
}
