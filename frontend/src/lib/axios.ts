import axios from 'axios';
import { getIdFromToken } from '@/helpers/jwt';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ---------------------------------------------
// REQUEST INTERCEPTOR: Chặn trước khi gửi đi
// ---------------------------------------------
axiosClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      const userId = getIdFromToken(accessToken);
      if (userId) {
        config.headers['X-User-Id'] = userId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------
// RESPONSE INTERCEPTOR: Xử lý Lỗi & Cấp lại Token
// ---------------------------------------------
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      // Chặn chống lặp vô hạn: Nếu API đang gọi chính là API refresh bị 401 thì dừng luôn
      if (originalRequest.url.includes('/api/public/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}api/public/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data.accessToken;

        setAccessToken(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosClient(originalRequest);

      } catch (refreshError) {
        console.warn('Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.');
        setAccessToken(null);
        // Lưu trang hiện tại để sau khi đăng nhập xong quay lại đúng chỗ
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath && currentPath !== '/auth') {
          sessionStorage.setItem('redirect_after_login', currentPath);
        }
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      if (error.response.status === 403) {
        console.warn('Forbidden! Bạn không có quyền truy cập.');
      } else if (error.response.status === 500) {
        console.error('Lỗi Server nội bộ!');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;