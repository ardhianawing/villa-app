import { useState } from 'react';
import {
  LogIn, LogOut, Home, TrendingUp, MapPin,
} from 'lucide-react';
import type { Booking, Unit, Villa } from '../types';
import UnitCard from '../components/UnitCard';
import UnitCalendarModal from '../components/UnitCalendarModal';

interface DashboardProps {
  bookings: Booking[];
  units: Unit[];
  villas: Villa[];
  selectedVilla: string;
  onNavigate: (page: 'availability') => void;
}

const TODAY = '2026-04-08';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, units, villas, selectedVilla }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const villa = villas.find((v) => v.id === selectedVilla);
  const villaUnits = units.filter((u) => u.villaId === selectedVilla);
  const villaUnitIds = villaUnits.map((u) => u.id);
  const villaBookings = bookings.filter((b) => villaUnitIds.includes(b.unitId));

  // Stats
  const checkInsToday = villaBookings.filter((b) => b.checkIn === TODAY && b.status !== 'CANCELLED').length;
  const checkOutsToday = villaBookings.filter((b) => b.checkOut === TODAY && b.status !== 'CANCELLED').length;
  const occupiedUnits = villaBookings.filter(
    (b) => b.checkIn <= TODAY && b.checkOut > TODAY && !['CANCELLED', 'CHECKED_OUT'].includes(b.status)
  ).length;
  const monthlyRevenue = villaBookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => {
      const paid = b.payments
        .filter((p) => p.paidAt.startsWith('2026-04') && p.type !== 'REFUND')
        .reduce((s, p) => s + p.amount, 0);
      return sum + paid;
    }, 0);

  const stats = [
    { label: 'Check-in', value: checkInsToday, icon: LogIn, accent: '#3b82f6' },
    { label: 'Check-out', value: checkOutsToday, icon: LogOut, accent: '#f59e0b' },
    { label: 'Terisi', value: `${occupiedUnits}/${villaUnits.length}`, icon: Home, accent: '#10b981' },
    { label: 'Revenue', value: formatRupiah(monthlyRevenue), icon: TrendingUp, accent: '#8b5cf6', small: true },
  ];

  return (
    <div className="space-y-5">
      {/* Villa info */}
      {villa && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin size={12} />
          <span>{villa.address}, {villa.city}</span>
        </div>
      )}

      {/* Compact stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="stat-mini"
              style={{ '--accent': stat.accent } as React.CSSProperties}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`font-bold text-gray-900 mt-0.5 ${stat.small ? 'text-sm' : 'text-xl'}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${stat.accent}12` }}
                >
                  <Icon size={16} style={{ color: stat.accent }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Unit Kavling
          <span className="text-gray-400 font-normal ml-1.5">({villaUnits.length} unit)</span>
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Tersedia</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Terisi</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Check-in</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> Maintenance</span>
        </div>
      </div>

      {/* Unit cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {villaUnits.map((unit, i) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            bookings={villaBookings}
            today={TODAY}
            onClick={() => setSelectedUnit(unit)}
            index={i}
          />
        ))}
      </div>

      {/* Calendar modal */}
      {selectedUnit && villa && (
        <UnitCalendarModal
          unit={selectedUnit}
          bookings={villaBookings}
          villaName={villa.name}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
