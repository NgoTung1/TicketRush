import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventItem from '../../components/event/EventItem';
import EventSessionItem from '../../components/event/EventSessionItem';
import DateFilter from '@/assets/images/Date.svg';
import LocationFilter from '@/assets/images/LocationIcon.svg';
import { eventApi, EventResponse } from '../../api/eventApi';
import { eventSessionApi, EventSessionResponse } from '../../api/eventSessionApi';
import { seatTypeApi, SeatTypeResponse } from '../../api/seatTypeApi';
import { roomApi } from '../../api/roomApi';
import { useRoomStore } from '../../store/RoomStore';
import NotifyForm from '../../components/ui/NotifyForm';
import { formatUnblockTime } from '@/helpers/time';

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

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeRoom, setActiveRoom, setNotifyOpen, clearActiveRoom } = useRoomStore();
  const [isSwitchConfirmOpen, setSwitchConfirmOpen] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  // ─── State ─────────────────────────────────────────────────────────────────
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [sessions, setSessions] = useState<EventSessionResponse[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);
  const [relatedEvents, setRelatedEvents] = useState<EventResponse[]>([]);
  // Map: eventId → seatTypes (dùng cho related events card giá)
  const [relatedSeatTypes, setRelatedSeatTypes] = useState<Record<string, SeatTypeResponse[]>>({});

  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [unblockTime, setUnblockTime] = useState<string | null>(null);

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
        setEvent(e);
      })
      .catch(() => setError('Không thể tải thông tin sự kiện.'))
      .finally(() => setLoadingEvent(false));

    // Sessions
    eventSessionApi.getSessionsByEventId(id)
      .then((res: any) => {
        setSessions(extractList(res));
      })
      .finally(() => setLoadingSessions(false));

    // Seat types (giá vé)
    seatTypeApi.getSeatTypesByEventId(id)
      .then((res: any) => {
        setSeatTypes(extractList(res));
      });

    // Related events: lấy ONGOING + mới (không filter status → mới nhất)
    Promise.all([
      eventApi.getEvents({ status: 'ONGOING', page: 0, size: 4 }),
      eventApi.getEvents({ page: 0, size: 4 }),
    ]).then(([ongoingRes, newRes]) => {
      const ongoing = extractList(ongoingRes);
      const newest = extractList(newRes);
      // Gộp, loại trùng và loại event hiện tại, lấy tối đa 8
      const merged = [...ongoing, ...newest]
        .filter((e, idx, arr) => e.id !== id && arr.findIndex((x) => x.id === e.id) === idx)
        .slice(0, 8);
      setRelatedEvents(merged);

      // Fetch seat types cho từng related event để hiển thị giá
      merged.forEach((e) => {
        seatTypeApi.getSeatTypesByEventId(e.id)
          .then((res: any) => {
            const types = extractList(res);
            setRelatedSeatTypes((prev) => ({ ...prev, [e.id]: types }));
          })
          .catch(() => { });
      });
    });
  }, [id]);

  const performJoinRoom = async () => {
    if (!id) return;
    try {
      const res = await roomApi.joinRoom(id);
      const status = res.status ? res.status.toString() : '';

      if (status === 'ACTIVE_ROOM' || status === 'ALREADY_IN_ACTIVE') {

        const expireAtMs = res.expireAt ? res.expireAt * 1000 : Date.now() + 600000;

        if (Date.now() >= expireAtMs) {
          alert("Thao tác quá nhanh, vui lòng thử lại trong giây lát!");
          return;
        }

        // Truyền hẳn expireAt vào Store
        setActiveRoom({ eventId: id, status: 'ready', expiresAt: expireAtMs });
        navigate(`/event/${id}/room`);

      } else if (status === 'WAITING_ROOM' || status === 'ALREADY_IN_WAITING') {
        setActiveRoom({ eventId: id, status: 'waiting' });
        setNotifyOpen(true);
      } else if (status === 'BLOCKED') {
        const unblockAt = (res as any).unblockAt
        setBlockMessage('Tài khoản của bạn đã bị chặn do phát hiện hoạt động bất thường.');
        if (unblockAt) {
          setUnblockTime(formatUnblockTime(unblockAt));
        } else {
          setUnblockTime(null);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để mua vé!');
        navigate('/auth');
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        console.error("Lỗi join room:", error);
      }
    }
  };

  const handleJoinRoom = async () => {
    if (!id) return;

    if (activeRoom) {
      if (activeRoom.eventId === id) {
        navigate(`/event/${id}/room`, { state: { fromDetail: true } });
        return;
      } else {
        setSwitchConfirmOpen(true);
        return;
      }
    }

    await performJoinRoom();
  };

  const confirmSwitchRoom = async () => {
    if (!id || !activeRoom) return;
    try {
      await roomApi.leaveRoom(activeRoom.eventId);
    } catch (error) {
      console.error("Lỗi khi rời sự kiện cũ:", error);
    } finally {
      clearActiveRoom();
      setSwitchConfirmOpen(false);
      await performJoinRoom();
    }
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  const statusLabel =
    event?.status === 'ONCOMING'
      ? 'Sắp diễn ra'
      : event?.status === 'ONGOING'
        ? 'Đang diễn ra'
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
      <div className="bg-[#141414] min-h-screen text-white pt-20 pb-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 animate-pulse">
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
      <div className="bg-[#141414] min-h-screen text-white pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-2 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-sm font-bold rounded-full transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#141414] min-h-screen text-white pt-20 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-8 lg:mb-12">
          {/* Left: Poster — fixed 16/9, object-cover fills full frame without stretching */}
          <div className="w-full lg:w-[55%] shrink-0">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <img
                src={event?.bannerUrl || `https://picsum.photos/seed/${id}/1000/600`}
                alt={event?.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Right: Info - Đã đổi class thành justify-start để đẩy nội dung lên trên */}
          <div className="w-full lg:w-[45%] flex flex-col justify-start">
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white mb-4 lg:mb-6 leading-tight">
              {event?.title || '—'}
            </h1>
            <p className="text-white text-sm sm:text-[18px] leading-relaxed text-white/80">
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
            <img src={DateFilter} alt="" />
            <span className="font-bold italic">
              {event?.startTime ? formatDateTime(event.startTime) : '—'}
            </span>
            <span className={`px-3 py-0.5 bg-white text-[10px] font-bold italic rounded-full uppercase ml-2 tracking-wide ${statusTextColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[16px] text-white font-bold italic">
            <img src={LocationFilter} alt="" />
            <span>{event?.address || '—'}</span>
          </div>
        </div>

        {/* Lịch diễn */}
        <div className="mb-16">
          <h2 className="text-[24px] font-bold italic mb-6 text-white">Lịch diễn</h2>

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
                // Giá thấp nhất của event (seat types đã load)
                const priceLabel =
                  seatTypes.length > 0 ? formatMinPrice(seatTypes) : '—';

                // Map session status → EventSessionItem status
                const itemStatus: 'available' | 'sold_out' =
                  session.status === 'COMPLETED' || session.status === 'CANCELLED'
                    ? 'sold_out'
                    : 'available';

                const timeStr = session.startAt
                  ? `${formatSessionTime(session.startAt)} - ${formatSessionTime(session.endAt)}`
                  : session.name;

                const isEventOncoming = event?.status === 'ONCOMING';
                const isEventCompleted = event?.status === 'COMPLETED';

                return (
                  <EventSessionItem
                    key={session.id}
                    time={timeStr}
                    date={session.startAt ? formatSessionDate(session.startAt) : '—'}
                    price={priceLabel}
                    status={itemStatus}
                    disabled={isEventOncoming || isEventCompleted}
                    actionLabel={
                      isEventCompleted
                        ? 'Đã kết thúc'
                        : isEventOncoming
                          ? 'Chưa mở bán'
                          : 'Mua vé ngay'
                    }
                    onActionClick={isEventCompleted ? undefined : handleJoinRoom}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Có thể bạn quan tâm */}
        <div>
          <h2 className="text-xl font-bold mb-8 text-center text-white">Có thể bạn quan tâm</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.map((e) => {
              const types = relatedSeatTypes[e.id] || [];
              return (
                <div
                  key={e.id}
                  onClick={() => navigate(`/event/${e.id}`)}
                  className="cursor-pointer"
                >
                  <EventItem
                    title={e.title}
                    price={formatMinPrice(types)}
                    date={formatDateTime(e.startTime)}
                    status={
                      e.status === 'ONCOMING'
                        ? 'Sắp diễn ra'
                        : e.status === 'ONGOING'
                          ? 'Đang diễn ra'
                          : 'Đã kết thúc'
                    }
                    statusColor={
                      e.status === 'ONCOMING'
                        ? 'text-[#ffe600]'
                        : e.status === 'ONGOING'
                          ? 'text-[#00e5ff]'
                          : 'text-gray-400'
                    }
                    imageUrl={e.bannerUrl || `https://picsum.photos/seed/${e.id}/600/400`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/events')}
              className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Xem thêm
            </button>
          </div>
        </div>

      </div>

      {/* Thông báo xác nhận chuyển sự kiện */}
      <NotifyForm
        isOpen={isSwitchConfirmOpen}
        onClose={() => setSwitchConfirmOpen(false)}
        title="Nhắc nhở"
        onConfirm={confirmSwitchRoom}
        confirmText="Tiếp tục"
      >
        <p className="font-normal">
          Bạn đang tham gia hàng chờ của một sự kiện khác. Bạn có chắc chắn muốn hủy hàng đợi hiện tại để tham gia sự kiện này không?
        </p>
      </NotifyForm>

      {/* Thông báo khi tài khoản bị Block */}
      <NotifyForm
        isOpen={!!blockMessage}
        onClose={() => {
          setBlockMessage(null);
          setUnblockTime(null);
        }}
        title="Tài khoản bị hạn chế"
        confirmText="Đã hiểu"
      >
        <div className="font-normal space-y-3">
          <p className="text-white/90">
            {blockMessage}
          </p>

          {unblockTime && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">Thời gian tự động mở khóa:</p>
              <p className="text-red-500 font-bold text-lg">{unblockTime}</p>
            </div>
          )}
        </div>
      </NotifyForm>

    </div>
  );
};

export default EventDetail;