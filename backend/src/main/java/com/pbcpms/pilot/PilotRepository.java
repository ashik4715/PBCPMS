package com.pbcpms.pilot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PilotRepository extends JpaRepository<Pilot, Long> {
    List<Pilot> findByIsAvailableTrue();
    boolean existsByEmail(String email);
    boolean existsByLicenseNumber(String licenseNumber);
}
