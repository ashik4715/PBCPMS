package com.pbcpms.booking.dto;

import com.pbcpms.shared.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private Long vesselId;
    private String vesselName;
    private Long routeId;
    private String routeName;
    private Long pilotId;
    private String pilotName;
    private Long couponId;
    private String couponCode;
    private BookingStatus status;
    private BigDecimal totalFee;
    private BigDecimal couponAmount;
    private BigDecimal originalFee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
