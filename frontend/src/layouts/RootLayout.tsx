import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/ui/Loading';
import { useAuthStore } from '@/store/AuthStore';
import { setAccessToken } from '@/lib/axios';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

const RootLayout: React.FC = () => {
  const location = useLocation();
  const hideFooter =
    location.pathname === '/auth' ||
    location.pathname === '/profile';

  const [isRestoring, setIsRestoring] = useState(true);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);

  // Restore session on app mount by trying to refresh token via httpOnly cookie
  useEffect(() => {
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
        }
      } catch {
        // No valid session — user stays unauthenticated, that's fine
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  if (isRestoring) {
    return <Loading visible />;
  }

  return (
    <div
      id="root-layout"
      className="min-h-screen flex flex-col font-roboto"
    >
      {/* ── Header ──────────────────────────────────────── */}
      <Header />

      {/* ── Main Content ────────────────────────────────── */}
      <main
        className="relative flex-1"
      >
        <Outlet />
      </main>

      {/* ── Footer (hidden on auth and profile pages) ────────────────── */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default RootLayout;
