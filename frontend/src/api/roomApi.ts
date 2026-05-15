import axiosClient from '@/lib/axios';

export interface RoomResponse {
  status: string;
  message: string;
}

const TICKET_BASE = '/api/tickets';

export const roomApi = {
  joinRoom: (eventId: string) =>
    axiosClient.post<RoomResponse>(`${TICKET_BASE}/${eventId}/join`),

  leaveRoom: (eventId: string) =>
    axiosClient.post<RoomResponse>(`${TICKET_BASE}/${eventId}/leave`),
};
