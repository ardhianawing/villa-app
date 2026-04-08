import { LayoutDashboard, CalendarDays, BookOpen, DollarSign, Settings } from 'lucide-react';
import type { PageName } from './Sidebar';

interface BottomNavProps {
  activePage: PageName;
  onNavigate: (page: PageName) => void;
}

const navItems = [
  { id: 'dashboard' as PageName,     label: 'Home',        icon: LayoutDashboard },
  { id: 'availability' as PageName,  label: 'Availability', icon: CalendarDays },
  { id: 'bookings' as PageName,      label: 'Booking',     icon: BookOpen },
  { id: 'keuangan' as PageName,      label: 'Keuangan',    icon: DollarSign },
  { id: 'pengaturan' as PageName,    label: 'Lainnya',     icon: Settings },
];

export default function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-stretch h-16">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
      {/* Safe area untuk iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
