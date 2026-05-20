package com.ticketrush.repository;

import com.ticketrush.entity.Order;
import com.ticketrush.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
	// Toi uu tim kiem
	@EntityGraph(attributePaths = {
			"orderSeats",
			"orderSeats.seat",
			"orderSeats.seat.zone",
			"orderSeats.seat.zone.eventSession",
			"orderSeats.seat.seatType"
	})

	// tim dua theo id order correspond voi id user
	Optional<Order> findByIdAndUser_Id(UUID id, UUID userId);

	boolean existsByCode(String code);

	// tim don hang dua tren trang thai cua don hang va het han hay chua
	List<Order> findAllByStatusAndExpiresAtBefore(OrderStatus status, LocalDateTime time);

	@EntityGraph(attributePaths = { "user", "orderSeats", "orderSeats.seat", "orderSeats.seat.seatType" })
	@Query("SELECT DISTINCT o FROM Order o " +
			"JOIN o.orderSeats os " +
			"JOIN os.seat s " +
			"JOIN s.seatType st " +
			"WHERE st.event.id = :eventId AND o.status = :status")
	List<Order> findByEventIdAndStatusWithDetails(@Param("eventId") UUID eventId, @Param("status") OrderStatus status);




}
