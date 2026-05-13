import React from 'react';
import EventItem from '../../components/event/EventItem';
import EventSessionItem from '../../components/event/EventSessionItem';
import DateFilter from "@/assets/images/Date.svg"
import LocationFilter from "@/assets/images/LocationIcon.svg"

const EventDetail: React.FC = () => {
  const relatedEvents = [
    {
      title: "HBAshow: Hoàng Hôn Rực Rỡ - Hoàng Hải & Bạch Công Khanh",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/hba2/600/400",
    },
    {
      title: "GAI HOME CONCERT",
      price: "1.200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/gai2/600/400",
    },
    {
      title: "Show nhạc nước đặc biệt chào mừng Đại Lễ 30/04 & 01/05",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/water3/600/400",
    },
    {
      title: "[GARDEN ART] - ART WORKSHOP VẼ TRANH MÀU NƯỚC 'HOA TRONG VƯỜ...",
      price: "0đ",
      date: "23:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/art3/600/400",
    },
    {
      title: "HBAshow: Hoàng Hôn Rực Rỡ - Hoàng Hải & Bạch Công Khanh",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/hba4/600/400",
    },
    {
      title: "GAI HOME CONCERT",
      price: "1.200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/gai4/600/400",
    },
    {
      title: "Show nhạc nước đặc biệt chào mừng Đại Lễ 30/04 & 01/05",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/water4/600/400",
    },
    {
      title: "[GARDEN ART] - ART WORKSHOP VẼ TRANH MÀU NƯỚC 'HOA TRONG VƯỜ...",
      price: "0đ",
      date: "23:30 - 30/04/2026",
      status: "Đã kết thúc",
      statusColor: "text-gray-500",
      imageUrl: "https://picsum.photos/seed/art4/600/400",
    }
  ];

  return (
    <div className="bg-[#141414] min-h-screen text-white pt-20 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-8 lg:mb-12">
          {/* Left: Poster */}
          <div className="w-full lg:w-[55%] shrink-0">
            <img 
              src="https://picsum.photos/seed/sparknite_detail/1000/600" 
              alt="Spark Nite" 
              className="w-full h-auto object-cover rounded-2xl shadow-xl border border-white/10" 
            />
          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-[45%] flex flex-col justify-start lg:justify-center">
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white mb-4 lg:mb-6 leading-tight">
              SPARK NITE: S.T SƠN THẠCH x NEKO LÊ
            </h1>
            <p className="text-white text-sm sm:text-[22px] leading-snug">
              Đêm hội ngộ bùng nổ của S.T Sơn Thạch x Neko Lê! Sẵn sàng cho một đêm không ngủ cùng "Cỗ máy nhảy" S.T Sơn Thạch và "Phù thủy rapper" Neko Lê. Bữa tiệc âm nhạc kết hợp Talkshow hứa hẹn mang đến những sân khấu live band đỉnh cao, những màn tung hứng hài hước và vô số "hint" hậu trường chưa từng được tiết lộ. Số lượng vé cực kỳ giới hạn, nhanh tay săn ngay vị trí đẹp nhất trên TicketRush!
            </p>
          </div>
        </div>

        {/* Organizer & Location */}
        <div className="mb-12">
          <h3 className="text-[24px] font-bold mb-4 italic text-white">Ban tổ chức: S.T SƠN THẠCH x NEKO LÊ</h3>
          <div className="flex items-center gap-3 text-[16px] mb-3 text-white">
            <img src={DateFilter}></img>
            <span className="font-bold italic">20:30 - 25/04/2026</span>
            <span className="px-3 py-0.5 bg-white text-[#00a3ff] text-[10px] font-bold italic rounded-full uppercase ml-2 tracking-wide">Sắp diễn ra</span>
          </div>
          <div className="flex items-center gap-3 text-[16px] text-white font-bold italic">
            <img src={LocationFilter}></img>
            <span>Lầu 1, Nhà hát Bến Thành Số 6 Mạc Đĩnh Chi, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh</span>
          </div>
        </div>

        {/* Lịch diễn */}
        <div className="mb-16">
          <h2 className="text-[24px] font-bold italic mb-6 text-white">Lịch diễn</h2>
          <div className="space-y-3">
            <EventSessionItem time="20:00 - 21:30, T5" date="26/03/2026" price="400.000đ" status="sold_out" />
            <EventSessionItem time="20:00 - 21:30, T5" date="26/03/2026" price="400.000đ" status="sold_out" />
            <EventSessionItem time="20:00 - 21:30, T5" date="26/03/2026" price="400.000đ" status="available" />
          </div>
        </div>

        {/* Có thể bạn quan tâm */}
        <div>
          <h2 className="text-xl font-bold mb-8 text-center text-white">Có thể bạn quan tâm</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.map((event, index) => (
              <EventItem key={index} {...event} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <button className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4">Xem thêm</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetail;
