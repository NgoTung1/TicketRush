package com.ticketrush.controller;

import com.ticketrush.dto.request.seat_type.SeatTypeRequest;
import com.ticketrush.dto.response.seat_type.SeatTypeResponse;
import com.ticketrush.service.impl.SeatTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SeatTypeController {

    private final SeatTypeService seatTypeService;

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/events/seat-types/{eventId}")
    public ResponseEntity<SeatTypeResponse> saveSeatType(
            @PathVariable UUID eventId,
            @RequestBody SeatTypeRequest request) {
        return ResponseEntity.ok(seatTypeService.saveSeatType(eventId, request));
    }

    @GetMapping("/events/seat-types/{eventId}")
    public ResponseEntity<List<SeatTypeResponse>> getSeatTypesByEventId(
            @PathVariable UUID eventId) {
        return ResponseEntity.ok(seatTypeService.getSeatTypesByEventId(eventId));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/events/seat-types/{eventId}")
    public ResponseEntity<Void> deleteAllByEventId(@PathVariable UUID eventId) {
        seatTypeService.deleteAllByEventId(eventId);
        return ResponseEntity.ok().build();
    }
}