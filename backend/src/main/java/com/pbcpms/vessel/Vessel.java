package com.pbcpms.vessel;

import com.pbcpms.shared.enums.VesselStatus;
import com.pbcpms.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vessels")
public class Vessel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(unique = true, nullable = false)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VesselStatus status = VesselStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
