package com.ticketrush.service;

import com.ticketrush.dto.admin.AgeStatisticDTO;
import com.ticketrush.dto.admin.DailyRevenueDTO;
import com.ticketrush.dto.admin.GenderStatisticDTO;
import com.ticketrush.dto.admin.RevenueStatisticDTO;
import com.ticketrush.entity.enums.Gender;
import com.ticketrush.entity.enums.OrderStatus;
import com.ticketrush.repository.OrderSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatisticService {

  private final OrderSeatRepository orderSeatRepository;

  public List<GenderStatisticDTO> getTicketCountByGender(UUID eventId) {
    List<Object[]> results = orderSeatRepository.countTicketsByGender(eventId, OrderStatus.PAID);
    Map<Gender, Long> genderCount = new EnumMap<>(Gender.class);

    for (Object[] result : results) {
      Gender gender = (Gender) result[0];
      Long count = (Long) result[1];
      
      if (gender == null) {
        gender = Gender.OTHER;
      }
      genderCount.merge(gender, count, Long::sum);
    }

    return genderCount.entrySet().stream()
        .map(e -> new GenderStatisticDTO(e.getKey(), e.getValue()))
        .collect(Collectors.toList());
  }

  public List<AgeStatisticDTO> getTicketCountByAgeRange(UUID eventId) {
    List<Object[]> results = orderSeatRepository.countTicketsByBirthDate(eventId, OrderStatus.PAID);
    Map<String, Long> ageRangeCount = new HashMap<>();
    int currentYear = LocalDate.now().getYear();

    for (Object[] result : results) {
      LocalDate birthDate = (LocalDate) result[0];
      Long count = (Long) result[1];
      
      if (birthDate == null) {
        ageRangeCount.merge("Khác", count, Long::sum);
        continue;
      }

      int exactAge = currentYear - birthDate.getYear();
      String ageRange = getAgeRangeLabel(exactAge);
      ageRangeCount.merge(ageRange, count, Long::sum);
    }

    return ageRangeCount.entrySet().stream()
        .map(e -> new AgeStatisticDTO(e.getKey(), e.getValue()))
        .sorted(Comparator.comparing(AgeStatisticDTO::getAgeRange))
        .collect(Collectors.toList());
  }

  public RevenueStatisticDTO getTotalRevenue(UUID eventId) {
    BigDecimal total = orderSeatRepository.sumRevenueByEventAndStatus(eventId, OrderStatus.PAID);
    if (total == null) {
      total = BigDecimal.ZERO;
    }
    return new RevenueStatisticDTO(total);
  }

  public List<DailyRevenueDTO> getDailyRevenue(UUID eventId, LocalDate startDate, LocalDate endDate) {
    List<Object[]> results = orderSeatRepository.findRevenueDetailsByEventAndStatus(eventId, OrderStatus.PAID);
    Map<LocalDate, BigDecimal> dailyRevenueMap = new HashMap<>();

    for (Object[] result : results) {
      LocalDateTime createdAt = (LocalDateTime) result[0];
      BigDecimal price = (BigDecimal) result[1];
      
      if (createdAt == null || price == null) continue;
      
      LocalDate orderDate = createdAt.toLocalDate();

      if (startDate != null && orderDate.isBefore(startDate))
        continue;
      if (endDate != null && orderDate.isAfter(endDate))
        continue;

      dailyRevenueMap.merge(orderDate, price, BigDecimal::add);
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
