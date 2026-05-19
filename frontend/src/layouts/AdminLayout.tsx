import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '@/components/AdminHeader';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-inter">
      <AdminHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
