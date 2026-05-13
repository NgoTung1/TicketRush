import React, { useState } from 'react';
import EventItem from '../../components/event/EventItem';
import OngoingFilter from "@/assets/images/OngoingFilter.svg"
import Filter from "@/assets/images/Filter.svg"
import DateFilter from "@/assets/images/Date.svg"
import SearchIcon from "@/assets/images/SearchIcon.svg"

const EventList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(3);
  const searchText = "Ngày mưa";

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
          <button className="flex items-center gap-2 px-3 py-1.5 font-bold bg-[#414141] hover:bg-[#333] text-[13px] text-white rounded-md transition-colors border border-white/10">
            <img src={Filter}></img>
            Tất cả
            <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-1.5 font-bold bg-[#414141] hover:bg-[#333] text-[13px] text-white rounded-md transition-colors border border-white/10">
            <img src={OngoingFilter}></img>
            Đang diễn ra
            <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 font-bold bg-[#414141] hover:bg-[#333] text-[13px] text-white rounded-md transition-colors border border-white/10">
            <img src={DateFilter}></img>
            Tất cả các ngày
            <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        <button className="flex items-center justify-center gap-2 px-3 py-1.5 min-w-8 min-h-8 bg-[#696969] hover:bg-[#333] text-white rounded-md transition-all duration-300 border border-white/10 whitespace-nowrap">
          {/* Đặt kích thước cố định cho icon để nó không bị méo */}
          <img src={SearchIcon} alt="search" className="w-4 h-4 object-contain" />
          
          {/* Chỉ hiển thị thẻ span này nếu có nội dung searchText */}
          {searchText && (
            <span className="font-bold text-sm">{searchText}</span>
          )}
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
