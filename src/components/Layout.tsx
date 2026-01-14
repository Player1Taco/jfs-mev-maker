import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BackgroundEffects from './BackgroundEffects';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />
      <div className="flex relative z-10">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6 pt-24">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
