package com.pbcpms.booking;

import com.pbcpms.booking.exception.InvalidBookingTransitionException;
import com.pbcpms.shared.enums.BookingStatus;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class BookingStateMachine {

    private final Map<BookingStatus, Set<BookingStatus>> transitions = new EnumMap<>(BookingStatus.class);

    public BookingStateMachine() {
        transitions.put(BookingStatus.PENDING, EnumSet.of(BookingStatus.ASSIGNED, BookingStatus.REJECTED));
        transitions.put(BookingStatus.ASSIGNED, EnumSet.of(BookingStatus.APPROVED, BookingStatus.REJECTED));
        transitions.put(BookingStatus.APPROVED, EnumSet.of(BookingStatus.IN_PROGRESS));
        transitions.put(BookingStatus.IN_PROGRESS, EnumSet.of(BookingStatus.COMPLETED));
        transitions.put(BookingStatus.COMPLETED, EnumSet.noneOf(BookingStatus.class));
        transitions.put(BookingStatus.REJECTED, EnumSet.noneOf(BookingStatus.class));
    }

    public void validateTransition(BookingStatus current, BookingStatus target) {
        Set<BookingStatus> allowed = transitions.get(current);
        if (allowed == null || !allowed.contains(target)) {
            throw new InvalidBookingTransitionException(
                    "Cannot transition from " + current + " to " + target);
        }
    }
}
