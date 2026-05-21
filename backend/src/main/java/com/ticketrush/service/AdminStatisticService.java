package com.ticketrush.service;

import com.ticketrush.dto.admin.AgeStatisticDTO;
import com.ticketrush.dto.admin.DailyRevenueDTO;
import com.ticketrush.dto.admin.GenderStatisticDTO;
import com.ticketrush.dto.admin.RevenueStatisticDTO;
import com.ticketrush.entity.Order;
import com.ticketrush.entity.OrderSeat;
import com.ticketrush.entity.enums.Gender;
import com.ticketrush.entity.enums.OrderStatus;
import com.ticketrush.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatisticService {

  private final OrderRepository orderRepository;

  private List<Order> getPaidOrdersForEvent(UUID eventId) {
    return orderRepository.findByEventIdAndStatusWithDetails(eventId, OrderStatus.PAID);
  }

  private long countEventTicketsInOrder(Order order, UUID eventId) {
    if (order == null || order.getOrderSeats() == null || eventId == null) {
      return 0;
    }
    return order.getOrderSeats().stream()
        .filter(os -> os != null 
            && os.getSeat() != null 
            && os.getSeat().getSeatType() != null 
            && os.getSeat().getSeatType().getEvent() != null 
            && eventId.equals(os.getSeat().getSeatType().getEvent().getId()))
        .count();
  }

  private BigDecimal sumEventRevenueInOrder(Order order, UUID eventId) {
    if (order == null || order.getOrderSeats() == null || eventId == null) {
      return BigDecimal.ZERO;
    }
    return order.getOrderSeats().stream()
        .filter(os -> os != null 
            && os.getSeat() != null 
            && os.getSeat().getSeatType() != null 
            && os.getSeat().getSeatType().getEvent() != null 
            && eventId.equals(os.getSeat().getSeatType().getEvent().getId()))
        .map(os -> os.getPriceAtPurchase() != null ? os.getPriceAtPurchase() : BigDecimal.ZERO)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  public List<GenderStatisticDTO> getTicketCountByGender(UUID eventId) {
    List<Order> orders = getPaidOrdersForEvent(eventId);
    System.out.println("======> TÌM ĐƯỢC BAO NHIÊU ĐƠN PAID: " + orders.size());
    Map<Gender, Long> genderCount = new EnumMap<>(Gender.class);

    for (Order order : orders) {
      if (order == null || order.getUser() == null)
        continue;
      Gender gender = order.getUser().getGender();
      if (gender == null)
        continue;

      long ticketCount = countEventTicketsInOrder(order, eventId);
      genderCount.merge(gender, ticketCount, Long::sum);
    }

    return genderCount.entrySet().stream()
        .map(e -> new GenderStatisticDTO(e.getKey(), e.getValue()))
        .collect(Collectors.toList());
  }

  public List<AgeStatisticDTO> getTicketCountByAgeRange(UUID eventId) {
    List<Order> orders = getPaidOrdersForEvent(eventId);
    System.out.println("======> TÌM ĐƯỢC BAO NHIÊU ĐƠN PAID: " + orders.size());

    Map<String, Long> ageRangeCount = new HashMap<>();
    int currentYear = LocalDate.now().getYear();

    for (Order order : orders) {
      if (order == null || order.getUser() == null)
        continue;
      LocalDate birthDate = order.getUser().getBirthDate();
      if (birthDate == null)
        continue;

      int exactAge = currentYear - birthDate.getYear();
      String ageRange = getAgeRangeLabel(exactAge);

      long ticketCount = countEventTicketsInOrder(order, eventId);
      ageRangeCount.merge(ageRange, ticketCount, Long::sum);
    }

    return ageRangeCount.entrySet().stream()
        .map(e -> new AgeStatisticDTO(e.getKey(), e.getValue()))
        .sorted(Comparator.comparing(AgeStatisticDTO::getAgeRange))
        .collect(Collectors.toList());
  }

  public RevenueStatisticDTO getTotalRevenue(UUID eventId) {
    List<Order> orders = getPaidOrdersForEvent(eventId);
    System.out.println("======> TÌM ĐƯỢC BAO NHIÊU ĐƠN PAID: " + orders.size());
    BigDecimal total = BigDecimal.ZERO;

    for (Order order : orders) {
      if (order == null)
        continue;
      BigDecimal orderRevenue = sumEventRevenueInOrder(order, eventId);
      if (orderRevenue != null) {
        total = total.add(orderRevenue);
      }
    }

    return new RevenueStatisticDTO(total);
  }

  public List<DailyRevenueDTO> getDailyRevenue(UUID eventId, LocalDate startDate, LocalDate endDate) {
    List<Order> orders = getPaidOrdersForEvent(eventId);
    System.out.println("======> TÌM ĐƯỢC BAO NHIÊU ĐƠN PAID: " + orders.size());
    Map<LocalDate, BigDecimal> dailyRevenueMap = new HashMap<>();

    for (Order order : orders) {
      if (order == null || order.getCreatedAt() == null)
        continue;
      LocalDate orderDate = order.getCreatedAt().toLocalDate();

      if (startDate != null && orderDate.isBefore(startDate))
        continue;
      if (endDate != null && orderDate.isAfter(endDate))
        continue;

      BigDecimal orderRevenue = sumEventRevenueInOrder(order, eventId);
      if (orderRevenue != null) {
        dailyRevenueMap.merge(orderDate, orderRevenue, BigDecimal::add);
      }
    }

    return dailyRevenueMap.entrySet().stream()
        .map(e -> new DailyRevenueDTO(e.getKey(), e.getValue()))
        .sorted(Comparator.comparing(DailyRevenueDTO::getDate))
        .collect(Collectors.toList());
  }

  private String getAgeRangeLabel(int age) {
    if (age <= 0)
      return "Khác";
    if (age <= 10)
      return "0-10";
    if (age > 70)
      return "71+";
    int start = ((age - 1) / 10) * 10 + 1;
    int end = start + 9;
    return start + "-" + end;
  }
}
