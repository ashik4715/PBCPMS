package com.pbcpms.coupon.dto;

import com.pbcpms.shared.enums.CouponStatus;
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
public class CouponResponse {
    private Long id;
    private String code;
    private Long ownerId;
    private String ownerName;
    private BigDecimal amount;
    private CouponStatus status;
    private LocalDateTime issuedAt;
    private LocalDateTime usedAt;
    private LocalDateTime expiresAt;
}
