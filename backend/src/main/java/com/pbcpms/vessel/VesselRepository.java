package com.pbcpms.vessel;

import com.pbcpms.shared.enums.VesselStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VesselRepository extends JpaRepository<Vessel, Long> {
    List<Vessel> findByOwnerId(Long ownerId);
    List<Vessel> findByStatus(VesselStatus status);
    boolean existsByRegistrationNumber(String registrationNumber);
}
