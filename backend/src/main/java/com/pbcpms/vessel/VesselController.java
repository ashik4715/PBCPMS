package com.pbcpms.vessel;

import com.pbcpms.shared.dto.ApiResponse;
import com.pbcpms.shared.enums.VesselStatus;
import com.pbcpms.user.UserRepository;
import com.pbcpms.vessel.dto.VesselRequest;
import com.pbcpms.vessel.dto.VesselResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class VesselController {

    private final VesselService vesselService;
    private final UserRepository userRepository;

    public VesselController(VesselService vesselService, UserRepository userRepository) {
        this.vesselService = vesselService;
        this.userRepository = userRepository;
    }

    @GetMapping("/vessels/my")
    public ResponseEntity<ApiResponse<List<VesselResponse>>> getMyVessels(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        List<VesselResponse> vessels = vesselService.getMyVessels(ownerId);
        return ResponseEntity.ok(ApiResponse.success(vessels));
    }

    @PostMapping("/vessels")
    public ResponseEntity<ApiResponse<VesselResponse>> createVessel(
            @Valid @RequestBody VesselRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long ownerId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        VesselResponse vessel = vesselService.createVessel(request, ownerId);
        return ResponseEntity.ok(ApiResponse.success(vessel, "Vessel created successfully"));
    }

    @GetMapping("/admin/vessels")
    public ResponseEntity<ApiResponse<List<VesselResponse>>> getVesselsByStatus(
            @RequestParam(required = false) VesselStatus status) {
        List<VesselResponse> vessels;
        if (status != null) {
            vessels = vesselService.getVesselsByStatus(status);
        } else {
            vessels = vesselService.getAllVessels();
        }
        return ResponseEntity.ok(ApiResponse.success(vessels));
    }

    @PutMapping("/admin/vessels/{id}/approve")
    public ResponseEntity<ApiResponse<VesselResponse>> approveVessel(@PathVariable Long id) {
        VesselResponse vessel = vesselService.approveVessel(id);
        return ResponseEntity.ok(ApiResponse.success(vessel, "Vessel approved"));
    }

    @PutMapping("/admin/vessels/{id}/reject")
    public ResponseEntity<ApiResponse<VesselResponse>> rejectVessel(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        VesselResponse vessel = vesselService.rejectVessel(id, notes);
        return ResponseEntity.ok(ApiResponse.success(vessel, "Vessel rejected"));
    }
}
