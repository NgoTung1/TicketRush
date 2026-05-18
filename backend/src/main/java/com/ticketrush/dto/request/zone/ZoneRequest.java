package com.ticketrush.dto.request.zone;

import lombok.Data;

@Data
public class ZoneRequest {
    private String name;
    private Integer rowsCount;
    private Integer colsCount;
    private Double xPosition;
    private Double yPosition;
}