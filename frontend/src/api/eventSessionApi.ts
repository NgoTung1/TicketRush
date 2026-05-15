import axiosClient from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventSessionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventSessionCreateRequest {
  name: string;
  startAt: string; // ISO 8601
  endAt: string;
  status?: EventSessionStatus;
}

export interface EventSessionUpdateRequest {
  name?: string;
  startAt?: string;
  endAt?: string;
  status?: EventSessionStatus;
}

export interface EventSessionResponse {
  id: string;
  eventId: string;
  name: string;
  startAt: string;
  endAt: string;
  status: EventSessionStatus;
}


const SESSION_BASE = '/events/sessions';

export const eventSessionApi = {
  /**
   * [PUBLIC] Lấy danh sách phiên diễn ra theo eventId
   */
  getSessionsByEventId: (eventId: string) =>
    axiosClient.get<EventSessionResponse[]>(`${SESSION_BASE}/${eventId}`),

  /**
   * [ADMIN] Tạo phiên sự kiện mới cho một event
   */
  createSession: (eventId: string, data: EventSessionCreateRequest) =>
    axiosClient.post<EventSessionResponse>(`${SESSION_BASE}/${eventId}`, data),

  /**
   * [ADMIN] Cập nhật thông tin một phiên sự kiện
   */
  updateSession: (sessionId: string, data: EventSessionUpdateRequest) =>
    axiosClient.put<EventSessionResponse>(`/sessions/${sessionId}`, data),

  /**
   * [ADMIN] Xóa một phiên sự kiện
   */
  deleteSession: (sessionId: string) =>
    axiosClient.delete<void>(`/sessions/${sessionId}`),
};
