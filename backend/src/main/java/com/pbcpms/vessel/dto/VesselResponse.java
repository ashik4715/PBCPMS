package com.pbcpms.vessel.dto;

import com.pbcpms.shared.enums.VesselStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VesselResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private String type;
    private String registrationNumber;
    private VesselStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
