package com.ticketrush.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import com.ticketrush.config.SupabaseProperties;
import com.ticketrush.dto.AuthDTO.AuthTokens;
import com.ticketrush.entity.enums.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final SupabaseProperties supabaseProps;

  private final RestTemplate restTemplate = new RestTemplate();

  // Tạo Header chứa API Key của Supabase
  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("apikey", supabaseProps.key());
    headers.setBearerAuth(supabaseProps.key());
    return headers;
  }

  // Logic Đăng nhập
  public AuthTokens login(String email, String password) {
    String url = supabaseProps.url() + "/auth/v1/token?grant_type=password";

    Map<String, String> body = new HashMap<>();
    body.put("email", email);
    body.put("password", password);

    HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, createHeaders());

    // Gọi sang Supabase
    ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

    // Lấy token từ kết quả trả về
    Map<String, Object> resBody = response.getBody();
    return new AuthTokens(
        (String) resBody.get("access_token"),
        (String) resBody.get("refresh_token"));
  }

  // Đăng ký User (Mặc định)
  public void register(String email, String password, String fullName) {
    registerAccount(email, password, fullName, Role.USER);
  }

  // Đăng ký Admin
  public void registerAdmin(String email, String password, String fullName) {
    registerAccount(email, password, fullName, Role.ADMIN);
  }

  // Gửi mã OTP Quên mật khẩu
  public void sendPasswordResetOtp(String email) {
    String url = supabaseProps.url() + "/auth/v1/recover";

    Map<String, Object> body = new HashMap<>();
    body.put("email", email);
    body.put("should_create_user", false);

    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, createHeaders());
    restTemplate.postForEntity(url, entity, String.class);
  }

  // Reset mật khẩu bằng OTP
  public void resetPasswordWithOtp(String email, String otp, String newPassword) {
    String verifyUrl = supabaseProps.url() + "/auth/v1/verify";
    Map<String, String> verifyBody = new HashMap<>();
    verifyBody.put("email", email);
    verifyBody.put("token", otp);
    verifyBody.put("type", "recovery");

    HttpEntity<Map<String, String>> verifyEntity = new HttpEntity<>(verifyBody, createHeaders());
    ResponseEntity<Map> verifyRes = restTemplate.postForEntity(verifyUrl, verifyEntity, Map.class);
    String tempAccessToken = (String) verifyRes.getBody().get("access_token");

    String updateUrl = supabaseProps.url() + "/auth/v1/user";
    HttpHeaders authHeaders = createHeaders();
    authHeaders.setBearerAuth(tempAccessToken);

    Map<String, String> updateBody = new HashMap<>();
    updateBody.put("password", newPassword);

    HttpEntity<Map<String, String>> updateEntity = new HttpEntity<>(updateBody, authHeaders);
    restTemplate.exchange(updateUrl, HttpMethod.PUT, updateEntity, String.class);
  }

  public void logout(String accessToken) {
    String url = supabaseProps.url() + "/auth/v1/logout";

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("apikey", supabaseProps.key());
    headers.setBearerAuth(accessToken);

    HttpEntity<Void> entity = new HttpEntity<>(headers);

    restTemplate.postForEntity(url, entity, Void.class);
  }

  public AuthTokens refreshToken(String refreshToken) {
    String url = supabaseProps.url() + "/auth/v1/token?grant_type=refresh_token";

    Map<String, String> body = new HashMap<>();
    body.put("refresh_token", refreshToken);

    HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, createHeaders());

    // Gọi sang Supabase xin token mới
    ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
    Map<String, Object> resBody = response.getBody();

    return new AuthTokens(
        (String) resBody.get("access_token"),
        (String) resBody.get("refresh_token"));
  }

  // Hàm lõi dùng chung để đăng ký
  private void registerAccount(String email, String password, String fullName, Role role) {
    String url = supabaseProps.url() + "/auth/v1/signup";

    Map<String, Object> body = new HashMap<>();
    body.put("email", email);
    body.put("password", password);
    body.put("data", Map.of(
        "full_name", fullName,
        "role", role.name()));

    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, createHeaders());
    restTemplate.postForEntity(url, entity, String.class);
  }
}
