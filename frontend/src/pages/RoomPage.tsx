import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomApi } from '@/api/roomApi';
import { getAccessToken } from '@/lib/axios';
import { useRoomStore } from '@/store/RoomStore';

export function RoomPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeRoom, clearActiveRoom } = useRoomStore();

  useEffect(() => {
    if (!activeRoom || activeRoom.eventId !== eventId) {
      navigate(`/event/${eventId}`);
    }
  }, [activeRoom, eventId, navigate]);

  useEffect(() => {
    if (!eventId) return;

    const handleTabClose = () => {
      const token = getAccessToken();
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

      fetch(`${baseURL}api/tickets/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        keepalive: true
      }).catch(err => console.error("Lỗi khi báo leave room:", err));
    };

    // Bắt sự kiện người dùng tắt trình duyệt, f5, hoặc đóng tab
    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, [eventId]);

  const handleLeaveRoom = async () => {
    if (!eventId) return;
    try {
      await roomApi.leaveRoom(eventId);
    } catch (err) {
      console.error("Lỗi leave room:", err);
    } finally {
      clearActiveRoom();
      navigate(`/event/${eventId}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Phòng Chờ / Thanh Toán</h1>
      <p className="text-gray-400 mb-8 max-w-md text-center">
        Bạn đang trong hàng đợi để mua vé. Bạn có thể thu nhỏ phòng để tiếp tục lướt web,
        hoặc nhấn "Hủy xếp hàng" nếu không muốn tham gia nữa.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors font-medium"
        >
          Thu nhỏ phòng
        </button>

        <button
          onClick={handleLeaveRoom}
          className="px-6 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 rounded-lg transition-colors font-medium"
        >
          Hủy xếp hàng
        </button>
      </div>
    </div>
  );
}