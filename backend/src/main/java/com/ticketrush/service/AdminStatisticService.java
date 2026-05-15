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
    return order.getOrderSeats().stream()
        .filter(os -> os.getSeat().getSeatType().getEvent().getId().equals(eventId))
        .count();
  }

  private BigDecimal sumEventRevenueInOrder(Order order, UUID eventId) {
    return order.getOrderSeats().stream()
        .filter(os -> os.getSeat().getSeatType().getEvent().getId().equals(eventId))
        .map(OrderSeat::getPriceAtPurchase)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  public List<GenderStatisticDTO> getTicketCountByGender(UUID eventId) {
    List<Order> orders = getPaidOrdersForEvent(eventId);
    Map<Gender, Long> genderCount = new EnumMap<>(Gender.class);

    for (Order order : orders) {
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

    // Key bây giờ là String (chứa tên các khoảng tuổi)
    Map<String, Long> ageRangeCount = new HashMap<>();
    int currentYear = LocalDate.now().getYear();

    for (Order order : orders) {
      LocalDate birthDate = order.getUser().getBirthDate();
      if (birthDate == null)
        continue;

      int exactAge = currentYear - birthDate.getYear();

      // GỌI HÀM QUY ĐỔI Ở ĐÂY
      String ageRange = getAgeRangeLabel(exactAge);

      long ticketCount = countEventTicketsInOrder(order, eventId);

      // Vẫn dùng hàm merge thần thánh, nhưng lúc này nó sẽ bỏ vào các rổ "11-20",
      // "21-30"...
      ageRangeCount.merge(ageRange, ticketCount, Long::sum);
    }

    // Chuyển Map thành List DTO trả về cho Frontend
    return ageRangeCount.entrySet().stream()
        .map(e -> new AgeStatisticDTO(e.getKey(), e.getValue()))
        // Mẹo: Sắp xếp theo tên khoảng tuổi (String) để UI hiển thị theo thứ tự từ bé
        // đến lớn
        .sorted(Comparator.comparing(AgeStatisticDTO::getAgeRange))
        .collect(Collectors.toList());
  }

  public RevenueStatisticDTO getTotalRevenue(UUID eventId) {
    List<Order> orders = getPaidOrdersForEvent(eventId);
    BigDecimal total = BigDecimal.ZERO;

    for (Order order : orders) {
      total = total.add(sumEventRevenueInOrder(order, eventId));
    }

    return new RevenueStatisticDTO(total);
  }

  public List<DailyRevenueDTO> getDailyRevenue(UUID eventId, LocalDate startDate, LocalDate endDate) {
    List<Order> orders = getPaidOrdersForEvent(eventId);
    Map<LocalDate, BigDecimal> dailyRevenueMap = new HashMap<>();

    for (Order order : orders) {
      LocalDate orderDate = order.getCreatedAt().toLocalDate();

      if (startDate != null && orderDate.isBefore(startDate))
        continue;
      if (endDate != null && orderDate.isAfter(endDate))
        continue;

      BigDecimal orderRevenue = sumEventRevenueInOrder(order, eventId);
      dailyRevenueMap.merge(orderDate, orderRevenue, BigDecimal::add);
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
