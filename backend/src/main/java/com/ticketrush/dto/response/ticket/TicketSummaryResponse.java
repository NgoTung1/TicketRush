package com.ticketrush.dto.response.ticket;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class TicketSummaryResponse {
    private UUID ticketId;
    private String eventTitle;
    private String seatLabel;
    private String qrCode;
    private LocalDateTime expiresAt;
}

