package com.ticketrush.controller;

import com.ticketrush.dto.admin.AgeStatisticDTO;
import com.ticketrush.dto.admin.DailyRevenueDTO;
import com.ticketrush.dto.admin.GenderStatisticDTO;
import com.ticketrush.dto.admin.RevenueStatisticDTO;
import com.ticketrush.service.AdminStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticController {

    private final AdminStatisticService adminStatisticService;

    @GetMapping("/events/{eventId}/gender")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GenderStatisticDTO>> getTicketCountByGender(@PathVariable UUID eventId) {
        return ResponseEntity.ok(adminStatisticService.getTicketCountByGender(eventId));
    }

    @GetMapping("/events/{eventId}/age")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AgeStatisticDTO>> getTicketCountByAge(@PathVariable UUID eventId) {
        return ResponseEntity.ok(adminStatisticService.getTicketCountByAgeRange(eventId));
    }

    @GetMapping("/events/{eventId}/revenue/total")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RevenueStatisticDTO> getTotalRevenue(@PathVariable UUID eventId) {
        return ResponseEntity.ok(adminStatisticService.getTotalRevenue(eventId));
    }

    @GetMapping("/events/{eventId}/revenue/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DailyRevenueDTO>> getDailyRevenue(
            @PathVariable UUID eventId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok(adminStatisticService.getDailyRevenue(eventId, startDate, endDate));
    }
}
