import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import { setAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/store/AuthStore';
import { getRoleFromToken } from '@/helpers/jwt';
import axios from 'axios';
import Loading from '@/components/ui/Loading';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

function App() {
  const [isRestoring, setIsRestoring] = useState(true);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    // Lắng nghe event khi token hết hạn từ axios
    const handleUnauthorized = () => {
      clearUser();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [clearUser]);

  useEffect(() => {
    // Không cần restore nếu đang ở trang callback của OAuth
    if (window.location.pathname === '/auth/callback') {
      setIsRestoring(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const res = await axios.post(
          `${baseURL}api/public/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          await fetchUserProfile();

          // Điều hướng theo role: admin → /admin/event-list, user → ở lại trang hiện tại
          const role = getRoleFromToken(newAccessToken);
          if (role?.toLowerCase() === 'admin') {
            // Chỉ redirect nếu đang ở trang public (không phải đã ở trang admin)
            if (!window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/event-list';
              return; // Không setIsRestoring vì trang sẽ reload
            }
          }
        }
      } catch {
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [fetchUserProfile]);

  if (isRestoring) {
    return <Loading visible />;
  }

  return <RouterProvider router={router} />;
}

export default App;
