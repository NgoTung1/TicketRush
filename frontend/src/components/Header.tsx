import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tất Cả', path: '/' },
  { label: 'Âm nhạc', path: '/am-nhac' },
  { label: 'Nghệ thuật', path: '/nghe-thuat' },
  { label: 'Hội thảo', path: '/hoi-thao' },
];

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Close sidebar and search on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  // Close sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Lock body scroll when sidebar open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (value: string) => {
    console.log('Search:', value);
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      <header
        id="main-header"
        className="sticky top-0 left-0 right-0 z-[60] bg-[#141414]"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          {/* ── Mobile: Hamburger  */}
          <button
            ref={menuBtnRef}
            id="mobile-menu-btn"
            className="lg:hidden mr-3 p-1.5 rounded-md text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors duration-200"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileSearchOpen(false);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* ── Logo */}
          <Link
            to="/"
            id="logo"
            className="flex items-center shrink-0 mr-6 lg:mr-10 group"
          >
            <span className="text-xl sm:text-2xl font-black font-paytone tracking-tight">
              <span className="text-tr-accent group-hover:text-tr-accent-hover transition-colors duration-200">
                TICKET
              </span>
              <span className="text-[#FFFFFF]">RUSH</span>
            </span>
          </Link>

          {/* ── Desktop Navigation */}
          <nav
            id="desktop-nav"
            className="hidden lg:flex items-center gap-1 mr-auto"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-1.5 rounded-md text-[16px] font-bold text-[#FFFFFF] hover:bg-[#2A2A2A] transition-all duration-200 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── Search Bar (Bình thường ở Desktop) */}
          <SearchBar
            id="header-search"
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            className="hidden sm:flex ml-auto lg:ml-0 lg:mr-4"
            placeholder="Tìm kiếm"
          />

          {/* ── Mobile Search Button */}
          <button
            id="mobile-search-btn"
            className="sm:hidden ml-auto mr-2 p-2 rounded-xl text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors duration-200 border border-solid border-[#7B7B7B]"
            aria-label="Toggle search"
            onClick={() => {
              setIsMobileSearchOpen(!isMobileSearchOpen);
              setIsMobileMenuOpen(false);
            }}
          >
            {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* ── Auth Buttons (Desktop)  */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              as="link"
              to="/dang-nhap"
              id="login-btn"
              variant="ghost"
              className="text-[16px] rounded-full"
            >
              Đăng nhập
            </Button>
            <Button
              as="link"
              to="/dang-ky"
              id="register-btn"
              variant="primary"
              className="text-[16px] rounded-full"
            >
              Đăng ký
            </Button>
          </div>
        </div>

        {/* ── Thanh Tìm Kiếm Dài (Chỉ hiện khi bấm kính lúp ở Mobile) ── */}
        {isMobileSearchOpen && (
          <div
            className="absolute top-[var(--header-height)] left-0 w-full p-3 bg-[#141414] sm:hidden pointer-events-auto shadow-lg"
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Tìm kiếm..."
            />
          </div>
        )}
      </header>

      {/* ── Mobile Overlay*/}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 lg:hidden
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
      />

      {/* ── Mobile Sidebar — NẰM BÊN DƯỚI HEADER */}
      <aside
        ref={sidebarRef}
        id="mobile-sidebar"
        className={`
          fixed left-0 z-50 bg-[#1C1C1C] border-r border-tr-border
          transform transition-transform duration-300 ease-in-out flex flex-col
          lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          top: 'var(--header-height)',
          height: 'calc(100vh - var(--header-height))',
          width: 'var(--sidebar-width)'
        }}
        aria-label="Mobile navigation"
      >
        {/* Nav Items (Mobile) */}
        <nav className="px-2 py-3 flex-1 overflow-y-auto" aria-label="Mobile navigation links">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[16px] font-bold text-[#FFFFFF] hover:bg-[#2A2A2A] transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer – Auth on mobile */}
        <div className="px-4 py-4 border-t border-tr-border rounded-2xl sm:hidden flex flex-col gap-2 bg-[#1C1C1C]">
          <Button
            as="link"
            to="/dang-nhap"
            variant="outline"
            className="w-full rounded-xl"
          >
            <User size={16} />
            Đăng nhập
          </Button>
          <Button
            as="link"
            to="/dang-ky"
            variant="primary"
            className="w-full rounded-xl"
          >
            Đăng ký
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Header;