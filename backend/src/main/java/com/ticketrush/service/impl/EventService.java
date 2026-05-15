package com.ticketrush.service.impl;

import com.ticketrush.dto.request.event.EventCreateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse;
import com.ticketrush.dto.request.event.EventUpdateRequest;
import com.ticketrush.entity.Category;
import com.ticketrush.entity.Event;
import com.ticketrush.entity.enums.EventStatus;
import com.ticketrush.repository.CategoryRepository;
import com.ticketrush.repository.EventRepository;
import com.ticketrush.external.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public EventCreateResponse createEvent(EventCreateRequest request, MultipartFile bannerFile) { 
        // Check thời gian bắt đầu phải >= 1 tuần kể từ hiện tại
        if (request.getStartTime() == null || request.getStartTime().isBefore(LocalDateTime.now().plusDays(7))) {
            throw new IllegalArgumentException("Thời gian bắt đầu sự kiện phải ít nhất 1 tuần sau thời điểm hiện tại!");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Category!"));

        Event newEvent = new Event();
        newEvent.setTitle(request.getTitle());
        newEvent.setOrganizer(request.getOrganizer());
        newEvent.setDescription(request.getDescription());
        newEvent.setAddress(request.getAddress());
        if (bannerFile != null && !bannerFile.isEmpty()) {
            String bannerUrl = fileStorageService.uploadFile(bannerFile, "banners");
            newEvent.setBannerUrl(bannerUrl);
        }
        newEvent.setStartTime(request.getStartTime());
        newEvent.setStatus(EventStatus.ONCOMING); 
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

    @Transactional(readOnly = true)
    public Page<EventCreateResponse> searchEvents(UUID categoryId, EventStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Event> eventPage = eventRepository.searchEvents(categoryId, status, pageable);
        return eventPage.map(this::mapToResponse);
    }

    @Transactional
    public EventCreateResponse updateEvent(UUID id, EventUpdateRequest request, MultipartFile bannerFile) {
        Event existingEvent = eventRepository.findById(id)
              .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));

        if (existingEvent.getStatus() != EventStatus.ONCOMING) {
            throw new IllegalStateException("Chỉ có thể cập nhật các sự kiện đang ở trạng thái ONCOMING!");
        }

        if (request.getStartTime() != null) {
            if (request.getStartTime().isBefore(LocalDateTime.now().plusDays(7))) {
                throw new IllegalArgumentException("Thời gian bắt đầu sự kiện phải ít nhất 1 tuần sau thời điểm hiện tại!");
            }
            existingEvent.setStartTime(request.getStartTime());
        }

        if (request.getTitle() != null) existingEvent.setTitle(request.getTitle());
        if (request.getOrganizer() != null) existingEvent.setOrganizer(request.getOrganizer());
        if (request.getDescription() != null) existingEvent.setDescription(request.getDescription());
        if (request.getAddress() != null)  existingEvent.setAddress(request.getAddress());
        
        if (bannerFile != null && !bannerFile.isEmpty() ) {
            String bannerUrl = fileStorageService.uploadFile(bannerFile, "banners");
            existingEvent.setBannerUrl(bannerUrl);
        }
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

    // Hàm này để tự động chạy để chuyển status event từ oncoming sang ongoing sau 3 ngày
    @Scheduled(cron = "0 0 0 * * ?") 
    @Transactional
    public void autoUpdateEventStatus() {
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        
        List<Event> eventsToUpdate = eventRepository.findByStatusAndCreatedAtBefore(EventStatus.ONCOMING, threeDaysAgo);
        
        if (!eventsToUpdate.isEmpty()) {
            for (Event event : eventsToUpdate) {
                event.setStatus(EventStatus.ONGOING);
            }
            eventRepository.saveAll(eventsToUpdate);
        }
    }

    private EventCreateResponse mapToResponse(Event event) { 
        return EventCreateResponse.builder() 
                .id(event.getId())
                .title(event.getTitle())
                .categoryId(event.getCategory().getId())
                .organizer(event.getOrganizer())
                .description(event.getDescription())
                .address(event.getAddress())
                .bannerUrl(event.getBannerUrl())
                .startTime(event.getStartTime())
                .status(event.getStatus())
                .build();
    }
}