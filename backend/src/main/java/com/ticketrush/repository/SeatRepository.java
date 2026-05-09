package com.ticketrush.repository;

import com.ticketrush.entity.Seat;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, UUID> {
    List<Seat> findByZone_EventSession_Id(UUID sessionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id IN :seatIds AND s.status = 'AVAILABLE'")
    List<Seat> findAvailableSeatsForUpdate(@Param("seatIds") List<UUID> seatIds);

    @Modifying
    @Query("DELETE FROM Seat s WHERE s.zone.id = :zoneId")
    void deleteByZoneId(@Param("zoneId") UUID zoneId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s join s.zone z join z.eventSession es join fetch s.seatType " +
            "where es.id = :sessionId and s.id in :seatIds")
    List<Seat> findForUpdateBySessionAndIds(@Param("sessionId") UUID sessionId,
                                            @Param("seatIds") List<UUID> seatIds);
}

