package com.ticketrush.dto.request.order;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class OrderCreateRequest {
    //Request de generate ma QR
    private UUID sessionId;
    private List<UUID> seatIds;
}

