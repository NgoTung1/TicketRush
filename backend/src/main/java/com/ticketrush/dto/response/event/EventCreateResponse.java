package com.ticketrush.dto.response.event;

import com.ticketrush.entity.enums.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EventCreateResponse {
    private UUID id;
    private String title;
    private UUID categoryId;
    private String organizer;
    private String description;
    private String address;
    private String bannerUrl;
    private LocalDateTime startTime;
    private EventStatus status;
    private Integer minPrice;
    private Integer maxTicketPerUser;
}