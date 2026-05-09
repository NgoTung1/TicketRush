package com.ticketrush.external.scheduler;

public interface TimeoutScheduler {
  void schedulePaymentTimeout(String eventId, String userId, long delaySeconds);

  void cancelPaymentTimeout(String eventId, String userId);
}