package com.pbcpms.route.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {

    @NotBlank(message = "Route name is required")
    private String name;

    @NotBlank(message = "Origin is required")
    private String origin;

    @NotBlank(message = "Destination is required")
    private String destination;

    private BigDecimal distanceKm;

    @NotNull(message = "Fee is required")
    private BigDecimal fee;
}
