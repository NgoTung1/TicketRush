package com.ticketrush.service.impl;

import com.ticketrush.dto.request.seat.SeatGenerateRequest;
import com.ticketrush.dto.request.seat.SeatRequest;
import com.ticketrush.dto.request.seat_type.SeatBulkUpdateRequest;
import com.ticketrush.dto.response.seat.SeatResponse;
import com.ticketrush.entity.Seat;
import com.ticketrush.entity.SeatType;
import com.ticketrush.entity.Zone;
import com.ticketrush.entity.enums.SeatStatus;
import com.ticketrush.repository.SeatRepository;
import com.ticketrush.repository.SeatTypeRepository;
import com.ticketrush.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final ZoneRepository zoneRepository;
    private final SeatTypeRepository seatTypeRepository;

    // Tự động sinh ghế sau khi chốt được zone
    @Transactional
    public List<SeatResponse> generateSeats(UUID zoneId, SeatGenerateRequest request) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Zone!"));
        
        SeatType seatType = seatTypeRepository.findById(request.getSeatTypeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy SeatType!"));

        List<Seat> seatsToSave = new ArrayList<>();
        int seatNumber = 1;

        for (int r = 1; r <= zone.getRowsCount(); r++) {
            for (int c = 1; c <= zone.getColsCount(); c++) {
                Seat seat = new Seat();
                seat.setZone(zone);
                seat.setSeatType(seatType);
                seat.setRowIndex(r);
                seat.setColIndex(c);
                seat.setSeatNumber(seatNumber++);
                seat.setStatus(SeatStatus.AVAILABLE); 
                
                seatsToSave.add(seat);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(seatsToSave);
        return savedSeats.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsBySessionId(UUID sessionId) {
        return seatRepository.findByZone_EventSession_Id(sessionId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Update 1 seat
    @Transactional
    public SeatResponse updateSeat(UUID seatId, SeatRequest request) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Seat!"));

        if (request.getSeatTypeId() != null) {
            SeatType seatType = seatTypeRepository.findById(request.getSeatTypeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy SeatType!"));
            seat.setSeatType(seatType);
        }


        if (request.getRowIndex() != null) seat.setRowIndex(request.getRowIndex());
        if (request.getColIndex() != null) seat.setColIndex(request.getColIndex());
        if (request.getSeatNumber() != null) seat.setSeatNumber(request.getSeatNumber());
        if (request.getStatus() != null) seat.setStatus(request.getStatus());

        Seat savedSeat = seatRepository.save(seat);
        return mapToResponse(savedSeat); 
    }

    // Update nhiều seat 1 lúc
    @Transactional
    public List<SeatResponse> updateMultipleSeatsType(SeatBulkUpdateRequest request) {
        SeatType newSeatType = seatTypeRepository.findById(request.getNewSeatTypeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy SeatType!"));

        List<Seat> seatsToUpdate = seatRepository.findAllById(request.getSeatIds());

        if (seatsToUpdate.isEmpty()) {
            throw new RuntimeException("Không tìm thấy danh sách ghế cần cập nhật!");
        }

        for (Seat seat : seatsToUpdate) {
            seat.setSeatType(newSeatType);
        }

        List<Seat> savedSeats = seatRepository.saveAll(seatsToUpdate);

        return savedSeats.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<SeatResponse> holdSeatsForBooking(List<UUID> seatIds) {
        List<Seat> seats = seatRepository.findAvailableSeatsForUpdate(seatIds);

        if (seats.size() != seatIds.size()) {
            throw new RuntimeException("Rất tiếc! Một hoặc nhiều ghế bạn chọn đã bị người khác đặt. Vui lòng chọn ghế khác.");
        }

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.ORDERED);
        }

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        return savedSeats.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteSeatsByZoneId(UUID zoneId) {
        seatRepository.deleteByZoneId(zoneId);
    }
    
    private SeatResponse mapToResponse(Seat seat) {
        return SeatResponse.builder()
                .id(seat.getId())
                .zoneId(seat.getZone().getId())
                .seatTypeId(seat.getSeatType().getId())
                .rowIndex(seat.getRowIndex())
                .colIndex(seat.getColIndex())
                .seatNumber(seat.getSeatNumber())
                .status(seat.getStatus())
                .userId(seat.getSelectedBy() != null ? seat.getSelectedBy().getId() : null)
                .build();
    }
}