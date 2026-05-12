import React from 'react';

interface InvoiceItemProps {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'cancelled';
  onViewTicket?: () => void;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({
  id,
  amount,
  date,
  status,
  onViewTicket
}) => {
  return (
    <div className="bg-[#1f2937] text-white p-4 rounded-lg flex justify-between items-center w-full mb-3 shadow-sm border border-gray-700">
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">Mã hóa đơn: {id}</div>
        <div className="text-sm">
          <span className="text-gray-400">Tổng chi phí: </span>
          <span className="text-green-500 font-semibold">
            {amount.toLocaleString('vi-VN')}đ
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {status === 'paid' ? 'Thời điểm tạo: ' : 'Thời điểm hủy: '}
          {date}
        </div>
      </div>
      <div>
        <button 
          onClick={onViewTicket}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold py-1.5 px-4 rounded-full transition-colors"
        >
          Thông tin vé
        </button>
      </div>
    </div>
  );
};
