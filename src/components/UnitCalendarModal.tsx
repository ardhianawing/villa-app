import { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Phone, Users,
  Calendar, Banknote, MapPin, MessageCircle,
} from 'lucide-react';
import type { Booking, Unit } from '../types';
import StatusBadge from './StatusBadge';

interface UnitCalendarModalProps {
  unit: Unit;
  bookings: Booking[];
  villaName: string;
  onClose: () => void;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const TODAY = '2026-04-08';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const sourceLabel: Record<string, string> = {
  WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', WALK_IN: 'Walk-in',
  REFERRAL: 'Referral', AIRBNB: 'Airbnb', TRAVELOKA: 'Traveloka', OTHER: 'Lainnya',
};

const sourceIcon: Record<string, string> = {
  WHATSAPP: '💬', INSTAGRAM: '📸', WALK_IN: '🚶', REFERRAL: '🤝',
  AIRBNB: '🏠', TRAVELOKA: '✈️', OTHER: '📋',
};

type StatusKey = 'CONFIRMED' | 'FULLY_PAID' | 'CHECKED_IN' | 'CHECKED_OUT' | 'INQUIRY' | 'CANCELLED';

const barClass: Record<StatusKey, string> = {
  CONFIRMED: 'booking-bar--confirmed',
  FULLY_PAID: 'booking-bar--fully-paid',
  CHECKED_IN: 'booking-bar--checked-in',
  CHECKED_OUT: 'booking-bar--checked-out',
  INQUIRY: 'booking-bar--inquiry',
  CANCELLED: 'booking-bar--cancelled',
};

interface CalendarDay { date: string; day: number; isCurrentMonth: boolean; }

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const days: CalendarDay[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d.toISOString().split('T')[0], day: i, isCurrentMonth: true });
  }
  while (days.length % 7 !== 0) {
    const d = new Date(year, month + 1, days.length - lastDay.getDate() - startOffset + 1);
    days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false });
  }
  return days;
}

interface BookingBar { booking: Booking; startCol: number; span: number; row: number; }

