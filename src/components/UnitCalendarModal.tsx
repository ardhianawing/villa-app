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

type StatusKey = 'CONFIRMED' | 'FULLY_PAID' | 'CHECKED_IN' | 'CHECKED_OUT' | 'INQUIRY' | 'CANCELLED';

const barClass: Record<StatusKey, string> = {
  CONFIRMED: 'booking-bar--confirmed',
  FULLY_PAID: 'booking-bar--fully-paid',
  CHECKED_IN: 'booking-bar--checked-in',
  CHECKED_OUT: 'booking-bar--checked-out',
  INQUIRY: 'booking-bar--inquiry',
  CANCELLED: 'booking-bar--cancelled',
};

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: CalendarDay[] = [];

  // Previous month fill
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({
      date: d.toISOString().split('T')[0],
      day: d.getDate(),
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d.toISOString().split('T')[0],
      day: i,
      isCurrentMonth: true,
    });
  }

  // Next month fill (complete last week)
  while (days.length % 7 !== 0) {
    const d = new Date(year, month + 1, days.length - lastDay.getDate() - startOffset + 1);
    days.push({
      date: d.toISOString().split('T')[0],
      day: d.getDate(),
      isCurrentMonth: false,
    });
  }

  return days;
}

interface BookingBar {
  booking: Booking;
  startCol: number; // 0-based within the week row
  span: number;
  row: number; // which row of the week (for stacking)
}

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
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }
  function goToday() {
    setYear(todayDate.getFullYear());
    setMonth(todayDate.getMonth());
  }

  // Build booking bars per week
  function getBarsForWeek(week: CalendarDay[]): BookingBar[] {
    const weekStart = week[0].date;
    const weekEnd = week[6].date;
    const bars: BookingBar[] = [];
    const rowTracker: string[][] = []; // track which booking IDs are in which row

    for (const booking of unitBookings) {
      // Booking overlaps this week?
      const bStart = booking.checkIn;
      const bEnd = booking.checkOut; // exclusive

      // checkOut is exclusive — the last night is checkOut - 1
      const lastNight = new Date(bEnd);
      lastNight.setDate(lastNight.getDate() - 1);
      const bLastNight = lastNight.toISOString().split('T')[0];

      if (bLastNight < weekStart || bStart > weekEnd) continue;

      const visibleStart = bStart < weekStart ? weekStart : bStart;
      const visibleEnd = bLastNight > weekEnd ? weekEnd : bLastNight;

      const startIdx = week.findIndex((d) => d.date === visibleStart);
      const endIdx = week.findIndex((d) => d.date === visibleEnd);
      if (startIdx === -1 || endIdx === -1) continue;

      const span = endIdx - startIdx + 1;

      // Find available row (no overlap)
      let assignedRow = 0;
      for (let r = 0; r < rowTracker.length; r++) {
        const hasConflict = rowTracker[r].some((id) => {
          const existing = bars.find((b) => b.booking.id === id);
          if (!existing) return false;
          return !(startIdx >= existing.startCol + existing.span || startIdx + span <= existing.startCol);
        });
        if (!hasConflict) {
          assignedRow = r;
          break;
        }
        assignedRow = r + 1;
      }
      if (!rowTracker[assignedRow]) rowTracker[assignedRow] = [];
      rowTracker[assignedRow].push(booking.id);

      bars.push({ booking, startCol: startIdx, span, row: assignedRow });
    }

    return bars;
  }

  const totalPaid = selectedBooking
    ? selectedBooking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0)
    : 0;
  const remaining = selectedBooking ? selectedBooking.totalPrice - totalPaid : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center p-0 lg:p-6 calendar-backdrop"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="calendar-modal bg-white w-full lg:max-w-2xl lg:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[94vh] lg:max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{unit.label}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} className="text-gray-400" />
                <span className="text-xs text-gray-400">{villaName}</span>
                <span className="text-xs text-gray-300 mx-1">·</span>
                <span className="text-xs font-medium text-gray-500">{formatRupiah(unit.pricePerNight)}/malam</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2 mt-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer">
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <h3 className="text-sm font-semibold text-gray-800 min-w-[140px] text-center">
              {MONTHS[month]} {year}
            </h3>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer">
              <ChevronRight size={16} className="text-gray-500" />
            </button>
            <button
              onClick={goToday}
              className="ml-2 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
            >
              Hari Ini
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-[11px] font-semibold uppercase tracking-wider py-1 ${i >= 5 ? 'text-red-400' : 'text-gray-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="space-y-1">
            {weeks.map((week, wi) => {
              const bars = getBarsForWeek(week);
              const maxRow = bars.length > 0 ? Math.max(...bars.map((b) => b.row)) + 1 : 0;

              return (
                <div key={wi} className="relative">
                  {/* Date numbers */}
                  <div className="grid grid-cols-7">
                    {week.map((day) => {
                      const isToday = day.date === TODAY;
                      const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
                      return (
                        <div
                          key={day.date}
                          className={`text-center py-1.5 text-sm relative ${
                            !day.isCurrentMonth ? 'text-gray-300' :
                            isToday ? 'font-bold' :
                            isWeekend ? 'text-red-400' : 'text-gray-700'
                          }`}
                        >
                          {isToday ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold">
                              {day.day}
                            </span>
                          ) : (
                            <span className="text-xs">{day.day}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Booking bars container */}
                  {maxRow > 0 && (
                    <div className="relative" style={{ height: maxRow * 24 + 2 }}>
                      {bars.map((bar) => {
                        const leftPct = (bar.startCol / 7) * 100;
                        const widthPct = (bar.span / 7) * 100;

                        return (
                          <div
                            key={bar.booking.id}
                            className={`booking-bar absolute ${barClass[bar.booking.status as StatusKey] || 'booking-bar--confirmed'}`}
                            style={{
                              left: `calc(${leftPct}% + 3px)`,
                              width: `calc(${widthPct}% - 6px)`,
                              top: bar.row * 24,
                            }}
                            onClick={() => setSelectedBooking(
                              selectedBooking?.id === bar.booking.id ? null : bar.booking
                            )}
                            title={`${bar.booking.guestName} · ${bar.booking.checkIn} - ${bar.booking.checkOut}`}
                          >
                            {bar.booking.guestName}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty state for weeks without bookings */}
                  {maxRow === 0 && (
                    <div className="h-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-gray-100">
            {[
              { cls: 'booking-bar--confirmed', label: 'Confirmed' },
              { cls: 'booking-bar--fully-paid', label: 'Lunas' },
              { cls: 'booking-bar--checked-in', label: 'Check-in' },
              { cls: 'booking-bar--checked-out', label: 'Check-out' },
              { cls: 'booking-bar--inquiry', label: 'Inquiry' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-5 h-2.5 rounded-sm ${item.cls}`} />
                <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking detail panel (expandable) */}
        {selectedBooking && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/80 px-5 py-4 space-y-3 animate-[modal-slide-up_0.25s_ease-out]">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedBooking.guestName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedBooking.status} size="sm" />
                  <span className="text-xs text-gray-400">
                    {selectedBooking.nights} malam
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                <span>{formatDateFull(selectedBooking.checkIn)} — {formatDateFull(selectedBooking.checkOut)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={13} className="text-gray-400 flex-shrink-0" />
                <span>{selectedBooking.guestPhone || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={13} className="text-gray-400 flex-shrink-0" />
                <span>{selectedBooking.guestCount} tamu</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle size={13} className="text-gray-400 flex-shrink-0" />
                <span>{sourceLabel[selectedBooking.source]}</span>
              </div>
            </div>

            {/* Payment summary */}
            <div className="flex items-center gap-4 bg-white rounded-lg px-4 py-3 border border-gray-100">
              <Banknote size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">Total {formatRupiah(selectedBooking.totalPrice)}</span>
                <span className="text-gray-300">|</span>
                <span className="text-green-600 font-medium">Dibayar {formatRupiah(totalPaid)}</span>
                <span className="text-gray-300">|</span>
                <span className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Sisa {formatRupiah(remaining)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
