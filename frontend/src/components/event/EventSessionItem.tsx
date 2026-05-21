import React from 'react';

export interface EventSessionItemProps {
  time: string;
  date: string;
  price: string;
  status: 'available' | 'sold_out';
  disabled?: boolean;
  actionLabel?: string;
  onActionClick?: () => void;
}

const EventSessionItem: React.FC<EventSessionItemProps> = ({
  time,
  date,
  price,
  status,
  disabled = false,
  actionLabel = "Mua vé ngay",
  onActionClick
}) => {
  const isAvailable = status === 'available' && !disabled;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 px-5 rounded-[8px] bg-[#1E1E1E] hover:bg-[#383838] transition-colors duration-200 mb-3 gap-4 sm:gap-0">
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
        {isAvailable ? (
          <button
            onClick={onActionClick}
            className="px-8 py-1.5 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-[12px] font-bold italic rounded-full transition-colors"
          >
            {actionLabel}
          </button>
        ) : (
          <button
            disabled
            className="px-6 py-1 bg-[#6B6B6B] text-white text-[10px] font-bold italic rounded-full cursor-not-allowed"
          >
            {disabled
              ? actionLabel
              : (actionLabel !== "Mua vé ngay" ? actionLabel : "Đã hết vé")}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventSessionItem;
