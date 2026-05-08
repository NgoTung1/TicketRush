package com.ticketrush.repository;

import com.ticketrush.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
	List<Ticket> findAllByOrderSeat_Order_User_Id(UUID userId);

	Optional<Ticket> findByIdAndOrderSeat_Order_User_Id(UUID ticketId, UUID userId);

	Optional<Ticket> findByQrCode(String qrCode);
}

