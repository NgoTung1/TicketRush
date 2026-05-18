import axiosClient from '@/lib/axios';

export type SeatStatusEnum = 'AVAILABLE' | 'ORDERED' | 'SOLD';

export interface SeatResponse {
  id: string;
  zoneId: string;
  seatTypeId: string | null;
  rowIndex: number;
  colIndex: number;
  seatNumber: number;
  status: SeatStatusEnum;
  userId?: string; // Tạm thời thêm mock giả định userid
}

export interface SeatGenerateRequest {
  seatTypeId?: string;
}

export interface SeatRequest {
  seatTypeId: string;
}

export interface SeatBulkUpdateRequest {
  seatIds: string[];
  newSeatTypeId: string;
}

export const seatApi = {
  generateSeats: (zoneId: string, data: SeatGenerateRequest) =>
    axiosClient.post<SeatResponse[]>(`/zones/seats/generate/${zoneId}`, data),

  getSeatsBySession: (sessionId: string) =>
    axiosClient.get<SeatResponse[]>(`/sessions/seats/${sessionId}`),

  updateSeat: (seatId: string, data: SeatRequest) =>
    axiosClient.put<SeatResponse>(`/seats/${seatId}`, data),

  updateMultipleSeats: (data: SeatBulkUpdateRequest) =>
    axiosClient.put<SeatResponse[]>(`/seats/bulk-update`, data),
};
