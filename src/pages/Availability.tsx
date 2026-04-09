import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Phone, Users, Calendar, Banknote, XCircle, Plus, LogIn, LogOut } from 'lucide-react';
import type { Booking, BookingSource, BookingStatus, PaymentMethod, Unit, Villa, PricingRule } from '../types';
import { calculateStayPrice } from '../utils/pricing';
import StatusBadge from '../components/StatusBadge';

interface AvailabilityProps {
  bookings: Booking[];
  units: Unit[];
  villas: Villa[];
  selectedVilla: string;
  onSelectVilla: (id: string) => void;
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
  pricingRules: PricingRule[];
  isReadOnly?: boolean;
}

const TODAY = '2026-04-08';
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const GRID_DAYS_DESKTOP = 14;
const GRID_DAYS_MOBILE = 7;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useState(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });
  return isMobile;
}

const sourceOptions: { value: BookingSource; label: string }[] = [
  { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'WALK_IN', label: 'Walk-in' }, { value: 'REFERRAL', label: 'Referral' },
  { value: 'AIRBNB', label: 'Airbnb' }, { value: 'TRAVELOKA', label: 'Traveloka' },
  { value: 'OTHER', label: 'Lainnya' },
];
const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'TRANSFER', label: 'Transfer Bank' }, { value: 'CASH', label: 'Tunai' }, { value: 'QRIS', label: 'QRIS' },
];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0];
}
function dateDiff(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr); return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function generateId(): string { return Math.random().toString(36).slice(2, 9); }

type CellStatus = 'available' | 'booked' | 'maintenance';
interface CellInfo { status: CellStatus; booking?: Booking; isStart?: boolean; spanDays?: number; }

const legendItems = [
  { color: '#7c8c6e', label: 'Tersedia' },
  { color: '#3b82f6', label: 'Confirmed' },
  { color: '#c4704b', label: 'Check-in' },
  { color: '#94a3b8', label: 'Check-out' },
  { color: '#8a8178', label: 'Maintenance' },
];

interface BookingFormData {
  unitId: string; checkIn: string; checkOut: string; guestName: string;
  guestPhone: string; guestCount: number; source: BookingSource;
  notes: string; dpAmount: number; dpMethod: PaymentMethod;
}

const defaultForm: BookingFormData = {
  unitId: '', checkIn: TODAY, checkOut: addDays(TODAY, 1), guestName: '',
  guestPhone: '', guestCount: 2, source: 'WHATSAPP', notes: '', dpAmount: 0, dpMethod: 'TRANSFER',
};

