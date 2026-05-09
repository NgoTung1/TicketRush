package com.ticketrush.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ticketrush.dto.UserDTO.UpdateProfileRequest;
import com.ticketrush.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  private UUID getUserIdFromToken(Jwt jwt) {
    return UUID.fromString(jwt.getSubject());
  }

  @GetMapping("/me")
  public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
    UUID userId = getUserIdFromToken(jwt);
    return ResponseEntity.ok(userService.getUserProfile(userId));
  }

  @PutMapping(value = "/me", consumes = "multipart/form-data")
  public ResponseEntity<?> updateMyProfile(
      @AuthenticationPrincipal Jwt jwt,
      @RequestPart("data") String dataJson,
      @RequestPart(value = "avatar", required = false) MultipartFile file) {

    try {
      UUID userId = getUserIdFromToken(jwt);

      ObjectMapper objectMapper = new ObjectMapper();
      objectMapper.registerModule(new JavaTimeModule()); // Bắt buộc để xử lý LocalDate

      UpdateProfileRequest request = objectMapper.readValue(dataJson, UpdateProfileRequest.class);
      return ResponseEntity.ok(userService.updateUserProfile(userId, request, file));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Lỗi dữ liệu đầu vào: " + e.getMessage());
    }
  }
}