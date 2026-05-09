package com.ticketrush.repository;

import com.ticketrush.entity.Ticket;
import com.ticketrush.entity.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
	//tim theo UserId theo thu tu
	List<Ticket> findAllByOrderSeat_Order_User_Id(UUID userId);

	List<Ticket> findAllByOrderSeat_Order_User_IdAndStatus(UUID userId, TicketStatus status);

	//tim theo ca ticket ID
	Optional<Ticket> findByIdAndOrderSeat_Order_User_Id(UUID ticketId, UUID userId);

	//tim theo QR code
	Optional<Ticket> findByQrCode(String qrCode);
}
