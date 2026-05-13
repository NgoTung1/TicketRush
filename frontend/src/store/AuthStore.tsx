import { create } from 'zustand';
import axiosClient from '@/lib/axios';

interface UserProfile {
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
  isAuthenticated: false,

  fetchUserProfile: async () => {
    try {
      const userData = await axiosClient.get<any, UserProfile>('/api/users/me');
      set({ user: userData, isAuthenticated: true });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      set({ user: null, isAuthenticated: false });
    }
  },

  clearUser: () => set({ user: null, isAuthenticated: false }),
}));