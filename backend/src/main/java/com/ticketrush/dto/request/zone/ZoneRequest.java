package com.ticketrush.dto.request.zone;

import java.util.UUID;

import lombok.Data;

@Data
public class ZoneRequest {
    private String name;
    private Integer rowsCount;
    private Integer colsCount;
    private UUID defaultSeatTypeId;
}