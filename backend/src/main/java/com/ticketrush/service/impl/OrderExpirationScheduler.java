package com.ticketrush.service.impl;

import com.ticketrush.entity.Order;
import com.ticketrush.entity.enums.OrderStatus;
import com.ticketrush.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderExpirationScheduler {
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Scheduled(fixedDelayString = "60000")
    @Transactional
    public void releaseExpiredOrders() {
        List<Order> expiredOrders = orderRepository.findAllByStatusAndExpiresAtBefore(
                OrderStatus.PENDING,
                LocalDateTime.now()
        );

        for (Order order : expiredOrders) {
            orderService.cancelOrder(order, LocalDateTime.now());
        }
    }
}

