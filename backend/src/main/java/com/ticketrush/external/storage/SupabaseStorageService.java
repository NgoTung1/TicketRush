package com.ticketrush.external.storage;

import com.ticketrush.config.SupabaseProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService implements FileStorageService {

  private final SupabaseProperties supabaseProps;
  private final RestTemplate restTemplate = new RestTemplate();

  @Override
  public String uploadFile(MultipartFile file, String folder) {
    try {
      String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
      String bucket = supabaseProps.bucket();

      String cleanFolder = folder.replaceAll("^/|/$", "");

      String url = String.format("%s/storage/v1/object/%s/%s/%s",
          supabaseProps.url(), bucket, cleanFolder, fileName);

      // Cấu hình Header
      HttpHeaders headers = new HttpHeaders();
      headers.set("Authorization", "Bearer " + supabaseProps.key());
      headers.setContentType(MediaType.valueOf(file.getContentType()));

      HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

      // Bắn file sang Supabase
      ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

      if (response.getStatusCode().is2xxSuccessful()) {
        return String.format("%s/storage/v1/object/public/%s/%s/%s",
            supabaseProps.url(), bucket, cleanFolder, fileName);
      } else {
        throw new RuntimeException("Upload thất bại! HTTP Status: " + response.getStatusCode());
      }
    } catch (Exception e) {
      throw new RuntimeException("Lỗi khi upload ảnh: " + e.getMessage());
    }
  }
}