const Availability: React.FC<AvailabilityProps> = ({
  bookings, units, villas, selectedVilla, onSelectVilla, onAddBooking, onUpdateBooking, pricingRules, isReadOnly = false,
}) => {
  const isMobile = useIsMobile();
  const GRID_DAYS = isMobile ? GRID_DAYS_MOBILE : GRID_DAYS_DESKTOP;
  const CELL_WIDTH = isMobile ? 48 : 72;

  const [startDate, setStartDate] = useState(TODAY);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingFormData>(defaultForm);
  const [showPelunasan, setShowPelunasan] = useState(false);
  const [pelunasanAmount, setPelunasanAmount] = useState(0);
  const [pelunasanMethod, setPelunasanMethod] = useState<PaymentMethod>('TRANSFER');

  const villaUnits = units.filter((u) => u.villaId === selectedVilla);
  const villaUnitIds = villaUnits.map((u) => u.id);
  const villaBookings = bookings.filter((b) => villaUnitIds.includes(b.unitId));

  const dates: string[] = [];
  for (let i = 0; i < GRID_DAYS; i++) dates.push(addDays(startDate, i));

  function getCellInfo(unit: Unit, date: string): CellInfo {
    if (unit.status === 'MAINTENANCE') return { status: 'maintenance' };
    const booking = villaBookings.find((b) => b.unitId === unit.id && b.checkIn <= date && b.checkOut > date && b.status !== 'CANCELLED');
    if (!booking) return { status: 'available' };
    const endDate = booking.checkOut < addDays(startDate, GRID_DAYS) ? booking.checkOut : addDays(startDate, GRID_DAYS);
    const startVisible = booking.checkIn >= startDate ? booking.checkIn : startDate;
    return { status: 'booked', booking, isStart: booking.checkIn === date, spanDays: dateDiff(startVisible, endDate) };
  }

  function handleCellClick(unit: Unit, date: string) {
    if (isReadOnly) return;
    const info = getCellInfo(unit, date);
    if (info.status === 'available') {
      setForm({ ...defaultForm, unitId: unit.id, checkIn: date, checkOut: addDays(date, 1) });
      setShowBookingModal(true);
    } else if (info.status === 'booked' && info.booking) {
      setSelectedBooking(info.booking); setShowDetailModal(true); setShowPelunasan(false);
    }
  }

  const nights = dateDiff(form.checkIn, form.checkOut);
  const unit = villaUnits.find((u) => u.id === form.unitId);

  const pricing = unit ? calculateStayPrice(unit, form.checkIn, form.checkOut, pricingRules) : { total: 0, breakdown: [] };
  const totalPrice = pricing.total;

  function handleSaveBooking() {
    if (!form.guestName || !form.unitId || nights <= 0) return;
    const newBooking: Booking = {
      id: 'b' + generateId(), unitId: form.unitId, guestName: form.guestName,
      guestPhone: form.guestPhone, guestCount: form.guestCount, source: form.source,
      checkIn: form.checkIn, checkOut: form.checkOut, nights, pricePerNight: unit?.pricePerNight ?? 0,
      totalPrice, status: 'INQUIRY', notes: form.notes,
      payments: form.dpAmount > 0 ? [{ id: 'p' + generateId(), bookingId: '', amount: form.dpAmount, type: 'DP', method: form.dpMethod, paidAt: new Date().toISOString() }] : [],
    };
    if (form.dpAmount > 0) { newBooking.payments[0].bookingId = newBooking.id; newBooking.status = 'CONFIRMED'; }
    onAddBooking(newBooking); setShowBookingModal(false);
  }

  function handleStatusChange(newStatus: BookingStatus) {
    if (!selectedBooking) return;
    onUpdateBooking({ ...selectedBooking, status: newStatus });
    setSelectedBooking({ ...selectedBooking, status: newStatus });
  }

  function handlePelunasan() {
    if (!selectedBooking || pelunasanAmount <= 0) return;
    const updated: Booking = {
      ...selectedBooking, status: 'FULLY_PAID',
      payments: [...selectedBooking.payments, { id: 'p' + generateId(), bookingId: selectedBooking.id, amount: pelunasanAmount, type: 'PELUNASAN', method: pelunasanMethod, paidAt: new Date().toISOString() }],
    };
    onUpdateBooking(updated); setSelectedBooking(updated); setShowPelunasan(false);
  }

  const selectedUnit = selectedBooking ? villaUnits.find((u) => u.id === selectedBooking.unitId) : null;
  const totalPaid = selectedBooking ? selectedBooking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0) : 0;
  const remaining = selectedBooking ? selectedBooking.totalPrice - totalPaid : 0;

  // Warm palette input class
  const inputCls = "w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c4704b]/30 focus:border-[#c4704b]";

  return (
    <div className="bookings-page space-y-4">
      {/* Controls */}
      <div className="space-y-2 lg:space-y-0 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
        <div className="flex items-center gap-2">
          <select value={selectedVilla} onChange={(e) => onSelectVilla(e.target.value)}
            className="flex-1 lg:flex-none px-3 py-2 rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c4704b]/30"
            style={{ background: 'var(--bk-warm-50)', border: '1.5px solid var(--bk-warm-100)', color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>
            {villas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>

          <div className="flex items-center gap-1 px-2 py-2 rounded-xl" style={{ background: 'var(--bk-warm-50)', border: '1.5px solid var(--bk-warm-100)' }}>
            <button onClick={() => setStartDate(addDays(startDate, -GRID_DAYS))} className="p-1 rounded-lg cursor-pointer transition-colors hover:bg-white/60">
              <ChevronLeft size={15} style={{ color: 'var(--bk-warm-800)' }} />
            </button>
            <span className="text-xs lg:text-sm font-semibold whitespace-nowrap px-1" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>
              {formatDateShort(startDate)} — {formatDateShort(addDays(startDate, GRID_DAYS - 1))}
            </span>
            <button onClick={() => setStartDate(addDays(startDate, GRID_DAYS))} className="p-1 rounded-lg cursor-pointer transition-colors hover:bg-white/60">
              <ChevronRight size={15} style={{ color: 'var(--bk-warm-800)' }} />
            </button>
          </div>

          <button onClick={() => setStartDate(TODAY)}
            className="px-3 py-2 text-xs lg:text-sm rounded-xl cursor-pointer whitespace-nowrap font-semibold transition-colors"
            style={{ background: 'var(--bk-terracotta-light)', color: 'var(--bk-terracotta)', border: 'none' }}>
            Hari Ini
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 lg:ml-auto scrollbar-hide">
          {isReadOnly && (
            <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' }}>View Only</span>
          )}
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs whitespace-nowrap" style={{ color: 'var(--bk-warm-600)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--bk-warm-100)' }}>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="border-collapse" style={{ minWidth: `${140 + GRID_DAYS * CELL_WIDTH}px` }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-20 text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest" style={{ background: '#fff', borderBottom: '1px solid var(--bk-warm-100)', borderRight: '1px solid var(--bk-warm-100)', color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace", minWidth: 120 }}>
                  Unit
                </th>
                {dates.map((date) => {
                  const d = new Date(date);
                  const isToday = date === TODAY;
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <th key={date} className="px-1 py-2 text-center" style={{ borderBottom: '1px solid var(--bk-warm-100)', borderRight: '1px solid var(--bk-warm-100)', background: isToday ? 'var(--bk-terracotta-light)' : isWeekend ? 'var(--bk-warm-50)' : '#fff', minWidth: CELL_WIDTH }}>
                      <p className="text-[10px] font-medium" style={{ color: isToday ? 'var(--bk-terracotta)' : 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>
                        {DAYS[d.getDay()]}
                      </p>
                      <p className="text-xs lg:text-sm font-bold" style={{ color: isToday ? 'var(--bk-terracotta)' : 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>
                        {d.getDate()}
                      </p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {villaUnits.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--bk-warm-100)' }}>
                  <td className="sticky left-0 z-10 px-3 py-2.5" style={{ background: '#fff', borderRight: '1px solid var(--bk-warm-100)', minWidth: 120 }}>
                    <p className="text-xs lg:text-sm font-semibold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>{u.label}</p>
                    <p className="text-[10px] lg:text-xs" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>{formatRupiah(u.pricePerNight)}/mlm</p>
                    {u.status === 'MAINTENANCE' && <span className="text-[10px] font-semibold" style={{ color: '#8a8178' }}>Maintenance</span>}
                  </td>
                  {dates.map((date) => {
                    const info = getCellInfo(u, date);
                    const isToday = date === TODAY;
                    const bgToday = isToday ? 'var(--bk-terracotta-light)' : undefined;

                    if (info.status === 'maintenance') {
                      return (
                        <td key={date} className="p-0.5" style={{ borderRight: '1px solid var(--bk-warm-100)', background: bgToday, minWidth: CELL_WIDTH }}>
                          <div className="h-9 rounded-md flex items-center justify-center" style={{ background: '#f0ebe6' }}>
                            <span className="text-[9px] font-semibold" style={{ color: '#8a8178' }}>Maint.</span>
                          </div>
                        </td>
                      );
                    }

                    if (info.status === 'booked' && info.booking) {
                      if (info.isStart) {
                        const spanDays = info.spanDays ?? 1;
                        const booking = info.booking;
                        const blockColor = booking.status === 'CHECKED_IN' ? '#c4704b' : booking.status === 'CHECKED_OUT' ? '#94a3b8' : '#3b82f6';
                        return (
                          <td key={date} className="p-0.5" colSpan={spanDays} style={{ borderRight: '1px solid var(--bk-warm-100)', background: bgToday, minWidth: CELL_WIDTH * spanDays }}>
                            <button
                              onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); setShowPelunasan(false); }}
                              className="w-full h-9 rounded-md px-2 flex items-center cursor-pointer transition-all hover:brightness-110 hover:shadow-sm"
                              style={{ backgroundColor: blockColor }}
                              title={`${booking.guestName} | ${booking.checkIn} - ${booking.checkOut}`}
                            >
                              <span className="text-white text-[10px] lg:text-xs font-semibold truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {booking.guestName}
                              </span>
                            </button>
                          </td>
                        );
                      }
                      return null;
                    }

                    return (
                      <td key={date} className="p-0.5 group" style={{ borderRight: '1px solid var(--bk-warm-100)', background: bgToday, minWidth: CELL_WIDTH }}>
                        <button
                          onClick={() => handleCellClick(u, date)}
                          disabled={isReadOnly}
                          className={`w-full h-9 rounded-md flex items-center justify-center transition-colors ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          style={{ backgroundColor: 'var(--bk-sage-light)' }}
                          onMouseEnter={(e) => { if (!isReadOnly) e.currentTarget.style.backgroundColor = '#d4e0cc'; }}
                          onMouseLeave={(e) => { if (!isReadOnly) e.currentTarget.style.backgroundColor = 'var(--bk-sage-light)'; }}
                        >
                          {!isReadOnly && <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--bk-sage)' }} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Booking Form Modal ─── */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-end" style={{ background: 'rgba(68,49,42,0.45)', backdropFilter: 'blur(8px)' }}>
          <div className="bk-modal bg-white w-full lg:max-w-md lg:h-full rounded-t-2xl lg:rounded-none overflow-y-auto shadow-2xl max-h-[92vh] lg:max-h-full">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '2px solid var(--bk-terracotta)' }}>
              <h2 className="font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>Tambah Booking</h2>
              <button onClick={() => setShowBookingModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: 'var(--bk-warm-50)' }}>
                <X size={16} style={{ color: 'var(--bk-warm-600)' }} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Unit</label>
                <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)', background: 'var(--bk-warm-50)' }}>
                  {villaUnits.filter((u) => u.status === 'AVAILABLE').map((u) => <option key={u.id} value={u.id}>{u.label} — {formatRupiah(u.pricePerNight)}/mlm</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Check-in</label>
                  <input type="date" value={form.checkIn} onChange={(e) => { const v = e.target.value; setForm({ ...form, checkIn: v, checkOut: v > form.checkOut ? addDays(v, 1) : form.checkOut }); }} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)', fontFamily: "'DM Mono', monospace" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Check-out</label>
                  <input type="date" value={form.checkOut} min={addDays(form.checkIn, 1)} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)', fontFamily: "'DM Mono', monospace" }} />
                </div>
              </div>
              <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bk-terracotta-light)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--bk-terracotta)' }}>Jumlah Malam</span>
                <span className="font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>{Math.max(nights, 0)} malam</span>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Nama Tamu *</label>
                <input type="text" placeholder="Nama lengkap tamu" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>No. WhatsApp</label>
                <input type="tel" placeholder="08xxx" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)', fontFamily: "'DM Mono', monospace" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Jumlah Tamu</label>
                <input type="number" min={1} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: parseInt(e.target.value) || 1 })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Asal Booking</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as BookingSource })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)', background: 'var(--bk-warm-50)' }}>
                  {sourceOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Catatan</label>
                <textarea rows={2} placeholder="Catatan tambahan..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} style={{ border: '1.5px solid var(--bk-warm-100)' }} />
              </div>
              <div className="rounded-xl p-4 space-y-1.5" style={{ background: 'var(--bk-warm-50)', border: '1px solid var(--bk-warm-100)' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--bk-warm-600)' }}>
                  <span>Estimasi ({Math.max(nights, 0)} malam)</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatRupiah(totalPrice)}</span>
                </div>
                {pricing.breakdown.some(b => b.ruleLabel) && (
                  <div className="pt-2 mt-1 space-y-1">
                    {pricing.breakdown.filter(b => b.ruleLabel).map((b, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] italic" style={{ color: 'var(--bk-terracotta)' }}>
                        <span>{formatDateShort(b.date)}: {b.ruleLabel}</span>
                        <span>{formatRupiah(b.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1.5" style={{ borderTop: '1px dashed var(--bk-warm-200)', color: 'var(--bk-warm-900)' }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatRupiah(totalPrice)}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>Down Payment (DP)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Nominal DP" min={0} value={form.dpAmount || ''} onChange={(e) => setForm({ ...form, dpAmount: parseFloat(e.target.value) || 0 })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)', fontFamily: "'DM Mono', monospace" }} />
                  <select value={form.dpMethod} onChange={(e) => setForm({ ...form, dpMethod: e.target.value as PaymentMethod })} className={inputCls} style={{ border: '1.5px solid var(--bk-warm-100)', background: 'var(--bk-warm-50)' }}>
                    {methodOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--bk-warm-100)' }}>
              <button onClick={() => setShowBookingModal(false)} className="bk-action flex-1" style={{ background: 'transparent', border: '1.5px solid var(--bk-warm-200)', color: 'var(--bk-warm-800)' }}>Batal</button>
              <button onClick={handleSaveBooking} disabled={!form.guestName || nights <= 0} className="bk-action bk-action--checkin flex-1 disabled:opacity-50 disabled:cursor-not-allowed">Simpan Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center lg:p-4"
          style={{ background: 'rgba(68,49,42,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}>
          <div className="bk-modal bg-white rounded-t-2xl lg:rounded-2xl w-full lg:max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: `2px solid ${selectedBooking.status === 'CHECKED_IN' ? '#c4704b' : '#3b82f6'}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Sans', sans-serif" }}>{selectedBooking.guestName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm" style={{ color: 'var(--bk-warm-600)' }}>{selectedUnit?.label}</span>
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: 'var(--bk-warm-50)' }}>
                  <X size={16} style={{ color: 'var(--bk-warm-600)' }} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: 'Check-in', val: formatDateFull(selectedBooking.checkIn) },
                  { icon: Calendar, label: 'Check-out', val: formatDateFull(selectedBooking.checkOut) },
                  { icon: Users, label: 'Tamu', val: `${selectedBooking.guestCount} orang · ${selectedBooking.nights} malam` },
                  { icon: Phone, label: 'WhatsApp', val: selectedBooking.guestPhone || '-' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--bk-warm-50)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon size={11} style={{ color: 'var(--bk-warm-600)' }} />
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>{item.label}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--bk-warm-900)' }}>{item.val}</p>
                  </div>
                ))}
              </div>

              {selectedBooking.notes && (
                <div className="rounded-xl p-3 border" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#b45309' }}>Catatan</p>
                  <p className="text-sm" style={{ color: '#92400e' }}>{selectedBooking.notes}</p>
                </div>
              )}

              <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bk-warm-50)', border: '1px solid var(--bk-warm-100)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--bk-warm-600)' }}>Total Harga</span>
                  <span className="font-semibold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>{formatRupiah(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--bk-warm-600)' }}>Dibayar</span>
                  <span className="font-semibold" style={{ color: '#059669', fontFamily: "'DM Mono', monospace" }}>{formatRupiah(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px dashed var(--bk-warm-200)' }}>
                  <span className="font-semibold" style={{ color: 'var(--bk-warm-800)' }}>Sisa</span>
                  <span className="font-bold" style={{ color: remaining > 0 ? '#dc2626' : '#059669', fontFamily: "'DM Mono', monospace" }}>{formatRupiah(remaining)}</span>
                </div>
              </div>

              {showPelunasan && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bk-sage-light)', border: '1px solid #d1dbc9' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--bk-sage)' }}>Input Pelunasan</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Nominal" value={pelunasanAmount || ''} onChange={(e) => setPelunasanAmount(parseFloat(e.target.value) || 0)} className="px-3 py-2.5 border rounded-xl text-sm focus:outline-none bg-white" style={{ borderColor: '#d1dbc9', fontFamily: "'DM Mono', monospace" }} />
                    <select value={pelunasanMethod} onChange={(e) => setPelunasanMethod(e.target.value as PaymentMethod)} className="px-3 py-2.5 border rounded-xl text-sm focus:outline-none bg-white" style={{ borderColor: '#d1dbc9' }}>
                      {methodOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <button onClick={handlePelunasan} className="bk-action bk-action--pay w-full"><Banknote size={15} /> Konfirmasi</button>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'CHECKED_OUT' && (
              <div className="px-6 py-4 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid var(--bk-warm-100)' }}>
                <div className="flex gap-2">
                  {(selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'FULLY_PAID') && (
                    <button onClick={() => handleStatusChange('CHECKED_IN')} className="bk-action bk-action--checkin flex-1"><LogIn size={15} /> Check-in</button>
                  )}
                  {selectedBooking.status === 'CHECKED_IN' && (
                    <button onClick={() => handleStatusChange('CHECKED_OUT')} className="bk-action bk-action--checkout flex-1"><LogOut size={15} /> Check-out</button>
                  )}
                  {remaining > 0 && (
                    <button onClick={() => setShowPelunasan(!showPelunasan)} className="bk-action bk-action--pay flex-1"><Banknote size={15} /> Pelunasan</button>
                  )}
                </div>
                <button onClick={() => handleStatusChange('CANCELLED')} className="bk-action bk-action--cancel w-full"><XCircle size={14} /> Batalkan</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
