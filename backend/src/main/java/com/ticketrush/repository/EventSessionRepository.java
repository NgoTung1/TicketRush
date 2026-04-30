package com.ticketrush.repository;

import com.ticketrush.entity.EventSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventSessionRepository extends JpaRepository<EventSession, UUID> {
}

