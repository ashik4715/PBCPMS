package com.pbcpms.route.dto;

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
public class RouteResponse {
    private Long id;
    private String name;
    private String origin;
    private String destination;
    private BigDecimal distanceKm;
    private BigDecimal fee;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
