package com.ticketrush.dto.response.order;

import com.ticketrush.entity.enums.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OrderDetailResponse {
    private UUID orderId;
    private String code;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private UUID eventId;
    private String eventTitle;
    private List<OrderSeatResponse> seats;
}