export default function UnitCalendarModal({ unit, bookings, villaName, onClose }: UnitCalendarModalProps) {
  const todayDate = new Date(TODAY);
  const [year, setYear] = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const unitBookings = bookings
    .filter((b) => b.unitId === unit.id && b.status !== 'CANCELLED')
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const calendarDays = getCalendarDays(year, month);
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) weeks.push(calendarDays.slice(i, i + 7));

  function prevMonth() { if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1); }
  function nextMonth() { if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1); }
  function goToday() { setYear(todayDate.getFullYear()); setMonth(todayDate.getMonth()); }

  function getBarsForWeek(week: CalendarDay[]): BookingBar[] {
    const weekStart = week[0].date;
    const weekEnd = week[6].date;
    const bars: BookingBar[] = [];
    const rowTracker: string[][] = [];
    for (const booking of unitBookings) {
      const lastNight = new Date(booking.checkOut);
      lastNight.setDate(lastNight.getDate() - 1);
      const bLastNight = lastNight.toISOString().split('T')[0];
      if (bLastNight < weekStart || booking.checkIn > weekEnd) continue;
      const visibleStart = booking.checkIn < weekStart ? weekStart : booking.checkIn;
      const visibleEnd = bLastNight > weekEnd ? weekEnd : bLastNight;
      const startIdx = week.findIndex((d) => d.date === visibleStart);
      const endIdx = week.findIndex((d) => d.date === visibleEnd);
      if (startIdx === -1 || endIdx === -1) continue;
      const span = endIdx - startIdx + 1;
      let assignedRow = 0;
      for (let r = 0; r < rowTracker.length; r++) {
        const hasConflict = rowTracker[r].some((id) => {
          const existing = bars.find((b) => b.booking.id === id);
          if (!existing) return false;
          return !(startIdx >= existing.startCol + existing.span || startIdx + span <= existing.startCol);
        });
        if (!hasConflict) { assignedRow = r; break; }
        assignedRow = r + 1;
      }
      if (!rowTracker[assignedRow]) rowTracker[assignedRow] = [];
      rowTracker[assignedRow].push(booking.id);
      bars.push({ booking, startCol: startIdx, span, row: assignedRow });
    }
    return bars;
  }

  const totalPaid = selectedBooking ? selectedBooking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0) : 0;
  const remaining = selectedBooking ? selectedBooking.totalPrice - totalPaid : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center p-0 lg:p-6"
      style={{ background: 'rgba(68,49,42,0.5)', backdropFilter: 'blur(8px)', animation: 'backdrop-fade 0.2s ease-out both' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bk-modal bg-white w-full lg:max-w-2xl lg:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[94vh] lg:max-h-[88vh] flex flex-col bookings-page">
        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '2px solid var(--bk-terracotta)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>{unit.label}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} style={{ color: 'var(--bk-warm-600)' }} />
                <span className="text-xs" style={{ color: 'var(--bk-warm-600)' }}>{villaName}</span>
                <span className="text-xs mx-1" style={{ color: 'var(--bk-sand)' }}>·</span>
                <span className="text-xs font-medium" style={{ color: 'var(--bk-warm-800)', fontFamily: "'DM Mono', monospace" }}>{formatRupiah(unit.pricePerNight)}/malam</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: 'var(--bk-warm-50)' }}>
              <X size={16} style={{ color: 'var(--bk-warm-600)' }} />
            </button>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-2 mt-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: 'var(--bk-warm-50)' }}>
              <ChevronLeft size={16} style={{ color: 'var(--bk-warm-800)' }} />
            </button>
            <h3 className="text-sm font-bold min-w-[150px] text-center" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>
              {MONTHS[month]} {year}
            </h3>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: 'var(--bk-warm-50)' }}>
              <ChevronRight size={16} style={{ color: 'var(--bk-warm-800)' }} />
            </button>
            <button onClick={goToday} className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors" style={{ background: 'var(--bk-terracotta-light)', color: 'var(--bk-terracotta)' }}>
              Hari Ini
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-widest py-1" style={{ color: i >= 5 ? 'var(--bk-terracotta)' : 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>
                {d}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {weeks.map((week, wi) => {
              const bars = getBarsForWeek(week);
              const maxRow = bars.length > 0 ? Math.max(...bars.map((b) => b.row)) + 1 : 0;
              return (
                <div key={wi} className="relative">
                  <div className="grid grid-cols-7">
                    {week.map((day) => {
                      const isToday = day.date === TODAY;
                      const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
                      return (
                        <div key={day.date} className="text-center py-1.5 relative">
                          {isToday ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold" style={{ background: 'var(--bk-terracotta)', fontFamily: "'DM Mono', monospace" }}>
                              {day.day}
                            </span>
                          ) : (
                            <span className="text-xs" style={{
                              color: !day.isCurrentMonth ? 'var(--bk-warm-200)' : isWeekend ? 'var(--bk-terracotta)' : 'var(--bk-warm-800)',
                              fontFamily: "'DM Mono', monospace",
                              fontWeight: day.isCurrentMonth ? 500 : 400,
                            }}>
                              {day.day}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {maxRow > 0 && (
                    <div className="relative" style={{ height: maxRow * 24 + 2 }}>
                      {bars.map((bar) => {
                        const leftPct = (bar.startCol / 7) * 100;
                        const widthPct = (bar.span / 7) * 100;
                        return (
                          <div
                            key={bar.booking.id}
                            className={`booking-bar absolute ${barClass[bar.booking.status as StatusKey] || 'booking-bar--confirmed'}`}
                            style={{ left: `calc(${leftPct}% + 3px)`, width: `calc(${widthPct}% - 6px)`, top: bar.row * 24, fontFamily: "'DM Sans', sans-serif" }}
                            onClick={() => setSelectedBooking(selectedBooking?.id === bar.booking.id ? null : bar.booking)}
                            title={`${bar.booking.guestName} · ${bar.booking.checkIn} - ${bar.booking.checkOut}`}
                          >
                            {bar.booking.guestName}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {maxRow === 0 && <div className="h-1" />}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px dashed var(--bk-warm-200)' }}>
            {[
              { cls: 'booking-bar--confirmed', label: 'Confirmed' },
              { cls: 'booking-bar--fully-paid', label: 'Lunas' },
              { cls: 'booking-bar--checked-in', label: 'Check-in' },
              { cls: 'booking-bar--checked-out', label: 'Check-out' },
              { cls: 'booking-bar--inquiry', label: 'Inquiry' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-5 h-2.5 rounded-sm ${item.cls}`} />
                <span className="text-[10px] font-medium" style={{ color: 'var(--bk-warm-600)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedBooking && (
          <div className="flex-shrink-0 px-5 py-4 space-y-3" style={{ borderTop: '1px solid var(--bk-warm-100)', background: 'var(--bk-warm-50)', animation: 'modal-slide-up 0.25s ease-out' }}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>{selectedBooking.guestName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedBooking.status} size="sm" />
                  <span className="text-xs" style={{ color: 'var(--bk-warm-600)' }}>
                    {selectedBooking.nights} malam · {sourceIcon[selectedBooking.source]} {sourceLabel[selectedBooking.source]}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded cursor-pointer" style={{ color: 'var(--bk-warm-600)' }}>
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2" style={{ color: 'var(--bk-warm-800)' }}>
                <Calendar size={13} style={{ color: 'var(--bk-warm-600)' }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{formatDateFull(selectedBooking.checkIn)} — {formatDateFull(selectedBooking.checkOut)}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--bk-warm-800)' }}>
                <Phone size={13} style={{ color: 'var(--bk-warm-600)' }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{selectedBooking.guestPhone || '-'}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--bk-warm-800)' }}>
                <Users size={13} style={{ color: 'var(--bk-warm-600)' }} />
                <span>{selectedBooking.guestCount} tamu</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--bk-warm-800)' }}>
                <MessageCircle size={13} style={{ color: 'var(--bk-warm-600)' }} />
                <span>{sourceLabel[selectedBooking.source]}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: '#fff', border: '1px solid var(--bk-warm-100)' }}>
              <Banknote size={16} style={{ color: 'var(--bk-warm-600)' }} />
              <div className="flex-1 flex items-center justify-between text-sm">
                <span style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>Total {formatRupiah(selectedBooking.totalPrice)}</span>
                <span style={{ color: 'var(--bk-warm-200)' }}>|</span>
                <span style={{ color: '#059669', fontWeight: 600, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>Dibayar {formatRupiah(totalPaid)}</span>
                <span style={{ color: 'var(--bk-warm-200)' }}>|</span>
                <span style={{ color: remaining > 0 ? '#dc2626' : '#059669', fontWeight: 700, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>Sisa {formatRupiah(remaining)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
