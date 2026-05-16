import React from 'react';

export type SeatStatus = 'available' | 'selected' | 'vip' | 'booked';

interface SeatProps {
  status?: SeatStatus;
  onClick?: () => void;
}

const Seat: React.FC<SeatProps> = ({ status = 'available', onClick }) => {
  // Ánh xạ trạng thái sang màu sắc tương ứng
  const getBgColor = () => {
    switch (status) {
      case 'vip':
        return 'bg-[#c6ff00]'; // Màu xanh lá mạ (vàng chanh)
      case 'selected':
        return 'bg-[#0000ff]'; // Màu xanh dương
      case 'booked':
        return 'bg-gray-700'; // Màu xám đậm cho ghế đã đặt (nếu có)
      case 'available':
      default:
        return 'bg-[#b3b3b3]'; // Màu xám nhạt mặc định
    }
  };

  return (
    <div
      onClick={onClick}
      className={`w-6 h-6 md:w-8 md:h-8 rounded-[4px] md:rounded-md cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg ${getBgColor()}`}
    />
  );
};

export default Seat;
