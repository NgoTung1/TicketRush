import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useToastStore } from './ToastStore';

interface ActiveRoom {
  eventId: string;
  status: 'waiting' | 'ready';
  expiresAt?: number; // Dùng số millisecond làm chuẩn gốc
  timeLeft?: string;  // Chỉ dùng để show UI (VD: 09:59)
  position?: number;
  eventName?: string;
  imageUrl?: string;
}

interface RoomState {
  activeRoom: ActiveRoom | null;
  timerId: ReturnType<typeof setInterval> | null;
  isNotifyOpen: boolean;

  setActiveRoom: (room: ActiveRoom | null) => void;
  clearActiveRoom: () => void;
  setNotifyOpen: (open: boolean) => void;
  startTimer: () => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      activeRoom: null,
      timerId: null,
      isNotifyOpen: false,

      setActiveRoom: (room) => {
        const currentTimer = get().timerId;
        if (currentTimer) clearInterval(currentTimer);

        if (!room) {
          set({ activeRoom: null, timerId: null });
          return;
        }

        // Kiểm tra an toàn: Lỡ Component quên check quá hạn, Store check lại lần nữa
        if (room.status === 'ready' && room.expiresAt) {
          if (room.expiresAt <= Date.now()) {
            set({ activeRoom: null, timerId: null });
            useToastStore.getState().addToast({
              type: 'warning',
              title: 'Hết thời gian',
              message: 'Phiên của bạn đã hết hạn, vui lòng xếp hàng lại.'
            });
            return; // Đuổi luôn, không set vào State
          }
        }

        set({ activeRoom: room });

        if (room.status === 'ready') {
          get().startTimer();
        }
      },

      clearActiveRoom: () => {
        const currentTimer = get().timerId;
        if (currentTimer) clearInterval(currentTimer);
        set({ activeRoom: null, timerId: null });
      },

      setNotifyOpen: (open) => set({ isNotifyOpen: open }),

      startTimer: () => {
        const timerId = setInterval(() => {
          const room = get().activeRoom;
          // Nếu mất phòng hoặc không có hạn -> Dừng đếm
          if (!room || room.status !== 'ready' || !room.expiresAt) {
            clearInterval(get().timerId as any);
            return;
          }

          const remainingMs = room.expiresAt - Date.now();

          if (remainingMs <= 0) { // HẾT GIỜ KHI ĐANG MỞ TRANG
            clearInterval(get().timerId as any);
            set({ activeRoom: null, timerId: null });

            // Đá người dùng về trang sự kiện chính thông qua React Router ở component, 
            // hoặc đơn giản là để component tự nhận diện activeRoom == null và đẩy ra.
            useToastStore.getState().addToast({
              type: 'warning',
              title: 'Hết thời gian giữ chỗ!',
              message: 'Thời gian thanh toán kết thúc. Vui lòng xếp hàng lại.'
            });
            // Optional: window.location.href = `/event/${room.eventId}`; (Để ép chuyển trang nếu cần)
          } else {
            // Cập nhật chuỗi hiển thị
            const totalSeconds = Math.floor(remainingMs / 1000);
            const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            set({
              activeRoom: { ...room, timeLeft: `${m}:${s}` }
            });
          }
        }, 1000);

        set({ timerId });
      }
    }),
    {
      name: 'room-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ activeRoom: state.activeRoom }),
      onRehydrateStorage: () => (state) => {
        if (state && state.activeRoom && state.activeRoom.status === 'ready' && state.activeRoom.expiresAt) {
          // Bắt sự kiện người dùng F5 trang web
          if (state.activeRoom.expiresAt <= Date.now()) {
            state.clearActiveRoom(); // F5 mà hết giờ -> Xóa luôn
          } else {
            setTimeout(() => {
              state.startTimer(); // F5 mà còn giờ -> Tiếp tục đếm đồng hồ
            }, 0);
          }
        }
      }
    }
  )
);