package com.ticketrush.dto.response.zone;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ZoneResponse {
    private UUID id;
    private UUID sessionId;
    private String name;
    private Integer rowsCount;
    private Integer colsCount;
    @com.fasterxml.jackson.annotation.JsonProperty("xPosition")
    private Double xPosition;
    
    @com.fasterxml.jackson.annotation.JsonProperty("yPosition")
    private Double yPosition;
}