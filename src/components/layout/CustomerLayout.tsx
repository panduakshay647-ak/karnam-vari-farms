import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-stone-900 selection:bg-[#c58940] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
