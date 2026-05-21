import React, { useEffect, useState, useRef } from 'react';
import { InvoiceItem } from '../components/invoices/InvoiceItem';
import { Pagination } from '../components/invoices/Pagination';
import { Calendar, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/InvoiceStore';
import { orderApi } from '@/api/orderApi';

const ITEMS_PER_PAGE = 7;

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeTab, setActiveTab,
    currentPage, setCurrentPage,
    orders, fetchOrders,
    loading,
    startDate, setStartDate,
    endDate, setEndDate
  } = useInvoiceStore();

  const handleViewSeats = async (orderId: string) => {
    try {
      const response: any = await orderApi.getEventByOrder(orderId);
      if (response && response.id) {
        navigate(`/event/${response.id}/seat-selected`, { state: { orderId } });
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi không thể lấy thông tin sự kiện");
    }
  };

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, activeTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} - ${day}`;
  };

  const filteredOrders = orders.filter((order) => {
    if (order.status.toLowerCase() !== activeTab) return false;

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const orderDate = new Date(order.createdAt);
      if (orderDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const orderDate = new Date(order.createdAt);
      if (orderDate > end) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const displayedInvoices = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: 'paid' | 'cancelled') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 on tab change
  };

  return (
    <div className="bg-background text-white font-sans">
      <div className="mx-auto w-full my-2">
        <div className="mx-auto">
          <h1 className="text-[32px] font-bold mb-2">Hóa đơn</h1>

          {/* Controls: Tabs & DatePicker */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => handleTabChange('paid')}
              className={`px-4 py-1.5 rounded-[8px] text-[12px] font-bold transition-colors ${activeTab === 'paid'
                ? 'bg-[#5A5A5A] text-white'
                : 'bg-[#414141] text-white/80 hover:text-gray-200'
                }`}
            >
              Đã thanh toán
            </button>

            <button
              onClick={() => handleTabChange('cancelled')}
              className={`px-4 py-1.5 rounded-[8px] text-[12px] font-bold transition-colors ${activeTab === 'cancelled'
                ? 'bg-[#5A5A5A] text-white'
                : 'bg-[#414141] text-white/80 hover:text-gray-200'
                }`}
            >
              Đã hủy
            </button>

            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2  bg-[#3F3F3F] hover:bg-[#4E4E4E] text-white px-4 py-1.5 rounded-[8px] text-[12px] font-bold transition-all duration-200"
              >
                <Calendar size={16} className="text-white shrink-0" />
                <span className="font-roboto tracking-wide">
                  {startDate || endDate ? (
                    <>
                      {startDate ? formatDisplayDate(startDate) : '...'}
                      {' - '}
                      {endDate ? formatDisplayDate(endDate) : '...'}
                    </>
                  ) : (
                    'Chọn khoảng thời gian'
                  )}
                </span>
                <ChevronDown size={16} className={`text-white transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDatePickerOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl p-4 shadow-2xl flex flex-col gap-3 min-w-[280px] animate-[fadeIn_0.15s_ease-out]">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-medium">Từ ngày</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-tr-accent w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-medium">Đến ngày</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-tr-accent w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setCurrentPage(1);
                        setIsDatePickerOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg transition-colors border border-red-500/20 w-full"
                    >
                      <X size={14} />
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Invoices List */}
          <div className="flex flex-col gap-1 min-h-[500px]">
            {loading ? (
              <div className="text-gray-500 text-center py-10">Đang tải...</div>
            ) : displayedInvoices.length > 0 ? (
              displayedInvoices.map((invoice) => (
                <InvoiceItem
                  key={invoice.orderId}
                  id={invoice.code}
                  amount={invoice.totalAmount}
                  date={formatDate(invoice.createdAt)}
                  status={invoice.status.toLowerCase() as 'paid' | 'cancelled'}
                  onViewTicket={() => {
                    if (invoice.status.toLowerCase() === 'paid') {
                      navigate(`/ticket/${invoice.orderId}`);
                    } else {
                      navigate(`/ticket/cancelled/${invoice.orderId}`);
                    }
                  }}
                  onViewSeats={() => handleViewSeats(invoice.orderId)}
                />
              ))
            ) : (
              <div className="text-gray-500 text-center py-10">
                Không có hóa đơn nào.
              </div>
            )}
          </div>

          {/* Pagination */}
          {displayedInvoices.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Invoices;
