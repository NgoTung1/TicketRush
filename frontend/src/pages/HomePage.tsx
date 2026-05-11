import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Placeholder hero section */}
      <section className="py-16 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-tr-text mb-4">
          Khám phá sự kiện <span className="text-tr-accent">nổi bật</span>
        </h1>
        <p className="text-tr-text-secondary text-lg max-w-2xl mx-auto">
          Đặt vé nhanh chóng cho các sự kiện âm nhạc, nghệ thuật và hội thảo trên cả nước.
        </p>
      </section>

      {/* Placeholder grid for demo */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="
              group rounded-xl overflow-hidden
              bg-tr-surface border border-tr-border
              hover:border-tr-accent/30
              transition-all duration-300
              hover:shadow-lg hover:shadow-tr-accent/5
              hover:-translate-y-0.5
            "
          >
            {/* Image placeholder */}
            <div className="aspect-[16/10] bg-tr-hover relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-tr-accent/90 text-white">
                  Sự kiện
                </span>
              </div>
            </div>
            {/* Content */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-tr-text group-hover:text-tr-accent transition-colors duration-200 mb-1.5 line-clamp-2">
                Tên sự kiện mẫu {i + 1}
              </h3>
              <p className="text-xs text-tr-text-muted mb-2">
                📅 20/06/2026 &nbsp;·&nbsp; 📍 TP.HCM
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-tr-accent">
                  500.000đ
                </span>
                <button className="text-xs text-tr-text-secondary hover:text-tr-accent transition-colors duration-200">
                  Chi tiết →
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
