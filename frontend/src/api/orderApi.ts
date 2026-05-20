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

export interface TicketInOrderResponse {
  id: string;
  ticketCode: string;
  zone: string;
  row: string;
  number: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  price: number;
  qrData: string;
  qrCodeImageBase64: string;
  eventTitle: string;
}

export const orderApi = {
  createOrder: (data: { sessionId: string; seatIds: string[] }) =>
    axiosClient.post<{ orderId: string }>('api/orders', data),

  payOrder: (orderId: string) =>
    axiosClient.post(`api/orders/${orderId}/pay`),

  getAllOrders: (params: { status?: string; from?: string; to?: string }) =>
    axiosClient.get<OrderDetailResponse[]>('api/orders', { params }),

  getOrderTicketDetail: (orderId: string) =>
    axiosClient.get<OrderDetailResponse>(`api/orders/${orderId}/ticket-detail`),

  getEventByOrder: (orderId: string) =>
    axiosClient.get<EventCreateResponse>(`api/orders/${orderId}/event`),

  getTicketsByOrder: (orderId: string) =>
    axiosClient.get<TicketInOrderResponse[]>(`api/orders/${orderId}/tickets`),
};
