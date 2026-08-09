package com.pbcpms.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "Vessel ID is required")
    private Long vesselId;

    @NotNull(message = "Route ID is required")
    private Long routeId;
}
