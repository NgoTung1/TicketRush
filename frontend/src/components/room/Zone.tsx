import React from 'react';
import Seat, { SeatStatus } from './Seat';

interface ZoneProps {
  name: string;
  seats: SeatStatus[][];
  onSeatClick?: (rowIndex: number, colIndex: number) => void;
}

const Zone: React.FC<ZoneProps> = ({ name, seats, onSeatClick }) => {
  return (
    <div className="bg-[#1a1a1a] p-6 md:p-10 rounded-2xl inline-block border border-gray-800 shadow-2xl">
      <h3 className="text-white text-xl md:text-2xl font-bold mb-6 text-left">{name}</h3>
      <div className="flex flex-col gap-2 md:gap-3">
        {seats.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-row gap-2 md:gap-3">
            {row.map((status, colIndex) => (
              <Seat 
                key={`seat-${rowIndex}-${colIndex}`} 
                status={status} 
                onClick={() => onSeatClick && onSeatClick(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Zone;
