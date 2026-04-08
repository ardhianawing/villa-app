import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut, ChevronRight } from 'lucide-react';
import type { User, Villa } from '../types';
import type { PageName } from './Sidebar';

interface HeaderProps {
  user: User;
  activePage: PageName;
  villas: Villa[];
  selectedVilla: string;
  onSelectVilla: (villaId: string) => void;
  onLogout: () => void;
  onMobileMenuOpen: () => void;
}

const pageTitles: Record<PageName, string> = {
  dashboard: 'Dashboard',
  availability: 'Availability',
  bookings: 'Bookings',
  keuangan: 'Keuangan',
  villa: 'Villa & Unit',
  laporan: 'Laporan',
  pengaturan: 'Pengaturan',
};

const Header: React.FC<HeaderProps> = ({
  user,
  activePage,
  villas,
  selectedVilla,
  onSelectVilla,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVillaMenu, setShowVillaMenu] = useState(false);

  const selectedVillaData = villas.find((v) => v.id === selectedVilla);

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-30">

      {/* Page title — mobile */}
      <div className="flex items-center gap-1.5 lg:hidden">
        <span className="text-base font-semibold text-gray-800">{pageTitles[activePage]}</span>
      </div>

      {/* Breadcrumb — desktop only */}
      <div className="hidden lg:flex items-center text-sm text-gray-500 gap-1">
        <span className="text-gray-400">VillaPro</span>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">{pageTitles[activePage]}</span>
      </div>

      <div className="flex-1" />

      {/* Villa selector */}
      <div className="relative">
        <button
          onClick={() => { setShowVillaMenu(!showVillaMenu); setShowUserMenu(false); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer max-w-[140px] lg:max-w-[200px]"
        >
          <span className="truncate text-xs lg:text-sm">{selectedVillaData?.name ?? 'Pilih Villa'}</span>
          <ChevronDown size={12} className="flex-shrink-0" />
        </button>

        {showVillaMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowVillaMenu(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden">
              {villas.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { onSelectVilla(v.id); setShowVillaMenu(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${
                    v.id === selectedVilla ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User avatar */}
      <div className="relative">
        <button
          onClick={() => { setShowUserMenu(!showUserMenu); setShowVillaMenu(false); }}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <ChevronDown size={13} className="text-gray-500 hidden lg:block" />
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role === 'OPERATOR' ? 'Operator' : 'Owner'}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); onLogout(); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <LogOut size={15} />
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
