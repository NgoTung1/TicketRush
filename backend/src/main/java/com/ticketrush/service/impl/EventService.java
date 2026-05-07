package com.ticketrush.service.impl;

import com.ticketrush.dto.request.event.EventCreateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse;
import com.ticketrush.entity.Category;
import com.ticketrush.entity.Event;
import com.ticketrush.repository.CategoryRepository;
import com.ticketrush.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;

    // 1. Chức năng Tạo sự kiện mới
    public EventCreateResponse createEvent(EventCreateRequest request) { // Đổi kiểu trả về
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Category!"));

        Event newEvent = new Event();
        newEvent.setTitle(request.getTitle());
        newEvent.setOrganizer(request.getOrganizer());
        newEvent.setDescription(request.getDescription());
        newEvent.setAddress(request.getAddress());
        newEvent.setBannerUrl(request.getBannerUrl());
        newEvent.setStartTime(request.getStartTime());
        newEvent.setStatus(request.getStatus());
        newEvent.setCategory(category);

        Event savedEvent = eventRepository.save(newEvent);

        return mapToResponse(savedEvent);
    }

    // 2. Chức năng Lấy chi tiết sự kiện
    public EventCreateResponse getEventById(UUID id) { // Đổi kiểu trả về
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));
        return mapToResponse(event);
    }

    // Hàm phụ trợ dùng chung
    private EventCreateResponse mapToResponse(Event event) { // Đổi kiểu trả về
        return EventCreateResponse.builder() // Đổi tên class gọi builder()
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