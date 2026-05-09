package com.ticketrush.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_seats_id", nullable = false)
    private OrderSeat orderSeat;

    @Column(nullable = false)
    private String code;

    @Column(name = "qr_code", nullable = false)
    private String qrCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    private com.ticketrush.entity.enums.TicketStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;


}
