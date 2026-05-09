package com.ticketrush.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTO {

  public record LoginRequest(
      @NotBlank @Email String email,
      @NotBlank String password) {
  }

  public record RegisterRequest(
      @NotBlank @Email String email,
      @NotBlank @Size(min = 6) String password,
      @NotBlank String fullName) {
  }

  public record TokenResponse(
      String accessToken,
      String message) {
  }

  public record AuthTokens(
      String accessToken,
      String refreshToken) {
  }

  public record OAuthSuccessRequest(
      String refreshToken) {
  }

  public record ForgotPasswordRequest(
      @NotBlank @Email String email) {
  }

  public record ResetPasswordRequest(
      @NotBlank String code,
      @NotBlank @Email String email,
      @NotBlank @Size(min = 6) String password) {
  }
}