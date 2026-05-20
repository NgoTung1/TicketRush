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
            "(:status IS NULL OR e.status = :status) AND " +
            "(:keyword IS NULL OR " +
            "LOWER(function('f_unaccent', e.title)) LIKE LOWER(function('f_unaccent', CONCAT('%', :keyword, '%'))) OR "
            +
            "LOWER(function('f_unaccent', e.organizer)) LIKE LOWER(function('f_unaccent', CONCAT('%', :keyword, '%'))) OR "
            +
            "LOWER(function('f_unaccent', e.address)) LIKE LOWER(function('f_unaccent', CONCAT('%', :keyword, '%')))) AND "
            +
            "(CAST(:startDate AS timestamp) IS NULL OR e.startTime >= :startDate) AND " +
            "(CAST(:endDate AS timestamp) IS NULL OR e.startTime <= :endDate)")
    Page<Event> searchEvents(
            @Param("categoryId") UUID categoryId,
            @Param("status") EventStatus status,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT e FROM Event e WHERE " +
            "e.status IN :statuses AND " +
            "(LOWER(function('f_unaccent', e.title)) LIKE LOWER(function('f_unaccent', CONCAT('%', :keyword, '%')))) " +
            "ORDER BY e.startTime ASC")
    List<Event> findHotSuggestions(
            @Param("keyword") String keyword,
            @Param("statuses") List<EventStatus> statuses,
            Pageable pageable);

    List<Event> findByStatusAndCreatedAtBefore(EventStatus status, LocalDateTime dateTime);

    List<Event> findByStatusAndStartTimeLessThanEqual(EventStatus status, LocalDateTime dateTime);

    List<Event> findByStatus(EventStatus status);
}