import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { ZoneData } from '@/components/room/AdminViewPort';
import { SeatTypeResponse } from '@/api/seatTypeApi';

interface ZoneItemProps {
  zone: ZoneData;
  isExpanded: boolean;
  onToggleExpand: (zoneId: string) => void;
  onDelete: (zoneId: string) => void;
  onUpdateXYR: (zoneId: string, x: number, y: number, rotation: number) => void;
  seatTypes: SeatTypeResponse[];
}

export function ZoneItem({
  zone,
  isExpanded,
  onToggleExpand,
  onDelete,
  onUpdateXYR,
  seatTypes
}: ZoneItemProps) {
  const allZoneSeats = zone.matrix.flat().filter(s => s != null);
  const totalSeats = allZoneSeats.length;

  const seatTypeDetails = seatTypes.map(t => {
    const count = allZoneSeats.filter(s => s?.seatTypeId === t.id).length;
    return { ...t, count };
  }).filter(t => t.count > 0);

  const validSeatTypeIds = seatTypes.map(t => t.id);
  const unassignedCount = allZoneSeats.filter(s => !s?.seatTypeId || !validSeatTypeIds.includes(s.seatTypeId)).length;

  return (
    <div className="bg-[#383838] rounded-lg overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="w-full px-3 py-2.5 flex justify-between items-center hover:bg-[#323232] transition-colors focus:outline-none group">
        <button
          className="flex-1 flex justify-between items-center text-left focus:outline-none"
          onClick={() => onToggleExpand(zone.id)}
        >
          <span className="font-bold text-white pr-2">{zone.name}</span>
          <div className="flex items-center gap-2 text-white text-[12px]">
            <span className="font-bold">{totalSeats} ghế</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(zone.id);
          }}
          className="ml-3 text-red-500 hover:text-red-400 p-1 hidden group-hover:block"
          title="Xóa khu vực"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Tọa độ X, Y, Góc */}
      <div className="px-3 pb-2 pt-1 flex gap-2 justify-between border-b border-gray-600/50 bg-[#323232]">
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[11px] text-gray-400 font-bold shrink-0">X:</span>
          <input
            type="number"
            value={Number.isNaN(zone.x) ? '' : Math.round(zone.x)}
            onChange={(e) => {
              const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
              onUpdateXYR(zone.id, val, zone.y, zone.rotation || 0);
            }}
            onBlur={(e) => {
              if (e.target.value === '' || Number.isNaN(zone.x)) {
                onUpdateXYR(zone.id, 0, zone.y, zone.rotation || 0);
              }
            }}
            className="w-full min-w-[36px] bg-[#2a2a2a] text-white text-[11px] px-1.5 py-1 rounded outline-none border border-transparent focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[11px] text-gray-400 font-bold shrink-0">Y:</span>
          <input
            type="number"
            value={Number.isNaN(zone.y) ? '' : Math.round(zone.y)}
            onChange={(e) => {
              const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
              onUpdateXYR(zone.id, zone.x, val, zone.rotation || 0);
            }}
            onBlur={(e) => {
              if (e.target.value === '' || Number.isNaN(zone.y)) {
                onUpdateXYR(zone.id, zone.x, 0, zone.rotation || 0);
              }
            }}
            className="w-full min-w-[36px] bg-[#2a2a2a] text-white text-[11px] px-1.5 py-1 rounded outline-none border border-transparent focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[11px] text-gray-400 font-bold shrink-0">Góc:</span>
          <input
            type="number"
            value={Number.isNaN(zone.rotation) ? '' : Math.round(zone.rotation || 0)}
            onChange={(e) => {
              const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
              onUpdateXYR(zone.id, zone.x, zone.y, val);
            }}
            onBlur={(e) => {
              if (e.target.value === '' || Number.isNaN(zone.rotation)) {
                onUpdateXYR(zone.id, zone.x, zone.y, 0);
              }
            }}
            className="w-full min-w-[36px] bg-[#2a2a2a] text-white text-[11px] px-1.5 py-1 rounded outline-none border border-transparent focus:border-blue-500"
          />
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 bg-[#383838]/50 flex flex-col gap-2">
          {seatTypeDetails.length === 0 && unassignedCount === 0 ? (
            <div className="text-[12px] text-white font-bold italic text-center py-1">Chưa có ghế</div>
          ) : (
            <>
              {seatTypeDetails.map(detail => (
                <div key={detail.id} className="flex justify-between items-center text-xs py-0.5 pl-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: detail.color }}
                    />
                    <span className="text-white font-bold">{detail.label}</span>
                  </div>
                  <span className="text-white font-bold">{detail.count} ghế</span>
                </div>
              ))}
              {unassignedCount > 0 && (
                <div className="flex justify-between items-center text-xs py-0.5 pl-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-gray-600" />
                    <span className="text-white font-bold">Chưa phân loại</span>
                  </div>
                  <span className="text-white font-bold">{unassignedCount} ghế</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
