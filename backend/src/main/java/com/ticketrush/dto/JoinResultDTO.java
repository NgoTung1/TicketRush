package com.ticketrush.dto;

public class JoinResultDTO {
  private String status;
  private Long expireAt;

  public JoinResultDTO(String status, Long expireAt) {
    this.status = status;
    this.expireAt = expireAt;
  }

  // Bắt buộc phải có Getter để Spring Boot có thể chuyển thành JSON
  public String getStatus() {
    return status;
  }

  public Long getExpireAt() {
    return expireAt;
  }
}
