import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import axiosClient, { setAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/store/AuthStore';
import { getRoleFromToken } from '@/helpers/jwt';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile)

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          throw new Error("Không lấy được phiên đăng nhập Google");
        }

        const accessToken = session.access_token;
        const refreshToken = session.refresh_token;

        await axiosClient.post('/api/public/auth/oauth-success', {
          refreshToken: refreshToken
        });

        setAccessToken(accessToken);

        await fetchUserProfile();

        // Ưu tiên: 1) oauth_redirect_to (localStorage)  2) sessionStorage (global)  3) role-based default
        const savedRedirect = localStorage.getItem('oauth_redirect_to') || sessionStorage.getItem('redirect_after_login');

        const role = getRoleFromToken(accessToken);
        if (role?.toLowerCase() === 'admin') {
          navigate('/admin/event-list', { replace: true });
        } else if (savedRedirect) {
          navigate(savedRedirect, { replace: true });
        } else {
          navigate('/', { replace: true });
        }

      } catch (err) {
        console.error("Lỗi xác thực OAuth:", err);
        navigate('/auth?error=oauth_failed');
      }
    };

    handleOAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <h2 className="text-[12px] italic">Đang xử lý đăng nhập Google, vui lòng đợi...</h2>
    </div>
  );
};

export default OAuthCallback;