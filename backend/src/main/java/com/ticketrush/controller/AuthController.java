package com.ticketrush.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
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

    System.out.println("[LOGIN] Đã tạo Access Token: "
        + tokens.accessToken().substring(0, Math.min(20, tokens.accessToken().length())) + "...");
    System.out.println("[LOGIN] Đã tạo Refresh Token: "
        + tokens.refreshToken().substring(0, Math.min(20, tokens.refreshToken().length())) + "...");

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
    System.out.println("[OAUTH SUCCESS] Refresh Token MỚI: " + request.refreshToken() + "...");
    setRefreshTokenCookie(response, request.refreshToken());
    System.out.println("[OAUTH SUCCESS] SET REFRESHTOKEN!!!!");
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

    System.out.println("[REFRESH API] Bắt đầu quá trình xin cấp lại Token...");
    System.out.println("[REFRESH API] Giá trị Refresh Token lấy từ Cookie: " +
        (refreshToken == null ? "NULL" : refreshToken + "..."));

    // Nếu trình duyệt gửi lên mà không có Cookie
    if (refreshToken == null || refreshToken.isEmpty()) {
      System.out.println("[REFRESH API] LỖI: Trình duyệt không gửi Cookie 'refresh_token' lên server!");
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không tìm thấy Refresh Token!");
    }

    try {
      AuthTokens tokens = authService.refreshToken(refreshToken);

      System.out.println("[REFRESH API] Xin cấp Token mới thành công!");
      System.out.println("[REFRESH API] Access Token MỚI: " + tokens.accessToken() + "...");
      System.out.println("[REFRESH API] Refresh Token MỚI: " + tokens.refreshToken() + "...");

      setRefreshTokenCookie(response, tokens.refreshToken());
      return ResponseEntity.ok(new TokenResponse(tokens.accessToken(), "Làm mới token thành công!"));
    } catch (Exception e) {
      clearRefreshTokenCookie(response);

      System.out.println("[REFRESH API] LỖI: Refresh Token này bị từ chối. Lý do: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token không hợp lệ hoặc đã hết hạn");
    }
  }

  private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
    ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
        .httpOnly(true)
        .secure(true)
        .path("/")
        .maxAge(30 * 24 * 60 * 60)
        .sameSite("None")
        .build();

    response.addHeader("Set-Cookie", cookie.toString());
  }

  private void clearRefreshTokenCookie(HttpServletResponse response) {
    ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
        .httpOnly(true)
        .secure(true)
        .path("/")
        .maxAge(0) // Set về 0 để xóa
        .sameSite("None")
        .build();

    response.addHeader("Set-Cookie", cookie.toString());
  }
}
