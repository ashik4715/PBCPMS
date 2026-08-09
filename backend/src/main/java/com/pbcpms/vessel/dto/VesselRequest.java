package com.pbcpms.vessel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VesselRequest {

    @NotBlank(message = "Vessel name is required")
    private String name;

    @NotBlank(message = "Vessel type is required")
    private String type;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;
}
