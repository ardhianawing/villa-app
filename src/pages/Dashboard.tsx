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
    { label: 'Check-in', value: checkInsToday, icon: LogIn, accent: '#c4704b' },
    { label: 'Check-out', value: checkOutsToday, icon: LogOut, accent: '#7b6b8a' },
    { label: 'Terisi', value: `${occupiedUnits}/${villaUnits.length}`, icon: Home, accent: '#7c8c6e' },
    { label: 'Revenue', value: formatRupiah(monthlyRevenue), icon: TrendingUp, accent: '#d4a04a', small: true },
  ];

  return (
    <div className="bookings-page space-y-5">
      {/* Villa info */}
      {villa && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--bk-warm-600)' }}>
          <MapPin size={12} />
          <span>{villa.address}, {villa.city}</span>
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="stat-mini"
              style={{ '--accent': stat.accent, borderColor: 'var(--bk-warm-100)' } as React.CSSProperties}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>
                    {stat.label}
                  </p>
                  <p className={`font-bold mt-0.5 ${stat.small ? 'text-sm' : 'text-xl'}`} style={{ color: 'var(--bk-warm-900)', fontFamily: stat.small ? "'DM Mono', monospace" : "'DM Sans', sans-serif" }}>
                    {stat.value}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.accent}18` }}>
                  <Icon size={16} style={{ color: stat.accent }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--bk-warm-100)', paddingBottom: 10 }}>
        <h2 className="text-sm font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>
          Unit Villa
          <span className="font-normal ml-1.5" style={{ color: 'var(--bk-warm-600)' }}>({villaUnits.length} unit)</span>
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-medium" style={{ color: 'var(--bk-warm-600)' }}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#7c8c6e' }} /> Tersedia</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#c4704b' }} /> Terisi</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#d4a04a' }} /> Check-in</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#8a8178' }} /> Maintenance</span>
        </div>
      </div>

      {/* Cards */}
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
