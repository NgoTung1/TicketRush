import axiosClient from '@/lib/axios';

const BASE = '/events/seat-types';

// ─── Types (mirror backend DTOs) ──────────────────────────────────────────────

export interface SeatTypeResponse {
  id: string;       // UUID → string
  eventId: string;
  name: string;
  price: number;    // Integer (VND)
  label: string;    // e.g. "VIP", "Standard"
  color: string;    // hex color for seat map display
}

export interface SeatTypeRequest {
  id?: string;
  name: string;
  price: number;
  label: string;
  color: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const seatTypeApi = {
  /**
   * [PUBLIC] Lấy tất cả loại vé của một sự kiện
   * GET /events/seat-types/{eventId}
   */
  getSeatTypesByEventId: (eventId: string) =>
    axiosClient.get<SeatTypeResponse[]>(`${BASE}/${eventId}`),

  /**
   * [ADMIN] Tạo / cập nhật loại vé cho sự kiện
   * POST /events/seat-types/{eventId}
   */
  saveSeatType: (eventId: string, data: SeatTypeRequest) =>
    axiosClient.post<SeatTypeResponse>(`${BASE}/${eventId}`, data),
};
