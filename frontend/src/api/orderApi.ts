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

export const orderApi = {
  getAllOrders: (params: { status?: string; from?: string; to?: string }) =>
    axiosClient.get<OrderDetailResponse[]>('api/orders', { params }),

  getOrderTicketDetail: (orderId: string) =>
    axiosClient.get<OrderDetailResponse>(`api/orders/${orderId}/ticket-detail`),
};
