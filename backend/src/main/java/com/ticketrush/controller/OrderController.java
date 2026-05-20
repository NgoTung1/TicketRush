package com.ticketrush.controller;

import com.ticketrush.dto.request.order.OrderCreateRequest;
import com.ticketrush.dto.response.event.EventCreateResponse;
import com.ticketrush.dto.response.order.OrderCreateResponse;
import com.ticketrush.dto.response.order.OrderDetailResponse;
import com.ticketrush.dto.response.order.OrderPayResponse;
import com.ticketrush.service.impl.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import com.ticketrush.service.impl.TicketService;
import org.springframework.security.access.prepost.PreAuthorize;
import com.ticketrush.entity.enums.OrderStatus;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<OrderPayResponse> createOrder(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody OrderCreateRequest request
    ) {
        return ResponseEntity.ok(orderService.createAndPayOrder(userId, request));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderDetail(userId, orderId));
    }

    @PostMapping("/{orderId}/pay")
    public ResponseEntity<OrderPayResponse> payOrder(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.payOrder(userId, orderId));
    }

    @GetMapping
    public ResponseEntity<List<OrderDetailResponse>> getMyOrders(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(value = "status", required = false) OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.getMyOrders(userId, status));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDetailResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{orderId}/event")
    public ResponseEntity<EventCreateResponse> getEventByOrder(
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getEventCorrespondToOrder(orderId));
    }

    @GetMapping("/{orderId}/tickets")
    public ResponseEntity<List<com.ticketrush.dto.response.ticket.TicketInOrderResponse>> getTicketsByOrder(
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(ticketService.getTicketsByOrder(orderId));
    }
}
