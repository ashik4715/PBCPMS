package com.pbcpms.coupon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByOwnerId(Long ownerId);
    Optional<Coupon> findByCode(String code);
    boolean existsByCode(String code);
}
