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
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Close sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSearch = (value: string) => {
    // TODO: navigate to search results
    console.log('Search:', value);
  };

  return (
    <>
      {/* ── Header — transparent, inherits page background ── */}
      <header
        id="main-header"
        className="relative top-0 left-0 right-0 z-50"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          {/* ── Mobile: Hamburger ─────────────────────────── */}
          <button
            ref={menuBtnRef}
            id="mobile-menu-btn"
            className="lg:hidden mr-3 p-1.5 rounded-md text-tr-text-secondary hover:text-tr-text hover:bg-tr-hover transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* ── Logo ─────────────────────────────────────── */}
          <Link
            to="/"
            id="logo"
            className="flex items-center shrink-0 mr-6 lg:mr-10 group"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-tr-accent group-hover:text-tr-accent-hover transition-colors duration-200">
                TICKET
              </span>
              <span className="text-tr-text">RUSH</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ───────────────────────── */}
          <nav
            id="desktop-nav"
            className="hidden lg:flex items-center gap-1 mr-auto"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-4 py-1.5 rounded-md text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${isActive(item.path)
                    ? 'text-tr-accent bg-tr-accent/10'
                    : 'text-tr-text-secondary hover:text-tr-text hover:bg-tr-hover'
                  }
                `}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-tr-accent rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Search Bar (desktop / tablet) ────────────── */}
          <SearchBar
            id="header-search"
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            className="hidden sm:flex ml-auto lg:ml-0 lg:mr-4"
            placeholder="Tìm kiếm sự kiện..."
          />

          {/* ── Mobile Search Button ─────────────────────── */}
          <button
            id="mobile-search-btn"
            className="sm:hidden ml-auto mr-2 p-2 rounded-md text-tr-text-secondary hover:text-tr-text hover:bg-tr-hover transition-colors duration-200"
            aria-label="Open search"
          >
            <Search size={20} />
          </button>

          {/* ── Auth Buttons ─────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              as="link"
              to="/dang-nhap"
              id="login-btn"
              variant="ghost"
              className="hidden sm:inline-flex"
            >
              Đăng nhập
            </Button>
            <Button
              as="link"
              to="/dang-ky"
              id="register-btn"
              variant="primary"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile Overlay ────────────────────────────────── */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 lg:hidden
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
      />

      {/* ── Mobile Sidebar ────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        id="mobile-sidebar"
        className={`
          fixed top-0 left-0 z-50 h-full
          bg-tr-header border-r border-tr-border
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: 'var(--sidebar-width)' }}
        aria-label="Mobile navigation"
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between px-4 border-b border-tr-border"
          style={{ height: 'var(--header-height)' }}
        >
          <Link to="/" className="flex items-center group">
            <span className="text-xl font-black tracking-tight">
              <span className="text-tr-accent">TICKET</span>
              <span className="text-tr-text">RUSH</span>
            </span>
          </Link>
          <button
            className="p-1.5 rounded-md text-tr-text-secondary hover:text-tr-text hover:bg-tr-hover transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="px-4 py-3 border-b border-tr-border sm:hidden">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Tìm kiếm sự kiện..."
          />
        </div>

        {/* Nav Items */}
        <nav className="px-3 py-3" aria-label="Mobile navigation links">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? 'text-tr-accent bg-tr-accent/10'
                      : 'text-tr-text-secondary hover:text-tr-text hover:bg-tr-hover'
                    }
                  `}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer – Auth on mobile */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-tr-border sm:hidden">
          <Button
            as="link"
            to="/dang-nhap"
            variant="outline"
            className="w-full mb-2"
          >
            <User size={16} />
            Đăng nhập
          </Button>
          <Button
            as="link"
            to="/dang-ky"
            variant="primary"
            className="w-full"
          >
            Đăng ký
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Header;
