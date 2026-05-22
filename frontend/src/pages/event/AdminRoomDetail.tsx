import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminViewPort, { ZoneData } from '@/components/room/AdminViewPort';
import { SeatTypeResponse, seatTypeApi } from '@/api/seatTypeApi';
import { SeatResponse, seatApi } from '@/api/seatApi';
import { zoneApi, ZoneResponse } from '@/api/zoneApi';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { supabase } from '@/lib/supabase';

export function AdminRoomDetail() {
  const { eventId, sessionId } = useParams<{ eventId: string; sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);
  
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});

  const toggleZoneExpand = (zoneId: string) => {
    setExpandedZones(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
  };

  useEffect(() => {
    if (!eventId || !sessionId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const typesRes: any = await seatTypeApi.getSeatTypesByEventId(eventId);
        const types = Array.isArray(typesRes) ? typesRes : typesRes?.data ?? [];
        setSeatTypes(types);

        const zonesRes: any = await zoneApi.getZonesBySessionId(sessionId);
        const rawZones = Array.isArray(zonesRes) ? zonesRes : zonesRes?.data ?? [];

        const seatsRes: any = await seatApi.getSeatsBySession(sessionId);
        const rawSeats = Array.isArray(seatsRes) ? seatsRes : seatsRes?.data ?? [];

        const formattedZones: ZoneData[] = rawZones.map((z: ZoneResponse) => {
          const zoneSeats = rawSeats.filter((s: SeatResponse) => s.zoneId === z.id);
          
          const rows = z.rowsCount;
          const cols = z.colsCount;
          const matrix: (SeatResponse | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

          for (const s of zoneSeats) {
            if (s.rowIndex > 0 && s.colIndex > 0) {
              matrix[s.rowIndex - 1][s.colIndex - 1] = s;
            }
          }

          return {
            id: z.id,
            name: z.name,
            x: z.xPosition ?? 50,
            y: z.yPosition ?? 50,
            matrix
          };
        });

        const initExpanded: Record<string, boolean> = {};
        formattedZones.forEach(z => { initExpanded[z.id] = true; });
        setExpandedZones(initExpanded);
        
        setZones(formattedZones);
      } catch (err) {
        console.error("Lỗi tải sơ đồ chi tiết:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, sessionId]);

  // Realtime: lắng nghe thay đổi trạng thái ghế để cập nhật sơ đồ + thống kê live
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`admin-room-detail-${eventId}-seats`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats'
        },
        (payload) => {
          const dbSeat = payload.new;

          setZones((prevZones) => {
            const isRelevant = prevZones.some(z => z.id === dbSeat.zone_id);
            if (!isRelevant) return prevZones;

            return prevZones.map((zone) => {
              if (zone.id !== dbSeat.zone_id) return zone;

              const newMatrix = zone.matrix.map(row => [...row]);
              const rIdx = dbSeat.row_index - 1;
              const cIdx = dbSeat.col_index - 1;

              if (newMatrix[rIdx] && newMatrix[rIdx][cIdx]) {
                const currentSeat = newMatrix[rIdx][cIdx]!;
                newMatrix[rIdx][cIdx] = {
                  ...currentSeat,
                  status: dbSeat.status,
                  userId: dbSeat.select_by
                };
              }

              return { ...zone, matrix: newMatrix };
            });
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase Realtime] AdminRoomDetail kết nối: admin-room-detail-${eventId}-seats`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Supabase Realtime] Lỗi kênh AdminRoomDetail:`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (loading) return <Loading visible />;

  return (
    <div className="h-[calc(100vh-64px)] bg-[#141414] text-white flex flex-col">
      <div className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[28px] font-bold">Ma trận ghế</h1>
      </div>

      <div className="flex flex-1 px-6 pb-6 gap-6 min-h-0 relative">
        {/* Sidebar */}
        <div className="w-[300px] bg-[#1E1E1E] rounded-xl flex flex-col overflow-hidden shrink-0 border border-gray-800 relative z-30">
          <div className="flex border-b border-gray-800 shrink-0">
            <button className="w-full py-3 text-[16px] font-bold bg-[#2a2a2a] text-white cursor-default">
              Thông tin
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-[16px]">Số lượng ghế</span>
                </div>
                {zones.length === 0 ? (
                  <div className="text-[12px] font-bold italic text-white text-center py-3 bg-[#202020] rounded-lg">Chưa có khu vực</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {zones.map(z => {
                      const allZoneSeats = z.matrix.flat().filter(s => s != null) as SeatResponse[];
                      const totalSeats = allZoneSeats.length;
                      const isExpanded = !!expandedZones[z.id];

                      const seatTypeDetails = seatTypes.map(t => {
                        const count = allZoneSeats.filter(s => s.seatTypeId === t.id).length;
                        return { ...t, count };
                      }).filter(t => t.count > 0);

                      const validSeatTypeIds = seatTypes.map(t => t.id);
                      const unassignedCount = allZoneSeats.filter(s => !s.seatTypeId || !validSeatTypeIds.includes(s.seatTypeId)).length;
                      const soldCount = allZoneSeats.filter(s => s.status === 'SOLD').length;

                      return (
                        <div key={z.id} className="bg-[#383838] rounded-lg overflow-hidden transition-all duration-200">
                          <button
                            onClick={() => toggleZoneExpand(z.id)}
                            className="w-full px-3 py-2.5 flex justify-between items-center hover:bg-[#323232] transition-colors focus:outline-none"
                          >
                            <span className="font-bold text-white">{z.name}</span>
                            <div className="flex items-center gap-2 text-white text-[12px]">
                              <span className="font-bold">{totalSeats} ghế</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </button>

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
                                  <div className="border-t border-gray-600 mt-1 pt-1"></div>
                                  <div className="flex justify-between items-center text-xs py-0.5 pl-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-black border border-gray-600" />
                                        <span className="text-white font-bold">Đã bán</span>
                                      </div>
                                      <span className="text-[#00e676] font-bold">{soldCount} ghế</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white font-bold text-[16px]">Mô tả</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#383838] px-3 py-2 rounded-lg flex items-center gap-2 text-[12px] font-bold border border-gray-700">
                    <div className="w-3 h-3 rounded-sm bg-black border border-gray-600"></div>
                    <span>Ghế đã bán</span>
                  </div>
                  {seatTypes.map(t => (
                    <div key={t.id} className="bg-[#383838] px-3 py-2 rounded-lg flex items-center gap-2 text-[12px] font-bold border border-gray-700">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.color }}></div>
                      <span className="truncate max-w-[100px]">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-800 relative shadow-2xl">
          <AdminViewPort 
            isAdmin={false} // Tắt các tính năng chọn, vẽ của admin
            zones={zones}
            seatTypes={seatTypes}
            selectedSeatIds={[]}
            onZonesChange={() => {}} 
            onSelectedSeatsChange={() => {}} 
          />
        </div>
      </div>
    </div>
  );
}

export default AdminRoomDetail;
