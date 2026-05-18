import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useToastStore } from './ToastStore';

interface ActiveRoom {
  eventId: string;
  status: 'waiting' | 'ready';
  timeLeft?: string;
  expiresAt?: number;
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
    if (currentTimer) {
      clearInterval(currentTimer);
    }

    if (!room) {
      set({ activeRoom: null, timerId: null });
      return;
    }

    if (room.status === 'ready' && !room.expiresAt) {
      let minutes = 10;
      let seconds = 0;

      if (room.timeLeft) {
        const parts = room.timeLeft.split(':');
        if (parts.length === 2) {
          const parsedMins = parseInt(parts[0], 10);
          const parsedSecs = parseInt(parts[1], 10);

          minutes = !isNaN(parsedMins) ? parsedMins : 1;
          seconds = !isNaN(parsedSecs) ? parsedSecs : 0;
        }
      }

      // Tính toán dựa trên giá trị đã parse chính xác
      room.expiresAt = Date.now() + (minutes * 60 + seconds) * 1000;
    }

    set({ activeRoom: room });

    if (room.status === 'ready') {
      get().startTimer();
    }
  },

  clearActiveRoom: () => {
    const currentTimer = get().timerId;
    if (currentTimer) {
      clearInterval(currentTimer);
    }
    set({ activeRoom: null, timerId: null });
  },

  setNotifyOpen: (open) => set({ isNotifyOpen: open }),

  startTimer: () => {
    const timerId = setInterval(() => {
      const room = get().activeRoom;
      if (!room || room.status !== 'ready' || !room.expiresAt) {
        clearInterval(get().timerId as any);
        return;
      }

      const remainingMs = room.expiresAt - Date.now();
      if (remainingMs <= 0) {
        clearInterval(get().timerId as any);
        set({ activeRoom: null, timerId: null });
        useToastStore.getState().addToast({
          type: 'warning',
          title: 'Hết thời gian giữ chỗ!',
          message: 'Thời gian chờ trong phòng thanh toán của bạn đã kết thúc. Vui lòng xếp hàng lại nếu chưa mua được vé.'
        });
      } else {
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
          if (state.activeRoom.expiresAt <= Date.now()) {
            state.clearActiveRoom();
          } else {
            setTimeout(() => {
              state.startTimer();
            }, 0);
          }
        }
      }
    }
  )
);
