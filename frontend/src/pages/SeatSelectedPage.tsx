import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ViewPort, { ZoneData } from '@/components/room/ViewPort';
import { SeatTypeResponse } from '@/api/seatTypeApi';
import { SeatResponse } from '@/api/seatApi';

// MOCK data
const MOCK_SEAT_TYPES: SeatTypeResponse[] = [
  { id: 'type-standard', eventId: 'mock', name: 'Standard', price: 200000, label: 'Ghế thường', color: '#b3b3b3' },
  { id: 'type-premium', eventId: 'mock', name: 'Premium', price: 300000, label: 'Ghế có vị trí tốt', color: '#0000ff' },
  { id: 'type-vip', eventId: 'mock', name: 'VIP', price: 500000, label: 'Ghế VIP', color: '#c6ff00' },
];

const getMockZones = (currentUserId?: string): ZoneData[] => [
  {
    id: 'zone-B',
    name: 'Khán đài Trái',
    x: 50,
    y: 200,
    matrix: Array.from({ length: 12 }, (_, rowIndex) =>
      Array.from({ length: 8 }, (_, colIndex) => {
        let typeId = 'type-standard';
        if (rowIndex < 4) typeId = 'type-premium';
        return {
          id: `seat-B-${rowIndex}-${colIndex}`,
          zoneId: 'zone-B',
          seatTypeId: typeId,
          rowIndex,
          colIndex,
          seatNumber: colIndex + 1,
          status: 'AVAILABLE' as any,
        };
      })
    ),
  },
  {
    id: 'zone-A',
    name: 'Khu vực Trung tâm',
    x: 600,
    y: 300,
    matrix: Array.from({ length: 10 }, (_, rowIndex) =>
      Array.from({ length: 20 }, (_, colIndex) => {
        let typeId = 'type-standard';
        if (rowIndex === 3 && colIndex >= 6 && colIndex <= 13) typeId = 'type-premium';
        if (rowIndex >= 4 && rowIndex <= 7) {
          if (colIndex === 6 || colIndex === 13) typeId = 'type-premium';
          if (colIndex > 6 && colIndex < 13) typeId = 'type-vip';
        }

        let status: any = 'AVAILABLE';
        let userId: string | undefined = undefined;

        // Mock some seats as purchased by this user
        if (rowIndex === 4 && (colIndex >= 8 && colIndex <= 10)) {
          status = 'SOLD';
          userId = currentUserId || 'mock-user-id';
        }

        return {
          id: `seat-A-${rowIndex}-${colIndex}`,
          zoneId: 'zone-A',
          seatTypeId: typeId,
          rowIndex,
          colIndex,
          seatNumber: colIndex + 1,
          status,
          userId,
        };
      })
    ),
  },
];

import { useAuthStore } from '@/store/AuthStore';

