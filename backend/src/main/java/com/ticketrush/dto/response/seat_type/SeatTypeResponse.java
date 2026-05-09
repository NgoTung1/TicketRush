package com.ticketrush.dto.response.seat_type;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class SeatTypeResponse {
    private UUID id;
    private UUID eventId;
    private String name;
    private Integer price;
    private String label;
    private String color;
}