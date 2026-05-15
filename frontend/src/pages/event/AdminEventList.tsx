import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EventItem from '../../components/event/EventItem';
import { eventApi, EventResponse, EventStatus } from '../../api/eventApi';
import { categoryApi, CategoryResponse } from '../../api/categoryApi';
import OngoingFilter from '@/assets/images/OngoingFilter.svg';
import Filter from '@/assets/images/Filter.svg';
import DateFilter from '@/assets/images/Date.svg';
import SearchIcon from '@/assets/images/SearchIcon.svg';

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

function toEventItemProps(event: EventResponse) {
  return {
    id: event.id,
    title: event.title,
    price: 'Xem chi tiết',
    date: formatDateTime(event.startTime),
    status:
      event.status === 'ONCOMING'
        ? 'Sắp diễn ra'
        : event.status === 'ONGOING'
        ? 'Đang diễn ra'
        : 'Đã kết thúc',
    statusColor:
      event.status === 'ONCOMING'
        ? 'text-[#ffe600]'
        : event.status === 'ONGOING'
        ? 'text-[#00e5ff]'
        : 'text-gray-400',
    imageUrl: event.bannerUrl || `https://picsum.photos/seed/${event.id}/600/400`,
  };
}

const extractEventsData = (res: any): EventResponse[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res.content && Array.isArray(res.content)) return res.content;
  return [];
};

const extractTotalPages = (res: any, events: EventResponse[], pageSize: number): number => {
  if (res?.data?.totalPages) return res.data.totalPages;
  if (res?.totalPages) return res.totalPages;
  return events.length < pageSize ? 1 : -1;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

type StatusFilter = 'ALL' | EventStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ONCOMING', label: 'Sắp diễn ra' },
  { value: 'ONGOING', label: 'Đang diễn ra' },
  { value: 'COMPLETED', label: 'Đã kết thúc' },
];

// ─── Dropdown component ───────────────────────────────────────────────────────

