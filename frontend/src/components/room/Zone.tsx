import React, { useState, useEffect } from 'react';
import Seat from './Seat';
import { SeatResponse } from '@/api/seatApi';
import { SeatTypeResponse } from '@/api/seatTypeApi';

interface ZoneProps {
  name: string;
  seatsMatrix: (SeatResponse | null)[][]; // Mảng 2 chiều các ghế, có thể chứa null (ô trống)
  seatTypes: SeatTypeResponse[]; // Danh sách các loại ghế để lấy màu
  selectedSeatIds: string[]; // Danh sách ID các ghế đang được chọn
  onSeatSelect?: (seat: SeatResponse, mode: 'add' | 'remove') => void;
}

const Zone: React.FC<ZoneProps> = ({ name, seatsMatrix, seatTypes, selectedSeatIds, onSeatSelect }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'add' | 'remove' | null>(null);

  // Theo dõi khi thả chuột ở bất kỳ đâu để kết thúc quét chọn
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false);
      setSelectionMode(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleSeatMouseDown = (e: React.MouseEvent, seat: SeatResponse) => {
    if (e.shiftKey) return; // Không quét bôi đen nếu đang giữ shift (để dành cho kéo zone)
    setIsSelecting(true);
    const mode = selectedSeatIds.includes(seat.id) ? 'remove' : 'add';
    setSelectionMode(mode);
    onSeatSelect?.(seat, mode);
  };

  const handleSeatMouseEnter = (e: React.MouseEvent, seat: SeatResponse) => {
    if (isSelecting && selectionMode && !e.shiftKey) {
      onSeatSelect?.(seat, selectionMode);
    }
  };
  // Lấy màu sắc dựa trên seatTypeId
  const getSeatColor = (seatTypeId: string | null) => {
    if (!seatTypeId) return '#b3b3b3'; // Xám mặc định
    const type = seatTypes.find(t => t.id === seatTypeId);
    return type?.color || '#b3b3b3';
  };

  // Tính số lượng cột lớn nhất để render Header Cột (1, 2, 3...)
  const maxCols = seatsMatrix.length > 0 ? Math.max(...seatsMatrix.map(row => row.length)) : 0;
  const colHeaders = Array.from({ length: maxCols }, (_, i) => i + 1);

  return (
    <div className="inline-block">
      <h3 className="text-white text-xl md:text-2xl font-bold mb-4 text-left pointer-events-none">{name}</h3>
      <div className="flex flex-col gap-2 md:gap-3">
        {/* Header Cột (1, 2, 3...) */}
        <div className="flex flex-row gap-2 md:gap-3 ml-[2.25rem] md:ml-[2.75rem] mb-2 pointer-events-none">
            {colHeaders.map(col => (
                <div key={`col-header-${col}`} className="w-6 md:w-8 flex items-center justify-center text-white font-semibold text-xs md:text-sm select-none">
                    {col}
                </div>
            ))}
        </div>

        {seatsMatrix.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-row gap-2 md:gap-3 items-center">
            {/* Header Hàng (A, B, C...) */}
            <div className="w-6 md:w-8 flex items-center justify-center text-white font-semibold text-xs md:text-sm mr-1 select-none pointer-events-none">
                {String.fromCharCode(65 + rowIndex)}
            </div>

            {row.map((seat, colIndex) => {
              if (!seat) return <div key={`empty-${rowIndex}-${colIndex}`} className="w-6 h-6 md:w-8 md:h-8" />;
              return (
                <Seat 
                  key={seat.id} 
                  seat={seat} 
                  color={getSeatColor(seat.seatTypeId)}
                  isSelected={selectedSeatIds.includes(seat.id)}
                  onMouseDown={(e) => handleSeatMouseDown(e, seat)}
                  onMouseEnter={(e) => handleSeatMouseEnter(e, seat)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Zone;
