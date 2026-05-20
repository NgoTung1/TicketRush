package com.ticketrush.repository;

import com.ticketrush.entity.Event;
import com.ticketrush.entity.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    
    @Query("SELECT e FROM Event e WHERE " +
           "(:categoryId IS NULL OR e.category.id = :categoryId) AND " +
           "(:status IS NULL OR e.status = :status)")
    Page<Event> searchEvents(
            @Param("categoryId") UUID categoryId, 
            @Param("status") EventStatus status, 
            Pageable pageable    
    );

    List<Event> findByStatusAndCreatedAtBefore(EventStatus status, LocalDateTime dateTime);

    List<Event> findByStatusAndStartTimeLessThanEqual(EventStatus status, LocalDateTime dateTime);

    List<Event> findByStatus(EventStatus status);
}