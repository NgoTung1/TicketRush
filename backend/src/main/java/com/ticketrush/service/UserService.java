package com.ticketrush.service;

import com.ticketrush.dto.UserDTO.UpdateProfileRequest;
import com.ticketrush.dto.UserDTO.UserProfileResponse;
import com.ticketrush.entity.User;
import com.ticketrush.external.storage.FileStorageService;
import com.ticketrush.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final FileStorageService fileStorageService;

  public UserProfileResponse getUserProfile(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

    return new UserProfileResponse(
        user.getFullName(),
        user.getGender(),
        user.getPhone(),
        user.getEmail(),
        user.getBirthDate(),
        user.getAvatarUrl());
  }

  public UserProfileResponse updateUserProfile(UUID userId, UpdateProfileRequest request, MultipartFile avatarFile) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

    if (request.fullName() != null) user.setFullName(request.fullName());
    if (request.gender()   != null) user.setGender(request.gender());
    if (request.phone()    != null) user.setPhone(request.phone());
    if (request.birthDate()!= null) user.setBirthDate(request.birthDate());
    if (avatarFile != null && !avatarFile.isEmpty()) {
      String avatarUrl = fileStorageService.uploadFile(avatarFile, "avatars");
      user.setAvatarUrl(avatarUrl);
    }

    User updatedUser = userRepository.save(user);

    return new UserProfileResponse(
        updatedUser.getFullName(),
        updatedUser.getGender(),
        updatedUser.getPhone(),
        updatedUser.getEmail(),
        updatedUser.getBirthDate(),
        updatedUser.getAvatarUrl());
  }
}