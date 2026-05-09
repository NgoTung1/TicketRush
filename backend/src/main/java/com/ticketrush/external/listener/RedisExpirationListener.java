package com.ticketrush.external.listener;

import com.ticketrush.service.TicketQueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

@Component
public class RedisExpirationListener extends KeyExpirationEventMessageListener {

  @Autowired
  private TicketQueueService ticketQueueService;

  public RedisExpirationListener(RedisMessageListenerContainer listenerContainer) {
    super(listenerContainer);
  }

  @Override
  public void onMessage(Message message, byte[] pattern) {
    String expiredKey = message.toString();

    // Kiểm tra xem có đúng là user đã hết thời gian không?
    if (expiredKey.startsWith("shadow_timer:")) {
      String[] parts = expiredKey.split(":");
      String eventId = parts[1];
      String userId = parts[2];

      System.out.println("[Báo Động] User " + userId + " đã hết 10 phút. Bắt đầu đá văng!");

      // Xóa người này khỏi ZSET và kéo người mới
      ticketQueueService.removeUserAndPullNext(eventId, userId);
    }
  }
}