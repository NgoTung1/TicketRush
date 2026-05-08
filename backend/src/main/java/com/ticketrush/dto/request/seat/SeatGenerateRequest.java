package com.ticketrush.dto.request.seat;
import lombok.Data;
import java.util.UUID;

@Data
public class SeatGenerateRequest {
    private UUID seatTypeId;
}
