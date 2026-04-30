package com.ticketrush.repository;

import com.ticketrush.entity.OrderSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderSeatRepository extends JpaRepository<OrderSeat, UUID> {
}

