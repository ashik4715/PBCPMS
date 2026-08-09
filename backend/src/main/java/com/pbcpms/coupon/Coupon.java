package com.pbcpms.coupon;

import com.pbcpms.shared.enums.CouponStatus;
import com.pbcpms.user.User;
import jakarta.persistence.*;
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
@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CouponStatus status = CouponStatus.ACTIVE;

    @Builder.Default
    private LocalDateTime issuedAt = LocalDateTime.now();

    private LocalDateTime usedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;
}
