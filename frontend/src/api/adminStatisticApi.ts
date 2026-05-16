import axiosClient from '../lib/axios';

export interface GenderStatistic {
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  ticketCount: number;
}

export interface AgeStatistic {
  ageRange: string;
  ticketCount: number;
}

export interface RevenueStatistic {
  totalRevenue: number;
}

export interface DailyRevenue {
  date: string; // ISO Date "YYYY-MM-DD"
  revenue: number;
}

export const adminStatisticApi = {
  getGenderStats: async (eventId: string): Promise<GenderStatistic[]> => {
    const response: any = await axiosClient.get(`/admin/statistics/events/${eventId}/gender`);
    return response?.data ?? response;
  },

  getAgeStats: async (eventId: string): Promise<AgeStatistic[]> => {
    const response: any = await axiosClient.get(`/admin/statistics/events/${eventId}/age`);
    return response?.data ?? response;
  },

  getTotalRevenue: async (eventId: string): Promise<RevenueStatistic> => {
    const response: any = await axiosClient.get(`/admin/statistics/events/${eventId}/revenue/total`);
    return response?.data ?? response;
  },

  getDailyRevenue: async (
    eventId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DailyRevenue[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response: any = await axiosClient.get(`/admin/statistics/events/${eventId}/revenue/daily${queryString}`);
    return response?.data ?? response;
  },
};
