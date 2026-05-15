import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '@/components/AdminHeader';

const AdminLayout: React.FC = () => {
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
