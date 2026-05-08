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
public class OrderCreateResponse {
    private UUID orderId;
    private String code;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime expiresAt;
    private List<OrderSeatResponse> seats;
}

