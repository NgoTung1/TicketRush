package com.ticketrush.dto.request.seat_type;

import lombok.Data;
import java.util.UUID;

@Data
public class SeatTypeRequest {
    private UUID id; 
    private String name;
    private Integer price;
    private String label;
    private String color;
}
