import axiosClient from '@/lib/axios';

export interface ZoneResponse {
  id: string;
  sessionId: string;
  name: string;
  rowsCount: number;
  colsCount: number;
}

export interface ZoneRequest {
  name: string;
  rowsCount: number;
  colsCount: number;
}

export const zoneApi = {
  createZone: (sessionId: string, data: ZoneRequest) =>
    axiosClient.post<ZoneResponse>(`/sessions/zones/${sessionId}`, data),

  updateZone: (zoneId: string, data: ZoneRequest) =>
    axiosClient.put<ZoneResponse>(`/zones/${zoneId}`, data),
};
