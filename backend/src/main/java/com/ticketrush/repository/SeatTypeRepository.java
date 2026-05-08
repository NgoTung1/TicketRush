package com.ticketrush.repository;

import com.ticketrush.entity.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SeatTypeRepository extends JpaRepository<SeatType, UUID> {
    List<SeatType> findByEventId(UUID eventId);
    
}