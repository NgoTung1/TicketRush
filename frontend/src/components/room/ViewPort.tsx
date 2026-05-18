import React, { useState, useEffect, useRef } from 'react';
import Zone from './Zone';
import { SeatResponse } from '@/api/seatApi';
import { SeatTypeResponse } from '@/api/seatTypeApi';
import { useRoomStore } from '@/store/RoomStore';
import { useToastStore } from '@/store/ToastStore';

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
  readOnly?: boolean;
}

const DEFAULT_ZONES: ZoneData[] = [];
const DEFAULT_SEAT_TYPES: SeatTypeResponse[] = [];

const ViewPort: React.FC<ViewPortProps> = ({
  className,
  isAdmin = true,
  zones: propZones = DEFAULT_ZONES,
  seatTypes = DEFAULT_SEAT_TYPES,
  onZonesChange,
  onSelectedSeatsChange,
  readOnly = false
}) => {
  const { activeRoom } = useRoomStore();
  const eventId = activeRoom?.eventId;

  const [zones, setInternalZones] = useState<ZoneData[]>(propZones);
  const [selectedSeatIds, setInternalSelectedSeatIds] = useState<string[]>([]);
  const [internalSeatTypes, setInternalSeatTypes] = useState<SeatTypeResponse[]>(seatTypes);

  // Khởi tạo data từ props
  useEffect(() => {
    setInternalZones(propZones);
    setInternalSeatTypes(seatTypes);
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
  const hasAutoCentered = useRef(false);

  // Auto-center and zoom to fit zones
  useEffect(() => {
    if (zones.length === 0 || !viewportRef.current || hasAutoCentered.current) return;

    const hasSeats = zones.some(z => z.matrix.length > 0);
    if (!hasSeats) return;

    const viewport = viewportRef.current;
    const vpWidth = viewport.clientWidth;
    const vpHeight = viewport.clientHeight;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    zones.forEach(zone => {
      const rows = zone.matrix.length;
      const cols = rows > 0 ? zone.matrix[0].length : 0;
      const zoneWidth = cols * 48; // estimate 48px per cell
      const zoneHeight = rows * 48;

      if (zone.x < minX) minX = zone.x;
      if (zone.y < minY) minY = zone.y;
      if (zone.x + zoneWidth > maxX) maxX = zone.x + zoneWidth;
      if (zone.y + zoneHeight > maxY) maxY = zone.y + zoneHeight;
    });

    if (minX === Infinity) return;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const paddingx = 80;
    const paddingy = 120;

    const scaleX = (vpWidth - paddingx * 2) / contentWidth;
    const scaleY = (vpHeight - paddingy * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1); // max scale 1

    const centerX = (vpWidth - contentWidth * newScale) / 2 - minX * newScale;
    const centerY = (vpHeight - contentHeight * newScale) / 2 - minY * newScale;

    setScale(newScale);
    setPosition({ x: centerX, y: centerY });
    hasAutoCentered.current = true;
  }, [zones]);

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
      setDragMode('PAN'); // Phải giữ Shift thì mới được kéo màn hình (di chuyển cả khu vực)
      lastPosition.current = { x: e.clientX, y: e.clientY };
    } else {
      if (isAdmin) {
        setDragMode('SELECT'); // Không giữ -> Khoanh vùng
        setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
      }
    }
  };

  // Click vào vùng Zone (Khu vực ghế)
  const handleZoneMouseDown = (e: React.MouseEvent, zoneId: string) => {
    if (!isAdmin) {
      if (isShiftPressed) {
        setDragMode('PAN'); // User thường phải giữ Shift mới được kéo màn hình
        lastPosition.current = { x: e.clientX, y: e.clientY };
      }
      return;
    }
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
        setSelectedSeatIds(prev => {
          const combined = Array.from(new Set([...prev, ...newlySelectedIds]));
          if (combined.length > 8) {
            useToastStore.getState().addToast({ type: 'warning', title: 'Giới hạn ghế', message: 'Bạn chỉ được chọn tối đa 8 ghế.' });
            return combined.slice(0, 8);
          }
          return combined;
        });
      }
    }
  };

  const handleSeatSelect = (seat: SeatResponse, mode: 'add' | 'remove') => {
    setSelectedSeatIds(prev => {
      if (mode === 'add') {
        if (prev.length >= 8 && !prev.includes(seat.id)) {
          useToastStore.getState().addToast({ type: 'warning', title: 'Giới hạn ghế', message: 'Bạn chỉ được chọn tối đa 8 ghế.' });
          return prev;
        }
        return prev.includes(seat.id) ? prev : [...prev, seat.id];
      }
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

  return (
    <div
      ref={viewportRef}
      className={`absolute z-20 top-0 left-0 w-full h-full overflow-hidden select-none ${cursorClass} ${className || 'bg-[#1b1b1b]'}`}
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
              unselectableStatuses={readOnly ? ['AVAILABLE', 'SOLD', 'ORDERED', 'LOCKED'] : ['SOLD', 'ORDERED', 'LOCKED']}
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
    </div>
  );
};

export default ViewPort;