import React, { useState, useEffect, useRef } from 'react';
import Zone from './Zone';
import { SeatResponse } from '@/api/seatApi';
import { SeatTypeResponse } from '@/api/seatTypeApi';
import { useToastStore } from '@/store/ToastStore';

export interface ZoneData {
  id: string;
  name: string;
  x: number;
  y: number;
  matrix: (SeatResponse | null)[][];
}

interface ViewPortProps {
  className?: string;
  zones?: ZoneData[];
  seatTypes?: SeatTypeResponse[];
  selectedSeatIds?: string[];
  onSelectedSeatsChange?: (seatIds: string[]) => void;
  readOnly?: boolean;
}

const DEFAULT_ZONES: ZoneData[] = [];
const DEFAULT_SEAT_TYPES: SeatTypeResponse[] = [];
const SELECTED_SEAT_IDS: string[] = [];

const ViewPort: React.FC<ViewPortProps> = ({
  className,
  zones: propZones = DEFAULT_ZONES,
  seatTypes = DEFAULT_SEAT_TYPES,
  selectedSeatIds: propSelectedSeatIds = SELECTED_SEAT_IDS,
  onSelectedSeatsChange,
  readOnly = false
}) => {
  const [zones, setInternalZones] = useState<ZoneData[]>(propZones);
  const [selectedSeatIds, setInternalSelectedSeatIds] = useState<string[]>(propSelectedSeatIds);
  const [internalSeatTypes, setInternalSeatTypes] = useState<SeatTypeResponse[]>(seatTypes);

  // Khởi tạo data từ props
  useEffect(() => {
    setInternalZones(propZones);
    setInternalSeatTypes(seatTypes);
    setInternalSelectedSeatIds(propSelectedSeatIds);
  }, [propZones, seatTypes, propSelectedSeatIds]);

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
  const [dragMode, setDragMode] = useState<'PAN' | null>(null);
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
    if (isShiftPressed) {
      setDragMode('PAN'); // Phải giữ Shift thì mới được kéo màn hình (di chuyển cả khu vực)
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Click vào vùng Zone (Khu vực ghế)
  const handleZoneMouseDown = (e: React.MouseEvent) => {
    if (isShiftPressed) {
      setDragMode('PAN'); // User thường phải giữ Shift mới được kéo màn hình
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragMode === 'PAN') {
      const dx = e.clientX - lastPosition.current.x;
      const dy = e.clientY - lastPosition.current.y;
      lastPosition.current = { x: e.clientX, y: e.clientY };
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handleMouseUpOrLeave = () => {
    setDragMode(null);
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

  let cursorClass = 'cursor-default';
  if (isShiftPressed) {
    cursorClass = dragMode ? 'cursor-grabbing' : 'cursor-grab';
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
      <div
        className="w-full h-full origin-top-left transition-transform duration-75"
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
      >
        {zones.map(zone => (
          <div
            key={zone.id}
            className={`absolute p-4 rounded-xl select-none transition-[box-shadow,background-color] duration-200`}
            style={{
              left: zone.x,
              top: zone.y
            }}
            onMouseDown={handleZoneMouseDown}
          >
            <Zone
              name={zone.name}
              seatsMatrix={zone.matrix}
              seatTypes={internalSeatTypes}
              selectedSeatIds={selectedSeatIds}
              readOnly={readOnly}
              unselectableStatuses={readOnly ? ['AVAILABLE', 'SOLD', 'ORDERED', 'LOCKED'] : ['SOLD', 'ORDERED', 'LOCKED']}
              onSeatSelect={handleSeatSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewPort;