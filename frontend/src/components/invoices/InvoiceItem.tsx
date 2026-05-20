import React from 'react';

interface InvoiceItemProps {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'cancelled';
  onViewTicket?: () => void;
  onViewSeats?: () => void;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({
  id,
  amount,
  date,
  status,
  onViewTicket,
  onViewSeats
}) => {
  return (
    <div 
      onClick={status === 'paid' ? onViewSeats : undefined}
      className={`bg-[#1E1E1E] hover:bg-[#383838] text-white p-4 rounded-xl flex justify-between items-start w-full mb-3 shadow-sm transition-colors duration-200 ${status === 'paid' ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col gap-1">
        <div className="text-[14px] font-bold">Mã hóa đơn: {id}</div>
        <div className="text-[14px]">
          <span className="text-white font-bold">Tổng chi phí: </span>
          <span className={`font-semibold italic ${status === 'cancelled' ? 'text-[#FF3C3C] line-through' : 'text-[#00FF1E]'}`}>
            {amount.toLocaleString('vi-VN')}đ
          </span>
        </div>
        <div className="text-[14px] text-white font-bold">
          {status === 'paid' ? 'Thời điểm tạo: ' : 'Thời điểm hủy: '}
          {date}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewTicket?.();
        }}
        className="bg-[#0090FF] hover:bg-[#0284c7] text-white text-[12px] font-bold py-1.5 px-4 rounded-full transition-colors"
      >
        Thông tin vé
      </button>
    </div>
  );
};
