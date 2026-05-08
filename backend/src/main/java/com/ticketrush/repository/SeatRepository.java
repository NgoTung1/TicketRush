package com.ticketrush.repository;

import com.ticketrush.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, UUID> {
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select s from Seat s join s.zone z join z.eventSession es join fetch s.seatType " +
			"where es.id = :sessionId and s.id in :seatIds")
	List<Seat> findForUpdateBySessionAndIds(@Param("sessionId") UUID sessionId,
											@Param("seatIds") List<UUID> seatIds);
}

