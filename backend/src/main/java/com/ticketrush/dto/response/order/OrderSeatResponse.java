package com.ticketrush.dto.response.order;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class OrderSeatResponse {
    private UUID seatId;
    private String seatLabel;
    private BigDecimal priceAtPurchase;
}

