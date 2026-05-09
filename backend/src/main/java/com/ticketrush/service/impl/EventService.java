package com.ticketrush.service.impl;
package com.ticketrush.service.impl;

import com.ticketrush.dto.request.event.EventCreateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse;
import com.ticketrush.dto.request.event.EventUpdateRequest;
import com.ticketrush.entity.Category;
import com.ticketrush.entity.Event;
import com.ticketrush.entity.enums.EventStatus;
import com.ticketrush.repository.CategoryRepository;
import com.ticketrush.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public EventCreateResponse createEvent(EventCreateRequest request) { 
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Category!"));

        Event newEvent = new Event();
        newEvent.setTitle(request.getTitle());
        newEvent.setOrganizer(request.getOrganizer());
        newEvent.setDescription(request.getDescription());
        newEvent.setAddress(request.getAddress());
        newEvent.setBannerUrl(request.getBannerUrl());
        newEvent.setStartTime(request.getStartTime());
        newEvent.setStatus(EventStatus.ONGOING); 
        newEvent.setCategory(category); 

        Event savedEvent = eventRepository.save(newEvent);

        return mapToResponse(savedEvent);
    }

    @Transactional(readOnly = true)
    public EventCreateResponse getEventById(UUID id) { 
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));
        return mapToResponse(event);
    }

    // Tìm kiếm phân trang
    @Transactional(readOnly = true)
    public Page<EventCreateResponse> searchEvents(UUID categoryId, EventStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Event> eventPage = eventRepository.searchEvents(categoryId, status, pageable);
        
        return eventPage.map(this::mapToResponse);
    }

    @Transactional
    public EventCreateResponse updateEvent(UUID id, EventUpdateRequest request) {
        Event existingEvent = eventRepository.findById(id)
              .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));

        if (request.getTitle() != null) existingEvent.setTitle(request.getTitle());
        if (request.getOrganizer() != null) existingEvent.setOrganizer(request.getOrganizer());
        if (request.getDescription() != null) existingEvent.setDescription(request.getDescription());
        if (request.getAddress() != null)  existingEvent.setAddress(request.getAddress());
        if (request.getBannerUrl() != null)  existingEvent.setBannerUrl(request.getBannerUrl());
        if (request.getStartTime() != null)  existingEvent.setStartTime(request.getStartTime());
        if (request.getStatus() != null) existingEvent.setStatus(request.getStatus());

        Event updatedEvent = eventRepository.save(existingEvent);
        
        return mapToResponse(updatedEvent);
    }

    @Transactional
    public void deleteEvent(UUID id) {
        Event existingEvent = eventRepository.findById(id)
              .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));
        eventRepository.delete(existingEvent);
    }

    private EventCreateResponse mapToResponse(Event event) { 
        return EventCreateResponse.builder() 
                .id(event.getId())
                .title(event.getTitle())
                .categoryId(event.getCategory().getId())
                .organizer(event.getOrganizer())
                .address(event.getAddress())
                .bannerUrl(event.getBannerUrl())
                .startTime(event.getStartTime())
                .status(event.getStatus())
                .build();
    }
}