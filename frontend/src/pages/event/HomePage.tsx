import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EventItem from '../../components/event/EventItem';
import { eventApi, EventResponse } from '../../api/eventApi';

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

// Helper: map EventResponse → EventItem props
function toEventItemProps(event: EventResponse, onClick: () => void) {
  return {
    title: event.title,
    price: 'Xem chi tiết', // Cần cập nhật nếu API trả về giá
    date: formatDateTime(event.startTime),
    status: event.status === 'ONCOMING' ? 'Đang chuẩn bị' : event.status === 'ONGOING' ? 'Đang mở bán' : 'Đã kết thúc',
    statusColor: event.status === 'ONCOMING' ? 'text-[#F7FF55]' : event.status === 'ONGOING' ? 'text-[#00D4FF]' : 'text-[#757575]',
    imageUrl: event.bannerUrl || 'https://picsum.photos/seed/default/600/400',
    onClick
  };
}

// Helper: Trích xuất mảng an toàn từ các chuẩn response khác nhau
const extractEventsData = (res: any): EventResponse[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res.content && Array.isArray(res.content)) return res.content;
  return [];
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<EventResponse[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<EventResponse[]>([]);
  const [newEvents, setNewEvents] = useState<EventResponse[]>([]);

  // State cho Banner
  const [bannerEvents, setBannerEvents] = useState<EventResponse[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventResponse | null>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Lấy dữ liệu theo đúng param Swagger (page mặc định = 0, size = 4)
        const [upcomingRes, ongoingRes, newRes] = await Promise.all([
          eventApi.getEvents({ status: 'ONCOMING', page: 0, size: 4 }),
          eventApi.getEvents({ status: 'ONGOING', page: 0, size: 4 }),
          eventApi.getEvents({ page: 0, size: 6 }), // Lấy 6 cái để có đủ data cho banner
        ]);

        const extractedUpcoming = extractEventsData(upcomingRes);
        const extractedOngoing = extractEventsData(ongoingRes);
        const extractedNew = extractEventsData(newRes);

        setUpcomingEvents(extractedUpcoming);
        setOngoingEvents(extractedOngoing);
        setNewEvents(extractedNew);

        // Lấy tối đa 6 sự kiện từ danh sách sự kiện mới (hoặc bạn có thể gộp mảng) để làm banner
        const banners = extractedNew.slice(0, 6);
        setBannerEvents(banners);
        if (banners.length > 0) {
          setActiveEvent(banners[0]); // Đặt slide đầu tiên làm active mặc định
        }

      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Không thể tải danh sách sự kiện.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (id: string) => {
    navigate(`/event/${id}`);
  };

  const advanceToNext = React.useCallback(() => {
    if (bannerEvents.length === 0) return;
    const currentIdx = bannerEvents.findIndex(e => e.id === activeEvent?.id);
    const newIndex = currentIdx === -1 ? 0 : (currentIdx + 1) % bannerEvents.length;

    setActiveEvent(bannerEvents[newIndex]);

    if (trackRef.current) {
      if (newIndex === 0) {
        trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const child = trackRef.current.children[0] as HTMLElement;
        if (child) {
          const gap = window.innerWidth >= 640 ? 12 : 8;
          trackRef.current.scrollBy({ left: (child.offsetWidth + gap), behavior: 'smooth' });
        }
      }
    }
  }, [activeEvent, bannerEvents]);

  useEffect(() => {
    if (bannerEvents.length === 0) return;

    const t2 = setTimeout(() => {
      advanceToNext();
    }, 8000);

    return () => {
      clearTimeout(t2);
    };
  }, [activeEvent, bannerEvents, advanceToNext]);

  const handlePrevBanner = () => {
    if (bannerEvents.length === 0) return;
    const currentIdx = bannerEvents.findIndex(e => e.id === activeEvent?.id);
    const newIndex = (currentIdx - 1 + bannerEvents.length) % bannerEvents.length;

    setActiveEvent(bannerEvents[newIndex]);

    if (trackRef.current) {
      if (newIndex === bannerEvents.length - 1) {
        trackRef.current.scrollTo({ left: trackRef.current.scrollWidth, behavior: 'smooth' });
      } else {
        const child = trackRef.current.children[0] as HTMLElement;
        if (child) {
          const gap = window.innerWidth >= 640 ? 12 : 8;
          trackRef.current.scrollBy({ left: -(child.offsetWidth + gap), behavior: 'smooth' });
        }
      }
    }
  };

  const handleNextBanner = () => {
    advanceToNext();
  };

  return (
    <div className="bg-[#141414] min-h-screen text-white font-roboto pb-16">
      {/* Hero Banner Section */}
      <section className="relative w-full h-auto lg:h-[650px] flex flex-col px-9 pt-5 overflow-hidden">

        {/* --- VÙNG 1: BANNERS & TEXT CONTENT --- */}
        <div className="relative w-full flex-grow flex flex-col justify-center min-h-[480px] lg:min-h-0">
          {activeEvent && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out rounded-xl"
              style={{ backgroundImage: `url(${activeEvent.bannerUrl || 'https://picsum.photos/seed/hero/1920/1080'})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

          <div className="relative z-10 px-20 w-full pt-20 pb-16 lg:py-0">
            {activeEvent ? (
              <div className="max-w-3xl mt-4 lg:mt-12">
                <h3 className="max-w-[600px] break-words text-[24px] font-bold font-italic text-white mb-2 italic uppercase leading-none">
                  {activeEvent.organizer || 'Sự kiện nổi bật'}
                </h3>
                <h1 className="max-w-[600px] break-words text-[54px] font-bold text-white leading-none mb-2 tracking-tight">
                  {activeEvent.title}
                </h1>

                <div className="flex flex-col gap-3 mb-8 lg:mb-10">
                  <span className={`inline-block px-5 py-1 bg-white text-[10px] font-bold italic rounded-full w-fit tracking-wider ${activeEvent.status === 'ONCOMING' ? 'text-[#4E4E4E]' : activeEvent.status === 'ONGOING' ? 'text-[#00a3ff]' : 'text-gray-500'
                    }`}>
                    {activeEvent.status === 'ONCOMING' ? 'Đang chuẩn bị' : activeEvent.status === 'ONGOING' ? 'Đang mở bán' : 'Đã kết thúc'}
                  </span>
                  <p className="text-[#00A6FF] font-bold italic text-[14px]">
                    Bắt đầu lúc {formatDateTime(activeEvent.startTime)}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleEventClick(activeEvent.id)}
                    className="px-14 py-2 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-sm font-bold rounded-full transition-colors"
                  >
                    Mua vé ngay
                  </button>
                  <button
                    onClick={() => handleEventClick(activeEvent.id)}
                    className="px-14 py-2 bg-white/40 hover:bg-white/30 text-white text-sm font-bold rounded-full backdrop-blur-md transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ) : (
              // Skeleton hoặc Loading State cho Banner nếu chưa có data
              <div className="max-w-3xl mt-4 lg:mt-12 animate-pulse">
                <div className="h-6 w-48 bg-white/20 rounded mb-4" />
                <div className="h-16 w-3/4 bg-white/20 rounded mb-6" />
                <div className="h-8 w-32 bg-white/20 rounded-full mb-8" />
                <div className="flex gap-4">
                  <div className="h-10 w-36 bg-white/20 rounded-full" />
                  <div className="h-10 w-36 bg-white/20 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- VÙNG 2: CAROUSEL THUMBNAILS --- */}
        {bannerEvents.length > 0 && (
          <div className="relative z-20 w-full bg-[#141414] xl:bg-transparent py-6 xl:py-0 xl:absolute xl:left-auto xl:right-14 xl:bottom-16">
            <div className="mx-auto px-4 xl:px-0 xl:max-w-none flex items-center justify-start xl:justify-end">

              <button
                onClick={handlePrevBanner}
                className="shrink-0 w-12 h-18 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all duration-200">
                <ChevronLeft size={36} strokeWidth={2.5} />
              </button>

              <div className="w-[414px] xl:w-[564px] overflow-hidden">
                <div
                  ref={trackRef}
                  className="flex gap-2 sm:gap-3 overflow-x-auto py-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {bannerEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setActiveEvent(event)}
                      className={`shrink-0 w-[130px] h-[73px] xl:w-[180px] xl:h-[100px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${activeEvent?.id === event.id
                        ? 'border-2 border-white shadow-lg opacity-100'
                        : 'border border-white/20 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={event.bannerUrl || 'https://picsum.photos/seed/thumb/360/200'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextBanner}
                className="shrink-0 w-12 h-18 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all duration-200">
                <ChevronRight size={36} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main Content Lists */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-16">

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-red-400 font-medium">{error}</div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-8">
            {[0, 1].map((s) => (
              <section key={s}>
                <div className="h-8 w-48 bg-white/10 rounded-lg mb-6 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-full rounded-xl overflow-hidden bg-[#1a1a1b] animate-pulse">
                      <div className="w-full aspect-[16/10] bg-white/10" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Actual Data */}
        {!loading && !error && (
          <>
            {/* Đang chuẩn bị */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-[24px] font-bold text-white">Đang chuẩn bị</h2>
                <button
                  onClick={() => navigate('/events?status=ONCOMING')}
                  className="text-[#B4B2B2] hover:text-white text-[20px] font-bold transition-colors"
                >
                  Xem thêm
                </button>
              </div>
              {!upcomingEvents || upcomingEvents.length === 0 ? (
                <p className="text-white/40 text-sm">Không có sự kiện đang chuẩn bị.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {upcomingEvents.slice(0, 4).map((event) => (
                    <EventItem key={event.id} {...toEventItemProps(event, () => handleEventClick(event.id))} />
                  ))}
                </div>
              )}
            </section>

            {/* Đang mở bán */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-bold text-white">Đang mở bán</h2>
                <button
                  onClick={() => navigate('/events?status=ONGOING')}
                  className="text-[#B4B2B2] hover:text-white text-[20px] font-bold transition-colors"
                >
                  Xem thêm
                </button>
              </div>
              {!ongoingEvents || ongoingEvents.length === 0 ? (
                <p className="text-white/40 text-sm">Không có sự kiện đang mở bán.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {ongoingEvents.slice(0, 4).map((event) => (
                    <EventItem key={event.id} {...toEventItemProps(event, () => handleEventClick(event.id))} />
                  ))}
                </div>
              )}
            </section>

            {/* Mới ra mắt */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-[24px] font-bold text-white">Mới ra mắt</h2>
                <button
                  onClick={() => navigate('/events')}
                  className="text-[#B4B2B2] hover:text-white text-[20px] font-bold transition-colors"
                >
                  Xem thêm
                </button>
              </div>
              {!newEvents || newEvents.length === 0 ? (
                <p className="text-white/40 text-sm">Chưa có sự kiện mới.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {newEvents.slice(0, 4).map((event) => (
                    <EventItem key={event.id} {...toEventItemProps(event, () => handleEventClick(event.id))} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

      </div>
    </div>
  );
};

export default HomePage;