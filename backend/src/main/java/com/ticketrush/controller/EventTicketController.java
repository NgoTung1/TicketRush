package com.ticketrush.controller;

import com.ticketrush.service.TicketQueueService;
import com.ticketrush.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class EventTicketController {

  private final TicketQueueService queueService;
  private final BlockService blockService;

  private String getUserIdFromToken(Jwt jwt) {
    return jwt.getSubject();
  }

  @PostMapping("/{eventId}/join")
  public ResponseEntity<Map<String, String>> joinEvent(
      @PathVariable String eventId,
      @AuthenticationPrincipal Jwt jwt) {

    String userId = getUserIdFromToken(jwt);
    Map<String, String> response = new HashMap<>();

    // 1. Kiểm tra Block
    if (blockService.isUserBlocked(userId)) {
      String reason = blockService.getBlockReason(userId);
      Long unblockAt = blockService.getBlockExpiryTime(userId);

      response.put("status", "BLOCKED");
      response.put("message", "Tài khoản của bạn đang bị chặn. Lý do: " + reason);
      if (unblockAt != null) {
        response.put("unblockAt", String.valueOf(unblockAt));
      }
      return ResponseEntity.ok(response);
    }

    // 2. Đẩy vào luồng xếp hàng
    String status = queueService.joinEvent(eventId, userId);

    response.put("status", status);
    if ("ACTIVE_ROOM".equals(status)) {
      response.put("message", "Đã vào phòng thanh toán. Bạn có 10 phút!");
    } else {
      response.put("message", "Đang ở phòng chờ. Vui lòng giữ màn hình...");
    }

    return ResponseEntity.ok(response);
  }

  @PostMapping("/{eventId}/leave")
  public ResponseEntity<Map<String, String>> leaveEvent(
      @PathVariable String eventId,
      @AuthenticationPrincipal Jwt jwt) {

    String userId = getUserIdFromToken(jwt);
    queueService.removeUserAndPullNext(eventId, userId);

    Map<String, String> response = new HashMap<>();
    response.put("status", "LEFT");
    response.put("message", "Đã nhường chỗ thành công!");

    return ResponseEntity.ok(response);
  }

  // Dùng để test block (hàm này vốn dĩ sẽ chạy ngầm)
  @PostMapping("/test-punish")
  public ResponseEntity<String> punishUser(@RequestParam String userId) {
    blockService.blockUser(userId, Duration.ofMinutes(5), "Cố tình spam/Hack API đặt vé");
    return ResponseEntity.ok("Đã chặn user " + userId + " trong 5 phút.");
  }
}