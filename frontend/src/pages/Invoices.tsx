import React, { useEffect } from 'react';
import { InvoiceItem } from '../components/invoices/InvoiceItem';
import { Pagination } from '../components/invoices/Pagination';
import { Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/InvoiceStore';

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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      <div className="max-w-7xl mx-auto w-full px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Hóa đơn</h1>
        
        {/* Controls: Tabs & DatePicker */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => handleTabChange('paid')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'paid' 
                ? 'bg-gray-600 text-white' 
                : 'bg-[#1f2937] text-gray-400 hover:text-gray-200'
            }`}
          >
            Đã thanh toán
          </button>
          
          <button
            onClick={() => handleTabChange('cancelled')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'cancelled' 
                ? 'bg-gray-600 text-white' 
                : 'bg-[#1f2937] text-gray-400 hover:text-gray-200'
            }`}
          >
            Đã hủy
          </button>
          
          <div className="flex items-center gap-2 bg-[#1f2937] text-gray-300 px-4 py-2 rounded-md text-sm font-medium">
            <Calendar size={16} />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-gray-300 focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
            <span>-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-gray-300 focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
                className="ml-1 text-gray-400 hover:text-red-400 transition-colors rounded-full p-0.5"
                title="Xóa khoảng thời gian"
              >
                <X size={16} />
              </button>
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
