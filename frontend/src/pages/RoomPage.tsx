import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { roomApi } from '@/api/roomApi';
import { useRoomStore } from '@/store/RoomStore';
import { useToastStore } from '@/store/ToastStore';
import ViewPort, { ZoneData } from '@/components/room/ViewPort';
import { SeatTypeResponse, seatTypeApi } from '@/api/seatTypeApi';
import { SeatResponse, seatApi } from '@/api/seatApi';
import { zoneApi } from '@/api/zoneApi';
import { eventSessionApi } from '@/api/eventSessionApi';
import { eventApi } from '@/api/eventApi';
import { supabase } from '@/lib/supabase';

export function RoomPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRoom, clearActiveRoom } = useRoomStore();
  const { addToast } = useToastStore();
  const hasWarnedRed = useRef(false);
  const fromDetail = location.state?.fromDetail;

  useEffect(() => {
    if (activeRoom?.timeLeft && !hasWarnedRed.current) {
      const parts = activeRoom.timeLeft.split(':');
      if (parts.length === 2) {
        const mins = parseInt(parts[0], 10);
        if (mins < 3) {
          addToast({
            type: 'warning',
            title: 'Sắp hết thời gian',
            message: 'Bạn chỉ còn dưới 3 phút để chọn ghế!',
          });
          hasWarnedRed.current = true;
        }
      }
    }
  }, [activeRoom?.timeLeft, addToast]);

  const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Guard 1: Không có activeRoom hoặc eventId không khớp → redirect
  useEffect(() => {
    if (!activeRoom || activeRoom.eventId !== eventId) {
      if (fromDetail) {
        navigate(-1);
      } else {
        navigate(`/event/${eventId}`, { replace: true });
      }
    }
  }, [activeRoom, eventId, navigate, fromDetail]);

  // Guard 2: Event đã COMPLETED → redirect về trang trước
  useEffect(() => {
    if (!eventId) return;
    eventApi.getEventById(eventId)
      .then((res: any) => {
        const status: string = res?.data?.status ?? res?.status ?? '';
        if (status === 'COMPLETED') {
          navigate(-1);
        }
      })
      .catch(() => {
        // Không lấy được event (eventId không hợp lệ) → redirect về trang trước
        navigate(-1);
      });
  }, [eventId, navigate]);

  // Cảnh báo người dùng khi họ cố tình F5, đóng tab hoặc tắt trình duyệt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Trình duyệt hiện đại chỉ cần thế này là tự bung popup mặc định
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      try {
        const types = (await seatTypeApi.getSeatTypesByEventId(eventId)) as unknown as SeatTypeResponse[];
        setSeatTypes(types);

        const sessions = (await eventSessionApi.getSessionsByEventId(eventId)) as unknown as any[];
        if (sessions.length > 0) {
          const fetchedSessionId = sessions[0].id; // Lấy session đầu tiên
          setSessionId(fetchedSessionId);
          const zonesData = (await zoneApi.getZonesBySessionId(fetchedSessionId)) as unknown as any[];
          const seatsData = (await seatApi.getSeatsBySession(fetchedSessionId)) as unknown as SeatResponse[];

          const finalZones: ZoneData[] = zonesData.map(zone => {
            const matrix: (SeatResponse | null)[][] = Array.from({ length: zone.rowsCount }, () =>
              Array(zone.colsCount).fill(null)
            );

            const zoneSeats = seatsData.filter(seat => seat.zoneId === zone.id);
            zoneSeats.forEach(seat => {
              const rIdx = seat.rowIndex - 1;
              const cIdx = seat.colIndex - 1;
              if (rIdx >= 0 && rIdx < zone.rowsCount && cIdx >= 0 && cIdx < zone.colsCount) {
                matrix[rIdx][cIdx] = seat;
              }
            });

            return {
              id: zone.id,
              name: zone.name,
              x: zone.xPosition || 0,
              y: zone.yPosition || 0,
              matrix,
            };
          });

          setZones(finalZones);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    // Tạo kênh lắng nghe riêng cho phòng này để tránh nhiễu tín hiệu
    const channel = supabase
      .channel(`room-${eventId}-seats`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats'
        },
        (payload) => {
          // payload.new chứa dữ liệu của DB (dùng snake_case: zone_id, row_index, select_by...)
          const dbSeat = payload.new;

          setZones((prevZones) => {
            // Kiểm tra xem ghế bị đổi có nằm trong các Zone đang render trên màn hình không
            const isRelevant = prevZones.some(z => z.id === dbSeat.zone_id);
            if (!isRelevant) return prevZones;

            return prevZones.map((zone) => {
              if (zone.id !== dbSeat.zone_id) return zone;

              // Deep copy matrix để React hiểu là có sự thay đổi và kích hoạt re-render
              const newMatrix = zone.matrix.map(row => [...row]);

              // Map tọa độ DB về index của mảng React (trừ 1 giống logic bạn đã viết)
              const rIdx = dbSeat.row_index - 1;
              const cIdx = dbSeat.col_index - 1;

              // Kiểm tra an toàn trước khi gán
              if (newMatrix[rIdx] && newMatrix[rIdx][cIdx]) {
                const currentSeat = newMatrix[rIdx][cIdx]!;

                newMatrix[rIdx][cIdx] = {
                  ...currentSeat,
                  status: dbSeat.status, // Cập nhật trạng thái mới (ORDERED, SOLD, AVAILABLE)
                  userId: dbSeat.select_by // Đổi từ select_by (DB) sang userId (Frontend Component)
                };
              }

              return { ...zone, matrix: newMatrix };
            });
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase Realtime] Đã kết nối thành công kênh: room-${eventId}-seats`);
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Supabase Realtime] Lỗi kết nối kênh: room-${eventId}-seats`, err);
        }

        if (status === 'TIMED_OUT') {
          console.warn(`[Supabase Realtime] Kết nối quá hạn (Timeout) tới kênh: room-${eventId}-seats`);
        }

        if (status === 'CLOSED') {
          console.log(`[Supabase Realtime] Đã ngắt kết nối kênh: room-${eventId}-seats`);
        }
      });

    // Dọn dẹp websocket khi user rời phòng
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const handleLeaveRoom = async () => {
    if (!eventId) return;
    try {
      await roomApi.leaveRoom(eventId);
    } catch (err) {
      console.error("Lỗi leave room:", err);
    } finally {
      clearActiveRoom();
    }
  };

  const [isHolding, setIsHolding] = useState(false);

  const handleCheckout = async () => {
    if (!sessionId || !eventId || groupedSelectedSeats.length === 0) return;
    const seatIds = groupedSelectedSeats.flatMap(g => g.seats.map(s => s.id));
    const invoiceData = groupedSelectedSeats.map(g => ({
      type: `${g.type.label} - ${g.zone.name}`,
      price: g.type.price,
      quantity: g.seats.length,
      seats: g.seats.map(s => `${s.colIndex}${String.fromCharCode(65 + s.rowIndex - 1)}`),
    }));

    setIsHolding(true);
    try {
      await seatApi.holdSeats(seatIds);
      navigate(`/checkout/${eventId}`, { 
        state: { 
          sessionId, 
          seatIds, 
          invoiceData,
          totalAmount: totalPrice,
          eventId,
        } 
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể giữ ghế. Vui lòng thử lại.';
      alert(message);
    } finally {
      setIsHolding(false);
    }
  };

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Calculate grouped selected seats
  const groupedSelectedSeats = useMemo(() => {
    const selectedSeatsData: { seat: SeatResponse; zone: ZoneData }[] = [];
    zones.forEach(zone => {
      zone.matrix.forEach(row => {
        row.forEach(seat => {
          if (seat && selectedSeatIds.includes(seat.id)) {
            selectedSeatsData.push({ seat, zone });
          }
        });
      });
    });

    const groups: { type: SeatTypeResponse; zone: ZoneData; seats: SeatResponse[] }[] = [];
    selectedSeatsData.forEach(({ seat, zone }) => {
      const type = seatTypes.find(t => t.id === seat.seatTypeId);
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
  }, [selectedSeatIds, zones, seatTypes]);

  const totalPrice = useMemo(() => {
    return groupedSelectedSeats.reduce((sum, group) => sum + group.type.price * group.seats.length, 0);
  }, [groupedSelectedSeats]);

  const getTimerColor = (timeLeft?: string) => {
    if (!timeLeft) return 'text-[#00ff00]';
    const parts = timeLeft.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      if (mins < 3) return 'text-[#ff4747]';
      if (mins < 6) return 'text-yellow-400';
    }
    return 'text-[#00ff00]';
  };

  return (
    <div className="min-h-screen text-white pt-4 pb-10 flex flex-col">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Top Section: Viewport + Legend */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Left: Viewport */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-end mb-3">
              <h1 className="text-[24px] font-bold">Chọn vị trí</h1>
              <div className="text-sm font-medium italic mb-1">
                Vui lòng hoàn tất chọn ghế trong: <span className={`font-bold ml-1 ${getTimerColor(activeRoom?.timeLeft)}`}>{activeRoom?.timeLeft || '10:00'}</span>
              </div>
            </div>
            <div className="flex-1 bg-[#1E1E1E] rounded-[8px] overflow-hidden relative min-h-[600px]">
              <ViewPort
                zones={zones}
                seatTypes={seatTypes}
                onSelectedSeatsChange={setSelectedSeatIds}
                className="!bg-transparent"
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
                  {seatTypes.map(type => (
                    <div key={`legend-${type.id}`} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[4px] shrink-0" style={{ backgroundColor: type.color }}></div>
                      <span className="whitespace-nowrap">{type.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#000000] rounded-[4px] shrink-0"></div>
                    <span className="whitespace-nowrap">Ghế đã bán</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#666666] rounded-[4px] shrink-0"></div>
                    <span className="whitespace-nowrap">Ghế đang bị giữ</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white rounded-full shrink-0"></div>
                    <span className="whitespace-nowrap">Ghế bạn đang giữ</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-[20px]">Giá tiền</h3>
                <div className="flex flex-row flex-wrap xl:flex-col gap-x-4 gap-y-2">
                  {seatTypes.map(type => (
                    <div key={`price-${type.id}`} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[4px] shrink-0" style={{ backgroundColor: type.color }}></div>
                      <span className="text-[#00ff00] italic whitespace-nowrap">{type.price.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex justify-end">
                <button onClick={() => setIsRulesOpen(true)} className="px-4 py-1.5 bg-white text-[#0090FF] italic text-[10px] font-bold rounded-full hover:bg-gray-200 transition-colors">
                  Xem nội quy
                </button>
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
                    Vị trí: {group.seats.map(s => `${s.colIndex}${String.fromCharCode(65 + s.rowIndex - 1)}`).join(', ')}
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

            {groupedSelectedSeats.length === 0 && (
              <div className="text-white/60 italic bg-[#1E1E1E] p-5 rounded-xl">
                Chưa có ghế nào được chọn.
              </div>
            )}
          </div>
        </div>

        {/* Total & Action Buttons */}
        <div className="my-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[22px] font-bold w-full md:w-auto text-center md:text-left">
            Tổng hóa đơn: <span className="text-[#00ff00] ml-2">{totalPrice.toLocaleString()}đ</span>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleLeaveRoom}
              className="flex-1 md:flex-none px-4 py-1.5 bg-[#555] hover:bg-[#666] text-white rounded-full font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              className="flex-1 md:flex-none px-4 py-1.5 bg-[#0088ff] hover:bg-blue-500 text-white rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={groupedSelectedSeats.length === 0 || isHolding}
              onClick={handleCheckout}
            >
              {isHolding ? 'Đang giữ ghế...' : 'Thanh toán'}
            </button>
          </div>
        </div>

      </div>

      {/* Rules Popup */}
      {isRulesOpen && (
        <div className="fixed bottom-4 left-4 z-50 w-[800px] max-w-[calc(100vw-32px)] bg-[#333] rounded-[8px] p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-[18px] text-white">Quy định đặt vé</h3>
            <button onClick={() => setIsRulesOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
          <div className="text-[14px] text-gray-200 space-y-3 leading-relaxed">
            <p>
              <strong className="text-white">- Quy định chọn ghế:</strong> Bạn chỉ được đặt tối đa <span className="text-[#00ff00] font-bold">8 vé</span>. Trong quá trình thao tác, nếu ghế bạn chọn bị người khác giữ trước, hệ thống sẽ tự động xóa ghế đó khỏi lựa chọn của bạn.
            </p>
            <div>
              <strong className="text-white">- Chế tài vi phạm:</strong> Để đảm bảo tính công bằng, tài khoản của bạn sẽ bị cấm đặt vé trong <span className="text-[#00ff00] font-bold">2 tiếng</span> nếu:
              <ul className="list-disc pl-8 mt-1 space-y-1">
                <li>Để hệ thống tự động kích do hết thời gian quá <span className="text-[#00ff00] font-bold">3 lần</span>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}