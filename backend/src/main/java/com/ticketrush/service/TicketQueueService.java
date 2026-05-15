package com.ticketrush.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Duration;
import java.util.Set;

@Service
public class TicketQueueService {

  @Autowired
  private StringRedisTemplate redisTemplate;

  @Autowired
  private BlockService blockService;

  private static final int ACTIVE_ROOM_LIMIT = 200;
  private static final long PAYMENT_WINDOW_SECONDS = 600; // 10 phút

  private String getWaitingKey(String eventId) {
    return "event:" + eventId + ":waiting";
  }

  private String getActiveKey(String eventId) {
    return "event:" + eventId + ":active";
  }

  public String joinEvent(String eventId, String userId) {
    String activeKey = getActiveKey(eventId);
    String waitingKey = getWaitingKey(eventId);

    // Nếu Score khác null tức là họ đang ở trong Active hoặc Waiting
    Double activeScore = redisTemplate.opsForZSet().score(activeKey, userId);
    Double waitingScore = redisTemplate.opsForZSet().score(waitingKey, userId);

    if (activeScore != null || waitingScore != null) {
      return activeScore != null ? "ALREADY_IN_ACTIVE" : "ALREADY_IN_WAITING";
    }

    long now = Instant.now().getEpochSecond();
    Long currentActive = redisTemplate.opsForZSet().zCard(activeKey);

    if (currentActive != null && currentActive < ACTIVE_ROOM_LIMIT) {
      long expireTime = now + PAYMENT_WINDOW_SECONDS;
      redisTemplate.opsForZSet().add(activeKey, userId, expireTime);
      return "ACTIVE_ROOM";
    } else {
      redisTemplate.opsForZSet().add(waitingKey, userId, now);
      return "WAITING_ROOM";
    }
  }

  // Hàm xóa user khỏi active room dùng khi hết 10 phút, hoặc user chủ động Out
  public void removeUserAndPullNext(String eventId, String userId) {
    String activeKey = getActiveKey(eventId);
    String waitingKey = getWaitingKey(eventId);

    // THỬ TÌM VÀ XÓA Ở PHÒNG THANH TOÁN (ACTIVE ROOM)
    Long removedFromActive = redisTemplate.opsForZSet().remove(activeKey, userId);

    if (removedFromActive != null && removedFromActive > 0) {
      pullNextUserToActiveRoom(eventId);
      System.out.println("User " + userId + " đã chủ động rời Active Room.");
      return;
    }

    // TÌM VÀ XÓA Ở HÀNG CHỜ (WAITING ROOM)
    Long removedFromWaiting = redisTemplate.opsForZSet().remove(waitingKey, userId);

    if (removedFromWaiting != null && removedFromWaiting > 0) {
      System.out.println("User " + userId + " đã bỏ cuộc khi đang ở Waiting Room.");
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
      System.out.println("Đã kéo User " + nextUserId + " vào phòng!");
    }
  }

  // Hàm dọn rác thủ công
  public void sweepTimeoutUsers(String eventId) {
    long now = Instant.now().getEpochSecond();
    String activeKey = getActiveKey(eventId);

    // Lấy danh sách user đã hết hạn
    Set<String> timedOutUsers = redisTemplate.opsForZSet().rangeByScore(activeKey, Double.NEGATIVE_INFINITY, now);

    if (timedOutUsers != null && !timedOutUsers.isEmpty()) {
      System.out.println("Cronjob hệ thống! Dọn được " + timedOutUsers.size() + " user bị kẹt do rớt Pub/Sub.");

      for (String userId : timedOutUsers) {
        // Ghi nhận vi phạm
        handleUserTimeout(userId);

        // Xóa khỏi hàng chờ & gọi người tiếp theo
        redisTemplate.opsForZSet().remove(activeKey, userId);
        pullNextUserToActiveRoom(eventId);
      }
    }
  }

  private void handleUserTimeout(String userId) {
    String countKey = "user:timeout_count:" + userId;
    Long count = redisTemplate.opsForValue().increment(countKey);

    if (count != null && count == 1) {
      redisTemplate.expire(countKey, Duration.ofMinutes(30));
    }

    if (count != null && count > 2) {
      // Bị kick quá 2 lần (tức là lần thứ 3)
      blockService.blockUser(userId, Duration.ofHours(2),
          "Bạn đã không hoàn tất thanh toán quá nhiều lần. Tài khoản bị tạm khóa đặt vé trong 2 giờ.");
      redisTemplate.delete(countKey);
    }
  }
}