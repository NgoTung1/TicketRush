package com.ticketrush.service.impl;

import com.ticketrush.dto.request.event_session.EventSessionCreateRequest;
import com.ticketrush.dto.request.event_session.EventSessionUpdateRequest;
import com.ticketrush.dto.response.event_session.EventSessionResponse;
import com.ticketrush.entity.Event;
import com.ticketrush.entity.EventSession;
import com.ticketrush.entity.enums.EventSessionStatus;
import com.ticketrush.repository.EventRepository;
import com.ticketrush.repository.EventSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventSessionService {

    private final EventSessionRepository eventSessionRepository;
    private final EventRepository eventRepository;

    @Transactional
    public EventSessionResponse createSession(UUID eventId, EventSessionCreateRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));

        EventSession session = new EventSession();
        session.setEvent(event);
        session.setName(request.getName());
        session.setStartAt(request.getStartAt());
        session.setEndAt(request.getEndAt());
        session.setStatus(EventSessionStatus.ON_SALE);

        EventSession savedSession = eventSessionRepository.save(session);
        return mapToResponse(savedSession);
    }

    @Transactional
    public EventSessionResponse updateSession(UUID sessionId, EventSessionUpdateRequest request) {
        EventSession session = eventSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event Session!" ));

        if (request.getName() != null) session.setName(request.getName());
        if (request.getStartAt() != null)session.setStartAt(request.getStartAt());
        if (request.getEndAt() != null) session.setEndAt(request.getEndAt());
        if (request.getStatus() != null) session.setStatus(request.getStatus());

        EventSession updatedSession = eventSessionRepository.save(session);
        return mapToResponse(updatedSession);
    }

    @Transactional
    public void deleteSession(UUID sessionId) {
        if (!eventSessionRepository.existsById(sessionId)) {
            throw new RuntimeException("Không tìm thấy Event Session!" );
        }
        eventSessionRepository.deleteById(sessionId);
    }

    @Transactional(readOnly = true)
    public List<EventSessionResponse> getSessionsByEventId(UUID eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Không tìm thấy Event!");
        }
        
        return eventSessionRepository.findByEventId(eventId)
                .stream()
                .map(session -> this.mapToResponse(session))
                .collect(Collectors.toList());
    }

    private EventSessionResponse mapToResponse(EventSession session) {
    return EventSessionResponse.builder()
            .id(session.getId())
            .eventId(session.getEvent().getId())
            .name(session.getName())
            .startAt(session.getStartAt())
            .endAt(session.getEndAt())
            .status(session.getStatus())
            .build();
    }
}