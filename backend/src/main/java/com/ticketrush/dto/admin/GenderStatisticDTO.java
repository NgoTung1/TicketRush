package com.ticketrush.dto.admin;

import com.ticketrush.entity.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenderStatisticDTO {
    private Gender gender;
    private Long ticketCount;
}
