package com.ticketrush.dto.request.ticket;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class TicketCheckInRequest {
    private UUID id;
    private String qrCode;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime checkedInAt;

}

