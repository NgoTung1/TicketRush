import axiosClient from '@/lib/axios';

export interface UpdateProfilePayload {
  fullName: string | null;
  gender: string | null;
  phone: string | null;
  birthDate: string | null;
}

export interface UserProfileResponse {
  fullName: string;
  email: string;
  avatarUrl: string;
  gender: string | null;
  phone: string | null;
  birthDate: string | null;
}

export const userApi = {
  /** GET /api/users/me */
  getProfile: () =>
    axiosClient.get<any, UserProfileResponse>('/api/users/me'),

  /**
   * PUT /api/users/me (multipart/form-data)
   * @param data - JSON payload for profile fields
   * @param avatarFile - optional cropped avatar file
   */
  updateProfile: (data: UpdateProfilePayload, avatarFile?: File | Blob) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (avatarFile) {
      formData.append('avatar', avatarFile, 'avatar.jpg');
    }
    return axiosClient.put<any, UserProfileResponse>('/api/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
