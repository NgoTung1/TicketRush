package com.ticketrush.dto.response.event_session;

import com.ticketrush.entity.enums.EventSessionStatus;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EventSessionResponse {
    private UUID id;
    private UUID eventId;
    private String name;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private EventSessionStatus status;
}