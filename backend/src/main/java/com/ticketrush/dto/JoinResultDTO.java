package com.ticketrush.dto;

public class JoinResultDTO {
  private String status;
  private Long expireAt;
  private Integer position; // Null nếu là ACTIVE_ROOM, có số nếu ở WAITING_ROOM

  public JoinResultDTO(String status, Long expireAt) {
    this.status = status;
    this.expireAt = expireAt;
    this.position = null;
  }

  public JoinResultDTO(String status, Long expireAt, Integer position) {
    this.status = status;
    this.expireAt = expireAt;
    this.position = position;
  }

  // Bắt buộc phải có Getter để Spring Boot có thể chuyển thành JSON
  public String getStatus() {
    return status;
  }

  public Long getExpireAt() {
    return expireAt;
  }

  public Integer getPosition() {
    return position;
  }
}
