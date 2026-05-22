package com.ticketrush.dto.request.zone;

import lombok.Data;

@Data
public class ZoneRequest {
    private String name;
    private Integer rowsCount;
    private Integer colsCount;
    @com.fasterxml.jackson.annotation.JsonProperty("xPosition")
    private Double xPosition;
    
    @com.fasterxml.jackson.annotation.JsonProperty("yPosition")
    private Double yPosition;

    private Double rotation;
}