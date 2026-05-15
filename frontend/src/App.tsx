import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import { useAuthStore } from '@/store/AuthStore';

function App() {
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);

  useEffect(() => {
    // Gọi API lấy profile ngay khi app load để khôi phục trạng thái đăng nhập
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile();
    }
  }, [fetchUserProfile]);

  return <RouterProvider router={router} />;
}

export default App;
