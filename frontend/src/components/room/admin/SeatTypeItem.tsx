import { Trash2 } from 'lucide-react';
import { SeatTypeResponse } from '@/api/seatTypeApi';

interface SeatTypeItemProps {
  seatType: SeatTypeResponse;
  onEdit: (seatType: SeatTypeResponse) => void;
  onDelete: (id: string) => void;
}

export function SeatTypeItem({ seatType, onEdit, onDelete }: SeatTypeItemProps) {
  return (
    <div
      onClick={() => onEdit(seatType)}
      className="bg-[#383838] px-3 py-2 rounded-lg flex justify-between items-center text-[12px] font-bold border border-gray-700 group cursor-pointer hover:bg-[#4a4a4a] transition-colors"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seatType.color }}></div>
        <span className="truncate max-w-[100px]">{seatType.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#00FF1E] pointer-events-none">{seatType.price.toLocaleString('vi-VN')}đ</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(seatType.id);
          }}
          className="text-red-500 hover:text-red-400 hidden group-hover:block p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
