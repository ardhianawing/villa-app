import {
  Home, Users, Calendar, ArrowRightLeft, Wrench,
  Clock, ChevronRight,
} from 'lucide-react';
import type { Booking, Unit } from '../types';

interface UnitCardProps {
  unit: Unit;
  bookings: Booking[];
  today: string;
  onClick: () => void;
  index?: number;
}

type CardVariant = 'available' | 'occupied' | 'checkin-today' | 'checkout-today' | 'maintenance' | 'upcoming';

function formatRupiah(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1).replace('.0', '')}jt`;
  return `${(amount / 1000).toFixed(0)}rb`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const variantStyles: Record<CardVariant, { bg: string; accent: string; textAccent: string }> = {
  available:       { bg: 'linear-gradient(135deg, #7c8c6e 0%, #5f6e53 50%, #4a5740 100%)', accent: '#a8b89a', textAccent: '#d4e0cc' },
  occupied:        { bg: 'linear-gradient(135deg, #c4704b 0%, #a85d3d 50%, #8c4d33 100%)', accent: '#e8a88a', textAccent: '#fce0d0' },
  'checkin-today':  { bg: 'linear-gradient(135deg, #d4a04a 0%, #b8883a 50%, #9a722e 100%)', accent: '#e8c878', textAccent: '#fef3d6' },
  'checkout-today': { bg: 'linear-gradient(135deg, #7b6b8a 0%, #635572 50%, #4d4260 100%)', accent: '#a898b4', textAccent: '#d4cade' },
  maintenance:     { bg: 'linear-gradient(135deg, #8a8178 0%, #716960 50%, #5a524a 100%)', accent: '#b0a89f', textAccent: '#d4cec8' },
  upcoming:        { bg: 'linear-gradient(135deg, #5a7a8a 0%, #4a6572 50%, #3a5060 100%)', accent: '#88aab8', textAccent: '#c8dce4' },
};

export default function UnitCard({ unit, bookings, today, onClick, index = 0 }: UnitCardProps) {
  const activeBooking = bookings.find(
    (b) => b.unitId === unit.id && b.checkIn <= today && b.checkOut > today && !['CANCELLED', 'CHECKED_OUT'].includes(b.status)
  );
  const checkinToday = bookings.find(
    (b) => b.unitId === unit.id && b.checkIn === today && !['CANCELLED', 'CHECKED_OUT'].includes(b.status)
  );
  const checkoutToday = bookings.find(
    (b) => b.unitId === unit.id && b.checkOut === today && b.status !== 'CANCELLED'
  );
  const nextBooking = bookings
    .filter((b) => b.unitId === unit.id && b.checkIn > today && !['CANCELLED', 'CHECKED_OUT'].includes(b.status))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];

  let variant: CardVariant = 'available';
  let displayBooking: Booking | undefined;

  if (unit.status === 'MAINTENANCE') {
    variant = 'maintenance';
  } else if (checkinToday) {
    variant = 'checkin-today';
    displayBooking = checkinToday;
  } else if (checkoutToday && !activeBooking) {
    variant = 'checkout-today';
    displayBooking = checkoutToday;
  } else if (activeBooking) {
    variant = 'occupied';
    displayBooking = activeBooking;
  } else if (nextBooking) {
    variant = 'upcoming';
    displayBooking = nextBooking;
  }

  const variantIcon = {
    available: Home, occupied: Users, 'checkin-today': Calendar,
    'checkout-today': ArrowRightLeft, maintenance: Wrench, upcoming: Clock,
  };
  const variantLabel = {
    available: 'Tersedia', occupied: 'Terisi', 'checkin-today': 'Check-in Hari Ini',
    'checkout-today': 'Check-out Hari Ini', maintenance: 'Maintenance', upcoming: 'Upcoming',
  };

  const WatermarkIcon = variantIcon[variant];
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className="unit-card unit-card-enter"
      style={{ background: styles.bg, animationDelay: `${index * 50}ms` }}
    >
      <WatermarkIcon size={72} className="absolute bottom-1 right-1 opacity-[0.06]" strokeWidth={1.2} />

      {/* Top */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {unit.label}
            </h3>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: styles.textAccent, opacity: 0.8, fontFamily: "'DM Mono', monospace" }}>
              Rp {formatRupiah(unit.pricePerNight)}/malam
            </p>
          </div>
          <ChevronRight size={18} style={{ color: styles.accent }} className="opacity-50 mt-1 flex-shrink-0" />
        </div>
      </div>

      {/* Bottom */}
      <div className="relative z-10 mt-auto pt-3">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: styles.textAccent }}
        >
          <WatermarkIcon size={11} />
          {variantLabel[variant]}
        </span>

        {displayBooking && (
          <div className="mt-2">
            <p className="text-sm font-semibold truncate leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {displayBooking.guestName}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: styles.textAccent, opacity: 0.75, fontFamily: "'DM Mono', monospace" }}>
              {variant === 'upcoming' ? (
                <>Masuk {formatDateShort(displayBooking.checkIn)}</>
              ) : variant === 'checkout-today' ? (
                <>{displayBooking.nights} malam selesai</>
              ) : (
                <>{formatDateShort(displayBooking.checkIn)} — {formatDateShort(displayBooking.checkOut)} · {displayBooking.guestCount} tamu</>
              )}
            </p>
          </div>
        )}

        {variant === 'available' && (
          <p className="text-[11px] mt-2 italic" style={{ color: styles.textAccent, opacity: 0.5 }}>
            Tidak ada booking terjadwal
          </p>
        )}
        {variant === 'maintenance' && (
          <p className="text-[11px] mt-2 italic" style={{ color: styles.textAccent, opacity: 0.5 }}>
            Unit sedang dalam perbaikan
          </p>
        )}
      </div>
    </div>
  );
}
