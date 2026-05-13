import React, { useState } from 'react';
import EventItem from '../../components/event/EventItem';

const EventList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(3);

  const baseEvents = [
    {
      title: "HBAshow: Hoàng Hôn Rực Rỡ - Hoàng Hải & Bạch Công Khanh",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      imageUrl: "https://picsum.photos/seed/hba/600/400",
    },
    {
      title: "GAI HOME CONCERT",
      price: "1.200.000đ",
      date: "20:30 - 30/04/2026",
      imageUrl: "https://picsum.photos/seed/gai/600/400",
    },
    {
      title: "Show nhạc nước đặc biệt chào mừng Đại Lễ 30/04 & 01/05",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      imageUrl: "https://picsum.photos/seed/water/600/400",
    },
    {
      title: "[GARDEN ART] - ART WORKSHOP VẼ TRANH MÀU NƯỚC 'HOA TRONG VƯỜ...",
      price: "0đ",
      date: "23:30 - 30/04/2026",
      imageUrl: "https://picsum.photos/seed/art/600/400",
    }
  ];

  const events = [
    ...baseEvents.map((e, i) => ({ ...e, status: "Sắp diễn ra", statusColor: "text-[#ffe600]", imageUrl: `https://picsum.photos/seed/row1_${i}/600/400` })),
    ...baseEvents.map((e, i) => ({ ...e, status: "Đang diễn ra", statusColor: "text-[#00e5ff]", imageUrl: `https://picsum.photos/seed/row2_${i}/600/400` })),
    ...baseEvents.map((e, i) => ({ ...e, status: "Đang diễn ra", statusColor: "text-[#00e5ff]", imageUrl: `https://picsum.photos/seed/row3_${i}/600/400` })),
    ...baseEvents.map((e, i) => ({ ...e, status: "Đã kết thúc", statusColor: "text-gray-500", imageUrl: `https://picsum.photos/seed/row4_${i}/600/400` })),
    ...baseEvents.map((e, i) => ({ ...e, status: "Đã kết thúc", statusColor: "text-gray-500", imageUrl: `https://picsum.photos/seed/row5_${i}/600/400` })),
  ];

  return (
    <div className="bg-[#141414] min-h-screen text-white font-roboto pt-24 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-[13px] text-white rounded-md transition-colors border border-white/10">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Tất cả
            <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-[13px] text-white rounded-md transition-colors border border-white/10">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Đang diễn ra
            <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-[13px] text-white rounded-md transition-colors border border-white/10">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Tất cả các ngày
            <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button className="flex items-center justify-center w-8 h-8 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-md transition-colors border border-white/10">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {events.map((event, index) => (
            <EventItem key={index} {...event} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-1.5 text-[13px] text-gray-400 font-medium">
          <button className="w-7 h-7 flex items-center justify-center hover:text-white transition-colors">&lt;</button>
          <button className="w-7 h-7 flex items-center justify-center hover:text-white transition-colors" onClick={() => setCurrentPage(1)}>1</button>
          <button className="w-7 h-7 flex items-center justify-center hover:text-white transition-colors" onClick={() => setCurrentPage(2)}>2</button>
          <button className={`w-7 h-7 flex items-center justify-center rounded-sm ${currentPage === 3 ? 'bg-white/20 text-white' : 'hover:text-white transition-colors'}`} onClick={() => setCurrentPage(3)}>3</button>
          <button className="w-7 h-7 flex items-center justify-center hover:text-white transition-colors" onClick={() => setCurrentPage(4)}>4</button>
          <button className="w-7 h-7 flex items-center justify-center hover:text-white transition-colors" onClick={() => setCurrentPage(5)}>5</button>
          <span className="w-7 h-7 flex items-center justify-center tracking-[2px]">...</span>
          <button className="w-7 h-7 flex items-center justify-center hover:text-white transition-colors">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default EventList;
