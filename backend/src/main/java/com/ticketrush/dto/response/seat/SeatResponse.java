package com.ticketrush.dto.response.seat;

import com.ticketrush.entity.enums.SeatStatus;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class SeatResponse {
    private UUID id;
    private UUID zoneId;
    private UUID seatTypeId;
    private Integer rowIndex;
    private Integer colIndex;
    private Integer seatNumber;
    private SeatStatus status;
}