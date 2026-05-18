import axiosClient from '@/lib/axios';

export interface OrderSeatResponse {
  seatId: string;
  seatLabel: string;
  priceAtPurchase: number;
}

export interface OrderDetailResponse {
  orderId: string;
  code: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  expiresAt: string;
  createdAt: string;
  seats: OrderSeatResponse[];
}

export interface EventCreateResponse {
  id: string;
  title: string;
  categoryId: string;
  organizer: string;
  description: string;
  address: string;
  bannerUrl: string;
  startTime: string;
  status: string;
}

export const orderApi = {
  getAllOrders: (params: { status?: string; from?: string; to?: string }) =>
    axiosClient.get<OrderDetailResponse[]>('api/orders', { params }),

  getOrderTicketDetail: (orderId: string) =>
    axiosClient.get<OrderDetailResponse>(`api/orders/${orderId}/ticket-detail`),

  getEventByOrder: (orderId: string) =>
    axiosClient.get<EventCreateResponse>(`api/orders/${orderId}/event`),
};
