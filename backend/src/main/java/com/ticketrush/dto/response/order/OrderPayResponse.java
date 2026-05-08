package com.ticketrush.dto.response.order;

import com.ticketrush.dto.response.ticket.TicketSummaryResponse;
import com.ticketrush.entity.enums.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OrderPayResponse {
    private UUID orderId;
    private OrderStatus status;
    private LocalDateTime paidAt;
    private List<TicketSummaryResponse> tickets;
}

