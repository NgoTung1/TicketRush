package com.ticketrush.external.cronjob;

import com.ticketrush.service.TicketQueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

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

        for (String key : activeKeys) {
            String[] parts = key.split(":");
            if (parts.length == 3) {
                String eventId = parts[1];
                ticketQueueService.sweepTimeoutUsers(eventId);
            }
        }
    }
}
