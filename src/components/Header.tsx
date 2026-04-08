import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, ChevronRight } from 'lucide-react';
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
  onMobileMenuOpen,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVillaMenu, setShowVillaMenu] = useState(false);

  const selectedVillaData = villas.find((v) => v.id === selectedVilla);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 gap-1">
        <span className="text-gray-400">VillaPro</span>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">{pageTitles[activePage]}</span>
      </div>

      <div className="flex-1" />

      {/* Villa selector */}
      <div className="relative">
        <button
          onClick={() => {
            setShowVillaMenu(!showVillaMenu);
            setShowUserMenu(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span className="max-w-[140px] truncate">{selectedVillaData?.name ?? 'Pilih Villa'}</span>
          <ChevronDown size={14} />
        </button>

        {showVillaMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            {villas.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  onSelectVilla(v.id);
                  setShowVillaMenu(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer transition-colors ${
                  v.id === selectedVilla ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowVillaMenu(false);
          }}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {user.name}
          </span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setShowUserMenu(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-lg cursor-pointer transition-colors"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
