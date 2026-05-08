package com.ticketrush.controller;

import com.ticketrush.dto.request.event_session.EventSessionCreateRequest;
import com.ticketrush.dto.request.event_session.EventSessionUpdateRequest;
import com.ticketrush.dto.response.event_session.EventSessionResponse;
import com.ticketrush.service.impl.EventSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class EventSessionController {

    private final EventSessionService eventSessionService;

    @PostMapping("/events/sessions/{eventId}")
    public ResponseEntity<EventSessionResponse> createSession( @PathVariable UUID eventId, @RequestBody EventSessionCreateRequest request) {
        EventSessionResponse response = eventSessionService.createSession(eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/events/sessions/{eventId}")
    public ResponseEntity<List<EventSessionResponse>> getSessionsByEventId(@PathVariable UUID eventId) {
        List<EventSessionResponse> responses = eventSessionService.getSessionsByEventId(eventId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/sessions/{sessionId}")
    public ResponseEntity<EventSessionResponse> updateSession( @PathVariable UUID sessionId, @RequestBody EventSessionUpdateRequest request) {
        EventSessionResponse response = eventSessionService.updateSession(sessionId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID sessionId) {
        eventSessionService.deleteSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}