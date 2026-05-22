import axiosClient from '@/lib/axios';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EventStatus = 'ONCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

// ─── Event Types ──────────────────────────────────────────────────────────────

export interface EventCreateRequest {
  title: string;
  categoryId: string;
  organizer: string;
  description?: string;
  address: string;
  bannerUrl?: string;
  startTime: string;
  status?: EventStatus;
}

export interface EventUpdateRequest {
  title?: string;
  categoryId?: string;
  organizer?: string;
  description?: string;
  address?: string;
  bannerUrl?: string;
  startTime?: string;
  status?: EventStatus;
}

export interface EventResponse {
  id: string;
  title: string;
  categoryId: string;
  organizer: string;
  description?: string;
  address: string;
  bannerUrl: string;
  startTime: string;
  status: EventStatus;
  minPrice?: number | null;
}

export interface EventSearchParams {
  category_id?: string;
  status?: EventStatus;
  keyword?: string;
  date?: string;      // Thêm dòng này để truyền yyyy-mm-dd
  page?: number;
  size?: number;
}

const EVENT_BASE = '/events';

export const eventApi = {
  /**
   * [PUBLIC] Lấy danh sách sự kiện, hỗ trợ lọc theo danh mục, trạng thái và phân trang
   */
  getEvents: (params?: EventSearchParams) =>
    axiosClient.get<EventResponse[]>(EVENT_BASE, { params }),

  /**
   * [PUBLIC] Lấy chi tiết một sự kiện theo ID
   */
  getEventById: (id: string) =>
    axiosClient.get<EventResponse>(`${EVENT_BASE}/${id}`),

  /**
   * [PUBLIC] Lấy danh sách sự kiện gợi ý khi đang gõ chữ
   */
  getHotSuggestions: (keyword: string) =>
    axiosClient.get<EventResponse[]>(`${EVENT_BASE}/suggestions`, { params: { keyword } }),

  /**
   * [ADMIN] Tạo sự kiện mới (multipart/form-data: "data" + "banner")
   */
  createEvent: (data: EventCreateRequest, banner?: File) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (banner) formData.append('banner', banner);
    return axiosClient.post<EventResponse>(EVENT_BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * [ADMIN] Cập nhật thông tin sự kiện (multipart/form-data: "data" + "banner")
   */
  updateEvent: (id: string, data: EventUpdateRequest, banner?: File) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (banner) formData.append('banner', banner);
    return axiosClient.put<EventResponse>(`${EVENT_BASE}/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * [ADMIN] Xóa sự kiện theo ID
   */
  deleteEvent: (id: string) =>
    axiosClient.delete<void>(`${EVENT_BASE}/${id}`),
};

