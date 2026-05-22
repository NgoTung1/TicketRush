import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { authApi } from '@/api/authApi';
import { setAccessToken } from '@/lib/axios';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Quản lý sự kiện', path: '/admin/event-list' },
  { label: 'Quản lý danh mục', path: '/admin/categories' },
];

const AdminHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, clearUser } = useAuthStore();

  // Đóng menu khi đổi route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Đóng sidebar khi click ra ngoài
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

  // Lock body scroll
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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) { }
    setAccessToken(null);
    clearUser();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

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
    const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'A';
    return (
      <span className="text-xs font-bold text-white">{initial}</span>
    );
  };

  return (
    <>
      <header
        className="z-[60] bg-[#141414] sticky top-0"
        style={{ height: 'var(--header-height, 64px)' }}
      >
        <div className="h-full w-full px-10 mx-auto flex items-center">
          {/* Mobile: Hamburger */}
          <button
            ref={menuBtnRef}
            className="lg:hidden mr-3 p-1.5 rounded-md text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link
            to="/admin/event-list"
            className="flex items-center shrink-0 mr-12 group"
          >
            <span className="text-2xl font-black font-paytone tracking-tight">
              <span className="text-[#FFFFFF]">TICKET</span>
              <span className="text-[#00a3ff]">RUSH</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 mr-auto">
            {NAV_ITEMS.map((item) => {
              // Active path nếu đang đứng đúng route
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-1.5 rounded-full text-[16px] font-bold text-[#FFFFFF] hover:bg-[#2A2A2A] transition-all duration-200 whitespace-nowrap'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Avatar + Dropdown */}
          <div ref={profileMenuRef} className="relative ml-auto shrink-0">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#2A2A2A] border-2 border-transparent hover:border-[#00a3ff] flex items-center justify-center overflow-hidden transition-all duration-200"
            >
              {getAvatarContent()}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl shadow-black/50 py-2 z-[70] animate-[fadeIn_0.15s_ease-out]">
                <div className="px-4 py-3 border-b border-[#2A2A2A]">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.fullName || 'Quản trị viên'}
                  </p>
                  <p className="text-xs text-[#868686] truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors duration-200"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User size={16} className="text-[#868686]" />
                    Trang cá nhân
                  </Link>
                </div>
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
      </header>

      {/* Mobile Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 lg:hidden
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Mobile Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed left-0 z-50 bg-[#1C1C1C] border-r border-[#2A2A2A]
          transform transition-transform duration-300 ease-in-out flex flex-col
          lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          top: 'var(--header-height, 64px)',
          height: 'calc(100vh - var(--header-height, 64px))',
          width: '280px'
        }}
      >
        <nav className="px-2 py-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[16px] font-bold transition-all duration-200 ${isActive ? 'bg-[#2A2A2A] text-white' : 'text-[#868686] hover:bg-[#2A2A2A] hover:text-white'
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-4 flex flex-col gap-3 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center overflow-hidden shrink-0">
              {getAvatarContent()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
              <p className="text-xs text-[#868686] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#2A2A2A] text-red-400 text-sm font-medium hover:bg-[#2A2A2A] transition-colors duration-200"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminHeader;
