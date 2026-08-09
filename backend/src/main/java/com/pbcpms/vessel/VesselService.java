package com.pbcpms.vessel;

import com.pbcpms.shared.enums.VesselStatus;
import com.pbcpms.shared.exception.BadRequestException;
import com.pbcpms.shared.exception.DuplicateResourceException;
import com.pbcpms.shared.exception.ForbiddenException;
import com.pbcpms.shared.exception.ResourceNotFoundException;
import com.pbcpms.user.User;
import com.pbcpms.user.UserRepository;
import com.pbcpms.vessel.dto.VesselRequest;
import com.pbcpms.vessel.dto.VesselResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VesselService {

    private final VesselRepository vesselRepository;
    private final UserRepository userRepository;

    public VesselService(VesselRepository vesselRepository, UserRepository userRepository) {
        this.vesselRepository = vesselRepository;
        this.userRepository = userRepository;
    }

    public List<VesselResponse> getMyVessels(Long ownerId) {
        return vesselRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public VesselResponse createVessel(VesselRequest request, Long ownerId) {
        if (vesselRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("Vessel with this registration number already exists");
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Vessel vessel = Vessel.builder()
                .owner(owner)
                .name(request.getName())
                .type(request.getType())
                .registrationNumber(request.getRegistrationNumber())
                .status(VesselStatus.PENDING)
                .build();

        vesselRepository.save(vessel);
        return toResponse(vessel);
    }

    public List<VesselResponse> getAllVessels() {
        return vesselRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<VesselResponse> getVesselsByStatus(VesselStatus status) {
        return vesselRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public VesselResponse approveVessel(Long vesselId) {
        Vessel vessel = vesselRepository.findById(vesselId)
                .orElseThrow(() -> new ResourceNotFoundException("Vessel not found"));
        vessel.setStatus(VesselStatus.APPROVED);
        vesselRepository.save(vessel);
        return toResponse(vessel);
    }

    public VesselResponse rejectVessel(Long vesselId, String notes) {
        Vessel vessel = vesselRepository.findById(vesselId)
                .orElseThrow(() -> new ResourceNotFoundException("Vessel not found"));
        vessel.setStatus(VesselStatus.REJECTED);
        vessel.setAdminNotes(notes);
        vesselRepository.save(vessel);
        return toResponse(vessel);
    }

    private VesselResponse toResponse(Vessel vessel) {
        return VesselResponse.builder()
                .id(vessel.getId())
                .ownerId(vessel.getOwner().getId())
                .ownerName(vessel.getOwner().getFullName())
                .name(vessel.getName())
                .type(vessel.getType())
                .registrationNumber(vessel.getRegistrationNumber())
                .status(vessel.getStatus())
                .adminNotes(vessel.getAdminNotes())
                .createdAt(vessel.getCreatedAt())
                .updatedAt(vessel.getUpdatedAt())
                .build();
    }
}
