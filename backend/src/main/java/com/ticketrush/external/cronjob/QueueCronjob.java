package com.ticketrush.external.cronjob;

import com.ticketrush.service.TicketQueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class QueueCronjob {

  @Autowired
  private StringRedisTemplate redisTemplate;

  @Autowired
  private TicketQueueService ticketQueueService;

  // Chạy mỗi 5 giây để quét dọn người dùng hết hạn trong Active Room
  @Scheduled(fixedRate = 5000)
  public void sweepAllQueues() {
    Set<String> activeKeys = redisTemplate.keys("event:*:active");
    if (activeKeys == null || activeKeys.isEmpty()) {
      return;
    }

    List<String> eventIds = activeKeys.stream()
        .map(key -> key.split(":"))
        .filter(parts -> parts.length == 3)
        .map(parts -> parts[1])
        .collect(Collectors.toList());

    eventIds.parallelStream().forEach(eventId -> {
      try {
        ticketQueueService.sweepTimeoutUsers(eventId);
      } catch (Exception e) {
        System.err.println("Lỗi dọn rác sự kiện " + eventId + ": " + e.getMessage());
      }
    });
  }
}
