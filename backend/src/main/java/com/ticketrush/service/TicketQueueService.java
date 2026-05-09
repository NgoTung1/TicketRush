package com.ticketrush.service;

import com.ticketrush.external.scheduler.TimeoutScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TicketQueueService {

  @Autowired
  private StringRedisTemplate redisTemplate;

  @Autowired
  private TimeoutScheduler timeoutScheduler;

  private static final int ACTIVE_ROOM_LIMIT = 500;
  private static final long PAYMENT_WINDOW_SECONDS = 600; // 10 phút

  private String getWaitingKey(String eventId) {
    return "event:" + eventId + ":waiting";
  }

  private String getActiveKey(String eventId) {
    return "event:" + eventId + ":active";
  }

  public String joinEvent(String eventId, String userId) {
    String activeKey = getActiveKey(eventId);
    long now = Instant.now().getEpochSecond();
    Long currentActive = redisTemplate.opsForZSet().zCard(activeKey);

    if (currentActive != null && currentActive < ACTIVE_ROOM_LIMIT) {
      // Cho vào phòng
      long expireTime = now + PAYMENT_WINDOW_SECONDS;
      redisTemplate.opsForZSet().add(activeKey, userId, expireTime);

      // Gắn hẹn giờ bị đuổi
      timeoutScheduler.schedulePaymentTimeout(eventId, userId, PAYMENT_WINDOW_SECONDS);
      return "ACTIVE_ROOM";
    } else {
      // Phòng đầy => ném vào Waiting Room
      redisTemplate.opsForZSet().add(getWaitingKey(eventId), userId, now);
      return "WAITING_ROOM";
    }
  }

  // Hàm xóa user khỏi active room dùng khi hết 10 phút, hoặc user chủ động Out
  public void removeUserAndPullNext(String eventId, String userId) {
    String activeKey = getActiveKey(eventId);
    // 1. Xóa khỏi Active Room
    Long removed = redisTemplate.opsForZSet().remove(activeKey, userId);
    // 2. Kéo người chờ lâu nhất vào bù
    if (removed != null && removed > 0) {
      pullNextUserToActiveRoom(eventId);
    }
  }

  private void pullNextUserToActiveRoom(String eventId) {
    String waitingKey = getWaitingKey(eventId);
    String activeKey = getActiveKey(eventId);
    // Bốc 1 người đợi lâu nhất
    ZSetOperations.TypedTuple<String> popResult = redisTemplate.opsForZSet().popMin(waitingKey);

    if (popResult != null) {
      String nextUserId = popResult.getValue();
      long expireTime = Instant.now().getEpochSecond() + PAYMENT_WINDOW_SECONDS;
      // Ném vào phòng Thanh toán
      redisTemplate.opsForZSet().add(activeKey, nextUserId, expireTime);
      // Hẹn giờ out cho user mới
      timeoutScheduler.schedulePaymentTimeout(eventId, nextUserId, PAYMENT_WINDOW_SECONDS);
      System.out.println("Đã kéo User " + nextUserId + " vào phòng!");
    }
  }

  // Hàm dọn rác thủ công(chưa thực sự cần dùng)
  public void sweepTimeoutUsers(String eventId) {
    long now = Instant.now().getEpochSecond();
    // Quét những đứa đã hết giờ
    Long removedCount = redisTemplate.opsForZSet().removeRangeByScore(getActiveKey(eventId),
        Double.NEGATIVE_INFINITY, now);

    if (removedCount != null && removedCount > 0) {
      System.out.println("Cronjob đã cứu hệ thống! Dọn được " + removedCount + " user bị kẹt do rớt Pub/Sub.");
      // Hở bao nhiêu chỗ thì kéo bấy nhiêu người vào
      for (int i = 0; i < removedCount; i++) {
        pullNextUserToActiveRoom(eventId);
      }
    }
  }
}