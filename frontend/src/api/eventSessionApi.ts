import axiosClient from '@/lib/axios';


export type EventSessionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventSessionCreateRequest {
  name: string;
  startAt: string;
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
  getSessionsByEventId: (eventId: string) =>
    axiosClient.get<EventSessionResponse[]>(`${SESSION_BASE}/${eventId}`),

  createSession: (eventId: string, data: EventSessionCreateRequest) =>
    axiosClient.post<EventSessionResponse>(`${SESSION_BASE}/${eventId}`, data),

  updateSession: (sessionId: string, data: EventSessionUpdateRequest) =>
    axiosClient.put<EventSessionResponse>(`/sessions/${sessionId}`, data),

  deleteSession: (sessionId: string) =>
    axiosClient.delete<void>(`/sessions/${sessionId}`),
};
