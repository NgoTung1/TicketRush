package com.ticketrush.service.impl;

import com.ticketrush.dto.request.order.OrderCreateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse;
import com.ticketrush.dto.response.order.OrderCreateResponse;
import com.ticketrush.dto.response.order.OrderDetailResponse;
import com.ticketrush.dto.response.order.OrderPayResponse;
import com.ticketrush.dto.response.order.OrderSeatResponse;
import com.ticketrush.dto.response.ticket.TicketSummaryResponse;
import com.ticketrush.entity.*;
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
    public OrderPayResponse createAndPayOrder(UUID userId, OrderCreateRequest request) {
        validateRequest(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Seat> seats = seatRepository.findForUpdateByIds(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some seats could not be found");
        }

        for (Seat seat : seats) {
            boolean isAlreadyHeldByCurrentUser = (seat.getStatus() == SeatStatus.ORDERED) &&
                    (seat.getSelectedBy() != null) &&
                    (seat.getSelectedBy().getId().equals(userId));

            if (seat.getStatus() != SeatStatus.AVAILABLE && !isAlreadyHeldByCurrentUser) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat already reserved");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        Order order = new Order();
        if (request.getOrderId() != null) {
            order.setId(request.getOrderId());
        } else {
            order.setId(UUID.randomUUID());
        }
        order.setUser(user);
        order.setCode(generateOrderCode());
        order.setStatus(OrderStatus.PAID);
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        order.setExpiresAt(now.plusMinutes(LOCK_MINUTES));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderSeat> orderSeats = new ArrayList<>();

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.SOLD);
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
        
        for (OrderSeat orderSeat : orderSeats) {
            orderSeat.setOrder(savedOrder);
        }
        orderSeatRepository.saveAll(orderSeats);
        seatRepository.saveAll(seats);
        savedOrder.getOrderSeats().addAll(orderSeats);

        List<Ticket> tickets = new ArrayList<>();
        List<TicketSummaryResponse> ticketResponses = new ArrayList<>();

        for (OrderSeat orderSeat : orderSeats) {
            Ticket ticket = new Ticket();
            ticket.setOrderSeat(orderSeat);
            ticket.setCode(generateTicketCode());
            ticket.setQrCode(generateTicketQrPayload());
            ticket.setStatus(TicketStatus.VALID);
            ticket.setCreatedAt(now);
            ticket.setExpiresAt(orderSeat.getSeat().getZone().getEventSession().getEndAt());
            tickets.add(ticket);
        }

        tickets = ticketRepository.saveAll(tickets);

        for (Ticket ticket : tickets) {
            ticketResponses.add(mapToTicketSummary(ticket));
        }

        return OrderPayResponse.builder()
                .orderId(savedOrder.getId())
                .status(savedOrder.getStatus())
                .paidAt(now)
                .tickets(ticketResponses)
                .build();
    }

    @Transactional
    public OrderDetailResponse getOrderDetail(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUser_Id(orderId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "hóa đơn không tồn tại"));

        if (order.getStatus() == OrderStatus.PENDING && isExpired(order)) {
            cancelOrder(order, LocalDateTime.now());
        }

        return mapToDetailResponse(order);
    }

    @Transactional
    public List<OrderDetailResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(this::mapToDetailResponse).toList();
    }

    @Transactional
    public List<OrderDetailResponse> getMyOrders(UUID userId, OrderStatus status) {
        List<Order> orders = status != null
                ? orderRepository.findByUser_IdAndStatus(userId, status)
                : orderRepository.findByUser_Id(userId);
        for (Order order : orders) {
            if (order.getStatus() == OrderStatus.PENDING && isExpired(order)) {
                cancelOrder(order, LocalDateTime.now());
            }
        }
        return orders.stream().map(this::mapToDetailResponse).toList();
    }

    @Transactional
    public OrderPayResponse payOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUser_Id(orderId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "hóa đơn không tồn tại"));

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

    @Transactional
    public EventCreateResponse getEventCorrespondToOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hóa đơn không tồn tại"));

        if (order.getOrderSeats() == null || order.getOrderSeats().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chỗ ngồi trong hóa đơn");
        }

        Event event = order.getOrderSeats().get(0).getSeat().getSeatType().getEvent();
        return EventCreateResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .categoryId(event.getCategory() != null ? event.getCategory().getId() : null)
                .organizer(event.getOrganizer())
                .description(event.getDescription())
                .address(event.getAddress())
                .bannerUrl(event.getBannerUrl())
                .startTime(event.getStartTime())
                .status(event.getStatus())
                .build();
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
        UUID eventId = null;
        String eventTitle = null;
        if (order.getOrderSeats() != null && !order.getOrderSeats().isEmpty()) {
            Event event = order.getOrderSeats().get(0).getSeat().getSeatType().getEvent();
            eventId = event.getId();
            eventTitle = event.getTitle();
        }

        return OrderDetailResponse.builder()
                .orderId(order.getId())
                .code(order.getCode())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .expiresAt(order.getExpiresAt())
                .createdAt(order.getCreatedAt())
                .eventId(eventId)
                .eventTitle(eventTitle)
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
        String qrPayload = String.format("Mã vé: %s | ID: %s | Trạng thái: %s | Ghế: %s",
                ticket.getQrCode(),
                ticket.getId(),
                ticket.getStatus(),
                buildSeatLabel(seat));
        return TicketSummaryResponse.builder()
                .ticketId(ticket.getId())
                .eventTitle(eventTitle)
                .seatLabel(buildSeatLabel(seat))
                .qrCode(qrPayload)
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
        String code;
        do {
            int randomNum = 10000 + (int)(Math.random() * 90000);
            code = "ORD-" + randomNum;
        } while (orderRepository.existsByCode(code));
        return code;
    }

    private String generateTicketCode() {
        return "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateTicketQrPayload() {
        return "TR-" + UUID.randomUUID();
    }
}