export default function SeatSelectedPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.user);

  const mockZones = useMemo(() => getMockZones(currentUser?.id), [currentUser?.id]);

  // MOCK: Những ID ghế mà người dùng đã mua
  const purchasedSeatIds = ['seat-A-4-8', 'seat-A-4-9', 'seat-A-4-10'];

  const groupedSelectedSeats = useMemo(() => {
    const selectedSeatsData: { seat: SeatResponse; zone: ZoneData }[] = [];
    mockZones.forEach(zone => {
      zone.matrix.forEach(row => {
        row.forEach(seat => {
          if (seat && purchasedSeatIds.includes(seat.id)) {
            selectedSeatsData.push({ seat, zone });
          }
        });
      });
    });

    const groups: { type: SeatTypeResponse; zone: ZoneData; seats: SeatResponse[] }[] = [];
    selectedSeatsData.forEach(({ seat, zone }) => {
      const type = MOCK_SEAT_TYPES.find(t => t.id === seat.seatTypeId);
      if (type) {
        let group = groups.find(g => g.type.id === type.id && g.zone.id === zone.id);
        if (!group) {
          group = { type, zone, seats: [] };
          groups.push(group);
        }
        group.seats.push(seat);
      }
    });
    return groups;
  }, []);

  const totalPrice = useMemo(() => {
    return groupedSelectedSeats.reduce((sum, group) => sum + group.type.price * group.seats.length, 0);
  }, [groupedSelectedSeats]);

  const handleCancelInvoice = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này không?")) {
      alert("Hủy thành công!");
      navigate(-1);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen text-white pt-4 pb-10 flex flex-col">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Top Section: Viewport + Legend */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Left: Viewport */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-[24px] font-bold mb-3">Chi tiết vé đã đặt và đã được thanh toán</h1>
            <div className="flex-1 bg-[#1E1E1E] rounded-[8px] overflow-hidden relative min-h-[600px]">
              <ViewPort
                isAdmin={false}
                zones={mockZones}
                seatTypes={MOCK_SEAT_TYPES}
                onSelectedSeatsChange={() => { }}
                className="!bg-transparent"
                readOnly={true}
              />
            </div>
          </div>

          {/* Right: Legend */}
          <div className="w-full xl:w-[320px] flex flex-col shrink-0">
            <h2 className="text-[24px] font-bold mb-3">Chú thích</h2>
            <div className="bg-[#2a2a2a] p-6 rounded-xl flex flex-col gap-8 flex-1">
              <div>
                <h3 className="font-semibold mb-2 text-[20px]">Biểu tượng</h3>
                <div className="flex flex-row flex-wrap xl:flex-col gap-x-4 gap-y-2">
                  {MOCK_SEAT_TYPES.map(type => (
                    <div key={`legend-${type.id}`} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[4px] shrink-0" style={{ backgroundColor: type.color }}></div>
                      <span className="whitespace-nowrap">{type.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white rounded-full shrink-0"></div>
                    <span className="whitespace-nowrap">Ghế bạn đã mua</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-[20px]">Giá tiền</h3>
                <div className="flex flex-row flex-wrap xl:flex-col gap-x-4 gap-y-2">
                  {MOCK_SEAT_TYPES.map(type => (
                    <div key={`price-${type.id}`} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[4px] shrink-0" style={{ backgroundColor: type.color }}></div>
                      <span className="text-[#00ff00] italic whitespace-nowrap">{type.price.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Seats Information */}
        <div className="mt-8">
          <h2 className="text-[24px] font-bold mb-3">Thông tin ghế đã chọn</h2>
          <div className="flex flex-col gap-3">
            {groupedSelectedSeats.map(group => (
              <div key={`${group.type.id}-${group.zone.id}`} className="bg-[#1E1E1E] py-4 px-5 rounded-[8px] flex flex-col md:flex-row justify-between items-start">
                <div className="flex flex-col gap-3 items-start flex-1 min-w-0 md:pr-4">
                  <div className='flex items-center gap-2'>
                    <div className="w-7 h-7 rounded-[4px] shrink-0" style={{ backgroundColor: group.type.color }}></div>
                    <div className="font-semibold truncate">{group.type.label} - {group.zone.name}</div>
                  </div>
                  <div className="w-full font-bold">
                    Vị trí: {group.seats.map(s => `${s.colIndex + 1}${String.fromCharCode(65 + s.rowIndex)}`).join(', ')}
                  </div>
                </div>
                <div className="text-left md:text-right w-full md:w-auto shrink-0 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end mt-4 md:mt-0">
                  <div className="italic font-semibold mt-0.5">Số lượng: {group.seats.length}</div>
                  <div className="italic font-medium mt-3.5">
                    Tổng chi phí: <span className="text-[#00ff00] font-bold ml-1">{(group.seats.length * group.type.price).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Action Buttons */}
        <div className="my-6 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-[22px] font-bold w-full md:w-auto text-left flex items-center gap-4">
              Tổng hóa đơn: <span className="text-[#00ff00] font-bold">{totalPrice.toLocaleString()}đ</span>
              <span className="text-[12px] px-3 py-1 bg-white text-[#0090FF] rounded-full italic shadow-sm">Đã thanh toán</span>
            </div>
            <div className="font-semibold">
              Mã hóa đơn: <span className="font-bold ml-1">eksiewp12j3%2123</span>
            </div>
            <div className="font-semibold">
              Thời điểm tạo: <span className="font-bold ml-1">23:01:53 - 20/04/2026</span>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 items-end h-full">
            <button
              onClick={handleGoBack}
              className="px-6 py-2 bg-[#555] hover:bg-[#666] text-white rounded-full font-bold transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleCancelInvoice}
              className="px-6 py-2 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full font-bold transition-colors"
            >
              Hủy hóa đơn
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
