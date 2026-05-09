package com.ticketrush.controller;

import com.ticketrush.dto.response.ticket.TicketSummaryResponse;
import com.ticketrush.service.impl.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserTicketController {
    private final TicketService ticketService;

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketSummaryResponse>> getMyTickets(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(value = "status", required = false) String status
    ) {
        return ResponseEntity.ok(ticketService.getMyTickets(userId, status));
    }
}
