package com.ticketrush.dto.response.ticket;

import com.ticketrush.entity.enums.TicketStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class TicketDetailResponse {
    private UUID ticketId;
    private TicketStatus status;
    private String eventTitle;
    private String sessionName;
    private String seatLabel;
    private String qrCodePayload;
    private String qrCodeImageBase64;
    private LocalDateTime expiresAt;
    private LocalDateTime checkedInAt;
    private LocalDateTime canceledAt;
}

