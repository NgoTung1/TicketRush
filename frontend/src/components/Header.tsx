import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Receipt, LogOut, User } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/AuthStore';
import { authApi } from '@/api/authApi';
import { setAccessToken } from '@/lib/axios';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Thể thao', path: '/events?category_id=357cbca4-6b37-4dee-80d1-9baec32cb4a7' },
  { label: 'Âm nhạc', path: '/events?category_id=f7d40e2c-ecbd-4051-a30e-84dab991d194' },
  { label: 'Nghệ thuật', path: '/events?category_id=56e9ba8e-3972-428b-8aa0-63a8a5d023ce' },
  { label: 'Hội nghị', path: '/events?category_id=8954b823-43c3-4d4c-bd2a-6125188dda25' },
];

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, clearUser } = useAuthStore();

  // Cart badge count (default: 0 = hidden)
  const cartItemCount = 0;

  // Close sidebar and search on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsProfileMenuOpen(false);
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
      // Close profile dropdown on click outside
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isProfileMenuOpen]);

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

  // Sync search input with URL parameter 'keyword'
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    setSearchQuery(keyword);
  }, [location.search]);

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    const params = new URLSearchParams(location.search);
    if (trimmed) {
      params.set('keyword', trimmed);
    } else {
      params.delete('keyword');
    }
    params.delete('page');

    if (location.pathname === '/events') {
      navigate(`/events?${params.toString()}`);
    } else {
      if (trimmed) {
        navigate(`/events?keyword=${encodeURIComponent(trimmed)}`);
      } else {
        navigate('/events');
      }
    }
    setIsMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout API errors
    }
    setAccessToken(null);
    clearUser();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  // Build avatar display: initials fallback or image
  const getAvatarContent = () => {
    if (user?.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    // Fallback: first letter of name
    const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';
    return (
      <span className="text-xs font-bold text-white">{initial}</span>
    );
  };

  return (
    <>
      <header
        id="main-header"
        className="bg-[#141414]"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="h-full max-w-[1440px] mx-auto px-2 flex items-center">
          {/* ── Mobile: Hamburger  */}
          <button
            ref={menuBtnRef}
            id="mobile-menu-btn"
            className="lg:hidden mr-3 p-1.5 rounded-md text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors duration-200"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileSearchOpen(false);
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
            <span className="text-2xl font-black font-paytone tracking-tight">
              <span className="text-tr-accent">
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
                className="relative px-4 py-1.5 rounded-full text-[16px] font-bold text-[#FFFFFF] hover:bg-[#2A2A2A] transition-all duration-200 whitespace-nowrap"
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
            className="hidden sm:flex ml-auto lg:ml-0 lg:mr-4 bg-[#1C1C1C] w-[272px]"
            inputClassName='text-[12px] py-1.5 px-1.5'
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
              setIsMobileMenuOpen(false);
            }}
          >
            {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* ── Authenticated: Cart + Avatar | Unauthenticated: Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 shrink-0">
              {/* Invoice */}
              <Link
                to="/invoices"
                id="cart-btn"
                className="relative p-2 rounded-lg text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors duration-200"
                aria-label="Hóa đơn"
              >
                <Receipt size={20} />
                {/* Red badge - only visible when cartItemCount > 0 */}
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Avatar + Dropdown */}
              <div ref={profileMenuRef} className="relative">
                <button
                  id="user-avatar-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-8 h-8 rounded-full bg-[#2A2A2A] border-2 border-transparent hover:border-tr-accent flex items-center justify-center overflow-hidden transition-all duration-200"
                  aria-label="Menu tài khoản"
                >
                  {getAvatarContent()}
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl shadow-black/50 py-2 z-[70] animate-[fadeIn_0.15s_ease-out]">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[#2A2A2A]">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.fullName || 'Người dùng'}
                      </p>
                      <p className="text-xs text-tr-text-muted truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User size={16} className="text-tr-text-muted" />
                        Trang cá nhân
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="">
                      <button
                        onClick={handleLogout}
                        className="w-full shadow-none flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 bg-transparent hover:bg-[#2A2A2A] transition-colors duration-200"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Auth Buttons (Desktop) - Only when NOT authenticated */
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
              <Button
                as="link"
                to="/auth?view=login"
                id="login-btn"
                variant="ghost"
                className="text-[14px] rounded-full"
              >
                Đăng nhập
              </Button>
              <Button
                as="link"
                to="/auth?view=register"
                id="register-btn"
                variant="primary"
                className="text-[14px] rounded-full"
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>

        {/* ── Thanh Tìm Kiếm Dài (Chỉ hiện khi bấm kính lúp ở Mobile) ── */}
        {isMobileSearchOpen && (
          <div
            className="absolute top-[var(--header-height)] left-0 w-full p-3 bg-[#141414] sm:hidden pointer-events-auto"
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Tìm kiếm"
              className="sm:flex bg-[#1C1C1C]"
              inputClassName='text-[12px] py-1.5 px-1.5'
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

        {/* Sidebar Footer – Auth on mobile (only when NOT authenticated) */}
        {isAuthenticated ? (
          <div className="px-4 py-4 sm:hidden flex flex-col gap-3 border-t border-[#2A2A2A]">
            {/* User info in sidebar */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center overflow-hidden shrink-0">
                {getAvatarContent()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-tr-text-muted truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-[12px] border border-[#2A2A2A] text-red-400 text-sm font-medium hover:bg-[#2A2A2A] transition-colors duration-200"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 sm:hidden flex flex-col gap-3">
            <Button
              as="link"
              to="/auth"
              variant="outline"
              className="w-full rounded-[12px] py-2"
            >
              Đăng nhập
            </Button>
            <Button
              as="link"
              to="/auth?view=register"
              variant="primary"
              className="w-full rounded-[12px] py-2"
            >
              Đăng ký
            </Button>
          </div>
        )}
      </aside >
    </>
  );
};

export default Header;