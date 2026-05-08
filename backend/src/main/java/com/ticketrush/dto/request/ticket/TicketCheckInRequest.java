package com.ticketrush.dto.request.ticket;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TicketCheckInRequest {
    private String qrCode;
}

