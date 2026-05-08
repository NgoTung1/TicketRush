package com.ticketrush.controller;

import com.ticketrush.dto.request.ticket.TicketCheckInRequest;
import com.ticketrush.dto.response.ticket.TicketCheckInResponse;
import com.ticketrush.dto.response.ticket.TicketDetailResponse;
import com.ticketrush.service.impl.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketDetailResponse> getTicketDetail(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID ticketId
    ) {
        return ResponseEntity.ok(ticketService.getTicketDetail(userId, ticketId));
    }

    @PostMapping("/{ticketId}/cancel")
    public ResponseEntity<TicketDetailResponse> cancelTicket(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID ticketId
    ) {
        return ResponseEntity.ok(ticketService.cancelTicket(userId, ticketId));
    }

    @PostMapping("/check-in")
    public ResponseEntity<TicketCheckInResponse> checkIn(@RequestBody TicketCheckInRequest request) {
        return ResponseEntity.ok(ticketService.checkIn(request.getQrCode()));
    }
}

