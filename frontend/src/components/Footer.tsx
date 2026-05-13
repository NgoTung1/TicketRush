import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="main-footer"
      className="bg-tr-header border-t border-tr-border"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Top Section ──────────────────────────────────── */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center group mb-4">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-tr-accent group-hover:text-tr-accent-hover transition-colors duration-200">
                  TICKET
                </span>
                <span className="text-tr-text">RUSH</span>
              </span>
            </Link>
            <p className="text-sm text-tr-text-secondary leading-relaxed max-w-xs">
              Nền tảng đặt vé sự kiện trực tuyến hàng đầu. Khám phá và đặt vé cho các sự kiện âm nhạc, nghệ thuật, hội thảo trên cả nước.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-tr-text uppercase tracking-wider mb-4">
              Danh mục
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Tất Cả', path: '/' },
                { label: 'Âm nhạc', path: '/am-nhac' },
                { label: 'Nghệ thuật', path: '/nghe-thuat' },
                { label: 'Hội thảo', path: '/hoi-thao' },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-tr-text-secondary hover:text-tr-accent transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-tr-text uppercase tracking-wider mb-4">
              Hỗ trợ
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Trung tâm hỗ trợ', path: '/ho-tro' },
                { label: 'Điều khoản sử dụng', path: '/dieu-khoan' },
                { label: 'Chính sách bảo mật', path: '/bao-mat' },
                { label: 'Liên hệ', path: '/lien-he' },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-tr-text-secondary hover:text-tr-accent transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-tr-text uppercase tracking-wider mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-2.5 text-sm text-tr-text-secondary">
              <li>Email: support@ticketrush.vn</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Địa chỉ: Hà Nội</li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Section ───────────────────────────────── */}
        <div className="border-t border-tr-border py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-tr-text-muted">
            © {currentYear} TicketRush. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/dieu-khoan"
              className="text-xs text-tr-text-muted hover:text-tr-text-secondary transition-colors duration-200"
            >
              Điều khoản
            </Link>
            <Link
              to="/bao-mat"
              className="text-xs text-tr-text-muted hover:text-tr-text-secondary transition-colors duration-200"
            >
              Bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
