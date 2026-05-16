import React from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-background border-b border-gray-800">
      <div className="flex items-center space-x-12">
        <Link to="/" className="text-2xl font-bold tracking-tighter font-logo">
          <span className="text-white">TICKET</span>
          <span className="text-ticket-blue">RUSH</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
          <Link to="/sports" className="hover:text-white transition-colors">Thể thao</Link>
          <Link to="/music" className="hover:text-white transition-colors">Âm nhạc</Link>
          <Link to="/arts" className="hover:text-white transition-colors">Nghệ thuật</Link>
          <Link to="/seminars" className="hover:text-white transition-colors">Hội thảo</Link>
        </nav>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="bg-panel text-sm text-gray-200 rounded pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-ticket-blue focus:ring-1 focus:ring-ticket-blue w-72"
          />
        </div>
        <button className="text-gray-300 hover:text-white transition-colors relative">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">2</span>
        </button>
        <button className="h-8 w-8 rounded-full bg-gray-600 overflow-hidden border border-gray-500 focus:outline-none">
          {/* Mock User Avatar */}
          <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="h-full w-full object-cover" />
        </button>
      </div>
    </header>
  );
};

export default Header;
