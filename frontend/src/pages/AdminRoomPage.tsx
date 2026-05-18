import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import AdminViewPort, { ZoneData } from '@/components/room/AdminViewPort';
import { SeatTypeResponse } from '@/api/seatTypeApi';
import { SeatResponse } from '@/api/seatApi';
import { eventSessionApi } from '@/api/eventSessionApi';
import { seatTypeApi } from '@/api/seatTypeApi';
import { zoneApi } from '@/api/zoneApi';
import { seatApi } from '@/api/seatApi';

const PRESET_COLORS = [
  '#b0b0b0', // Gray
  '#ff5757', // Coral Pink
  '#ffe359', // Pastel Yellow
  '#8e3a3a', // Dark Red/Brown
  '#2a0808', // Dark Maroon
  '#00e676', // Emerald Green
  '#0d6132', // Dark Green
  '#2979ff', // Soft Blue
  '#152e66', // Deep Navy
  '#d500f9', // Magenta/Lavender
  '#7b1fa2', // Purple
  '#ff6d00', // Orange
  '#5d4037', // Brown
  '#1de9b6', // Teal
  '#00e5ff', // Bright Cyan
  '#ff1744', // Red
  '#c6ff00', // Lime Yellow
  '#ffea00'  // Yellow
];

export function AdminRoomPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'manage' | 'edit'>('manage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [zones, setZones] = useState<ZoneData[]>([]);

  // Track expanded state for zones
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});

  const toggleZoneExpand = (zoneId: string) => {
    setExpandedZones(prev => ({
      ...prev,
      [zoneId]: !prev[zoneId]
    }));
  };
  
  const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([
    { id: 't1', eventId: eventId || '', name: 'Standard', label: 'Ghế thường', price: 200000, color: '#4a4a4a' }
  ]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  // Add Zone Modal state
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRows, setNewZoneRows] = useState('');
  const [newZoneCols, setNewZoneCols] = useState('');

  // Manage SeatType Modal state
  const [showSeatTypeModal, setShowSeatTypeModal] = useState(false);
  const [editingSeatTypeId, setEditingSeatTypeId] = useState<string | null>(null);
  const [newSeatTypeLabel, setNewSeatTypeLabel] = useState('');
  const [newSeatTypePrice, setNewSeatTypePrice] = useState('');
  const [newSeatTypeColor, setNewSeatTypeColor] = useState(PRESET_COLORS[0]);

  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAssignSeatType = (typeId: string) => {
    if (selectedSeatIds.length === 0) return;
    setZones(prev => prev.map(zone => ({
      ...zone,
      matrix: zone.matrix.map(row => row.map(seat => {
        if (seat && selectedSeatIds.includes(seat.id)) {
          return { ...seat, seatTypeId: typeId || null };
        }
        return seat;
      }))
    })));
    
    // Xóa mảng ghế đang chọn sau khi gán loại ghế thành công
    setSelectedSeatIds([]);
  };

  const handleAddZone = () => {
    if (!newZoneName || !newZoneRows || !newZoneCols) return;
    
    const rows = parseInt(newZoneRows, 10);
    const cols = parseInt(newZoneCols, 10);
    
    if (rows <= 0 || cols <= 0) return;

    const newZoneId = `zone-${Date.now()}`;
    
    // Mặc định lấy id của loại ghế đang đứng đầu tiên trong danh sách, nếu danh sách trống thì gán null
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
      name: newZoneName,
      x: 50,
      y: 50,
      matrix: newMatrix
    };

    setZones(prev => [...prev, newZone]);
    setShowAddZoneModal(false);
    setNewZoneName('');
    setNewZoneRows('');
    setNewZoneCols('');
  };

  const openAddSeatTypeModal = () => {
    setEditingSeatTypeId(null);
    setNewSeatTypeLabel('');
    setNewSeatTypePrice('');
    setNewSeatTypeColor(PRESET_COLORS[0]);
    setShowSeatTypeModal(true);
  };

  const openEditSeatTypeModal = (type: SeatTypeResponse) => {
    setEditingSeatTypeId(type.id);
    setNewSeatTypeLabel(type.label);
    setNewSeatTypePrice(type.price.toString());
    setNewSeatTypeColor(type.color);
    setShowSeatTypeModal(true);
  };

  const handleSaveSeatType = () => {
    if (!newSeatTypeLabel || !newSeatTypePrice || !newSeatTypeColor) return;
    const price = parseInt(newSeatTypePrice.toString(), 10);
    if (isNaN(price) || price < 0) return;

    if (editingSeatTypeId) {
      // Chế độ Edit: Cập nhật loại ghế đang có
      setSeatTypes(prev => prev.map(t => 
        t.id === editingSeatTypeId 
          ? { ...t, name: newSeatTypeLabel, label: newSeatTypeLabel, price: price, color: newSeatTypeColor } 
          : t
      ));
    } else {
      // Chế độ Thêm mới
      const newType: SeatTypeResponse = {
        id: `type-${Date.now()}`,
        eventId: eventId || '',
        name: newSeatTypeLabel,
        label: newSeatTypeLabel,
        price: price,
        color: newSeatTypeColor
      };
      setSeatTypes(prev => [...prev, newType]);

      // TÍNH NĂNG TỰ ĐỘNG PHỤC HỒI KHU VỰC:
      // Nếu danh sách loại ghế trước đó đang trống trơn (bạn vừa xóa hết) 
      // => tự động lấy loại ghế mới tạo này lấp đầy toàn bộ ghế trong tất cả các zone
      if (seatTypes.length === 0) {
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
    setEditingSeatTypeId(null);
    setNewSeatTypeLabel('');
    setNewSeatTypePrice('');
    setNewSeatTypeColor(PRESET_COLORS[0]);
  };

  const handleDeleteSeatType = (id: string) => {
    const newSeatTypes = seatTypes.filter(t => t.id !== id);
    setSeatTypes(newSeatTypes);

    // Tính năng tự động dồn: Tìm ID của loại ghế đầu tiên còn lại (nếu có)
    const fallbackTypeId = newSeatTypes.length > 0 ? newSeatTypes[0].id : null;

    // Quét toàn bộ ghế, nếu ghế nào đang dùng loại vừa bị xóa thì tự động gán sang loại thay thế
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
      
      // 1. Fetch sessions
      const sessionsRes: any = await eventSessionApi.getSessionsByEventId(eventId);
      const sessions = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes?.data ?? [];
      
      if (!sessions || sessions.length === 0) {
        alert("Chưa có phiên sự kiện nào! Hãy thêm phiên trước khi cấu hình sơ đồ ghế.");
        navigate(`/admin/event/update/${eventId}`);
        return;
      }

      // 2. Save seat types & get real IDs
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

      // 3. For each session, create zones and seats
      for (const session of sessions) {
        for (const zone of zones) {
          const rows = zone.matrix.length;
          const cols = rows > 0 ? zone.matrix[0].length : 0;
          if (rows === 0 || cols === 0) continue;

           // 3a. Create Zone
          const zoneRes: any = await zoneApi.createZone(session.id, {
            name: zone.name,
            rowsCount: rows,
            colsCount: cols,
            xPosition: zone.x,
            yPosition: zone.y
          });
          const realZone = zoneRes?.data ?? zoneRes;
          const realZoneId = realZone.id;

          // 3b. Generate Seats
          const defaultRealTypeId = seatTypes.length > 0 ? typeIdMap.get(seatTypes[0].id) : undefined;
          const seatsRes: any = await seatApi.generateSeats(realZoneId, {
            seatTypeId: defaultRealTypeId
          });
          const realSeats = Array.isArray(seatsRes) ? seatsRes : seatsRes?.data ?? [];

          // 3c. Map seats to their assigned seat types
          const seatTypeGroups: Record<string, string[]> = {};
          
          for (const realSeat of realSeats) {
            const r = realSeat.rowIndex;
            const c = realSeat.colIndex;
            const localSeat = zone.matrix[r]?.[c];
            if (localSeat && localSeat.seatTypeId) {
              const realTypeId = typeIdMap.get(localSeat.seatTypeId);
              if (realTypeId) {
                if (!seatTypeGroups[realTypeId]) seatTypeGroups[realTypeId] = [];
                seatTypeGroups[realTypeId].push(realSeat.id);
              }
            }
          }

          // 3d. Update seat types in bulk
          for (const [realTypeId, seatIds] of Object.entries(seatTypeGroups)) {
            if (seatIds.length > 0) {
              await seatApi.updateMultipleSeats({
                seatIds,
                newSeatTypeId: realTypeId
              });
            }
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
                      {zones.map(z => {
                        const allZoneSeats = z.matrix.flat().filter(s => s != null);
                        const totalSeats = allZoneSeats.length;
                        const isExpanded = !!expandedZones[z.id];

                        // Calculate counts for each seat type in this zone
                        const seatTypeDetails = seatTypes.map(t => {
                          const count = allZoneSeats.filter(s => s.seatTypeId === t.id).length;
                          return { ...t, count };
                        }).filter(t => t.count > 0);

                        // Tính số ghế chưa phân loại an toàn hơn (kiểm tra cả việc ID không tồn tại)
                        const validSeatTypeIds = seatTypes.map(t => t.id);
                        const unassignedCount = allZoneSeats.filter(s => !s.seatTypeId || !validSeatTypeIds.includes(s.seatTypeId)).length;

                        return (
                          <div 
                            key={z.id} 
                            className="bg-[#383838] rounded-lg overflow-hidden transition-all duration-200"
                          >
                            {/* Header */}
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
                      })}
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
                        <div 
                          key={t.id} 
                          onClick={() => openEditSeatTypeModal(t)}
                          className="bg-[#383838] px-3 py-2 rounded-lg flex justify-between items-center text-[12px] font-bold border border-gray-700 group cursor-pointer hover:bg-[#4a4a4a] transition-colors"
                        >
                          <div className="flex items-center gap-2 pointer-events-none">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.color }}></div>
                            <span className="truncate max-w-[100px]">{t.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#00FF1E] pointer-events-none">{t.price.toLocaleString('vi-VN')}đ</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleDeleteSeatType(t.id);
                              }} 
                              className="text-red-500 hover:text-red-400 hidden group-hover:block p-1"
                            >
                                <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
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

          <div className="p-4 shrink-0">
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
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#2a2a2a] w-[480px] p-6  rounded-xl relative shadow-2xl border border-gray-700">
            <button 
              onClick={() => setShowAddZoneModal(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X size={28} />
            </button>
            <h2 className="text-[28px] font-bold mb-6 text-center">Thêm khu vực</h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[20px] font-bold text-white mb-1">Tên khu vực</label>
                <input 
                  type="text" 
                  value={newZoneName}
                  onChange={e => setNewZoneName(e.target.value)}
                  placeholder="Nhập tên khu vực"
                  className="w-full bg-[#383838] rounded-lg px-4 py-2 text-[#868686] font-bold text-[16px] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[20px] font-bold text-white mb-1">Số hàng</label>
                  <input 
                    type="number" 
                    value={newZoneRows}
                    onChange={e => setNewZoneRows(e.target.value)}
                    placeholder="Nhập số hàng"
                    className="w-full bg-[#383838] rounded-lg px-4 py-2 text-[#868686] font-bold text-[16px] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[20px] font-bold text-white mb-1">Số cột</label>
                  <input 
                    type="number" 
                    value={newZoneCols}
                    onChange={e => setNewZoneCols(e.target.value)}
                    placeholder="Nhập số cột"
                    className="w-full bg-[#383838] rounded-lg px-4 py-2 text-[#868686] font-bold text-[16px] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <button 
                onClick={handleAddZone}
                className="mt-4 bg-[#0090FF] hover:bg-blue-600 text-white font-bold py-2 rounded-full px-8 mx-auto block transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Type Modal */}
      {showSeatTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] w-[480px] rounded-2xl p-6 relative shadow-2xl border border-gray-800">
            <button 
              onClick={() => setShowSeatTypeModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X size={28} />
            </button>
            <h2 className="text-[28px] font-bold mb-6 text-center text-white">
              {editingSeatTypeId ? 'Chỉnh sửa loại ghế' : 'Thêm loại ghế'}
            </h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[20px] font-bold text-white mb-1">Tên loại ghế</label>
                <input 
                  type="text" 
                  value={newSeatTypeLabel}
                  onChange={e => setNewSeatTypeLabel(e.target.value)}
                  placeholder="Nhập tên loại ghế"
                  className="w-full bg-[#383838] rounded-lg px-4 py-2 text-white font-bold text-[16px] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[20px] font-bold text-white mb-1">Giá tiền (đ)</label>
                <input 
                  type="number" 
                  value={newSeatTypePrice}
                  onChange={e => setNewSeatTypePrice(e.target.value)}
                  placeholder="Nhập giá tiền"
                  className="w-full bg-[#383838] rounded-lg px-4 py-2 text-white font-bold text-[16px] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[20px] font-bold text-white mb-1">Màu đại diện</label>
                <div className="grid grid-cols-10 gap-2">
                  {PRESET_COLORS.map(color => {
                    const isSelected = newSeatTypeColor.toLowerCase() === color.toLowerCase();
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewSeatTypeColor(color)}
                        className={`w-7 h-7 rounded-lg transition-all relative ${
                          isSelected 
                            ? 'ring-2 ring-[#0066ff] scale-110 border border-white' 
                            : 'hover:scale-105 border border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    );
                  })}
                  {/* Custom color picker */}
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <input
                      type="color"
                      value={PRESET_COLORS.includes(newSeatTypeColor.toLowerCase()) ? '#ffffff' : newSeatTypeColor}
                      onChange={e => setNewSeatTypeColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Chọn màu khác"
                    />
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-500 hover:border-white transition-colors ${
                        !PRESET_COLORS.includes(newSeatTypeColor.toLowerCase()) 
                          ? 'ring-2 ring-[#0066ff] scale-110 border-solid border-white' 
                          : ''
                      }`}
                      style={!PRESET_COLORS.includes(newSeatTypeColor.toLowerCase()) ? { backgroundColor: newSeatTypeColor } : {}}
                    >
                      <span className="text-xs font-bold text-gray-400 hover:text-white">+</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleSaveSeatType}
                className="mt-4 bg-[#0090FF] hover:bg-blue-600 text-white font-bold py-2 rounded-full px-12 mx-auto block transition-colors"
              >
                {editingSeatTypeId ? 'Lưu thay đổi' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#383838] w-[550px] p-6 rounded-2xl relative shadow-2xl border border-gray-800 text-center">
            <h2 className="text-[24px] font-bold mb-4 text-white">Xác nhận tạo sơ đồ ghế</h2>
            <p className="text-[20px] font-bold text-white mb-6 leading-relaxed">
              Bạn có chắc chắn muốn tạo sơ đồ ghế không? <br/>
              <span className="text-[#ff5757] font-bold">Bạn sẽ không thể chỉnh sửa sơ đồ ghế sau khi đã tạo.</span>
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="bg-[#777777] border border-gray-600 hover:border-gray-400 text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmSubmit}
                className="bg-[#ff5757] hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}