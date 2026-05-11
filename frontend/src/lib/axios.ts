import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, 
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {

    return response.data;
  },
  (error) => {

    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Unauthorized! Cần đăng nhập lại.');
      } else if (error.response.status === 403) {
        console.warn('Forbidden! Bạn không có quyền truy cập.');
      } else if (error.response.status === 500) {
        console.error('Lỗi Server nội bộ!');
      }
    } else if (error.request) {
      console.error('Không nhận được phản hồi từ server:', error.request);
    } else {
      console.error('Lỗi thiết lập request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
