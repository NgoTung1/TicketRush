package com.ticketrush.controller;

import com.ticketrush.dto.request.event.EventCreateRequest;
import com.ticketrush.dto.request.event.EventUpdateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse;
import com.ticketrush.entity.enums.EventStatus;
import org.springframework.data.domain.Page;
import com.ticketrush.service.impl.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventCreateResponse> createEvent(@RequestBody EventCreateRequest request) { 
        EventCreateResponse response = eventService.createEvent(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<EventCreateResponse>> searchEvents(
        @RequestParam(name = "category_id", required = false) UUID categoryId,
        @RequestParam(name = "status", required = false) EventStatus status,
        @RequestParam(name = "page", defaultValue = "0") int page,
        @RequestParam(name = "size", defaultValue = "10") int size) {
    
        Page<EventCreateResponse> eventPage = eventService.searchEvents(categoryId, status, page, size);
        
        return ResponseEntity.ok(eventPage.getContent());
        }   

    @PutMapping("/update/{id}")
    public ResponseEntity<EventCreateResponse> updateEvent(@PathVariable UUID id, @RequestBody EventUpdateRequest request) {
        EventCreateResponse response = eventService.updateEvent(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EventCreateResponse> getEvent(@PathVariable UUID id) { 
        EventCreateResponse response = eventService.getEventById(id);
        return ResponseEntity.ok(response);
    }
}