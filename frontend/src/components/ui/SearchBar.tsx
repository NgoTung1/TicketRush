import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Flame, Loader2 } from 'lucide-react';
import { eventApi, EventResponse } from '@/api/eventApi';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  id?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Tìm kiếm sự kiện...',
  value,
  onChange,
  onSubmit,
  className = '',
  inputClassName = '',
  id,
}) => {
  const [internal, setInternal] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hotEvents, setHotEvents] = useState<EventResponse[]>([]);
  const [recentFiltered, setRecentFiltered] = useState<string[]>([]);

  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const query = value !== undefined ? value : internal;

  const setQuery = (v: string) => {
    if (onChange) onChange(v);
    else setInternal(v);
  };

  const getRecentSearches = (): string[] => {
    const data = localStorage.getItem('tr_recent_searches');
    return data ? JSON.parse(data) : [];
  };

  const saveRecentSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    let searches = getRecentSearches();
    searches = searches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    searches.unshift(trimmed);
    localStorage.setItem('tr_recent_searches', JSON.stringify(searches.slice(0, 10)));
  };

  useEffect(() => {
    const recent = getRecentSearches();
    if (query.trim()) {
      const filtered = recent
        .filter((s) => s.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 2);
      setRecentFiltered(filtered);
    } else {
      setRecentFiltered(recent.slice(0, 2));
    }

    setIsFetching(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await eventApi.getHotSuggestions(query.trim());
        setHotEvents(Array.isArray(res) ? res : (res as any)?.data ?? []);
      } catch (err) {
        console.error('Lỗi lấy gợi ý sự kiện:', err);
        setHotEvents([]);
      } finally {
        setIsFetching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setIsDropdownOpen(false);
      if (onSubmit) onSubmit(query.trim());
    }
  };

  const handleItemClick = (keyword: string) => {
    setQuery(keyword);
    saveRecentSearch(keyword);
    setIsDropdownOpen(false);
    if (onSubmit) onSubmit(keyword);
  };

  // Biến kiểm tra xem có content gợi ý nào không (để quyết định hiển thị đường gạch ngang)
  const hasAnySuggestions = recentFiltered.length > 0 || hotEvents.length > 0 || isFetching;

  return (
    <div ref={dropdownRef} className="relative">
      <form
        id={id}
        onSubmit={handleSubmit}
        className={`flex items-center bg-[#1C1C1C] rounded-[8px] overflow-hidden border border-[#7B7B7B] transition-all duration-200 ${className}`}
      >
        <span className="pl-3 text-tr-text-muted shrink-0">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          className={`w-full bg-transparent text-[14px] text-white placeholder-[#5A5A5A] px-3 py-1 outline-none ${inputClassName}`}
        />
      </form>

      {/* POPUP DROPDOWN */}
      {isDropdownOpen && (hasAnySuggestions || query.trim().length > 0) && (
        <div
          className="absolute top-[24px] sm:top-[calc(100%+6px)] -right-20 sm:right-0 min-w-full w-[350px] sm:w-[450px] max-w-[95vw] bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl z-[99] overflow-hidden py-2 text-sm text-white animate-[fadeIn_0.1s_ease-out]"
        >
          {/* VÙNG 1: Tìm kiếm gần đây */}
          {recentFiltered.length > 0 && (
            <div className="mb-1">
              <div className="px-3 py-1 text-xs text-[#5A5A5A] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> TÌM KIẾM GẦN ĐÂY
                </span>
              </div>
              {recentFiltered.map((text, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleItemClick(text)}
                  className="w-full shadow-none bg-transparent text-left px-4 py-2 hover:bg-[#2A2A2A] transition-colors duration-150 truncate flex items-center text-white"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Đường gạch ngang phân chia */}
          {recentFiltered.length > 0 && (hotEvents.length > 0 || isFetching) && (
            <div className="border-t border-[#2A2A2A] my-1" />
          )}

          {/* VÙNG 2: Tên Events Hot */}
          {(hotEvents.length > 0 || isFetching) && (
            <div>
              <div className="px-3 py-1 text-xs text-tr-accent font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame size={12} className="text-red-500" /> SỰ KIỆN NỔI BẬT
                </span>
                {isFetching && <Loader2 size={12} className="animate-spin text-tr-accent" />}
              </div>
              {hotEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleItemClick(event.title)}
                  className="w-full shadow-none bg-transparent text-left px-4 py-2 hover:bg-[#2A2A2A] transition-colors duration-150 flex flex-col justify-start text-white"
                >
                  <span className="font-medium truncate w-full">{event.title}</span>
                  {event.organizer && (
                    <span className="text-xs text-[#7B7B7B] truncate w-full">
                      Ban tổ chức: {event.organizer}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* VÙNG 3: Nút tìm kiếm chuỗi hiện tại (Bấm vào đây giống hệt như bấm Enter) */}
          {query.trim().length > 0 && (
            <>
              {/* Chỉ kẻ vạch trên nếu bên trên nó đã có list lịch sử hoặc sự kiện hot */}
              {hasAnySuggestions && <div className="border-t border-[#2A2A2A] mt-1 mb-1" />}

              <button
                type="button"
                onClick={() => handleItemClick(query.trim())}
                className="w-full shadow-none bg-transparent text-left px-4 py-2.5 hover:bg-[#2A2A2A] transition-colors duration-150 flex items-center gap-3 text-white"
              >
                <div className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0">
                  <Search size={12} className="text-[#7B7B7B]" />
                </div>
                <span className="truncate">
                  Tìm kiếm <span className="font-semibold text-white">"{query}"</span>
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;