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
    available: Home,
    occupied: Users,
    'checkin-today': Calendar,
    'checkout-today': ArrowRightLeft,
    maintenance: Wrench,
    upcoming: Clock,
  };

  const variantLabel = {
    available: 'Tersedia',
    occupied: 'Terisi',
    'checkin-today': 'Check-in Hari Ini',
    'checkout-today': 'Check-out Hari Ini',
    maintenance: 'Maintenance',
    upcoming: 'Upcoming',
  };

  const WatermarkIcon = variantIcon[variant];

  return (
    <div
      onClick={onClick}
      className={`unit-card unit-card--${variant} unit-card-enter`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Watermark icon */}
      <WatermarkIcon
        size={72}
        className="absolute bottom-1 right-1 opacity-[0.06]"
        strokeWidth={1.2}
      />

      {/* Top: unit label + price */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight leading-tight">
              {unit.label}
            </h3>
            <p className="text-[11px] font-medium opacity-70 mt-0.5">
              Rp {formatRupiah(unit.pricePerNight)}/malam
            </p>
          </div>
          <ChevronRight size={18} className="opacity-40 mt-1 flex-shrink-0" />
        </div>
      </div>

      {/* Bottom: status + guest info */}
      <div className="relative z-10 mt-auto pt-3">
        {/* Status pill */}
        <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
          <WatermarkIcon size={11} />
          {variantLabel[variant]}
        </span>

        {/* Guest info */}
        {displayBooking && (
          <div className="mt-2">
            <p className="text-sm font-semibold truncate leading-tight">
              {displayBooking.guestName}
            </p>
            <p className="text-[11px] opacity-75 mt-0.5">
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

        {/* Available: show empty message */}
        {variant === 'available' && (
          <p className="text-[11px] opacity-60 mt-2 italic">
            Tidak ada booking terjadwal
          </p>
        )}

        {/* Maintenance */}
        {variant === 'maintenance' && (
          <p className="text-[11px] opacity-60 mt-2 italic">
            Unit sedang dalam perbaikan
          </p>
        )}
      </div>
    </div>
  );
}
