package com.ticketrush.service.impl;

import com.ticketrush.dto.request.seat.SeatGenerateRequest;
import com.ticketrush.dto.request.zone.ZoneRequest;
import com.ticketrush.dto.response.zone.ZoneResponse;
import com.ticketrush.entity.EventSession;
import com.ticketrush.entity.Zone;
import com.ticketrush.repository.EventSessionRepository;
import com.ticketrush.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final EventSessionRepository sessionRepository;
    
    private final SeatService seatService; 

    // Tạo Zone và sinh ghế
    @Transactional
    public ZoneResponse createZone(UUID sessionId, ZoneRequest request) {
        EventSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Session!"));

        Zone zone = new Zone();
        zone.setEventSession(session);
        zone.setName(request.getName());
        zone.setRowsCount(request.getRowsCount());
        zone.setColsCount(request.getColsCount());

        Zone savedZone = zoneRepository.save(zone);

        if (request.getDefaultSeatTypeId() != null) {
            SeatGenerateRequest seatGenReq = new SeatGenerateRequest();
            seatGenReq.setSeatTypeId(request.getDefaultSeatTypeId());
            
            seatService.generateSeats(savedZone.getId(), seatGenReq);
        } else {
            throw new RuntimeException("Vui lòng cung cấp loại ghế mặc định (defaultSeatTypeId) để sinh sơ đồ!");
        }

        return mapToResponse(savedZone);
    }

    @Transactional
    public ZoneResponse updateZone(UUID zoneId, ZoneRequest request) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Zone!"));

        if (request.getName() != null) zone.setName(request.getName());
        if (request.getRowsCount() != null) zone.setRowsCount(request.getRowsCount());
        if (request.getColsCount() != null) zone.setColsCount(request.getColsCount());

        Zone saved = zoneRepository.save(zone);
        return mapToResponse(saved);
    }

    private ZoneResponse mapToResponse(Zone zone) {
        return ZoneResponse.builder()
                .id(zone.getId())
                .sessionId(zone.getEventSession().getId())
                .name(zone.getName())
                .rowsCount(zone.getRowsCount())
                .colsCount(zone.getColsCount())
                .build();
    }
}