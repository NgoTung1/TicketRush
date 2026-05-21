package com.ticketrush.dto.response.order;

import com.ticketrush.entity.enums.SeatStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class OrderSeatResponse {
    private UUID id;
    private UUID orderId;
    private UUID seatId;
    private String seatLabel;
    private BigDecimal priceAtPurchase;
    private SeatStatus status;
}

