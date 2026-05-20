import React from 'react';
import { SeatResponse } from '@/api/seatApi';
import { useAuthStore } from '@/store/AuthStore';

interface SeatProps {
  seat: SeatResponse;
  color?: string; // Màu sắc từ SeatType
  isSelected?: boolean; // Trạng thái chọn ở phía client
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
}

const Seat: React.FC<SeatProps> = ({ seat, color = '#b3b3b3', isSelected, onMouseDown, onMouseEnter }) => {
  const currentUser = useAuthStore(state => state.user);
  const isPurchasedByUser = seat.status === 'SOLD' && seat.userId && (currentUser?.id || 'mock-user-id') === seat.userId;

  const getStyle = () => {
    if (seat.status === 'SOLD' && !isPurchasedByUser) {
      return { backgroundColor: '#000000' };
    }
    if (seat.status === 'ORDERED' || seat.status === ('LOCKED' as any)) {
      return { backgroundColor: '#8D8D8D' };
    }
    return { backgroundColor: color }; // Màu mặc định của loại ghế
  };

  const isUnselectable = (seat.status === 'SOLD' && !isPurchasedByUser) || seat.status === 'ORDERED' || seat.status === ('LOCKED' as any);

  return (
    <div
      onMouseDown={isUnselectable ? undefined : onMouseDown}
      onMouseEnter={isUnselectable ? undefined : onMouseEnter}
      style={getStyle()}
      className={`seat-element w-6 h-6 md:w-10 md:h-10 rounded-[4px] transition-all duration-200 flex items-center justify-center ${isUnselectable ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-110 hover:shadow-lg'}`}
      title={`Ghế ${seat.rowIndex}-${seat.colIndex}`}
    >
      {(isSelected || isPurchasedByUser) && (
        <div className="w-[24px] h-[24px] bg-white rounded-full shadow-sm"></div>
      )}
    </div>
  );
};

export default React.memo(Seat, (prevProps, nextProps) => {
  // Chỉ vẽ lại (re-render) nếu:
  // 1. Trạng thái của ghế thay đổi (Ví dụ: Từ AVAILABLE -> ORDERED)
  // 2. Trạng thái được chọn (có chấm trắng hay không) thay đổi
  return (
    prevProps.seat.status === nextProps.seat.status &&
    prevProps.isSelected === nextProps.isSelected
  );
});