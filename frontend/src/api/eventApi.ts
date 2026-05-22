import axiosClient from '@/lib/axios';

export type EventStatus = 'ONCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';


export interface EventCreateRequest {
  title: string;
  categoryId: string;
  organizer: string;
  description?: string;
  address: string;
  bannerUrl?: string;
  startTime: string;
  status?: EventStatus;
  maxTicketPerUser?: number;
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
  maxTicketPerUser?: number;
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
  maxTicketPerUser?: number;
}

export interface EventSearchParams {
  category_id?: string;
  status?: EventStatus;
  keyword?: string;
  date?: string;
  page?: number;
  size?: number;
}

const EVENT_BASE = '/events';

export const eventApi = {
  getEvents: (params?: EventSearchParams) =>
    axiosClient.get<EventResponse[]>(EVENT_BASE, { params }),

  getEventById: (id: string) =>
    axiosClient.get<EventResponse>(`${EVENT_BASE}/${id}`),

  getHotSuggestions: (keyword: string) =>
    axiosClient.get<EventResponse[]>(`${EVENT_BASE}/suggestions`, { params: { keyword } }),

  createEvent: (data: EventCreateRequest, banner?: File) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (banner) formData.append('banner', banner);
    return axiosClient.post<EventResponse>(EVENT_BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateEvent: (id: string, data: EventUpdateRequest, banner?: File) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (banner) formData.append('banner', banner);
    return axiosClient.put<EventResponse>(`${EVENT_BASE}/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteEvent: (id: string) =>
    axiosClient.delete<void>(`${EVENT_BASE}/${id}`),
};

