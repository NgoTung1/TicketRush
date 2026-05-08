package com.ticketrush.dto.request.event_session;

import com.ticketrush.entity.enums.EventSessionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventSessionUpdateRequest {
    private String name;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private EventSessionStatus status;
}