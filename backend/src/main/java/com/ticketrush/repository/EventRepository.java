package com.ticketrush.repository;

import com.ticketrush.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {


}

