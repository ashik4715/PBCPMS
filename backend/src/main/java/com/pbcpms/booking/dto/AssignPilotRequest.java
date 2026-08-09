package com.pbcpms.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignPilotRequest {

    @NotNull(message = "Pilot ID is required")
    private Long pilotId;
}
