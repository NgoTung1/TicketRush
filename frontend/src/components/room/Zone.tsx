import React, { useState, useEffect } from 'react';
import Seat from './Seat';
import { SeatResponse } from '@/api/seatApi';
import { SeatTypeResponse } from '@/api/seatTypeApi';

interface ZoneProps {
  name: string;
  seatsMatrix: (SeatResponse | null)[][];
  seatTypes: SeatTypeResponse[];
  selectedSeatIds: string[];
  readOnly?: boolean;
  unselectableStatuses?: string[];
  onSeatSelect?: (seat: SeatResponse, mode: 'add' | 'remove') => void;
  onNameMouseDown?: (e: React.MouseEvent) => void;
  onSeatMouseDown?: (e: React.MouseEvent, seat: SeatResponse) => void;
}

const Zone: React.FC<ZoneProps> = ({
  name,
  seatsMatrix,
  seatTypes,
  selectedSeatIds,
  readOnly,
  unselectableStatuses = [],
  onSeatSelect,
  onNameMouseDown,
  onSeatMouseDown
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'add' | 'remove' | null>(null);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false);
      setSelectionMode(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const isSeatSelectable = (seat: SeatResponse) => {
    return !unselectableStatuses.includes(seat.status);
  };

  const handleSeatMouseDown = (e: React.MouseEvent, seat: SeatResponse) => {
    e.stopPropagation();
    onSeatMouseDown?.(e, seat);

    if (e.shiftKey) return;
    if (!isSeatSelectable(seat)) return;

    setIsSelecting(true);
    const mode = selectedSeatIds.includes(seat.id) ? 'remove' : 'add';
    setSelectionMode(mode);
    onSeatSelect?.(seat, mode);
  };

  const handleSeatMouseEnter = (e: React.MouseEvent, seat: SeatResponse) => {
    if (isSelecting && selectionMode && !e.shiftKey && isSeatSelectable(seat)) {
      onSeatSelect?.(seat, selectionMode);
    }
  };

  const getSeatColor = (seatTypeId: string | null) => {
    if (!seatTypeId) return '#b3b3b3';
    const type = seatTypes.find(t => t.id === seatTypeId);
    return type?.color || '#b3b3b3';
  };

  const maxCols = seatsMatrix.length > 0 ? Math.max(...seatsMatrix.map(row => row.length)) : 0;
  const colHeaders = Array.from({ length: maxCols }, (_, i) => i + 1);

  return (
    <div className="inline-flex flex-col">

      {/* Khối Header Tên Zone: w-full và text-left như bạn yêu cầu */}
      <div
        className={`w-full text-left mb-4 select-none ${onNameMouseDown ? 'cursor-grab active:cursor-grabbing hover:text-blue-400 transition-colors' : 'pointer-events-none'}`}
        onMouseDown={onNameMouseDown}
      >
        <h3 className="text-white text-xl md:text-2xl font-bold inline-block">
          {name}
        </h3>
      </div>

      {/* Lưới sơ đồ ghế (Nằm bên dưới title) */}
      <div className="flex flex-col gap-2.5">
        {/* Header Cột (1, 2, 3...) */}
        <div className="flex flex-row gap-2.5 ml-[2.25rem] md:ml-[2.75rem] mb-2 pointer-events-none">
          {colHeaders.map(col => (
            <div key={`col-header-${col}`} className="w-6 md:w-10 flex items-center justify-center text-white font-semibold text-xs md:text-[20px] select-none">
              {col}
            </div>
          ))}
        </div>

        {/* Ma trận hàng ghế */}
        {seatsMatrix.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-row gap-2.5 items-center">
            {/* Header Hàng (A, B, C...) */}
            <div className="w-6 md:w-8 flex items-center justify-center text-white font-semibold text-xs md:text-[20px] mr-1 select-none pointer-events-none">
              {String.fromCharCode(65 + rowIndex)}
            </div>

            {row.map((seat, colIndex) => {
              if (!seat) return <div key={`empty-${rowIndex}-${colIndex}`} className="w-6 h-6 md:w-8 md:h-8" />;

              return (
                <div key={seat.id} data-seat-id={seat.id} className="seat-element">
                  <Seat
                    seat={seat}
                    color={getSeatColor(seat.seatTypeId)}
                    isSelected={selectedSeatIds.includes(seat.id)}
                    readOnly={readOnly}
                    onMouseDown={(e) => handleSeatMouseDown(e, seat)}
                    onMouseEnter={(e) => handleSeatMouseEnter(e, seat)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Zone;