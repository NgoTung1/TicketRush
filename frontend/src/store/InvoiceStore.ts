import { create } from 'zustand';
import { orderApi, OrderDetailResponse } from '../api/orderApi';

interface InvoiceState {
  activeTab: 'paid' | 'cancelled';
  currentPage: number;
  orders: OrderDetailResponse[];
  loading: boolean;
  startDate: string;
  endDate: string;
  hasFetched: boolean;

  setActiveTab: (tab: 'paid' | 'cancelled') => void;
  setCurrentPage: (page: number) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  fetchOrders: () => Promise<void>;
  resetDateRange: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  activeTab: 'paid',
  currentPage: 1,
  orders: [],
  loading: false,
  startDate: '',
  endDate: '',
  hasFetched: false,

  setActiveTab: (tab) => set({ activeTab: tab, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setStartDate: (date) => set({ startDate: date, currentPage: 1 }),
  setEndDate: (date) => set({ endDate: date, currentPage: 1 }),
  resetDateRange: () => set({ startDate: '', endDate: '', currentPage: 1 }),

  fetchOrders: async () => {
    const { activeTab } = get();
    set({ loading: true });
    try {
      const status = activeTab === 'paid' ? 'PAID' : 'CANCELLED';
      const data = await orderApi.getAllOrders({ status });
      set({ orders: (data as any) || [], hasFetched: true });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      set({ orders: [], hasFetched: false });
    } finally {
      set({ loading: false });
    }
  },
}));
