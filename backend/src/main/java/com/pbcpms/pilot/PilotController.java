package com.pbcpms.pilot;

import com.pbcpms.shared.dto.ApiResponse;
import com.pbcpms.pilot.dto.PilotRequest;
import com.pbcpms.pilot.dto.PilotResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/pilots")
public class PilotController {

    private final PilotService pilotService;

    public PilotController(PilotService pilotService) {
        this.pilotService = pilotService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PilotResponse>>> getAllPilots() {
        List<PilotResponse> pilots = pilotService.getAllPilots();
        return ResponseEntity.ok(ApiResponse.success(pilots));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PilotResponse>> createPilot(@Valid @RequestBody PilotRequest request) {
        PilotResponse pilot = pilotService.createPilot(request);
        return ResponseEntity.ok(ApiResponse.success(pilot, "Pilot created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PilotResponse>> updatePilot(
            @PathVariable Long id,
            @Valid @RequestBody PilotRequest request) {
        PilotResponse pilot = pilotService.updatePilot(id, request);
        return ResponseEntity.ok(ApiResponse.success(pilot, "Pilot updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePilot(@PathVariable Long id) {
        pilotService.deletePilot(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Pilot deleted successfully"));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<PilotResponse>> toggleAvailability(@PathVariable Long id) {
        PilotResponse pilot = pilotService.toggleAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(pilot, "Pilot availability toggled"));
    }
}