interface DropdownProps {
  icon: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

const FilterDropdown: React.FC<DropdownProps> = ({ icon, label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeLabel = options.find((o) => o.value === value)?.label ?? label;
  const isActive = value !== '' && value !== 'ALL';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-3 py-1.5 font-bold text-[13px] rounded-md transition-colors border ${
          isActive
            ? 'bg-[#00a3ff]/20 border-[#00a3ff]/60 text-[#00a3ff]'
            : 'bg-[#414141] hover:bg-[#333] text-white border-white/10'
        }`}
      >
        <img src={icon} alt="" className="w-4 h-4 object-contain" />
        <span>{activeLabel}</span>
        <svg
          className={`w-3 h-3 ml-1 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] bg-[#242424] border border-white/10 rounded-lg shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${
                opt.value === value
                  ? 'bg-[#00a3ff]/20 text-[#00a3ff]'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const EventList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL params
  const currentCategoryId = searchParams.get('category_id') || '';
  const currentStatus = (searchParams.get('status') as StatusFilter) || 'ALL';
  const currentDate = searchParams.get('date') || '';
  const currentKeyword = searchParams.get('keyword') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local states
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search input — realtime, debounced
  const [searchInput, setSearchInput] = useState(currentKeyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // ─── Load categories once ────────────────────────────────────────────────────
  useEffect(() => {
    categoryApi.getActiveCategories().then((res: any) => {
      const list: CategoryResponse[] = Array.isArray(res) ? res : res?.data ?? [];
      setCategories(list);
    });
  }, []);

  // ─── Fetch events ────────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: currentPage - 1,
        size: PAGE_SIZE,
      };
      if (currentStatus !== 'ALL') params.status = currentStatus;
      if (currentCategoryId) params.category_id = currentCategoryId;

      const res = await eventApi.getEvents(params);
      let extracted = extractEventsData(res);

      // Client-side keyword filter
      if (currentKeyword.trim()) {
        const kw = currentKeyword.toLowerCase();
        extracted = extracted.filter(
          (e) =>
            e.title.toLowerCase().includes(kw) ||
            (e.organizer && e.organizer.toLowerCase().includes(kw)) ||
            (e.address && e.address.toLowerCase().includes(kw))
        );
      }

      // Client-side date filter (yyyy-mm-dd)
      if (currentDate) {
        extracted = extracted.filter((e) => {
          const eventDate = new Date(e.startTime).toISOString().slice(0, 10);
          return eventDate === currentDate;
        });
      }

      setEvents(extracted);
      const tp = extractTotalPages(res, extracted, PAGE_SIZE);
      setTotalPages(tp > 0 ? tp : 1);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentStatus, currentCategoryId, currentKeyword, currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Sync search input khi URL keyword thay đổi từ ngoài
  useEffect(() => {
    setSearchInput(currentKeyword);
  }, [currentKeyword]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '' || v === 'ALL') next.delete(k);
      else next.set(k, v);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  // Search realtime: debounce 400ms
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ keyword: value.trim() || null });
    }, 400);
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page === 1) next.delete('page');
    else next.set('page', String(page));
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Category dropdown options ────────────────────────────────────────────────

  const categoryOptions = [
    { value: '', label: 'Tất cả' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  // ─── Pagination ───────────────────────────────────────────────────────────────

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#141414] min-h-screen text-white font-roboto pt-24 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">

          {/* Filter 1: Danh mục */}
          <FilterDropdown
            icon={Filter}
            label="Tất cả"
            options={categoryOptions}
            value={currentCategoryId}
            onChange={(v) => updateParams({ category_id: v || null })}
          />

          {/* Filter 2: Status */}
          <FilterDropdown
            icon={OngoingFilter}
            label="Đang diễn ra"
            options={STATUS_OPTIONS}
            value={currentStatus}
            onChange={(v) => updateParams({ status: v === 'ALL' ? null : v })}
          />

          {/* Filter 3: Ngày tháng */}
          <div className="relative">
            {/* Input ẩn — chỉ dùng để mở date picker qua ref */}
            <input
              ref={dateInputRef}
              type="date"
              className="sr-only"
              value={currentDate}
              onChange={(e) => updateParams({ date: e.target.value || null })}
            />
            <button
              onClick={() => dateInputRef.current?.showPicker()}
              className={`flex items-center gap-2 px-3 py-1.5 font-bold text-[13px] rounded-md border transition-colors ${
                currentDate
                  ? 'bg-[#00a3ff]/20 border-[#00a3ff]/60 text-[#00a3ff]'
                  : 'bg-[#414141] hover:bg-[#333] text-white border-white/10'
              }`}
            >
              <img src={DateFilter} alt="" className="w-4 h-4 object-contain" />
              <span className="whitespace-nowrap">
                {currentDate
                  ? new Date(currentDate + 'T00:00:00').toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'Tất cả các ngày'}
              </span>
              {currentDate && (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateParams({ date: null });
                  }}
                  className="ml-1 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </span>
              )}
            </button>
          </div>

          {/* Search: realtime (Đã xoá bỏ ml-auto để nút "Tạo sự kiện mới" được đẩy qua phải) */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <img
                src={SearchIcon}
                alt="search"
                className="absolute left-3 w-4 h-4 object-contain opacity-50 pointer-events-none"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm sự kiện..."
                className="pl-9 pr-8 py-1.5 bg-[#414141] border border-white/10 rounded-md text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[#00a3ff] transition-colors w-52"
              />
              {searchInput && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2 text-white/40 hover:text-white text-xs transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Button: Tạo sự kiện mới */}
          <button
            onClick={() => navigate('/admin/create-event')} // Cập nhật route của bạn ở đây
            className="ml-auto px-5 py-1.5 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-[13px] font-bold rounded-full transition-colors whitespace-nowrap"
          >
            Tạo sự kiện mới
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-6 py-2 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-sm font-bold rounded-full transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full rounded-xl overflow-hidden bg-[#1a1a1b] animate-pulse">
                <div className="w-full aspect-[16/10] bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="cursor-pointer"
              >
                <EventItem {...toEventItemProps(event)} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-white/50 text-base">Không tìm thấy sự kiện nào.</p>
            <button
              onClick={() =>
                setSearchParams(new URLSearchParams(), { replace: true })
              }
              className="px-6 py-2 bg-[#414141] hover:bg-[#333] text-white text-sm font-bold rounded-full border border-white/10 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 text-[13px] text-gray-400 font-medium">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              &lt;
            </button>

            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center tracking-[2px]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${
                    currentPage === p ? 'bg-white/20 text-white' : 'hover:text-white'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;