import React, { useState } from 'react';
import EventItem from '../../components/event/EventItem';

const HomePage: React.FC = () => {
  // Sample data to match the image perfectly
  const upcomingEvents = [
    {
      title: "HBAshow: Hoàng Hôn Rực Rỡ - Hoàng Hải & Bạch Công Khanh",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Sắp diễn ra",
      statusColor: "text-[#ffe600]", // Yellow
      imageUrl: "https://picsum.photos/seed/hba/600/400",
    },
    {
      title: "GAI HOME CONCERT",
      price: "1.200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Sắp diễn ra",
      statusColor: "text-[#ffe600]", // Yellow
      imageUrl: "https://picsum.photos/seed/gai/600/400",
    },
    {
      title: "Show nhạc nước đặc biệt chào mừng Đại Lễ 30/04 & 01/05",
      price: "200.000đ",
      date: "20:30 - 30/04/2026",
      status: "Sắp diễn ra",
      statusColor: "text-[#ffe600]", // Yellow
      imageUrl: "https://picsum.photos/seed/water/600/400",
    },
    {
      title: "[GARDEN ART] - ART WORKSHOP VẼ TRANH MÀU NƯỚC 'HOA TRONG VƯỜ...",
      price: "0đ",
      date: "23:30 - 30/04/2026",
      status: "Sắp diễn ra",
      statusColor: "text-[#ffe600]", // Yellow
      imageUrl: "https://picsum.photos/seed/art/600/400",
    }
  ];

  const ongoingEvents = [
    {
      title: "HBAshow: Hoàng Hôn Rực Rỡ - Hoàng Hải & Bạch Công Khanh",
      price: "200.000đ",
      date: "20:30 - 25/04/2026",
      status: "Đang diễn ra",
      statusColor: "text-[#00e5ff]", // Cyan
      imageUrl: "https://picsum.photos/seed/spark/600/400",
    },
    {
      title: "GAI HOME CONCERT",
      price: "1.200.000đ",
      date: "20:30 - 25/04/2026",
      status: "Đang diễn ra",
      statusColor: "text-[#00e5ff]", // Cyan
      imageUrl: "https://picsum.photos/seed/aog/600/400",
    },
    {
      title: "Show nhạc nước đặc biệt chào mừng Đại Lễ 30/04 & 01/05",
      price: "200.000đ",
      date: "20:30 - 25/04/2026",
      status: "Đang diễn ra",
      statusColor: "text-[#00e5ff]", // Cyan
      imageUrl: "https://picsum.photos/seed/water2/600/400",
    },
    {
      title: "[GARDEN ART] - ART WORKSHOP VẼ TRANH MÀU NƯỚC 'HOA TRONG VƯỜ...",
      price: "0đ",
      date: "23:30 - 25/04/2026",
      status: "Đang diễn ra",
      statusColor: "text-[#00e5ff]", // Cyan
      imageUrl: "https://picsum.photos/seed/art2/600/400",
    }
  ];

  const carouselItems = [
    {
      id: 1,
      thumbUrl: "https://picsum.photos/seed/thumb1/360/200",
      bgUrl: "https://picsum.photos/seed/hero/1920/1080",
    },
    {
      id: 2,
      thumbUrl: "https://picsum.photos/seed/thumb2/360/200",
      bgUrl: "https://picsum.photos/seed/hero2/1920/1080",
    },
    {
      id: 3,
      thumbUrl: "https://picsum.photos/seed/thumb3/360/200",
      bgUrl: "https://picsum.photos/seed/hero3/1920/1080",
    }
  ];

  const [activeSlide, setActiveSlide] = useState(carouselItems[0]);

  return (
    <div className="bg-[#141414] min-h-screen text-white font-roboto pb-16">
      {/* Hero Banner Section */}
      {/* Hero Banner Section */}
      {/* Thay đổi 1: Bỏ h-[550px] cố định, dùng h-auto trên mobile. Dùng flex-col */}
      <section className="relative w-full h-auto lg:h-[650px] flex flex-col overflow-hidden">
        
        {/* --- VÙNG 1: BANNERS & TEXT CONTENT --- */}
        {/* Div này bọc ảnh nền và chữ để tạo thành khối banner trên mobile */}
        <div className="relative w-full flex-grow flex flex-col justify-center min-h-[480px] lg:min-h-0">
            {/* Placeholder background image - Giữ nguyên logic */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
              style={{ backgroundImage: `url(${activeSlide.bgUrl})` }}
            />
            {/* Gradients - Giữ nguyên */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

            {/* Text Content - Giữ nguyên layout, thêm padding bottom cho mobile */}
            <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-16 lg:py-0">
              <div className="max-w-3xl mt-4 lg:mt-12">
                <h3 className="text-[20px] lg:text-xl font-bold font-italic text-white mb-2 italic">
                  S.T SƠN THẠCH x NEKO LÊ
                </h3>
                <h1 className="text-[32px] sm:text-[40px] lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                  SPARK NITE: S.T SƠN THẠCH x <br className="hidden sm:block" /> NEKO LÊ
                </h1>

                <div className="flex flex-col gap-3 mb-8 lg:mb-10">
                  <span className="inline-block px-4 py-1.5 bg-white text-[11px] font-bold font-italic text-[#00a3ff] rounded-full w-fit uppercase tracking-wider">
                    Đang diễn ra
                  </span>
                  <p className="text-[#00A6FF] font-bold italic text-[14px]">
                    Bắt đầu lúc 20:30 - 25/04/2026
                  </p>
                </div>

                <div className="flex gap-4">
                  <button className="px-6 py-2 sm:px-8 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-sm font-bold rounded-full transition-colors">
                    Mua vé ngay
                  </button>
                  <button className="px-6 py-2 sm:px-8 bg-white/40 hover:bg-white/30 text-white text-sm font-bold rounded-full backdrop-blur-md transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
        </div>


        {/* --- VÙNG 2: CAROUSEL THUMBNAILS --- */}
        {/* Thay đổi 3: Trên mobile dùng relative, tự chảy xuống dưới vùng banner. 
           Trên lg mới dùng absolute để đè lên banner như cũ */}
        <div className="relative z-20 w-full bg-[#141414] lg:bg-transparent py-6 lg:py-0 lg:absolute lg:left-auto lg:right-8 lg:bottom-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-0 lg:max-w-none flex items-center justify-center lg:justify-end gap-2 sm:gap-4">
            
            <button className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-sm text-xs sm:text-base">
              &lt;
            </button>
            
            {/* Chỉnh sửa nhẹ max-width cho list trên mobile để đẹp hơn */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
              {carouselItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveSlide(item)}
                  className={`shrink-0 w-[100px] h-[56px] sm:w-[130px] sm:h-[73px] lg:w-[180px] lg:h-[100px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    activeSlide.id === item.id
                      ? 'border-2 border-white shadow-lg opacity-100'
                      : 'border border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.thumbUrl} alt={`thumb${item.id}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            
            <button className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-sm text-xs sm:text-base">
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Lists */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-16">

        {/* Sắp diễn ra */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Sắp diễn ra</h2>
            <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Xem thêm
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event, index) => (
              <EventItem key={index} {...event} />
            ))}
          </div>
        </section>

        {/* Đang diễn ra */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Đang diễn ra</h2>
            <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Xem thêm
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ongoingEvents.map((event, index) => (
              <EventItem key={index} {...event} />
            ))}
          </div>
        </section>

        {/* Mới ra mắt */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Mới ra mắt</h2>
            <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Xem thêm
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ongoingEvents.map((event, index) => (
              <EventItem key={index} {...event} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
