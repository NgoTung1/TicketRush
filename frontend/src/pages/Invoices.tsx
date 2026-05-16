import React, { useState } from 'react';
import { InvoiceItem } from '../components/invoices/InvoiceItem';
import { Pagination } from '../components/invoices/Pagination';
import { Calendar } from 'lucide-react';

// Mock data
const generateMockInvoices = (status: 'paid' | 'cancelled', count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `eksiewp12j3%21${23 + i}`,
    amount: 600000,
    date: status === 'paid' ? '23:01:53 - 20/04/2026' : '23:01:53 - 20/04/2026',
    status
  }));
};

const mockPaidInvoices = generateMockInvoices('paid', 35);
const mockCancelledInvoices = generateMockInvoices('cancelled', 15);

const ITEMS_PER_PAGE = 7;

const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'paid' | 'cancelled'>('paid');
  const [currentPage, setCurrentPage] = useState(1);

  const currentData = activeTab === 'paid' ? mockPaidInvoices : mockCancelledInvoices;
  
  // Actually, to make pagination mock match Figma exactly, we'll pretend there are 50+ pages.
  // Real logic would calculate totalPages from data length:
  // const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);
  const mockTotalPages = 30; // Just for visual similarity to figma (< ... 21 22 23 24 25 ... >)

  // Real data slicing
  const displayedInvoices = currentData.slice(0, ITEMS_PER_PAGE);

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
          
          <button className="flex items-center gap-2 bg-[#1f2937] text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
            <Calendar size={16} />
            02/04/2026 - 25/04/2026
          </button>
        </div>

        {/* Invoices List */}
        <div className="flex flex-col gap-1 min-h-[500px]">
          {displayedInvoices.map((invoice) => (
            <InvoiceItem
              key={invoice.id}
              id={invoice.id}
              amount={invoice.amount}
              date={invoice.date}
              status={invoice.status}
              onViewTicket={() => console.log('View ticket', invoice.id)}
            />
          ))}
          
          {displayedInvoices.length === 0 && (
            <div className="text-gray-500 text-center py-10">
              Không có hóa đơn nào.
            </div>
          )}
        </div>

        {/* Pagination */}
        {displayedInvoices.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={mockTotalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default Invoices;
