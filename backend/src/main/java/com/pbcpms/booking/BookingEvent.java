package com.pbcpms.booking;

import com.pbcpms.shared.enums.BookingStatus;
import com.pbcpms.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "booking_events")
public class BookingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    private BookingStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
