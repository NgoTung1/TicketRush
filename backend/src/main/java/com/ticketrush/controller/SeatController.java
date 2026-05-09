package com.ticketrush.controller;

import com.ticketrush.dto.request.seat.SeatGenerateRequest;
import com.ticketrush.dto.request.seat.SeatRequest;
import com.ticketrush.dto.request.seat_type.SeatBulkUpdateRequest;
import com.ticketrush.dto.response.seat.SeatResponse;
import com.ticketrush.service.impl.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    // Sinh ghế tự động cho Zone
    @PostMapping("/zones/seats/generate/{zoneId}")
    public ResponseEntity<List<SeatResponse>> generateSeats(
            @PathVariable UUID zoneId,
            @RequestBody SeatGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seatService.generateSeats(zoneId, request));
    }

    // Lấy danh sách ghế theo Session
    @GetMapping("/sessions/seats/{sessionId}")
    public ResponseEntity<List<SeatResponse>> getSeatsBySession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(seatService.getSeatsBySessionId(sessionId));
    }

    // Update 1
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/seats/{seatId}")
    public ResponseEntity<SeatResponse> updateSeat(
            @PathVariable UUID seatId,
            @RequestBody SeatRequest request) {
        return ResponseEntity.ok(seatService.updateSeat(seatId, request));
    }

    // Update nhiều
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/seats/bulk-update")
    public ResponseEntity<List<SeatResponse>> updateMultipleSeats(
            @RequestBody SeatBulkUpdateRequest request) {
        return ResponseEntity.ok(seatService.updateMultipleSeatsType(request));
    }
}