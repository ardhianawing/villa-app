import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import type { PageName } from './Sidebar';
import type { User, Villa } from '../types';

interface LayoutProps {
  user: User;
  activePage: PageName;
  onNavigate: (page: PageName) => void;
  villas: Villa[];
  selectedVilla: string;
  onSelectVilla: (villaId: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}


const Layout: React.FC<LayoutProps> = ({
  user,
  activePage,
  onNavigate,
  villas,
  selectedVilla,
  onSelectVilla,
  onLogout,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainMargin = collapsed ? 'lg:ml-16' : 'lg:ml-60';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar — desktop only */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className={`transition-all duration-200 ${mainMargin}`}>
        <Header
          user={user}
          activePage={activePage}
          villas={villas}
          selectedVilla={selectedVilla}
          onSelectVilla={onSelectVilla}
          onLogout={onLogout}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        {/* pb-20 = ruang untuk bottom nav di mobile */}
        <main className="p-4 pb-24 lg:p-6 lg:pb-6">{children}</main>
      </div>

      {/* Bottom navigation — mobile only */}
      <BottomNav activePage={activePage} onNavigate={onNavigate} userRole={user.role} />
    </div>
  );
};

export default Layout;
