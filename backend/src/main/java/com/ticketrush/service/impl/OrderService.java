package com.ticketrush.service.impl;

import com.ticketrush.dto.request.order.OrderCreateRequest;
import com.ticketrush.dto.response.order.OrderCreateResponse;
import com.ticketrush.dto.response.order.OrderDetailResponse;
import com.ticketrush.dto.response.order.OrderPayResponse;
import com.ticketrush.dto.response.order.OrderSeatResponse;
import com.ticketrush.dto.response.ticket.TicketSummaryResponse;
import com.ticketrush.entity.Order;
import com.ticketrush.entity.OrderSeat;
import com.ticketrush.entity.Seat;
import com.ticketrush.entity.Ticket;
import com.ticketrush.entity.User;
import com.ticketrush.entity.enums.OrderStatus;
import com.ticketrush.entity.enums.SeatStatus;
import com.ticketrush.entity.enums.TicketStatus;
import com.ticketrush.repository.OrderRepository;
import com.ticketrush.repository.OrderSeatRepository;
import com.ticketrush.repository.SeatRepository;
import com.ticketrush.repository.TicketRepository;
import com.ticketrush.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final int LOCK_MINUTES = 10;

    private final OrderRepository orderRepository;
    private final OrderSeatRepository orderSeatRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderCreateResponse createOrder(UUID userId, OrderCreateRequest request) {
        validateRequest(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Seat> seats = seatRepository.findForUpdateBySessionAndIds(request.getSessionId(), request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some seats are not in the session");
        }

        for (Seat seat : seats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat already reserved");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        Order order = new Order();
        order.setUser(user);
        order.setCode(generateOrderCode());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        order.setExpiresAt(now.plusMinutes(LOCK_MINUTES));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderSeat> orderSeats = new ArrayList<>();

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.ORDERED);
            seat.setSelectedBy(user);

            OrderSeat orderSeat = new OrderSeat();
            orderSeat.setOrder(order);
            orderSeat.setSeat(seat);
            BigDecimal priceAtPurchase = BigDecimal.valueOf(seat.getSeatType().getPrice());
            orderSeat.setPriceAtPurchase(priceAtPurchase);
            orderSeats.add(orderSeat);
            totalAmount = totalAmount.add(priceAtPurchase);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        orderSeatRepository.saveAll(orderSeats);
        seatRepository.saveAll(seats);
        savedOrder.getOrderSeats().addAll(orderSeats);

        return mapToCreateResponse(savedOrder);
    }

    @Transactional
    public OrderDetailResponse getOrderDetail(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUser_Id(orderId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (order.getStatus() == OrderStatus.PENDING && isExpired(order)) {
            cancelOrder(order, LocalDateTime.now());
        }

        return mapToDetailResponse(order);
    }

    @Transactional
    public OrderPayResponse payOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUser_Id(orderId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not payable");
        }

        if (isExpired(order)) {
            cancelOrder(order, LocalDateTime.now());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order expired");
        }

        LocalDateTime now = LocalDateTime.now();
        order.setStatus(OrderStatus.PAID);
        order.setUpdatedAt(now);

        List<Ticket> tickets = new ArrayList<>();
        List<TicketSummaryResponse> ticketResponses = new ArrayList<>();

        for (OrderSeat orderSeat : order.getOrderSeats()) {
            Seat seat = orderSeat.getSeat();
            seat.setStatus(SeatStatus.SOLD);

            Ticket ticket = new Ticket();
            ticket.setOrderSeat(orderSeat);
            ticket.setCode(generateTicketCode());
            ticket.setQrCode(generateTicketQrPayload());
            ticket.setStatus(TicketStatus.VALID);
            ticket.setCreatedAt(now);
            ticket.setExpiresAt(seat.getZone().getEventSession().getEndAt());
            tickets.add(ticket);
        }

        ticketRepository.saveAll(tickets);
        seatRepository.saveAll(order.getOrderSeats().stream().map(OrderSeat::getSeat).toList());
        orderRepository.save(order);

        for (Ticket ticket : tickets) {
            ticketResponses.add(mapToTicketSummary(ticket));
        }

        return OrderPayResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .paidAt(now)
                .tickets(ticketResponses)
                .build();
    }

    @Transactional
    public void cancelOrder(Order order, LocalDateTime now) {
        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(now);

        List<Seat> seats = new ArrayList<>();
        for (OrderSeat orderSeat : order.getOrderSeats()) {
            Seat seat = orderSeat.getSeat();
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setSelectedBy(null);
            seats.add(seat);
        }
        seatRepository.saveAll(seats);
        orderRepository.save(order);
    }

    private boolean isExpired(Order order) {
        return order.getExpiresAt() != null && order.getExpiresAt().isBefore(LocalDateTime.now());
    }

    private void validateRequest(OrderCreateRequest request) {
        if (request == null || request.getSessionId() == null || request.getSeatIds() == null
                || request.getSeatIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sessionId and seatIds are required");
        }
    }

    private OrderCreateResponse mapToCreateResponse(Order order) {
        return OrderCreateResponse.builder()
                .orderId(order.getId())
                .code(order.getCode())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .expiresAt(order.getExpiresAt())
                .seats(mapSeats(order.getOrderSeats()))
                .build();
    }

    private OrderDetailResponse mapToDetailResponse(Order order) {
        return OrderDetailResponse.builder()
                .orderId(order.getId())
                .code(order.getCode())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .expiresAt(order.getExpiresAt())
                .createdAt(order.getCreatedAt())
                .seats(mapSeats(order.getOrderSeats()))
                .build();
    }

    private List<OrderSeatResponse> mapSeats(List<OrderSeat> orderSeats) {
        List<OrderSeatResponse> responses = new ArrayList<>();
        for (OrderSeat orderSeat : orderSeats) {
            Seat seat = orderSeat.getSeat();
            responses.add(OrderSeatResponse.builder()
                    .seatId(seat.getId())
                    .seatLabel(buildSeatLabel(seat))
                    .priceAtPurchase(orderSeat.getPriceAtPurchase())
                    .build());
        }
        return responses;
    }

    private TicketSummaryResponse mapToTicketSummary(Ticket ticket) {
        Seat seat = ticket.getOrderSeat().getSeat();
        String eventTitle = seat.getZone().getEventSession().getEvent().getTitle();
        return TicketSummaryResponse.builder()
                .ticketId(ticket.getId())
                .eventTitle(eventTitle)
                .seatLabel(buildSeatLabel(seat))
                .qrCode(ticket.getQrCode())
                .expiresAt(ticket.getExpiresAt())
                .build();
    }

    private String buildSeatLabel(Seat seat) {
        String zoneName = seat.getZone() != null ? seat.getZone().getName() : "ZONE";
        String row = seat.getRowIndex() != null ? seat.getRowIndex().toString() : "?";
        String number = seat.getSeatNumber() != null ? seat.getSeatNumber().toString() : "?";
        return zoneName + "-R" + row + "-S" + number;
    }

    private String generateOrderCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateTicketCode() {
        return "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateTicketQrPayload() {
        return "TR-" + UUID.randomUUID();
    }
}
