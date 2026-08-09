package com.pbcpms.pilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PilotResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String licenseNumber;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
