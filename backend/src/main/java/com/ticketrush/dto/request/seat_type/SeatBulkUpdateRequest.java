package com.ticketrush.dto.request.seat_type;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class SeatBulkUpdateRequest {
    private List<UUID> seatIds;     
    private UUID newSeatTypeId;    
}