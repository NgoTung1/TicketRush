package com.ticketrush.controller;

import com.ticketrush.dto.request.zone.ZoneRequest;
import com.ticketrush.dto.response.zone.ZoneResponse;
import com.ticketrush.service.impl.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @PostMapping("/sessions/zones/{sessionId}")
    public ResponseEntity<ZoneResponse> createZone(
            @PathVariable UUID sessionId,
            @RequestBody ZoneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(zoneService.createZone(sessionId, request));
    }

    @PutMapping("/zones/{zoneId}")
    public ResponseEntity<ZoneResponse> updateZone(
            @PathVariable UUID zoneId,
            @RequestBody ZoneRequest request) {
        return ResponseEntity.ok(zoneService.updateZone(zoneId, request));
    }
}