package com.ticketrush.repository;

import com.ticketrush.entity.OrderSeat;
import com.ticketrush.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface OrderSeatRepository extends JpaRepository<OrderSeat, UUID> {

    @Query("SELECT SUM(os.priceAtPurchase) FROM OrderSeat os " +
            "JOIN os.order o " +
            "JOIN os.seat s " +
            "JOIN s.seatType st " +
            "WHERE st.event.id = :eventId AND o.status = :status")
    BigDecimal sumRevenueByEventAndStatus(@Param("eventId") UUID eventId, @Param("status") OrderStatus status);

    @Query("SELECT o.createdAt, os.priceAtPurchase FROM OrderSeat os " +
            "JOIN os.order o " +
            "JOIN os.seat s " +
            "JOIN s.seatType st " +
            "WHERE st.event.id = :eventId AND o.status = :status")
    List<Object[]> findRevenueDetailsByEventAndStatus(@Param("eventId") UUID eventId, @Param("status") OrderStatus status);

    @Query("SELECT u.gender, COUNT(os.id) FROM OrderSeat os " +
            "JOIN os.order o " +
            "JOIN o.user u " +
            "JOIN os.seat s " +
            "JOIN s.seatType st " +
            "WHERE st.event.id = :eventId AND o.status = :status " +
            "GROUP BY u.gender")
    List<Object[]> countTicketsByGender(@Param("eventId") UUID eventId, @Param("status") OrderStatus status);

    @Query("SELECT u.birthDate, COUNT(os.id) FROM OrderSeat os " +
            "JOIN os.order o " +
            "JOIN o.user u " +
            "JOIN os.seat s " +
            "JOIN s.seatType st " +
            "WHERE st.event.id = :eventId AND o.status = :status " +
            "GROUP BY u.birthDate")
    List<Object[]> countTicketsByBirthDate(@Param("eventId") UUID eventId, @Param("status") OrderStatus status);
}

