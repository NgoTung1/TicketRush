package com.ticketrush.controller;

import com.ticketrush.dto.request.event.EventCreateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse; // Đổi import
import com.ticketrush.service.impl.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventCreateResponse> createEvent(@RequestBody EventCreateRequest request) { // Đổi kiểu trả về
        EventCreateResponse response = eventService.createEvent(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventCreateResponse> getEvent(@PathVariable UUID id) { // Đổi kiểu trả về
        EventCreateResponse response = eventService.getEventById(id);
        return ResponseEntity.ok(response);
    }
}