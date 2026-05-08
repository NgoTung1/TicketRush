package com.ticketrush.service.impl;

import com.ticketrush.dto.request.seat_type.SeatTypeRequest;
import com.ticketrush.dto.response.seat_type.SeatTypeResponse;
import com.ticketrush.entity.Event;
import com.ticketrush.entity.SeatType;
import com.ticketrush.repository.EventRepository;
import com.ticketrush.repository.SeatTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatTypeService {

    private final SeatTypeRepository seatTypeRepository;
    private final EventRepository eventRepository;

    // Tạo hoặc update
    @Transactional
    public SeatTypeResponse saveSeatType(UUID eventId, SeatTypeRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event!"));

        SeatType seatType;
        if (request.getId() != null) {
            seatType = seatTypeRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy SeatType!"));
            
            if (!seatType.getEvent().getId().equals(eventId)) {
                throw new RuntimeException("SeatType này không thuộc về Event đã chỉ định!");
            }
        } else {
            seatType = new SeatType();
            seatType.setEvent(event);
        }

        if (request.getName() != null) seatType.setName(request.getName());
        if (request.getPrice() != null) seatType.setPrice(request.getPrice());
        if (request.getLabel() != null) seatType.setLabel(request.getLabel());
        if (request.getColor() != null) seatType.setColor(request.getColor());

        SeatType saved = seatTypeRepository.save(seatType);
        return mapToResponse(saved);
    }

    // Lấy danh sách ghế theo event
    @Transactional(readOnly = true)
    public List<SeatTypeResponse> getSeatTypesByEventId(UUID eventId) {
        return seatTypeRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SeatTypeResponse mapToResponse(SeatType seatType) {
        return SeatTypeResponse.builder()
                .id(seatType.getId())
                .eventId(seatType.getEvent().getId())
                .name(seatType.getName())
                .price(seatType.getPrice())
                .label(seatType.getLabel())
                .color(seatType.getColor())
                .build();
    }
}