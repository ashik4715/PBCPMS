package com.pbcpms.route;

import com.pbcpms.shared.dto.ApiResponse;
import com.pbcpms.route.dto.RouteRequest;
import com.pbcpms.route.dto.RouteResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<List<RouteResponse>>> getActiveRoutes() {
        List<RouteResponse> routes = routeService.getActiveRoutes();
        return ResponseEntity.ok(ApiResponse.success(routes));
    }

    @GetMapping("/admin/routes")
    public ResponseEntity<ApiResponse<List<RouteResponse>>> getAllRoutes() {
        List<RouteResponse> routes = routeService.getAllRoutes();
        return ResponseEntity.ok(ApiResponse.success(routes));
    }

    @PostMapping("/admin/routes")
    public ResponseEntity<ApiResponse<RouteResponse>> createRoute(@Valid @RequestBody RouteRequest request) {
        RouteResponse route = routeService.createRoute(request);
        return ResponseEntity.ok(ApiResponse.success(route, "Route created successfully"));
    }

    @PutMapping("/admin/routes/{id}")
    public ResponseEntity<ApiResponse<RouteResponse>> updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody RouteRequest request) {
        RouteResponse route = routeService.updateRoute(id, request);
        return ResponseEntity.ok(ApiResponse.success(route, "Route updated successfully"));
    }

    @DeleteMapping("/admin/routes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Route deleted successfully"));
    }
}
