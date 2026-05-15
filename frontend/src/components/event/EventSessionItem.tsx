import React from 'react';

export interface EventSessionItemProps {
  time: string;
  date: string;
  price: string;
  status: 'available' | 'sold_out';
}

const EventSessionItem: React.FC<EventSessionItemProps> = ({ time, date, price, status }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 sm:p-5 rounded-xl bg-[#2a2a2a] border border-white/5 mb-3 gap-4 sm:gap-0">
      <div className="flex flex-col gap-1.5 text-[14px]">
        <div className="text-white font-medium">
          <span className="text-white font-bold w-20 inline-block">Thời gian:</span> {time}
        </div>
        <div className="text-white font-medium">
          <span className="text-white font-bold w-20 inline-block">Ngày diễn:</span> {date}
        </div>
        <div className="text-[#00FF1E] font-bold italic">
          <span className="text-white font-bold w-20 inline-block">Giá vé:</span> {price}
        </div>
      </div>
      <div className="flex sm:block justify-end">
        {status === 'available' ? (
          <button className="px-8 py-1.5 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-[12px] font-bold italic rounded-full transition-colors">
            Mua vé ngay
          </button>
        ) : (
          <button className="px-8 py-1.5 bg-[#6B6B6B] text-white text-[12px] font-bold italic rounded-full cursor-not-allowed">
            Đã hết vé
          </button>
        )}
      </div>
    </div>
  );
};

export default EventSessionItem;
