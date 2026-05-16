package com.ticketrush.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class BlockService {

  @Autowired
  private StringRedisTemplate redisTemplate;

  private String getBlockKey(String userId) {
    return "user:block:" + userId;
  }

  public void blockUser(String userId, Duration duration, String reason) {
    String key = getBlockKey(userId);
    redisTemplate.opsForValue().set(key, reason, duration);
    System.out.println("Đã chặn User " + userId + " trong " + duration.getSeconds() + " giây. Lý do: " + reason);
  }

  public void blockUser(String userId) {
    blockUser(userId, Duration.ofHours(1), "Vi phạm chính sách hệ thống");
  }

  public void blockUser(String userId, Duration duration) {
    blockUser(userId, duration, "Vi phạm chính sách hệ thống");
  }

  public boolean isUserBlocked(String userId) {
    return Boolean.TRUE.equals(redisTemplate.hasKey(getBlockKey(userId)));
  }

  public String getBlockReason(String userId) {
    return redisTemplate.opsForValue().get(getBlockKey(userId));
  }

  public void unblockUser(String userId) {
    redisTemplate.delete(getBlockKey(userId));
    System.out.println("Đã mở khóa cho User " + userId);
  }

  public Long getBlockExpiryTime(String userId) {
    String blockKey = "user:block:" + userId;

    Long secondsLeft = redisTemplate.getExpire(blockKey);

    if (secondsLeft != null && secondsLeft > 0) {
      return Instant.now().getEpochSecond() + secondsLeft;
    }

    return null;
  }
}