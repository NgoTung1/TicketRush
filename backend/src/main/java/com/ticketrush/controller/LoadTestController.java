package com.ticketrush.controller;

import com.ticketrush.service.TicketQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ⚠️ LOAD TEST ONLY — Xóa controller này trước khi deploy production!
 *
 * Endpoint public không cần JWT, nhận userId thẳng từ query param.
 * Dùng với k6: POST /api/public/load-test/{eventId}/join?userId=test_user_1
 *
 * Nằm trong /api/public/** nên được SecurityConfig.permitAll() bypass auth.
 */
@RestController
@RequestMapping("/api/public/load-test")
@RequiredArgsConstructor
public class LoadTestController {

    private final TicketQueueService queueService;

    @PostMapping("/{eventId}/join")
    public ResponseEntity<Map<String, Object>> joinQueue(
            @PathVariable String eventId,
            @RequestParam String userId) {

        var result = queueService.joinEvent(eventId, userId);
        String status = result.getStatus();

        Map<String, Object> response = new HashMap<>();
        response.put("status", status);
        response.put("expireAt", result.getExpireAt());
        response.put("userId", userId);
        response.put("message",
                ("ACTIVE_ROOM".equals(status) || "ALREADY_IN_ACTIVE".equals(status))
                        ? "Đã vào phòng thanh toán."
                        : "Đang ở phòng chờ.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{eventId}/leave")
    public ResponseEntity<Map<String, String>> leaveQueue(
            @PathVariable String eventId,
            @RequestParam String userId) {

        queueService.removeUserAndPullNext(eventId, userId);

        Map<String, String> response = new HashMap<>();
        response.put("status", "LEFT");
        response.put("userId", userId);
        return ResponseEntity.ok(response);
    }
}
