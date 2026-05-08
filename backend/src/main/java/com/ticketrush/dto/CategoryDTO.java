package com.ticketrush.dto;

import java.util.UUID;

public class CategoryDTO {
  public record CategoryRequest(
      String name) {
  }

  public record CategoryResponse(
      UUID id,
      String name,
      boolean isDeleted) {
  }
}