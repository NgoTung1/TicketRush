package com.ticketrush.dto.request.event;

import com.ticketrush.entity.enums.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class EventUpdateRequest {
    private String title;
    private UUID categoryId;
    private String organizer;
    private String description;
    private String address;
    private String bannerUrl;
    private LocalDateTime startTime;
    private EventStatus status;
    private Integer maxTicketPerUser;
}