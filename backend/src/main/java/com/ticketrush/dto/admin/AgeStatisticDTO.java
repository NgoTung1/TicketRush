package com.ticketrush.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgeStatisticDTO {
    private String ageRange;
    private Long ticketCount;
}
