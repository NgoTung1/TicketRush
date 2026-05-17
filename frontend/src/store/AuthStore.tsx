import { create } from 'zustand';
import axiosClient, { getAccessToken } from '@/lib/axios';
import { getIdFromToken } from '@/helpers/jwt';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  gender: string | null;
  phone: string | null;
  birthDate: string | null;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  fetchUserProfile: () => Promise<void>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getAccessToken(),

  fetchUserProfile: async () => {
    try {
      const token = getAccessToken();
      const id = token ? getIdFromToken(token) || '' : '';
      const userData = await axiosClient.get<any, Omit<UserProfile, 'id'>>('/api/users/me');
      set({ user: { ...userData, id } as UserProfile, isAuthenticated: true });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      set({ user: null, isAuthenticated: false });
    }
  },

  clearUser: () => set({ user: null, isAuthenticated: false }),
}));