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
    if (seat.status === 'SOLD') {
      return { backgroundColor: '#000000' };
    }
    if (seat.status === 'ORDERED' || seat.status === ('LOCKED' as any)) {
      return { backgroundColor: '#666666' };
    }
    return { backgroundColor: color }; // Màu mặc định của loại ghế
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      style={getStyle()}
      className={`seat-element w-6 h-6 md:w-10 md:h-10 rounded-[4px] transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-lg flex items-center justify-center`}
      title={`Ghế ${seat.rowIndex}-${seat.colIndex}`}
    >
      {isSelected && (
        <div className="w-5 h-5 bg-white rounded-full"></div>
      )}
    </div>
  );
};

export default Seat;
