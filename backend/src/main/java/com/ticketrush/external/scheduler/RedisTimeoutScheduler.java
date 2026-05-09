package com.ticketrush.external.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisTimeoutScheduler implements TimeoutScheduler {

  @Autowired
  private StringRedisTemplate redisTemplate;

  private static final String SHADOW_PREFIX = "shadow_timer:";

  @Override
  public void schedulePaymentTimeout(String eventId, String userId, long delaySeconds) {
    String key = SHADOW_PREFIX + eventId + ":" + userId;
    redisTemplate.opsForValue().set(key, "", delaySeconds, TimeUnit.SECONDS);
  }

  @Override
  public void cancelPaymentTimeout(String eventId, String userId) {
    String key = SHADOW_PREFIX + eventId + ":" + userId;
    redisTemplate.delete(key);
  }
}