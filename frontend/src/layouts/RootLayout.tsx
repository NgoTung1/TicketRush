import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RootLayout: React.FC = () => {
  return (
    <div
      id="root-layout"
      className="min-h-screen flex flex-col bg-tr-bg font-roboto"
    >
      {/* ── Header ──────────────────────────────────────── */}
      <Header />

      {/* ── Main Content ────────────────────────────────── */}
      <main
        id="main-content"
        className="flex-1 w-full"
        style={{ paddingTop: 'var(--header-height)' }}
      >
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default RootLayout;
