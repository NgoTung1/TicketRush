package com.ticketrush.repository;

import com.ticketrush.entity.Order;
import com.ticketrush.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
	@EntityGraph(attributePaths = {
			"orderSeats",
			"orderSeats.seat",
			"orderSeats.seat.zone",
			"orderSeats.seat.zone.eventSession",
			"orderSeats.seat.seatType"
	})
	Optional<Order> findByIdAndUser_Id(UUID id, UUID userId);

	List<Order> findAllByStatusAndExpiresAtBefore(OrderStatus status, LocalDateTime time);
}

