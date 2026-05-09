package com.ticketrush.dto;

import com.ticketrush.entity.enums.Gender;
import java.time.LocalDate;

public class UserDTO {
  public record UserProfileResponse(
      String fullName,
      Gender gender,
      String phone,
      String email,
      LocalDate birthDate,
      String avatarUrl) {
  }

  public record UpdateProfileRequest(
      String fullName,
      Gender gender,
      String phone,
      LocalDate birthDate) {
  }
}