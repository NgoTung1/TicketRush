package com.ticketrush.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ticketrush.dto.request.event.EventCreateRequest;
import com.ticketrush.dto.request.event.EventUpdateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse;
import com.ticketrush.entity.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;

import com.ticketrush.service.impl.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createEvent(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "banner", required = false) MultipartFile file) {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());

            EventCreateRequest request = objectMapper.readValue(dataJson, EventCreateRequest.class);

            EventCreateResponse response = eventService.createEvent(request, file);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi dữ liệu đầu vào: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<EventCreateResponse>> searchEvents(
            @RequestParam(name = "category_id", required = false) UUID categoryId,
            @RequestParam(name = "status", required = false) EventStatus status,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Page<EventCreateResponse> eventPage = eventService.searchEvents(categoryId, status, keyword, date, page, size);

        return ResponseEntity.ok(eventPage.getContent());
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<EventCreateResponse>> getHotSuggestions(
            @RequestParam(name = "keyword") String keyword) {
        List<EventCreateResponse> suggestions = eventService.getHotSuggestions(keyword);
        return ResponseEntity.ok(suggestions);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateEvent(
            @PathVariable UUID id,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "banner", required = false) MultipartFile file) {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());

            EventUpdateRequest request = objectMapper.readValue(dataJson, EventUpdateRequest.class);

            EventCreateResponse response = eventService.updateEvent(id, request, file);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi dữ liệu đầu vào: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
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