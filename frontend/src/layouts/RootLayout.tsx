import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ui/ToastContainer';
import QueueMiniWidget from '@/components/ui/QueueMiniWidget';
import { useRoomStore } from '@/store/RoomStore';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '@/api/roomApi';

const RootLayout: React.FC = () => {
  const location = useLocation();
  const hideFooter =
    location.pathname === '/auth' ||
    location.pathname === '/profile';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const { activeRoom, clearActiveRoom } = useRoomStore();
  const navigate = useNavigate();

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
        <div className="h-full max-w-[1440px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Footer (hidden on auth and profile pages) ────────────────── */}
      {!hideFooter && <Footer />}

      <ToastContainer />

      {activeRoom && !location.pathname.startsWith(`/event/${activeRoom.eventId}/room`) && !location.pathname.startsWith('/checkout') && (
        <div className="fixed bottom-6 right-6 z-[20] flex flex-col gap-4">
          <QueueMiniWidget
            imageUrl={activeRoom.imageUrl || "https://picsum.photos/seed/queue/400/300"}
            eventName={activeRoom.eventName || "Sự kiện đang tham gia"}
            status={activeRoom.status}
            position={activeRoom.position}
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
