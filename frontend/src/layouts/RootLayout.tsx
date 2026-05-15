import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/ui/Loading';
import { useAuthStore } from '@/store/AuthStore';
import { setAccessToken } from '@/lib/axios';
import axios from 'axios';
import NotifyForm from '@/components/ui/NotifyForm';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToastStore } from '@/store/ToastStore';
import QueueMiniWidget from '@/components/ui/QueueMiniWidget';
import { useRoomStore } from '@/store/RoomStore';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '@/api/roomApi';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

const RootLayout: React.FC = () => {
  const location = useLocation();
  const hideFooter =
    location.pathname === '/auth' ||
    location.pathname === '/profile';

  const [isRestoring, setIsRestoring] = useState(true);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const addToast = useToastStore((state) => state.addToast);
  const { activeRoom, isNotifyOpen, setNotifyOpen, clearActiveRoom } = useRoomStore();
  const navigate = useNavigate();

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
        className="relative flex-1 bg-background text-white"
      >
        <div className="h-full max-w-[1440px] mx-auto px-2 py-8">
          <Outlet />
        </div>
      </main>

      {/* ── Footer (hidden on auth and profile pages) ────────────────── */}
      {!hideFooter && <Footer />}

      <ToastContainer />

      <NotifyForm
        isOpen={isNotifyOpen}
        onClose={() => setNotifyOpen(false)}
        title="Nhắc nhở"
        onConfirm={() => { }}
        confirmText="Xác nhận">
        Sự kiện này hiện đang có lượng truy cập lớn! Để đảm bảo tính công bằng bạn đã được xếp vào hàng chờ tự động
      </NotifyForm>

      {/* <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 bg-black/80 p-4 rounded-xl">
        <h3 className="text-white text-sm font-bold text-center mb-1">🛠️ Bảng Test Toast</h3>

        <button
          onClick={() => addToast({
            type: 'error',
            title: 'Thanh toán thất bại!',
            message: <>Hóa đơn với mã số <strong>eksiewp12j3%2123</strong> cho sự kiện <strong>Spark Nite</strong> đã bị hủy do quá thời hạn thanh toán</>
          })}
          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/40 rounded text-sm transition-colors"
        >
          Hiện Lỗi (Error)
        </button>

        <button
          onClick={() => addToast({
            type: 'warning',
            title: 'Nhắc nhở',
            message: <>Hiện bạn đang có hóa đơn với mã số <u>eksiewp12j3%2123</u> cho sự kiện <strong>Spark Nite</strong> sắp hết hạn vẫn chưa được thanh toán, vui lòng kiểm tra trang quản lý vé và hoàn tất thanh toán</>
          })}
          className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/40 rounded text-sm transition-colors"
        >
          Hiện Nhắc nhở (Warning)
        </button>

        <button
          onClick={() => addToast({
            type: 'success',
            title: 'Đặt vé thành công!',
            message: 'Vui lòng kiểm tra hóa đơn đã thanh toán tại trang quản lý vé để xem chi tiết'
          })}
          className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/40 rounded text-sm transition-colors"
        >
          Hiện Thành công (Success)
        </button>
      </div> */}

      {activeRoom && !location.pathname.startsWith(`/event/${activeRoom.eventId}/room`) && (
        <div className="fixed bottom-6 right-6 z-[50] flex flex-col gap-4">
          <QueueMiniWidget
            imageUrl="https://picsum.photos/seed/queue/400/300"
            eventName="Sự kiện đang tham gia"
            status={activeRoom.status}
            timeLeft={activeRoom.timeLeft}
            onNavigate={() => {
              navigate(`/event/${activeRoom.eventId}/room`);
            }}
            onCancel={async () => {
              if (activeRoom) {
                try {
                  await roomApi.leaveRoom(activeRoom.eventId);
                } catch (e) {
                  console.error("Lỗi leave room:", e);
                } finally {
                  clearActiveRoom();
                }
              }
            }}
          />
        </div>
      )}
    </div >
  );
};

export default RootLayout;
