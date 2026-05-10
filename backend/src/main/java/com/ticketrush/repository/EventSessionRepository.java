package com.ticketrush.repository;

import com.ticketrush.entity.EventSession;
import com.ticketrush.entity.enums.EventSessionStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

import java.util.UUID;

public interface EventSessionRepository extends JpaRepository<EventSession, UUID> {
    List<EventSession> findByEventId(UUID eventId);

    List<EventSession> findByStatusAndStartAtLessThanEqual(EventSessionStatus status, LocalDateTime dateTime);

}

