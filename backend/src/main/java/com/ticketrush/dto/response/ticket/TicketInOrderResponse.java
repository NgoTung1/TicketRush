package com.ticketrush.dto.response.ticket;

import com.ticketrush.entity.enums.TicketStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class TicketInOrderResponse {
    private UUID id;
    private String ticketCode;
    private String zone;
    private String row;
    private String number;
    private TicketStatus status;
    private BigDecimal price;
    private String qrData;
    private String qrCodeImageBase64;
    private String eventTitle;
}
