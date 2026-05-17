import React, { useState, useEffect, useRef } from 'react';
import Zone from './Zone';
import { SeatResponse } from '@/api/seatApi';
import { SeatTypeResponse } from '@/api/seatTypeApi';
import { useRoomStore } from '@/store/RoomStore';

export interface ZoneData {
  id: string;
  name: string;
  x: number;
  y: number;
  matrix: (SeatResponse | null)[][];
}

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface ViewPortProps {
  className?: string;
  isAdmin?: boolean;
  zones?: ZoneData[];
  seatTypes?: SeatTypeResponse[];
  onZonesChange?: (zones: ZoneData[]) => void;
  onSelectedSeatsChange?: (seatIds: string[]) => void;
}

const DEFAULT_ZONES: ZoneData[] = [];
const DEFAULT_SEAT_TYPES: SeatTypeResponse[] = [];

const ViewPort: React.FC<ViewPortProps> = ({
  className,
  isAdmin = true,
  zones: propZones = DEFAULT_ZONES,
  seatTypes = DEFAULT_SEAT_TYPES,
  onZonesChange,
  onSelectedSeatsChange
}) => {
  const { activeRoom } = useRoomStore();
  const eventId = activeRoom?.eventId;

  const [zones, setInternalZones] = useState<ZoneData[]>(propZones);
  const [selectedSeatIds, setInternalSelectedSeatIds] = useState<string[]>([]);
  const [internalSeatTypes, setInternalSeatTypes] = useState<SeatTypeResponse[]>(seatTypes);

  // Khởi tạo Mock Data...
  useEffect(() => {
    if (propZones.length > 0) {
      setInternalZones(propZones);
      setInternalSeatTypes(seatTypes);
    } else {
      // Mock data cho việc thử nghiệm
      const mockSeatTypes: SeatTypeResponse[] = [
        { id: 'type-standard', eventId: 'mock', name: 'Standard', price: 100, label: 'Thường', color: '#b3b3b3' },
        { id: 'type-premium', eventId: 'mock', name: 'Premium', price: 200, label: 'Đẹp', color: '#0000ff' },
        { id: 'type-vip', eventId: 'mock', name: 'VIP', price: 300, label: 'VIP', color: '#c6ff00' },
      ];

      const mockMatrixA: (SeatResponse | null)[][] = Array.from({ length: 10 }, (_, rowIndex) => {
        return Array.from({ length: 20 }, (_, colIndex) => {
          let typeId = 'type-standard';
          if (rowIndex === 3 && colIndex >= 6 && colIndex <= 13) typeId = 'type-premium';
          if (rowIndex >= 4 && rowIndex <= 7) {
            if (colIndex === 6 || colIndex === 13) typeId = 'type-premium';
            if (colIndex > 6 && colIndex < 13) typeId = 'type-vip';
          }
          let status: any = 'AVAILABLE';
          if (rowIndex === 0 && colIndex < 5) status = 'SOLD';
          if (rowIndex === 1 && colIndex < 5) status = 'ORDERED';
          return {
            id: `seat-A-${rowIndex}-${colIndex}`, zoneId: 'zone-A', seatTypeId: typeId,
            rowIndex, colIndex, seatNumber: colIndex + 1, status
          };
        });
      });

      const mockMatrixB: (SeatResponse | null)[][] = Array.from({ length: 8 }, (_, rowIndex) => {
        return Array.from({ length: 10 }, (_, colIndex) => {
          let typeId = 'type-standard';
          if (rowIndex >= 0 && rowIndex <= 2) {
            if (colIndex >= 2 && colIndex <= 6) {
              typeId = rowIndex === 0 ? 'type-vip' : 'type-premium';
              if (rowIndex === 0 && colIndex === 2) typeId = 'type-premium';
            }
          }
          return {
            id: `seat-B-${rowIndex}-${colIndex}`, zoneId: 'zone-B', seatTypeId: typeId,
            rowIndex, colIndex, seatNumber: colIndex + 1, status: 'AVAILABLE'
          };
        });
      });

      setInternalSeatTypes(mockSeatTypes);
      setInternalZones([
        { id: 'zone-A', name: 'Khu vực A', x: 50, y: 350, matrix: mockMatrixA },
        { id: 'zone-B', name: 'Khu vực B', x: 800, y: 50, matrix: mockMatrixB }
      ]);
    }
  }, [propZones, seatTypes]);

  const setZones = (value: React.SetStateAction<ZoneData[]>) => {
    setInternalZones(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      onZonesChange?.(next);
      return next;
    });
  };

  const setSelectedSeatIds = (value: React.SetStateAction<string[]>) => {
    setInternalSelectedSeatIds(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      onSelectedSeatsChange?.(next);
      return next;
    });
  };

  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // --- LOGIC PHÍM SHIFT ---
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [dragMode, setDragMode] = useState<'PAN' | 'MOVE_ZONE' | 'SELECT' | null>(null);
  const [draggingZoneId, setDraggingZoneId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // Chỉ cho phép zoom khi đè Ctrl
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.min(Math.max(0.3, prev + delta), 4));
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  // Click ra vùng trống (Canvas)
  const handleMouseDown = (e: React.MouseEvent) => {
    setSelectedZoneId(null);
    if (isShiftPressed) {
      setDragMode('PAN'); // Giữ Shift -> Kéo màn hình
      lastPosition.current = { x: e.clientX, y: e.clientY };
    } else {
      setDragMode('SELECT'); // Không giữ -> Khoanh vùng
      setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
    }
  };

  // Click vào vùng Zone (Khu vực ghế)
  const handleZoneMouseDown = (e: React.MouseEvent, zoneId: string) => {
    if (!isAdmin) return;
    e.stopPropagation();

    setSelectedZoneId(zoneId); // Luôn active zone khi được click

    if (isShiftPressed) {
      setDragMode('MOVE_ZONE'); // Giữ Shift -> Kéo zone đi chỗ khác
      setDraggingZoneId(zoneId);
      lastPosition.current = { x: e.clientX, y: e.clientY };
    } else {
      setDragMode('SELECT'); // Không giữ Shift -> Quét ghế bên trong zone
      setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragMode === 'MOVE_ZONE' && draggingZoneId) {
      const dx = (e.clientX - lastPosition.current.x) / scale;
      const dy = (e.clientY - lastPosition.current.y) / scale;
      lastPosition.current = { x: e.clientX, y: e.clientY };
      setZones(prev => prev.map(z => z.id === draggingZoneId ? { ...z, x: z.x + dx, y: z.y + dy } : z));
    }
    else if (dragMode === 'PAN') {
      const dx = e.clientX - lastPosition.current.x;
      const dy = e.clientY - lastPosition.current.y;
      lastPosition.current = { x: e.clientX, y: e.clientY };
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
    else if (dragMode === 'SELECT' && selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, endX: e.clientX, endY: e.clientY } : null);
    }
  };

  const handleMouseUpOrLeave = () => {
    if (dragMode === 'SELECT' && selectionBox) calculateSelection();
    setDragMode(null);
    setDraggingZoneId(null);
    setSelectionBox(null);
  };

  const calculateSelection = () => {
    if (!selectionBox) return;
    const rect = {
      left: Math.min(selectionBox.startX, selectionBox.endX),
      top: Math.min(selectionBox.startY, selectionBox.endY),
      right: Math.max(selectionBox.startX, selectionBox.endX),
      bottom: Math.max(selectionBox.startY, selectionBox.endY),
    };

    if (rect.right - rect.left > 3 || rect.bottom - rect.top > 3) {
      const seatElements = document.querySelectorAll('.seat-element');
      const newlySelectedIds: string[] = [];

      seatElements.forEach((seatNode) => {
        const seatRect = seatNode.getBoundingClientRect();
        if (!(rect.right < seatRect.left || rect.left > seatRect.right || rect.bottom < seatRect.top || rect.top > seatRect.bottom)) {
          const id = seatNode.getAttribute('data-seat-id');
          if (id) {
            let seatData: SeatResponse | null = null;
            for (const zone of zones) {
              for (const row of zone.matrix) {
                const found = row.find(s => s && s.id === id);
                if (found) { seatData = found; break; }
              }
              if (seatData) break;
            }
            if (seatData && seatData.status === 'AVAILABLE') newlySelectedIds.push(id);
          }
        }
      });
      if (newlySelectedIds.length > 0) {
        setSelectedSeatIds(prev => Array.from(new Set([...prev, ...newlySelectedIds])));
      }
    }
  };

  const handleSeatSelect = (seat: SeatResponse, mode: 'add' | 'remove') => {
    setSelectedSeatIds(prev => {
      if (mode === 'add') return prev.includes(seat.id) ? prev : [...prev, seat.id];
      else return prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : prev;
    });
  };

  const handleUpdateSelectedSeatsStatus = async (newStatus: string) => {
    if (selectedSeatIds.length === 0) { alert("Vui lòng chọn ít nhất 1 ghế!"); return; }
    setZones(prevZones => prevZones.map(zone => ({
      ...zone, matrix: zone.matrix.map(row => row.map(seat => {
        if (seat && selectedSeatIds.includes(seat.id)) { return { ...seat, status: newStatus as any }; }
        return seat;
      }))
    })));
    setSelectedSeatIds([]);
  };

  const handleZoneTransform = (action: 'rotateLeft' | 'rotateRight' | 'flipHorizontal' | 'flipVertical') => {
    if (!selectedZoneId) return;
    setZones(prev => prev.map(z => {
      if (z.id !== selectedZoneId) return z;
      
      let newMatrix = [...z.matrix.map(row => [...row])];
      const rows = newMatrix.length;
      const cols = newMatrix[0]?.length || 0;

      switch (action) {
        case 'rotateLeft': {
          const rotated = [];
          for (let c = cols - 1; c >= 0; c--) {
            const newRow = [];
            for (let r = 0; r < rows; r++) {
              newRow.push(newMatrix[r][c]);
            }
            rotated.push(newRow);
          }
          newMatrix = rotated;
          break;
        }
        case 'rotateRight': {
          const rotated = [];
          for (let c = 0; c < cols; c++) {
            const newRow = [];
            for (let r = rows - 1; r >= 0; r--) {
              newRow.push(newMatrix[r][c]);
            }
            rotated.push(newRow);
          }
          newMatrix = rotated;
          break;
        }
        case 'flipVertical': {
          newMatrix.reverse();
          break;
        }
        case 'flipHorizontal': {
          newMatrix = newMatrix.map(row => [...row].reverse());
          break;
        }
        default:
          return z;
      }

      // Cập nhật lại rowIndex, colIndex và seatNumber cho khớp với ma trận mới
      const finalMatrix = newMatrix.map((row, rIdx) => 
        row.map((seat, cIdx) => {
          if (!seat) return null;
          return {
            ...seat,
            rowIndex: rIdx,
            colIndex: cIdx,
            seatNumber: cIdx + 1
          };
        })
      );

      return { ...z, matrix: finalMatrix };
    }));
  };

  let cursorClass = 'cursor-default';
  if (isShiftPressed) {
    cursorClass = dragMode ? 'cursor-grabbing' : 'cursor-grab';
  } else if (dragMode === 'SELECT') {
    cursorClass = 'cursor-crosshair';
  }

  console.log("DRAG MODE!: ", dragMode)

  return (
    <div
      ref={viewportRef}
      className={`absolute z-20 top-0 left-0 w-full h-full min-h-screen bg-[#1b1b1b] overflow-hidden select-none ${cursorClass} ${className || ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {selectionBox && dragMode === 'SELECT' && (
        <div
          className="absolute border border-blue-400 bg-blue-500/20 pointer-events-none z-50"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.endX),
            top: Math.min(selectionBox.startY, selectionBox.endY),
            width: Math.abs(selectionBox.startX - selectionBox.endX),
            height: Math.abs(selectionBox.startY - selectionBox.endY),
          }}
        />
      )}

      <div
        className="w-full h-full origin-top-left transition-transform duration-75"
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
      >
        {zones.map(zone => (
          <div
            key={zone.id}
            className={`absolute p-4 rounded-xl select-none transition-[box-shadow,background-color] duration-200 ${selectedZoneId === zone.id ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}
            style={{
              left: zone.x,
              top: zone.y
            }}
            onMouseDown={(e) => handleZoneMouseDown(e, zone.id)}
          >
            <Zone
              name={zone.name}
              seatsMatrix={zone.matrix}
              seatTypes={internalSeatTypes}
              selectedSeatIds={selectedSeatIds}
              unselectableStatuses={[]}
              onSeatSelect={handleSeatSelect}
              onNameMouseDown={isAdmin ? (e) => {
                e.stopPropagation();
                setSelectedZoneId(zone.id);
                setDragMode('MOVE_ZONE');
                setDraggingZoneId(zone.id);
                lastPosition.current = { x: e.clientX, y: e.clientY };
              } : undefined}
              onSeatMouseDown={(e) => {
                if (selectedZoneId !== zone.id) {
                  setSelectedZoneId(null);
                }
              }}
            />
          </div>
        ))}
      </div>

      {isAdmin && (
        <div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#2a2a2a] px-6 py-4 rounded-xl border border-gray-700 shadow-2xl flex flex-col md:flex-row gap-4 items-center z-50"
          // FIX LỖI TOOLBAR: Ngăn chặn click truyền ra ngoài làm mất Focus của Zone
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="text-white font-medium text-sm md:text-base whitespace-nowrap">
            Đang chọn: <strong className="text-[#0000ff] text-lg">{selectedSeatIds.length}</strong> ghế
          </span>
          <div className="flex gap-2">
            <button onClick={() => handleUpdateSelectedSeatsStatus('LOCKED')} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm shadow-md whitespace-nowrap">Khóa</button>
            <button onClick={() => handleUpdateSelectedSeatsStatus('SOLD')} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm shadow-md whitespace-nowrap">Bán</button>
            <button onClick={() => handleUpdateSelectedSeatsStatus('AVAILABLE')} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm shadow-md whitespace-nowrap">Mở</button>
          </div>

          {selectedZoneId && (
            <>
              <div className="hidden md:block w-px h-8 bg-gray-600 mx-2"></div>
              <div className="flex gap-2 items-center">
                <span className="text-gray-300 text-sm mr-1 hidden md:inline">Zone:</span>
                <button onClick={() => handleZoneTransform('rotateLeft')} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm shadow-md flex items-center justify-center" title="Xoay trái 90°">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
                <button onClick={() => handleZoneTransform('rotateRight')} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm shadow-md flex items-center justify-center" title="Xoay phải 90°">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                </button>
                <button onClick={() => handleZoneTransform('flipVertical')} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm shadow-md flex items-center justify-center" title="Lật dọc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3" /><path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M20 12h2" /><path d="M14 12h2" /><path d="M8 12h2" /><path d="M2 12h2" /></svg>
                </button>
                <button onClick={() => handleZoneTransform('flipHorizontal')} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm shadow-md flex items-center justify-center" title="Lật ngang">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><path d="M12 20v2" /><path d="M12 14v2" /><path d="M12 8v2" /><path d="M12 2v2" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewPort;