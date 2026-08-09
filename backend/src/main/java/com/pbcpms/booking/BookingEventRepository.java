package com.pbcpms.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingEventRepository extends JpaRepository<BookingEvent, Long> {
    List<BookingEvent> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
}
