import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  DollarSign,
  Building2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { User } from '../types';

type PageName = 'dashboard' | 'availability' | 'bookings' | 'keuangan' | 'villa' | 'laporan' | 'pengaturan';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activePage: PageName;
  onNavigate: (page: PageName) => void;
  user: User;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface MenuItem {
  id: PageName;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  ownerVisible: boolean; // apakah menu ini tampil untuk Owner
}

const menuItems: MenuItem[] = [
  { id: 'dashboard',    label: 'Dashboard',   icon: LayoutDashboard, ownerVisible: true  },
  { id: 'availability', label: 'Availability', icon: CalendarDays,    ownerVisible: true  },
  { id: 'bookings',     label: 'Bookings',    icon: BookOpen,        ownerVisible: true  },
  { id: 'keuangan',     label: 'Keuangan',    icon: DollarSign,      ownerVisible: true  },
  { id: 'villa',        label: 'Villa & Unit', icon: Building2,      ownerVisible: false },
  { id: 'laporan',      label: 'Laporan',     icon: BarChart3,       ownerVisible: true  },
  { id: 'pengaturan',   label: 'Pengaturan',  icon: Settings,        ownerVisible: false },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  activePage,
  onNavigate,
  user,
  isMobileOpen,
  onMobileClose,
}) => {
  const width = collapsed ? 'w-16' : 'w-60';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-[#1E293B] transition-all duration-200 ease-in-out
          ${width}
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-slate-700 flex-shrink-0">
          <Building2 size={22} className="text-primary-500 flex-shrink-0" />
          {!collapsed && (
            <span className="ml-2.5 text-white font-bold text-lg tracking-tight whitespace-nowrap">
              VillaPro
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.filter((item) => user.role === 'OPERATOR' || item.ownerVisible).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onMobileClose();
                }}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center rounded-lg mb-1
                  transition-colors duration-150 cursor-pointer
                  ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-2.5 overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-slate-400 text-xs">{user.role === 'OPERATOR' ? 'Operator' : 'Owner'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-10 border-t border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors duration-150 flex-shrink-0 cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
export type { PageName };
