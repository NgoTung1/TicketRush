package com.ticketrush.dto;

import java.time.LocalDateTime;

public class ErrorDTO {
  public record ErrorResponse(
      LocalDateTime timestamp,
      int status,
      String error,
      String message,
      String path) {
  }
}
