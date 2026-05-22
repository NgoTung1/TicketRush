import axiosClient from '@/lib/axios';

const BASE = '/events/seat-types';


export interface SeatTypeResponse {
  id: string;
  eventId: string;
  name: string;
  price: number;
  label: string;
  color: string;
}

export interface SeatTypeRequest {
  id?: string;
  name: string;
  price: number;
  label: string;
  color: string;
}


export const seatTypeApi = {
  getSeatTypesByEventId: (eventId: string) =>
    axiosClient.get<SeatTypeResponse[]>(`${BASE}/${eventId}`),

  saveSeatType: (eventId: string, data: SeatTypeRequest) =>
    axiosClient.post<SeatTypeResponse>(`${BASE}/${eventId}`, data),
};
