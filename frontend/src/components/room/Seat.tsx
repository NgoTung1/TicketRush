import React from 'react';
import { SeatResponse } from '@/api/seatApi';

interface SeatProps {
  seat: SeatResponse;
  color?: string; // Màu sắc từ SeatType
  isSelected?: boolean; // Trạng thái chọn ở phía client
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
}

const Seat: React.FC<SeatProps> = ({ seat, color = '#b3b3b3', isSelected, onMouseDown, onMouseEnter }) => {
  const isAvailable = seat.status === 'AVAILABLE';

  const getStyle = () => {
    if (isSelected) {
      return { backgroundColor: '#0000ff' }; // xanh dương (đang chọn)
    }
    if (!isAvailable) {
      return { backgroundColor: '#4b5563', opacity: 0.5 }; // xám (đã bán/đã đặt)
    }
    return { backgroundColor: color }; // màu mặc định của loại ghế
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      style={getStyle()}
      className={`seat-element w-6 h-6 md:w-8 md:h-8 rounded-[4px] md:rounded-md transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-lg`}
      title={`Ghế ${seat.rowIndex}-${seat.colIndex}`}
    />
  );
};

export default Seat;
