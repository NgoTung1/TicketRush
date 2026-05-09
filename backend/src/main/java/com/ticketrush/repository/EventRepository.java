package com.ticketrush.repository;

import com.ticketrush.entity.Event;
import com.ticketrush.entity.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query("SELECT e FROM Event e WHERE " +
           "(:categoryId IS NULL OR e.category.id = :categoryId) AND " +
           "(CAST(:status AS String) IS NULL OR CAST(e.status AS String) = CAST(:status AS String))")
    Page<Event> searchEvents(
            @Param("categoryId") UUID categoryId, 
            @Param("status") EventStatus status, 
            Pageable pageable
    );
}

