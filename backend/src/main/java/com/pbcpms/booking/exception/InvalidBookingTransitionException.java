package com.pbcpms.booking.exception;

public class InvalidBookingTransitionException extends RuntimeException {
    public InvalidBookingTransitionException(String message) {
        super(message);
    }
}
