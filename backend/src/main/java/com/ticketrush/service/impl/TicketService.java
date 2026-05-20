package com.ticketrush.service.impl;

import com.ticketrush.dto.response.ticket.TicketCheckInResponse;
import com.ticketrush.dto.response.ticket.TicketDetailResponse;
import com.ticketrush.dto.response.ticket.TicketInOrderResponse;
import com.ticketrush.dto.response.ticket.TicketSummaryResponse;
import com.ticketrush.entity.OrderSeat;
import com.ticketrush.entity.Seat;
import com.ticketrush.entity.Ticket;
import com.ticketrush.entity.enums.SeatStatus;
import com.ticketrush.entity.enums.TicketStatus;
import com.ticketrush.repository.SeatRepository;
import com.ticketrush.repository.TicketRepository;
import com.ticketrush.util.QrCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {
    private static final int QR_SIZE = 300;

    private final TicketRepository ticketRepository;
    private final SeatRepository seatRepository;
    private final QrCodeGenerator qrCodeGenerator;

    @Transactional(readOnly = true)
    public List<TicketSummaryResponse> getMyTickets(UUID userId) {
        return getMyTickets(userId, null);
    }

    @Transactional(readOnly = true)
    public List<TicketSummaryResponse> getMyTickets(UUID userId, String statusParam) {
        TicketStatus status = parseTicketStatus(statusParam);
        List<Ticket> tickets = status == null
                ? ticketRepository.findAllByOrderSeat_Order_User_Id(userId)
                : ticketRepository.findAllByOrderSeat_Order_User_IdAndStatus(userId, status);
        List<TicketSummaryResponse> responses = new ArrayList<>();
        for (Ticket ticket : tickets) {
            responses.add(mapToSummary(ticket));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public List<TicketInOrderResponse> getTicketsByOrder(UUID orderId) {
        List<Ticket> tickets = ticketRepository.findAllByOrderSeat_Order_Id(orderId);
        List<TicketInOrderResponse> responses = new ArrayList<>();
        for (Ticket ticket : tickets) {
            Seat seat = ticket.getOrderSeat().getSeat();
            String eventTitle = seat.getZone().getEventSession().getEvent().getTitle();
            responses.add(TicketInOrderResponse.builder()
                    .id(ticket.getId())
                    .ticketCode(ticket.getCode())
                    .zone(seat.getZone() != null ? seat.getZone().getName() : "ZONE")
                    .row(seat.getRowIndex() != null ? seat.getRowIndex().toString() : "?")
                    .number(seat.getSeatNumber() != null ? seat.getSeatNumber().toString() : "?")
                    .status(ticket.getStatus())
                    .price(ticket.getOrderSeat().getPriceAtPurchase())
                    .qrData(generateQrPayload(ticket))
                    .qrCodeImageBase64(qrCodeGenerator.generateBase64Png(generateQrPayload(ticket), QR_SIZE))
                    .eventTitle(eventTitle)
                    .build());
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public TicketDetailResponse getTicketDetail(UUID userId, UUID ticketId) {
        Ticket ticket = ticketRepository.findByIdAndOrderSeat_Order_User_Id(ticketId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        Seat seat = ticket.getOrderSeat().getSeat();
        String eventTitle = seat.getZone().getEventSession().getEvent().getTitle();
        String sessionName = seat.getZone().getEventSession().getName();

        return TicketDetailResponse.builder()
                .ticketId(ticket.getId())
                .status(ticket.getStatus())
                .eventTitle(eventTitle)
                .sessionName(sessionName)
                .seatLabel(buildSeatLabel(seat))
                .qrCodePayload(generateQrPayload(ticket))
                .qrCodeImageBase64(qrCodeGenerator.generateBase64Png(generateQrPayload(ticket), QR_SIZE))
                .expiresAt(ticket.getExpiresAt())
                .checkedInAt(ticket.getCheckedInAt())
                .build();
    }

    @Transactional
    public TicketDetailResponse cancelTicket(UUID userId, UUID ticketId) {
        Ticket ticket = ticketRepository.findByIdAndOrderSeat_Order_User_Id(ticketId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (ticket.getStatus() != TicketStatus.VALID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket cannot be cancelled");
        }


        OrderSeat orderSeat = ticket.getOrderSeat();
        Seat seat = orderSeat.getSeat();
        seat.setStatus(SeatStatus.AVAILABLE);
        seat.setSelectedBy(null);

        seatRepository.save(seat);
        ticketRepository.save(ticket);

        return getTicketDetail(userId, ticketId);
    }

    @Transactional
    public TicketCheckInResponse checkIn(String payload) {
        String actualQrCode = extractQrCode(payload);
        Ticket ticket = ticketRepository.findByQrCode(actualQrCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (ticket.getStatus() != TicketStatus.VALID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket is not valid for check-in");
        }

        if (ticket.getExpiresAt() != null && ticket.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket expired");
        }

        LocalDateTime now = LocalDateTime.now();
        ticket.setStatus(TicketStatus.USED);
        ticket.setCheckedInAt(now);
        ticketRepository.save(ticket);

        return TicketCheckInResponse.builder()
                .ticketId(ticket.getId())
                .status(ticket.getStatus())
                .checkedInAt(now)
                .message("Check-in success")
                .build();
    }

    private TicketStatus parseTicketStatus(String statusParam) {
        if (statusParam == null || statusParam.isBlank()) {
            return null;
        }
        try {
            return TicketStatus.valueOf(statusParam.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket status: " + statusParam);
        }
    }

    private TicketSummaryResponse mapToSummary(Ticket ticket) {
        Seat seat = ticket.getOrderSeat().getSeat();
        String eventTitle = seat.getZone().getEventSession().getEvent().getTitle();
        return TicketSummaryResponse.builder()
                .ticketId(ticket.getId())
                .eventTitle(eventTitle)
                .seatLabel(buildSeatLabel(seat))
                .qrCode(generateQrPayload(ticket))
                .expiresAt(ticket.getExpiresAt())
                .build();
    }

    private String buildSeatLabel(Seat seat) {
        String zoneName = seat.getZone() != null ? seat.getZone().getName() : "ZONE";
        String row = seat.getRowIndex() != null ? seat.getRowIndex().toString() : "?";
        String number = seat.getSeatNumber() != null ? seat.getSeatNumber().toString() : "?";
        return zoneName + "-R" + row + "-S" + number;
    }

    private String generateQrPayload(Ticket ticket) {
        Seat seat = ticket.getOrderSeat().getSeat();
        return String.format("Mã vé: %s | ID: %s | Trạng thái: %s | Ghế: %s",
                ticket.getQrCode(),
                ticket.getId(),
                ticket.getStatus(),
                buildSeatLabel(seat));
    }

    private String extractQrCode(String payload) {
        if (payload != null && payload.startsWith("Mã vé: ")) {
            int endIndex = payload.indexOf(" |");
            if (endIndex != -1) {
                return payload.substring(7, endIndex).trim();
            }
        }
        // Fallback for previous format
        if (payload != null && payload.startsWith("QrCode: ")) {
            int endIndex = payload.indexOf('\n');
            if (endIndex != -1) {
                return payload.substring(8, endIndex).trim();
            }
        }
        return payload != null ? payload.trim() : null;
    }
}
