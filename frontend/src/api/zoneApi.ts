import axiosClient from '@/lib/axios';

export interface ZoneResponse {
  id: string;
  sessionId: string;
  name: string;
  rowsCount: number;
  colsCount: number;
  xPosition?: number;
  yPosition?: number;
}

export interface ZoneRequest {
  name: string;
  rowsCount: number;
  colsCount: number;
  xPosition?: number;
  yPosition?: number;
}

export const zoneApi = {
  getZonesBySessionId: (sessionId: string) =>
    axiosClient.get<ZoneResponse[]>(`/sessions/zones/${sessionId}`),

  createZone: (sessionId: string, data: ZoneRequest) =>
    axiosClient.post<ZoneResponse>(`/sessions/zones/${sessionId}`, data),

  updateZone: (zoneId: string, data: ZoneRequest) =>
    axiosClient.put<ZoneResponse>(`/zones/${zoneId}`, data),
};
