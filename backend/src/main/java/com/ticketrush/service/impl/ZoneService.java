package com.ticketrush.service.impl;

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

    // Lấy danh sách Zone theo Session ID
    @Transactional(readOnly = true)
    public java.util.List<ZoneResponse> getZonesBySessionId(UUID sessionId) {
        return zoneRepository.findByEventSessionId(sessionId).stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    // Tạo Zone và sinh ghế
    @Transactional
    public ZoneResponse createZone(UUID sessionId, ZoneRequest request) {
        if (request.getRowsCount() != null && request.getRowsCount() > 50) {
            throw new RuntimeException("Số hàng không được vượt quá 50!");
        }
        if (request.getColsCount() != null && request.getColsCount() > 50) {
            throw new RuntimeException("Số cột không được vượt quá 50!");
        }

        EventSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Session!"));

        Zone zone = new Zone();
        zone.setEventSession(session);
        zone.setName(request.getName());
        zone.setRowsCount(request.getRowsCount());
        zone.setColsCount(request.getColsCount());
        if (request.getXPosition() != null) zone.setXPosition(request.getXPosition());
        if (request.getYPosition() != null) zone.setYPosition(request.getYPosition());

        Zone savedZone = zoneRepository.save(zone);

        return mapToResponse(savedZone);
    }

    @Transactional
    public ZoneResponse updateZone(UUID zoneId, ZoneRequest request) {
        if (request.getRowsCount() != null && request.getRowsCount() > 50) {
            throw new RuntimeException("Số hàng không được vượt quá 50!");
        }
        if (request.getColsCount() != null && request.getColsCount() > 50) {
            throw new RuntimeException("Số cột không được vượt quá 50!");
        }

        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Zone!"));

        if (request.getName() != null) zone.setName(request.getName());
        if (request.getRowsCount() != null) zone.setRowsCount(request.getRowsCount());
        if (request.getColsCount() != null) zone.setColsCount(request.getColsCount());
        if (request.getXPosition() != null) zone.setXPosition(request.getXPosition());
        if (request.getYPosition() != null) zone.setYPosition(request.getYPosition());

        Zone saved = zoneRepository.save(zone);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteZone(UUID zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Zone!"));

        seatService.deleteSeatsByZoneId(zoneId);

        zoneRepository.delete(zone);
    }

    private ZoneResponse mapToResponse(Zone zone) {
        return ZoneResponse.builder()
                .id(zone.getId())
                .sessionId(zone.getEventSession().getId())
                .name(zone.getName())
                .rowsCount(zone.getRowsCount())
                .colsCount(zone.getColsCount())
                .xPosition(zone.getXPosition())
                .yPosition(zone.getYPosition())
                .build();
    }
}