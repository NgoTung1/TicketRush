import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventSessionItem from '../../components/event/EventSessionItem';
import DateFilter from '@/assets/images/Date.svg';
import LocationFilter from '@/assets/images/LocationIcon.svg';
import { eventApi, EventResponse } from '../../api/eventApi';
import { eventSessionApi, EventSessionResponse } from '../../api/eventSessionApi';
import { seatTypeApi, SeatTypeResponse } from '../../api/seatTypeApi';
import { adminStatisticApi } from '../../api/adminStatisticApi';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, LabelList
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const yy = d.getFullYear();
    return `${hh}:${mm} - ${dd}/${mo}/${yy}`;
  } catch {
    return iso;
  }
}

function formatSessionTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const wd = weekdays[d.getDay()];
    return `${hh}:${mm}, ${wd}`;
  } catch {
    return iso;
  }
}

function formatSessionDate(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = d.getDate().toString().padStart(2, '0');
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}/${mo}/${yy}`;
  } catch {
    return iso;
  }
}

function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí';
  return price.toLocaleString('vi-VN') + 'đ';
}

function formatMinPrice(seatTypes: SeatTypeResponse[]): string {
  if (!seatTypes || seatTypes.length === 0) return 'Xem chi tiết';
  const min = Math.min(...seatTypes.map((s) => s.price));
  return min === 0 ? 'Miễn phí' : formatPrice(min) + '+';
}

const extractList = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res.content && Array.isArray(res.content)) return res.content;
  return [];
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [sessions, setSessions] = useState<EventSessionResponse[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);

  // ─── Stats State ───────────────────────────────────────────────────────────
  const [genderData, setGenderData] = useState<{ name: string, value: number, color: string }[]>([]);
  const [ageData, setAgeData] = useState<{ name: string, count: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [revenueData, setRevenueData] = useState<{ date: string, value: number }[]>([]);

  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch event + sessions + seatTypes ────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    setLoadingEvent(true);
    setLoadingSessions(true);
    setError(null);

    // Event detail
    eventApi.getEventById(id)
      .then((res: any) => {
        const e: EventResponse = res?.data ?? res;
        if (!e || !e.id) {
          navigate('/', { replace: true });
          return;
        }
        setEvent(e);
        setLoadingEvent(false);
      })
      .catch(() => {
        navigate('/', { replace: true });
      });

    // Sessions
    eventSessionApi.getSessionsByEventId(id)
      .then((res: any) => {
        setSessions(extractList(res));
      })
      .finally(() => setLoadingSessions(false));

    // Seat types
    seatTypeApi.getSeatTypesByEventId(id)
      .then((res: any) => {
        setSeatTypes(extractList(res));
      });

    // Statistics
    Promise.all([
      adminStatisticApi.getGenderStats(id),
      adminStatisticApi.getAgeStats(id),
      adminStatisticApi.getTotalRevenue(id),
      adminStatisticApi.getDailyRevenue(id)
    ]).then(([genderRes, ageRes, totalRevRes, dailyRevRes]) => {
      const mappedGender = genderRes.map(g => ({
        name: g.gender === 'FEMALE' ? 'Nữ' : g.gender === 'MALE' ? 'Nam' : 'Khác',
        value: g.ticketCount,
        color: g.gender === 'FEMALE' ? '#7a7a7a' : g.gender === 'MALE' ? '#b0b0b0' : '#4a4a4a'
      }));
      setGenderData(mappedGender);

      setAgeData(ageRes.map(a => ({
        name: a.ageRange,
        count: a.ticketCount
      })));

      setTotalRevenue(totalRevRes.totalRevenue);

      setRevenueData(dailyRevRes.map(d => {
        const parts = d.date.split('-');
        return {
          date: parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d.date,
          value: d.revenue
        };
      }));
    }).catch(err => console.error('Lỗi tải thống kê:', err));
  }, [id]);

  // ─── Derived ───────────────────────────────────────────────────────────────

  const statusLabel =
    event?.status === 'ONCOMING'
      ? 'Đang chuẩn bị'
      : event?.status === 'ONGOING'
        ? 'Đang mở bán'
        : 'Đã kết thúc';

  const statusTextColor =
    event?.status === 'ONCOMING'
      ? 'text-[#00a3ff]'
      : event?.status === 'ONGOING'
        ? 'text-[#00a3ff]'
        : 'text-gray-500';

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  if (loadingEvent) {
    return (
      <div className="bg-[#141414] min-h-screen text-white pt-8 pb-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-12">
            <div className="w-full lg:w-[55%] aspect-video bg-white/10 rounded-2xl" />
            <div className="w-full lg:w-[45%] space-y-4 py-4">
              <div className="h-8 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-4 bg-white/10 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#141414] min-h-screen text-white pt-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => navigate('/admin/event-list')}
            className="px-6 py-2 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-sm font-bold rounded-full transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // ─── Custom Tooltips for Charts ──────────────────────────────────────────────
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2a2a2a] border border-white/10 p-2 rounded text-xs text-white">
          <p>{`Độ tuổi: ${label}`}</p>
          <p>{`Số lượng: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2a2a2a] border border-white/10 p-2 rounded text-xs text-white">
          <p>{`Ngày: ${label}`}</p>
          <p>{`Doanh thu: ${payload[0].value} nghìn đồng`}</p>
        </div>
      );
    }
    return null;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#141414] min-h-screen text-white pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-8 lg:mb-12">
          {/* Left: Poster */}
          <div className="w-full lg:w-[55%] shrink-0">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <img
                src={event?.bannerUrl || `https://picsum.photos/seed/${id}/1000/600`}
                alt={event?.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-[45%] flex flex-col justify-start">
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white mb-4 lg:mb-6 leading-tight uppercase">
              {event?.title || '—'}
            </h1>
            <p className="text-white text-sm sm:text-[18px] leading-relaxed text-white/80 italic font-medium">
              {event?.description || 'Chưa có mô tả cho sự kiện này.'}
            </p>
          </div>
        </div>

        {/* Organizer & Location */}
        <div className="mb-12">
          <h3 className="text-[24px] font-bold mb-4 italic text-white">
            Ban tổ chức: {event?.organizer || '—'}
          </h3>
          <div className="flex items-center gap-3 text-[16px] mb-3 text-white">
            <img src={DateFilter} alt="Date" />
            <span className="font-bold italic">
              {event?.startTime ? formatDateTime(event.startTime) : '—'}
            </span>
            <span className={`px-3 py-0.5 bg-white text-[10px] font-bold italic rounded-full uppercase ml-2 tracking-wide ${statusTextColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[16px] text-white font-bold italic">
            <img src={LocationFilter} alt="Location" />
            <span>{event?.address || '—'}</span>
          </div>
        </div>

        {/* Lịch diễn */}
        <div className="mb-16">
          <h2 className="text-[24px] font-bold mb-6 text-white">Lịch diễn</h2>

          {loadingSessions ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-white/40 text-sm">Chưa có lịch diễn.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const priceLabel = seatTypes.length > 0 ? formatMinPrice(seatTypes) : '—';
                const itemStatus: 'available' | 'sold_out' =
                  session.status === 'COMPLETED' || session.status === 'CANCELLED'
                    ? 'sold_out'
                    : 'available';

                const timeStr = session.startAt
                  ? `${formatSessionTime(session.startAt)} - ${formatSessionTime(session.endAt)}`
                  : session.name;

                return (
                  <EventSessionItem
                    key={session.id}
                    time={timeStr}
                    date={session.startAt ? formatSessionDate(session.startAt) : '—'}
                    price={priceLabel}
                    status={itemStatus}
                    actionLabel="Chi tiết ghế"
                    onActionClick={() => navigate(`/admin/event/${id}/session/${session.id}/room`)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Thống kê */}
        <div className="mb-12">
          <h2 className="text-[24px] font-bold mb-6 text-white">Thống kê</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Giới tính */}
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-white/5 flex flex-col h-[300px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-white">Giới tính</h3>
              </div>
              <div className="flex-1 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute right-0 top-1/4 flex flex-col gap-2">
                  {genderData.map(g => (
                    <div key={g.name} className="flex items-center gap-2">
                      <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: g.color }}></div>
                      <span className="text-xs text-white lowercase">{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Độ tuổi */}
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-white/5 flex flex-col h-[300px]">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-sm font-bold text-white">Độ tuổi</h3>
                <span className="text-xs text-white/70 font-bold">Đơn vị - Người</span>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
                      dy={10}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                    <Bar
                      dataKey="count"
                      fill="#7a7a7a"
                      radius={[4, 4, 4, 4]}
                      barSize={20}
                    >
                      <LabelList dataKey="count" position="top" fill="#fff" fontSize={8} fontWeight="bold" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tổng doanh thu */}
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-white/5 flex flex-col h-[300px]">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-white">Tổng doanh thu</h3>
                <span className="text-xs text-white/70 font-bold">Đơn vị - Nghìn đồng</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-[40px] font-bold text-white">
                  {totalRevenue.toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

          </div>

          {/* Biến động doanh thu */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-white/5 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center bg-[#3a3a3a] px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer">
                <img src={DateFilter} alt="Date" className="w-4 h-4 mr-2" />
                <span className="text-xs text-white font-bold mr-2">
                  {revenueData.length > 0 ? `${revenueData[0].date} - ${revenueData[revenueData.length - 1].date}` : 'Toàn thời gian'}
                </span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="w-full sm:w-auto flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Biến động doanh thu</h3>
                <span className="text-xs text-white/70 font-bold sm:ml-6">Đơn vị - Nghìn đồng</span>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 8 }}
                    dy={10}
                  />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {event?.status === 'ONCOMING' && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => navigate(`/admin/event/update/${id}`)}
                className="px-8 py-2 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-sm font-bold rounded-full transition-colors"
              >
                Cập nhật sự kiện
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminEventDetail;
