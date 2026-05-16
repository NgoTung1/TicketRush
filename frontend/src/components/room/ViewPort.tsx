import React, { useState, useEffect, useRef } from 'react';
import Zone from './Zone';
import { SeatResponse, seatApi } from '@/api/seatApi';
import { SeatTypeResponse, seatTypeApi } from '@/api/seatTypeApi';
import { useRoomStore } from '@/store/RoomStore';
import { eventSessionApi } from '@/api/eventSessionApi';

interface ZoneData {
    id: string;
    name: string;
    x: number;
    y: number;
    matrix: (SeatResponse | null)[][];
}

const ViewPort: React.FC = () => {
    const { activeRoom } = useRoomStore();
    const eventId = activeRoom?.eventId;

    const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);
    const [zones, setZones] = useState<ZoneData[]>([]);
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // useEffect(() => {
    //     // Logic fetch thật nếu mở lại
    // }, [eventId]);

    useEffect(() => {
        // Mock Seat Types
        const mockSeatTypes: SeatTypeResponse[] = [
            { id: 'type-standard', eventId: 'mock', name: 'Standard', price: 100, label: 'Thường', color: '#b3b3b3' },
            { id: 'type-premium', eventId: 'mock', name: 'Premium', price: 200, label: 'Đẹp', color: '#0000ff' },
            { id: 'type-vip', eventId: 'mock', name: 'VIP', price: 300, label: 'VIP', color: '#c6ff00' },
        ];

        // Khu vực A (Mô phỏng như ảnh, 10 hàng 20 cột)
        const mockMatrixA: (SeatResponse | null)[][] = Array.from({ length: 10 }, (_, rowIndex) => {
            return Array.from({ length: 20 }, (_, colIndex) => {
                let typeId = 'type-standard';
                if (rowIndex === 3 && colIndex >= 6 && colIndex <= 13) typeId = 'type-premium';
                if (rowIndex >= 4 && rowIndex <= 7) {
                    if (colIndex === 6 || colIndex === 13) typeId = 'type-premium';
                    if (colIndex > 6 && colIndex < 13) typeId = 'type-vip';
                }
                return {
                    id: `seat-A-${rowIndex}-${colIndex}`, zoneId: 'zone-A', seatTypeId: typeId,
                    rowIndex, colIndex, seatNumber: colIndex + 1, status: 'AVAILABLE'
                };
            });
        });

        // Khu vực B (Mô phỏng khu vực nhỏ hơn nằm góc trên)
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

        setSeatTypes(mockSeatTypes);
        setZones([
            { id: 'zone-A', name: 'Khu vực A', x: 50, y: 350, matrix: mockMatrixA },
            { id: 'zone-B', name: 'Khu vực B', x: 800, y: 50, matrix: mockMatrixB }
        ]);
        setLoading(false);
    }, []);

    const handleSeatSelect = (seat: SeatResponse, mode: 'add' | 'remove') => {
        // Nếu vừa kéo chuột canvas thì bỏ qua (dù giờ kéo chọn ghế thì không dính vào kéo canvas nhờ stopPropagation ở zone)
        if (hasDragged.current) return;
        
        setSelectedSeatIds(prev => {
            if (mode === 'add') {
                return prev.includes(seat.id) ? prev : [...prev, seat.id];
            } else {
                return prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : prev;
            }
        });
    };

    const handleUpdateSelectedSeatsStatus = async (newStatus: string) => {
        // Đây là hàm tái sử dụng để xử lý logic đổi trạng thái
        // Trong thực tế, bạn sẽ gọi API như: await seatApi.updateMultipleSeats({ ids: selectedSeatIds, status: newStatus });
        
        if (selectedSeatIds.length === 0) {
            alert("Vui lòng chọn ít nhất 1 ghế để thay đổi trạng thái!");
            return;
        }

        // Mock update UI (để bạn test thấy màu/trạng thái đổi ngay)
        setZones(prevZones => prevZones.map(zone => ({
            ...zone,
            matrix: zone.matrix.map(row => row.map(seat => {
                if (seat && selectedSeatIds.includes(seat.id)) {
                    return { ...seat, status: newStatus as any };
                }
                return seat;
            }))
        })));

        alert(`Đã đổi trạng thái ${selectedSeatIds.length} ghế thành ${newStatus}`);
        setSelectedSeatIds([]); // Bỏ chọn sau khi thao tác xong
    };

    const [scale, setScale] = useState<number>(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const [draggingZoneId, setDraggingZoneId] = useState<string | null>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const hasDragged = useRef(false);
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale((prev) => Math.min(Math.max(0.3, prev + delta), 4));
        };

        viewport.addEventListener('wheel', handleWheel, { passive: false });
        return () => viewport.removeEventListener('wheel', handleWheel);
    }, []);

    // Mouse down trên Canvas (pan)
    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        hasDragged.current = false;
        lastPosition.current = { x: e.clientX, y: e.clientY };
    };

    // Mouse down trên từng Zone (kéo thả Zone)
    const handleZoneMouseDown = (e: React.MouseEvent, zoneId: string) => {
        e.stopPropagation(); // Luôn ngăn sự kiện click truyền ra ngoài canvas để không bị pan canvas khi nhấn vào ghế
        if (e.shiftKey) {
            setDraggingZoneId(zoneId);
            hasDragged.current = false;
            lastPosition.current = { x: e.clientX, y: e.clientY };
        }
    };

    // Chuột di chuyển
    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingZoneId) {
            hasDragged.current = true;
            // Tính toán khoảng cách chuột di chuyển và chia cho scale để đổi ra tọa độ thật của zone
            const dx = (e.clientX - lastPosition.current.x) / scale;
            const dy = (e.clientY - lastPosition.current.y) / scale;
            lastPosition.current = { x: e.clientX, y: e.clientY };
            setZones(prev => prev.map(z =>
                z.id === draggingZoneId ? { ...z, x: z.x + dx, y: z.y + dy } : z
            ));
        } else if (isDragging.current) {
            hasDragged.current = true;
            const dx = e.clientX - lastPosition.current.x;
            const dy = e.clientY - lastPosition.current.y;
            lastPosition.current = { x: e.clientX, y: e.clientY };
            setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        }
    };

    const handleMouseUpOrLeave = () => {
        isDragging.current = false;
        setDraggingZoneId(null);
    };

    if (loading) {
        return (
            <div className="absolute z-20 w-full h-full min-h-screen bg-[#1b1b1b] flex items-center justify-center p-4">
                <h2 className="text-white text-xl animate-pulse">Đang tải sơ đồ ghế...</h2>
            </div>
        );
    }

    return (
        <div
            ref={viewportRef}
            className="absolute z-20 top-0 left-0 w-full h-full min-h-screen bg-[#1b1b1b] overflow-hidden"
        >
            {/* Canvas (Lớp chứa tất cả các Zone, sẽ bị thu phóng và di chuyển) */}
            <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="w-full h-full origin-top-left transition-transform duration-75"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
            >
                {zones.map(zone => (
                    <div
                        key={zone.id}
                        className="absolute p-4"
                        style={{
                            left: zone.x,
                            top: zone.y,
                            cursor: draggingZoneId === zone.id ? 'grabbing' : 'default' // Giữ shift để grab được xử lý qua HDSD
                        }}
                        onMouseDown={(e) => handleZoneMouseDown(e, zone.id)}
                    >
                        <Zone
                            name={zone.name}
                            seatsMatrix={zone.matrix}
                            seatTypes={seatTypes}
                            selectedSeatIds={selectedSeatIds}
                            onSeatSelect={handleSeatSelect}
                        />
                    </div>
                ))}
            </div>

            {/* Thanh công cụ quản lý trạng thái ghế */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#2a2a2a] px-6 py-4 rounded-xl border border-gray-700 shadow-2xl flex flex-col md:flex-row gap-4 items-center z-50">
                <span className="text-white font-medium text-sm md:text-base">
                    Đang chọn: <strong className="text-[#0000ff] text-lg">{selectedSeatIds.length}</strong> ghế
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleUpdateSelectedSeatsStatus('LOCKED')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition text-sm shadow-md"
                    >
                        Khóa ghế
                    </button>
                    <button 
                        onClick={() => handleUpdateSelectedSeatsStatus('SOLD')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition text-sm shadow-md"
                    >
                        Bán ghế
                    </button>
                    <button 
                        onClick={() => handleUpdateSelectedSeatsStatus('AVAILABLE')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition text-sm shadow-md"
                    >
                        Mở khóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPort;
