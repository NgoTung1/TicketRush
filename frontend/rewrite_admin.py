import os

content = """import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Undo2 } from 'lucide-react';
import AdminViewPort, { ZoneData } from '@/components/room/AdminViewPort';
import { SeatTypeResponse } from '@/api/seatTypeApi';
import { SeatResponse } from '@/api/seatApi';
import { eventSessionApi } from '@/api/eventSessionApi';
import { seatTypeApi } from '@/api/seatTypeApi';
import { zoneApi } from '@/api/zoneApi';
import { seatApi } from '@/api/seatApi';
import { eventApi } from '@/api/eventApi';

import { AddZoneModal } from '@/components/room/admin/AddZoneModal';
import { SeatTypeModal } from '@/components/room/admin/SeatTypeModal';
import { ConfirmModal } from '@/components/room/admin/ConfirmModal';
import { ZoneItem } from '@/components/room/admin/ZoneItem';
import { SeatTypeItem } from '@/components/room/admin/SeatTypeItem';

export function AdminRoomPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manage' | 'edit'>('manage');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [zones, setZones] = useState<ZoneData[]>([]);
  const [zonesHistory, setZonesHistory] = useState<ZoneData[][]>([]);
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});
  const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([
    { id: 't1', eventId: eventId || '', name: 'Standard', label: 'Ghế thường', price: 200000, color: '#B7B7B7' }
  ]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showSeatTypeModal, setShowSeatTypeModal] = useState(false);
  const [editingSeatType, setEditingSeatType] = useState<SeatTypeResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    Promise.all([
      eventApi.getEventById(eventId),
      seatTypeApi.getSeatTypesByEventId(eventId).catch(() => [])
    ])
      .then(([eventRes, seatTypesRes]: [any, any]) => {
        const event = eventRes?.data ?? eventRes;
        const existingSeatTypes = Array.isArray(seatTypesRes) ? seatTypesRes : seatTypesRes?.data ?? [];

        if (event.status !== 'ONCOMING') {
          alert('Không thể cấu hình sơ đồ ghế cho sự kiện đã hoặc đang diễn ra.');
          navigate('/');
        } else if (existingSeatTypes.length > 0) {
          alert('Sơ đồ ghế cho sự kiện này đã được thiết lập!');
          navigate(`/admin/event/${eventId}`);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải thông tin sự kiện:", err);
        setLoading(false);
      });
  }, [eventId, navigate]);

  const saveHistory = (currentZones: ZoneData[]) => {
    const snapshot = JSON.parse(JSON.stringify(currentZones));
    setZonesHistory(prev => [...prev, snapshot]);
  };

  const handleUndo = () => {
    if (zonesHistory.length === 0) return;
    const prev = zonesHistory[zonesHistory.length - 1];
    setZones(prev);
    setZonesHistory(prevHistory => prevHistory.slice(0, -1));
  };

  const toggleZoneExpand = (zoneId: string) => {
    setExpandedZones(prev => ({
      ...prev,
      [zoneId]: !prev[zoneId]
    }));
  };

  const handleUpdateZoneXYR = (zoneId: string, x: number, y: number, rotation: number) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, x, y, rotation } : zone
    ));
  };

  const handleAssignSeatType = (typeId: string) => {
    if (selectedSeatIds.length === 0) return;
    saveHistory(zones);
    setZones(prev => prev.map(zone => ({
      ...zone,
      matrix: zone.matrix.map(row => row.map(seat => {
        if (seat && selectedSeatIds.includes(seat.id)) {
          return { ...seat, seatTypeId: typeId || null };
        }
        return seat;
      }))
    })));
    setSelectedSeatIds([]);
  };

  const handleAddZone = (name: string, rows: number, cols: number) => {
    if (rows > 50 || cols > 50) {
      alert("Số hàng và số cột không được vượt quá 50!");
      return;
    }

    const newZoneId = `zone-${Date.now()}`;
    const defaultSeatTypeId = seatTypes.length > 0 ? seatTypes[0].id : null;

    const newMatrix: (SeatResponse | null)[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        id: `seat-${newZoneId}-${r}-${c}`,
        zoneId: newZoneId,
        seatTypeId: defaultSeatTypeId,
        rowIndex: r,
        colIndex: c,
        seatNumber: c + 1,
        status: 'AVAILABLE'
      }))
    );

    const newZone: ZoneData = {
      id: newZoneId,
      name,
      x: 50,
      y: 50,
      rotation: 0,
      matrix: newMatrix
    };

    saveHistory(zones);
    setZones(prev => [...prev, newZone]);
    setShowAddZoneModal(false);
  };

  const openAddSeatTypeModal = () => {
    setEditingSeatType(null);
    setShowSeatTypeModal(true);
  };

  const openEditSeatTypeModal = (type: SeatTypeResponse) => {
    setEditingSeatType(type);
    setShowSeatTypeModal(true);
  };

  const handleSaveSeatType = (label: string, price: number, color: string) => {
    if (editingSeatType) {
      setSeatTypes(prev => prev.map(t =>
        t.id === editingSeatType.id
          ? { ...t, name: label, label, price, color }
          : t
      ));
    } else {
      const newType: SeatTypeResponse = {
        id: `type-${Date.now()}`,
        eventId: eventId || '',
        name: label,
        label,
        price,
        color
      };
      setSeatTypes(prev => [...prev, newType]);

      if (seatTypes.length === 0) {
        saveHistory(zones);
        setZones(prev => prev.map(zone => ({
          ...zone,
          matrix: zone.matrix.map(row => row.map(seat => {
            if (seat) {
              return { ...seat, seatTypeId: newType.id };
            }
            return seat;
          }))
        })));
      }
    }
    setShowSeatTypeModal(false);
    setEditingSeatType(null);
  };

  const handleDeleteSeatType = (id: string) => {
    const newSeatTypes = seatTypes.filter(t => t.id !== id);
    setSeatTypes(newSeatTypes);

    const fallbackTypeId = newSeatTypes.length > 0 ? newSeatTypes[0].id : null;

    saveHistory(zones);
    setZones(prev => prev.map(zone => ({
      ...zone,
      matrix: zone.matrix.map(row => row.map(seat => {
        if (seat && seat.seatTypeId === id) {
          return { ...seat, seatTypeId: fallbackTypeId };
        }
        return seat;
      }))
    })));
  };

  const handleConfirm = async () => {
    if (!eventId) return;

    if (zones.length === 0) {
      alert("Vui lòng tạo ít nhất một khu vực trước khi xác nhận sơ đồ ghế!");
      return;
    }

    if (seatTypes.length === 0) {
      alert("Vui lòng thêm ít nhất một loại ghế trước khi xác nhận sơ đồ ghế!");
      return;
    }

    try {
      setIsSubmitting(true);

      const sessionsRes: any = await eventSessionApi.getSessionsByEventId(eventId);
      const sessions = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes?.data ?? [];

      if (!sessions || sessions.length === 0) {
        alert("Chưa có phiên sự kiện nào! Hãy thêm phiên trước khi cấu hình sơ đồ ghế.");
        navigate(`/admin/event/update/${eventId}`);
        return;
      }

      try {
        await seatTypeApi.deleteAllByEventId(eventId);
        for (const session of sessions) {
          await zoneApi.deleteAllBySessionId(session.id);
        }
      } catch (err) {
        console.warn("Lỗi khi dọn dẹp dữ liệu cũ, có thể chưa có dữ liệu nào:", err);
      }

      const typeIdMap = new Map<string, string>();
      for (const t of seatTypes) {
        const payload: any = {
          name: t.name,
          label: t.label,
          price: t.price,
          color: t.color
        };
        if (!t.id.startsWith('t') && !t.id.startsWith('type-')) {
          payload.id = t.id;
        }

        const res: any = await seatTypeApi.saveSeatType(eventId, payload);
        const realType = res?.data ?? res;
        typeIdMap.set(t.id, realType.id);
      }

      for (const session of sessions) {
        for (const zone of zones) {
          const rows = zone.matrix.length;
          const cols = rows > 0 ? zone.matrix[0].length : 0;
          if (rows === 0 || cols === 0) continue;

          const zoneRes: any = await zoneApi.createZone(session.id, {
            name: zone.name,
            rowsCount: rows,
            colsCount: cols,
            xPosition: zone.x,
            yPosition: zone.y,
            rotation: zone.rotation || 0
          });
          const realZone = zoneRes?.data ?? zoneRes;
          const realZoneId = realZone.id;

          const defaultRealTypeId = seatTypes.length > 0 ? typeIdMap.get(seatTypes[0].id) : undefined;
          const seatsRes: any = await seatApi.generateSeats(realZoneId, {
            seatTypeId: defaultRealTypeId
          });
          const realSeats = Array.isArray(seatsRes) ? seatsRes : seatsRes?.data ?? [];

          const seatTypeGroups: Record<string, string[]> = {};
          const seatIdsToDelete: string[] = [];

          for (const realSeat of realSeats) {
            const r = realSeat.rowIndex - 1;
            const c = realSeat.colIndex - 1;
            const localSeat = zone.matrix[r]?.[c];
            if (localSeat) {
              const realTypeId = localSeat.seatTypeId ? typeIdMap.get(localSeat.seatTypeId) : undefined;

              if (localSeat.status && localSeat.status !== 'AVAILABLE') {
                await seatApi.updateSeat(realSeat.id, {
                  seatTypeId: realTypeId || defaultRealTypeId,
                  status: localSeat.status
                });
              } else {
                if (realTypeId) {
                  if (!seatTypeGroups[realTypeId]) seatTypeGroups[realTypeId] = [];
                  seatTypeGroups[realTypeId].push(realSeat.id);
                }
              }
            } else {
              seatIdsToDelete.push(realSeat.id);
            }
          }

          for (const [realTypeId, seatIds] of Object.entries(seatTypeGroups)) {
            if (seatIds.length > 0) {
              await seatApi.updateMultipleSeats({
                seatIds,
                newSeatTypeId: realTypeId
              });
            }
          }

          if (seatIdsToDelete.length > 0) {
            await seatApi.deleteSeats(seatIdsToDelete);
          }
        }
      }

      alert("Cấu hình sơ đồ ghế thành công cho tất cả các phiên!");
      navigate(`/admin/event/${eventId}`);
    } catch (error) {
      console.error("Lỗi khi cấu hình sơ đồ ghế:", error);
      alert("Đã xảy ra lỗi khi cấu hình sơ đồ ghế. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmClick = () => {
    if (zones.length === 0) {
      alert("Vui lòng tạo ít nhất một khu vực trước khi xác nhận sơ đồ ghế!");
      return;
    }

    if (seatTypes.length === 0) {
      alert("Vui lòng thêm ít nhất một loại ghế trước khi xác nhận sơ đồ ghế!");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    handleConfirm();
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#141414] text-white flex items-center justify-center font-bold text-lg">
        Đang tải thông tin sự kiện...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-[#141414] text-white flex flex-col">
      <div className="px-6 py-4 flex items-center gap-4">
        <h1 className="text-[28px] font-bold">Ma trận ghế</h1>
      </div>

      <div className="flex flex-1 px-6 pb-6 gap-6 min-h-0 relative">
        {/* Sidebar */}
        <div className="w-[300px] bg-[#1E1E1E] rounded-xl flex flex-col overflow-hidden shrink-0 border border-gray-800 relative z-30">
          <div className="flex border-b border-gray-800 shrink-0">
            <button
              className={`flex-1 py-3 text-[16px] font-bold ${activeTab === 'manage' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('manage')}
            >
              Quản lý
            </button>
            <button
              className={`flex-1 py-3 text-[16px] font-bold ${activeTab === 'edit' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('edit')}
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'manage' && (
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-[16px]">Khu vực</span>
                    <button
                      onClick={() => setShowAddZoneModal(true)}
                      className="bg-[#696464] hover:bg-gray-600 rounded p-[3px] transition-colors"
                      title="Thêm khu vực"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {zones.length === 0 ? (
                    <div className="text-[12px] font-bold italic text-white text-center py-3 bg-[#202020] rounded-lg">Chưa có khu vực</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {zones.map(z => (
                        <ZoneItem
                          key={z.id}
                          zone={z}
                          isExpanded={!!expandedZones[z.id]}
                          onToggleExpand={toggleZoneExpand}
                          onDelete={(zoneId) => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa khu vực này?')) {
                              saveHistory(zones);
                              setZones(prev => prev.filter(zone => zone.id !== zoneId));
                            }
                          }}
                          onUpdateXYR={handleUpdateZoneXYR}
                          seatTypes={seatTypes}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white font-bold text-[16px]">Ghế</span>
                    <button onClick={openAddSeatTypeModal} className="bg-[#696464] hover:bg-gray-600 rounded p-[3px]">
                      <Plus size={14} />
                    </button>
                  </div>
                  {seatTypes.length === 0 ? (
                    <div className="text-[12px] font-bold italic text-center py-3 bg-[#202020] rounded-lg">Chưa có ghế</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {seatTypes.map(t => (
                        <SeatTypeItem
                          key={t.id}
                          seatType={t}
                          onEdit={openEditSeatTypeModal}
                          onDelete={handleDeleteSeatType}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-white mb-3 text-[16px]">Trạng thái lựa chọn</h3>
                  <div className="bg-[#2a2a2a] p-3 rounded-lg text-sm border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#383838]"></div>
                        <span className="text-white font-bold">Ghế đang chọn</span>
                      </div>
                      <span className="font-bold text-white">{selectedSeatIds.length} ghế</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white mb-3 text-[16px]">Thay đổi loại ghế</h3>
                  <div className="flex flex-wrap gap-2">
                    {seatTypes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleAssignSeatType(t.id)}
                        className="w-8 h-8 rounded border border-gray-600 hover:scale-110 transition-transform flex-shrink-0"
                        style={{ backgroundColor: t.color }}
                        title={t.label}
                      />
                    ))}
                    <button
                      onClick={() => handleAssignSeatType('')}
                      className="w-8 h-8 rounded border border-gray-600 hover:scale-110 transition-transform bg-[#4a4a4a] flex-shrink-0 flex items-center justify-center"
                      title="Xóa loại ghế"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 shrink-0 flex flex-col gap-2">
            {zonesHistory.length > 0 && (
              <button
                onClick={handleUndo}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-full text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Undo2 size={16} /> Hoàn tác ({zonesHistory.length})
              </button>
            )}
            <button
              onClick={handleConfirmClick}
              disabled={isSubmitting}
              className={`px-4 py-2 bg-[#0090FF] hover:bg-blue-600 text-white rounded-lg w-full text-sm font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </div>

        {/* ViewPort Container */}
        <div className="flex-1 bg-[#1b1b1b] rounded-xl overflow-hidden relative border border-gray-800 z-10 flex flex-col shadow-inner">
          {zones.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold pointer-events-none italic z-20">
              Chọn khu vực để hiển thị
            </div>
          ) : (
            <div className="flex-1 relative">
              <AdminViewPort
                className="!absolute"
                isAdmin={true}
                zones={zones}
                seatTypes={seatTypes}
                selectedSeatIds={selectedSeatIds}
                onZonesChange={setZones}
                onSelectedSeatsChange={setSelectedSeatIds}
                onSaveHistory={() => saveHistory(zones)}
              />
            </div>
          )}
        </div>
      </div>

      <AddZoneModal
        isOpen={showAddZoneModal}
        onClose={() => setShowAddZoneModal(false)}
        onAdd={handleAddZone}
      />

      <SeatTypeModal
        isOpen={showSeatTypeModal}
        onClose={() => setShowSeatTypeModal(false)}
        onSave={handleSaveSeatType}
        initialData={editingSeatType ? { label: editingSeatType.label, price: editingSeatType.price, color: editingSeatType.color } : null}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
"""

path = r'd:\UET\Web\TicketRush\frontend\src\pages\AdminRoomPage.tsx'
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
