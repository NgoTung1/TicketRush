package com.ticketrush.dto.request.seat;

import com.ticketrush.entity.enums.SeatStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class SeatRequest {
    private UUID seatTypeId; 
    private Integer rowIndex;
    private Integer colIndex;
    private Integer seatNumber;
    private SeatStatus status; 
}