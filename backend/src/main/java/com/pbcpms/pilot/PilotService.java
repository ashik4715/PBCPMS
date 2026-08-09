package com.pbcpms.pilot;

import com.pbcpms.shared.exception.DuplicateResourceException;
import com.pbcpms.shared.exception.ResourceNotFoundException;
import com.pbcpms.pilot.dto.PilotRequest;
import com.pbcpms.pilot.dto.PilotResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PilotService {

    private final PilotRepository pilotRepository;

    public PilotService(PilotRepository pilotRepository) {
        this.pilotRepository = pilotRepository;
    }

    public List<PilotResponse> getAllPilots() {
        return pilotRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PilotResponse> getAvailablePilots() {
        return pilotRepository.findByIsAvailableTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PilotResponse createPilot(PilotRequest request) {
        if (pilotRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Pilot with this email already exists");
        }
        if (pilotRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("Pilot with this license number already exists");
        }

        Pilot pilot = Pilot.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .licenseNumber(request.getLicenseNumber())
                .isAvailable(true)
                .build();

        pilotRepository.save(pilot);
        return toResponse(pilot);
    }

    public PilotResponse updatePilot(Long id, PilotRequest request) {
        Pilot pilot = pilotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pilot not found"));
        pilot.setName(request.getName());
        pilot.setEmail(request.getEmail());
        pilot.setPhone(request.getPhone());
        pilot.setLicenseNumber(request.getLicenseNumber());
        pilotRepository.save(pilot);
        return toResponse(pilot);
    }

    public void deletePilot(Long id) {
        Pilot pilot = pilotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pilot not found"));
        pilotRepository.delete(pilot);
    }

    public PilotResponse toggleAvailability(Long id) {
        Pilot pilot = pilotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pilot not found"));
        pilot.setIsAvailable(!pilot.getIsAvailable());
        pilotRepository.save(pilot);
        return toResponse(pilot);
    }

    private PilotResponse toResponse(Pilot pilot) {
        return PilotResponse.builder()
                .id(pilot.getId())
                .name(pilot.getName())
                .email(pilot.getEmail())
                .phone(pilot.getPhone())
                .licenseNumber(pilot.getLicenseNumber())
                .isAvailable(pilot.getIsAvailable())
                .createdAt(pilot.getCreatedAt())
                .updatedAt(pilot.getUpdatedAt())
                .build();
    }
}
