package com.ticketrush.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketrush.dto.AuthDTO.*;
import com.ticketrush.service.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/public/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<?> loginWithEmail(@RequestBody LoginRequest request, HttpServletResponse response) {
    AuthTokens tokens = authService.login(request.email(), request.password());
    setRefreshTokenCookie(response, tokens.refreshToken());
    return ResponseEntity.ok(new TokenResponse(tokens.accessToken(), "Đăng nhập thành công!"));
  }

  @PostMapping("/register")
  public ResponseEntity<?> registerWithEmail(@RequestBody RegisterRequest request) {
    authService.register(request.email(), request.password(), request.fullName());

    return ResponseEntity.ok("Đăng ký thành công!");
  }

  @PostMapping("/register-admin")
  public ResponseEntity<?> registerAdminWithEmail(@RequestBody RegisterRequest request) {
    authService.registerAdmin(request.email(), request.password(), request.fullName());
    return ResponseEntity.ok("Tạo tài khoản Admin thành công!");
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
    authService.sendPasswordResetOtp(request.email());

    return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    authService.resetPasswordWithOtp(request.email(), request.code(), request.password());

    return ResponseEntity.ok("Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
  }

  @PostMapping("/oauth-success")
  public ResponseEntity<?> handleOAuthSuccess(@RequestBody OAuthSuccessRequest request, HttpServletResponse response) {
    setRefreshTokenCookie(response, request.refreshToken());
    return ResponseEntity.ok("Xử lý OAuth thành công, Cookie đã được thiết lập!");
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      HttpServletResponse response) {

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String accessToken = authHeader.substring(7);
      try {
        authService.logout(accessToken);
      } catch (Exception e) {
        System.out.println("Lỗi khi gọi Supabase logout (Có thể token đã hết hạn): " + e.getMessage());
      }
    }
    clearRefreshTokenCookie(response);

    return ResponseEntity.ok("Đăng xuất thành công!");
  }

  @PostMapping("/refresh")
  public ResponseEntity<?> refreshToken(
      @CookieValue(name = "refresh_token", required = false) String refreshToken,
      HttpServletResponse response) {

    // Nếu trình duyệt gửi lên mà không có Cookie
    if (refreshToken == null || refreshToken.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không tìm thấy Refresh Token!");
    }

    try {
      AuthTokens tokens = authService.refreshToken(refreshToken);

      setRefreshTokenCookie(response, tokens.refreshToken());
      return ResponseEntity.ok(new TokenResponse(tokens.accessToken(), "Làm mới token thành công!"));
    } catch (Exception e) {
      clearRefreshTokenCookie(response);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token không hợp lệ hoặc đã hết hạn");
    }
  }

  private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
    Cookie refreshTokenCookie = new Cookie("refresh_token", refreshToken);
    refreshTokenCookie.setHttpOnly(true);
    refreshTokenCookie.setSecure(true); // Bật true khi lên HTTPS
    refreshTokenCookie.setPath("/");
    refreshTokenCookie.setMaxAge(30 * 24 * 60 * 60); // 30 ngày

    response.addHeader("Set-Cookie", refreshTokenCookie.getName() + "=" + refreshTokenCookie.getValue() +
        "; HttpOnly; Secure; Path=/; Max-Age=" + refreshTokenCookie.getMaxAge() +
        "; SameSite=Strict");
  }

  private void clearRefreshTokenCookie(HttpServletResponse response) {
    response.addHeader("Set-Cookie", "refresh_token=" +
        "; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict");
  }
}
