package com.ticketrush.service.impl;

import com.ticketrush.dto.request.event_session.EventSessionCreateRequest;
import com.ticketrush.dto.request.event_session.EventSessionUpdateRequest;
import com.ticketrush.dto.response.event_session.EventSessionResponse;
import com.ticketrush.entity.Event;
import com.ticketrush.entity.EventSession;
import com.ticketrush.entity.enums.EventSessionStatus;
import com.ticketrush.repository.EventRepository;
import com.ticketrush.repository.EventSessionRepository;
import com.ticketrush.repository.SeatRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventSessionService {

    private final EventSessionRepository eventSessionRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    // Chỗ này status vẫn là ON_SALE nhưng sẽ bị chặn ko cho mua nếu event đang là ONCOMING
    @Transactional
    public EventSessionResponse createSession(UUID eventId, EventSessionCreateRequest request) {
        if (request.getEndAt() != null && request.getStartAt().isAfter(request.getEndAt())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu!");
        }

        if (request.getStartAt() == null || request.getStartAt().isBefore(LocalDateTime.now().plusDays(7))) {
            throw new IllegalArgumentException("Thời gian bắt đầu suất diễn phải cách hiện tại ít nhất 1 tuần!");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));

        if (request.getStartAt().toLocalDate().isBefore(event.getStartTime().toLocalDate())) {
            throw new IllegalArgumentException("Thời gian bắt đầu suất diễn không được trước ngày diễn ra sự kiện!");
        }

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
        
        if (request.getStartAt() != null) {
            if (request.getStartAt().isBefore(LocalDateTime.now().plusDays(7))) {
                throw new IllegalArgumentException("Thời gian bắt đầu suất diễn phải cách hiện tại ít nhất 1 tuần!");
            }
            if (request.getStartAt().toLocalDate().isBefore(session.getEvent().getStartTime().toLocalDate())) {
                throw new IllegalArgumentException("Thời gian bắt đầu suất diễn không được trước ngày diễn ra sự kiện!");
            }
            session.setStartAt(request.getStartAt());
        }
        if (request.getEndAt() != null) {
            if (session.getStartAt().isAfter(request.getEndAt())) {
                throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu!");
            }
            session.setEndAt(request.getEndAt());
        }
        
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
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void autoCompleteSessions() {
        LocalDateTime twoDaysFromNow = LocalDateTime.now().plusDays(2);
        
        List<EventSession> sessionsToComplete = eventSessionRepository.findByStatusAndStartAtLessThanEqual(
                EventSessionStatus.ON_SALE, 
                twoDaysFromNow
        );
        
        if (!sessionsToComplete.isEmpty()) {
            for (EventSession session : sessionsToComplete) {
                session.setStatus(EventSessionStatus.COMPLETE); 
            }
            eventSessionRepository.saveAll(sessionsToComplete);
        }
    }

    // Hàm này dùng để chuyển trạng thái sang SOLD_OUT nếu order full ghế 
    @Transactional
    public void syncSessionSoldOutStatus(UUID sessionId) {
        EventSession session = eventSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event Session!"));

        if (session.getStatus() == EventSessionStatus.COMPLETE || session.getStatus() == EventSessionStatus.CANCELLED) {
            return;
        }

        long availableSeats = seatRepository.countAvailableSeatsBySessionId(sessionId);

        if (availableSeats == 0 && session.getStatus() == EventSessionStatus.ON_SALE) {
            session.setStatus(EventSessionStatus.SOLD_OUT);
            eventSessionRepository.save(session);
        } 
        // Nếu hủy đơn lúc thanh toán thì lại ON_SALE
        else if (availableSeats > 0 && session.getStatus() == EventSessionStatus.SOLD_OUT) {
            session.setStatus(EventSessionStatus.ON_SALE);
            eventSessionRepository.save(session);
        }
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