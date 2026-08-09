package com.pbcpms.booking;

import com.pbcpms.shared.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByOwnerId(Long ownerId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByOwnerIdAndStatus(Long ownerId, BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :start AND :end")
    long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(b.totalFee), 0) FROM Booking b WHERE b.createdAt BETWEEN :start AND :end")
    java.math.BigDecimal sumFeesByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByStatus(BookingStatus status);
}
