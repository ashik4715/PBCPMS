package com.pbcpms.route;

import com.pbcpms.shared.exception.ResourceNotFoundException;
import com.pbcpms.route.dto.RouteRequest;
import com.pbcpms.route.dto.RouteResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<RouteResponse> getActiveRoutes() {
        return routeRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RouteResponse> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RouteResponse createRoute(RouteRequest request) {
        Route route = Route.builder()
                .name(request.getName())
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .distanceKm(request.getDistanceKm())
                .fee(request.getFee())
                .isActive(true)
                .build();

        routeRepository.save(route);
        return toResponse(route);
    }

    public RouteResponse updateRoute(Long id, RouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        route.setName(request.getName());
        route.setOrigin(request.getOrigin());
        route.setDestination(request.getDestination());
        route.setDistanceKm(request.getDistanceKm());
        route.setFee(request.getFee());
        routeRepository.save(route);
        return toResponse(route);
    }

    public void deleteRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        routeRepository.delete(route);
    }

    private RouteResponse toResponse(Route route) {
        return RouteResponse.builder()
                .id(route.getId())
                .name(route.getName())
                .origin(route.getOrigin())
                .destination(route.getDestination())
                .distanceKm(route.getDistanceKm())
                .fee(route.getFee())
                .isActive(route.getIsActive())
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .build();
    }
}
