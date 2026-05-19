import axiosClient from '@/lib/axios';

export interface RoomResponse {
  status: string;
  message: string;
  expireAt?: number;
  unblockAt?: number;
}

const TICKET_BASE = '/api/tickets';

export const roomApi = {
  joinRoom: (eventId: string): Promise<RoomResponse> =>
    axiosClient.post(`${TICKET_BASE}/${eventId}/join`),

  leaveRoom: (eventId: string): Promise<RoomResponse> =>
    axiosClient.post(`${TICKET_BASE}/${eventId}/leave`),
};