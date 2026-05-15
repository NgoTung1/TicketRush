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

        await supabase.auth.signOut();

        const role = getRoleFromToken(accessToken);
        if (role?.toLowerCase() === 'admin') {
          navigate('/admin/event-list');
        } else {
          navigate('/');
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