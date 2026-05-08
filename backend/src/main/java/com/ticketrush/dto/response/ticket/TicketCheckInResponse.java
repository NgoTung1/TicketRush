package com.ticketrush.dto.response.ticket;

import com.ticketrush.entity.enums.TicketStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class TicketCheckInResponse {
    private UUID ticketId;
    private TicketStatus status;
    private LocalDateTime checkedInAt;
    private String message;
}

