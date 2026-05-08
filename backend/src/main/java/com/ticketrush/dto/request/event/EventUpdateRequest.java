package com.ticketrush.dto.request.event;

import com.ticketrush.entity.enums.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventUpdateRequest {
    private String title;
    private String organizer;
    private String description;
    private String address;
    private String bannerUrl;
    private LocalDateTime startTime;
    private EventStatus status;
}