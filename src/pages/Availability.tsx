import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Phone, Users, Calendar, Banknote, CheckCircle, XCircle, Edit3, Plus } from 'lucide-react';
import type { Booking, BookingSource, BookingStatus, PaymentMethod, Unit, Villa } from '../types';
import StatusBadge from '../components/StatusBadge';

interface AvailabilityProps {
  bookings: Booking[];
  units: Unit[];
  villas: Villa[];
  selectedVilla: string;
  onSelectVilla: (id: string) => void;
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
}

const TODAY = '2026-04-08';
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const GRID_DAYS = 14;

const sourceOptions: { value: BookingSource; label: string }[] = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'AIRBNB', label: 'Airbnb' },
  { value: 'TRAVELOKA', label: 'Traveloka' },
  { value: 'OTHER', label: 'Lainnya' },
];

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'TRANSFER', label: 'Transfer Bank' },
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function dateDiff(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

type CellStatus = 'available' | 'booked' | 'maintenance' | 'partial';

interface CellInfo {
  status: CellStatus;
  booking?: Booking;
  isStart?: boolean;
  spanDays?: number;
}

// Legend items
const legendItems = [
  { color: '#22c55e', label: 'Tersedia' },
  { color: '#3B82F6', label: 'Confirmed / Booked' },
  { color: '#1D4ED8', label: 'Check-in' },
  { color: '#9CA3AF', label: 'Check-out' },
  { color: '#FCA5A5', label: 'Maintenance' },
];

interface BookingFormData {
  unitId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  source: BookingSource;
  notes: string;
  dpAmount: number;
  dpMethod: PaymentMethod;
}

const defaultForm: BookingFormData = {
  unitId: '',
  checkIn: TODAY,
  checkOut: addDays(TODAY, 1),
  guestName: '',
  guestPhone: '',
  guestCount: 2,
  source: 'WHATSAPP',
  notes: '',
  dpAmount: 0,
  dpMethod: 'TRANSFER',
};

const Availability: React.FC<AvailabilityProps> = ({
  bookings,
  units,
  villas,
  selectedVilla,
  onSelectVilla,
  onAddBooking,
  onUpdateBooking,
}) => {
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

  // Build date columns
  const dates: string[] = [];
  for (let i = 0; i < GRID_DAYS; i++) {
    dates.push(addDays(startDate, i));
  }

  function getCellInfo(unit: Unit, date: string): CellInfo {
    if (unit.status === 'MAINTENANCE') {
      return { status: 'maintenance' };
    }
    const booking = villaBookings.find(
      (b) =>
        b.unitId === unit.id &&
        b.checkIn <= date &&
        b.checkOut > date &&
        b.status !== 'CANCELLED'
    );
    if (!booking) return { status: 'available' };

    // How many days span within visible range
    const endDate = booking.checkOut < addDays(startDate, GRID_DAYS) ? booking.checkOut : addDays(startDate, GRID_DAYS);
    const startVisible = booking.checkIn >= startDate ? booking.checkIn : startDate;
    const spanDays = dateDiff(startVisible, endDate);

    return { status: 'booked', booking, isStart: booking.checkIn === date, spanDays };
  }

  function handleCellClick(unit: Unit, date: string) {
    const info = getCellInfo(unit, date);
    if (info.status === 'available') {
      setForm({
        ...defaultForm,
        unitId: unit.id,
        checkIn: date,
        checkOut: addDays(date, 1),
      });
      setShowBookingModal(true);
    } else if (info.status === 'booked' && info.booking) {
      setSelectedBooking(info.booking);
      setShowDetailModal(true);
      setShowPelunasan(false);
    }
  }

  function handleBookingCellClick(booking: Booking) {
    setSelectedBooking(booking);
    setShowDetailModal(true);
    setShowPelunasan(false);
  }

  const nights = dateDiff(form.checkIn, form.checkOut);
  const unit = villaUnits.find((u) => u.id === form.unitId);
  const totalPrice = (unit?.pricePerNight ?? 0) * Math.max(nights, 0);

  function handleSaveBooking() {
    if (!form.guestName || !form.unitId || nights <= 0) return;
    const newBooking: Booking = {
      id: 'b' + generateId(),
      unitId: form.unitId,
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      guestCount: form.guestCount,
      source: form.source,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      nights,
      pricePerNight: unit?.pricePerNight ?? 0,
      totalPrice,
      status: 'INQUIRY',
      notes: form.notes,
      payments: form.dpAmount > 0
        ? [{
            id: 'p' + generateId(),
            bookingId: '',
            amount: form.dpAmount,
            type: 'DP',
            method: form.dpMethod,
            paidAt: new Date().toISOString(),
          }]
        : [],
    };
    if (form.dpAmount > 0) {
      newBooking.payments[0].bookingId = newBooking.id;
      newBooking.status = 'CONFIRMED';
    }
    onAddBooking(newBooking);
    setShowBookingModal(false);
  }

  function handleStatusChange(newStatus: BookingStatus) {
    if (!selectedBooking) return;
    onUpdateBooking({ ...selectedBooking, status: newStatus });
    setSelectedBooking({ ...selectedBooking, status: newStatus });
  }

  function handlePelunasan() {
    if (!selectedBooking || pelunasanAmount <= 0) return;
    const updated: Booking = {
      ...selectedBooking,
      status: 'FULLY_PAID',
      payments: [
        ...selectedBooking.payments,
        {
          id: 'p' + generateId(),
          bookingId: selectedBooking.id,
          amount: pelunasanAmount,
          type: 'PELUNASAN',
          method: pelunasanMethod,
          paidAt: new Date().toISOString(),
        },
      ],
    };
    onUpdateBooking(updated);
    setSelectedBooking(updated);
    setShowPelunasan(false);
  }

  const selectedUnit = selectedBooking ? villaUnits.find((u) => u.id === selectedBooking.unitId) : null;
  const totalPaid = selectedBooking
    ? selectedBooking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0)
    : 0;
  const remaining = selectedBooking ? selectedBooking.totalPrice - totalPaid : 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Villa selector */}
        <select
          value={selectedVilla}
          onChange={(e) => onSelectVilla(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
        >
          {villas.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        {/* Date range navigator */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <button
            onClick={() => setStartDate(addDays(startDate, -7))}
            className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {formatDateShort(startDate)} — {formatDateShort(addDays(startDate, GRID_DAYS - 1))}
          </span>
          <button
            onClick={() => setStartDate(addDays(startDate, 7))}
            className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => setStartDate(TODAY)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Hari Ini
        </button>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse" style={{ minWidth: `${64 + GRID_DAYS * 72}px` }}>
            <thead>
              <tr>
                {/* Unit header */}
                <th
                  className="sticky left-0 z-20 bg-white border-b border-r border-gray-100 text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  style={{ minWidth: 140 }}
                >
                  Unit
                </th>
                {dates.map((date) => {
                  const d = new Date(date);
                  const isToday = date === TODAY;
                  return (
                    <th
                      key={date}
                      className={`border-b border-r border-gray-100 px-2 py-2 text-center ${isToday ? 'bg-blue-50' : 'bg-white'}`}
                      style={{ minWidth: 72 }}
                    >
                      <p className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                        {DAYS[d.getDay()]}
                      </p>
                      <p className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                        {d.getDate()}
                      </p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {villaUnits.map((unit) => (
                <tr key={unit.id} className="border-b border-gray-50 last:border-b-0">
                  {/* Unit label - sticky */}
                  <td
                    className="sticky left-0 z-10 bg-white border-r border-gray-100 px-4 py-3"
                    style={{ minWidth: 140 }}
                  >
                    <p className="text-sm font-medium text-gray-800">{unit.label}</p>
                    <p className="text-xs text-gray-400">{formatRupiah(unit.pricePerNight)}/mlm</p>
                    {unit.status === 'MAINTENANCE' && (
                      <span className="text-[10px] text-red-500 font-medium">Maintenance</span>
                    )}
                  </td>
                  {/* Date cells */}
                  {dates.map((date) => {
                    const info = getCellInfo(unit, date);
                    const isToday = date === TODAY;

                    if (info.status === 'maintenance') {
                      return (
                        <td
                          key={date}
                          className={`border-r border-gray-100 p-0.5 ${isToday ? 'bg-blue-50/30' : ''}`}
                          style={{ minWidth: 72 }}
                        >
                          <div className="h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                            <span className="text-[10px] text-red-400 font-medium">Maint.</span>
                          </div>
                        </td>
                      );
                    }

                    if (info.status === 'booked' && info.booking) {
                      // Only render the booking block at start cell
                      if (info.isStart) {
                        const spanDays = info.spanDays ?? 1;
                        const booking = info.booking;
                        const blockColor =
                          booking.status === 'CHECKED_IN' ? '#1D4ED8' :
                          booking.status === 'CHECKED_OUT' ? '#9CA3AF' :
                          '#3B82F6';
                        return (
                          <td
                            key={date}
                            className={`border-r border-gray-100 p-0.5 ${isToday ? 'bg-blue-50/30' : ''}`}
                            colSpan={spanDays}
                            style={{ minWidth: 72 * spanDays }}
                          >
                            <button
                              onClick={() => handleBookingCellClick(booking)}
                              className="w-full h-10 rounded-md px-2 flex items-center cursor-pointer transition-opacity hover:opacity-80 relative group"
                              style={{ backgroundColor: blockColor }}
                              title={`${booking.guestName} | ${booking.checkIn} - ${booking.checkOut} | ${booking.guestCount} tamu`}
                            >
                              <span className="text-white text-xs font-medium truncate">
                                {booking.guestName}
                              </span>
                            </button>
                          </td>
                        );
                      } else {
                        // Cell is part of a multi-day span — already covered by colSpan
                        return null;
                      }
                    }

                    // Available cell
                    return (
                      <td
                        key={date}
                        className={`border-r border-gray-100 p-0.5 group ${isToday ? 'bg-blue-50/30' : ''}`}
                        style={{ minWidth: 72 }}
                      >
                        <button
                          onClick={() => handleCellClick(unit, date)}
                          className="w-full h-10 rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-green-50 group-hover:border group-hover:border-green-200"
                          style={{ backgroundColor: '#F0FDF4' }}
                        >
                          <Plus size={14} className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* Booking Form Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Tambah Booking</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Unit selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={form.unitId}
                  onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {villaUnits
                    .filter((u) => u.status === 'AVAILABLE')
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.label} — {formatRupiah(u.pricePerNight)}/mlm</option>
                    ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={form.checkIn}
                    onChange={(e) => {
                      const newCheckIn = e.target.value;
                      setForm({
                        ...form,
                        checkIn: newCheckIn,
                        checkOut: newCheckIn > form.checkOut ? addDays(newCheckIn, 1) : form.checkOut,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={form.checkOut}
                    min={addDays(form.checkIn, 1)}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Nights indicator */}
              <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-blue-700">Jumlah Malam</span>
                <span className="font-bold text-blue-800">{Math.max(nights, 0)} malam</span>
              </div>

              {/* Guest info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tamu *</label>
                <input
                  type="text"
                  placeholder="Nama lengkap tamu"
                  value={form.guestName}
                  onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                <input
                  type="tel"
                  placeholder="08xxx"
                  value={form.guestPhone}
                  onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Tamu</label>
                <input
                  type="number"
                  min={1}
                  value={form.guestCount}
                  onChange={(e) => setForm({ ...form, guestCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asal Booking</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value as BookingSource })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sourceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Price summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatRupiah(unit?.pricePerNight ?? 0)} × {Math.max(nights, 0)} malam</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800 border-t border-gray-200 pt-1.5">
                  <span>Total</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
              </div>

              {/* DP section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment (DP)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Nominal DP"
                      min={0}
                      value={form.dpAmount || ''}
                      onChange={(e) => setForm({ ...form, dpAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <select
                      value={form.dpMethod}
                      onChange={(e) => setForm({ ...form, dpMethod: e.target.value as PaymentMethod })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {methodOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBooking}
                disabled={!form.guestName || nights <= 0}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Simpan Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-800 text-lg">{selectedBooking.guestName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{selectedUnit?.label}</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info */}
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Check-in</p>
                    <p className="text-gray-800 font-medium">{formatDateFull(selectedBooking.checkIn)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Check-out</p>
                    <p className="text-gray-800 font-medium">{formatDateFull(selectedBooking.checkOut)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Tamu</p>
                    <p className="text-gray-800 font-medium">{selectedBooking.guestCount} orang · {selectedBooking.nights} malam</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">WhatsApp</p>
                    <p className="text-gray-800 font-medium">{selectedBooking.guestPhone || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Catatan</p>
                  <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Payment */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Harga</span>
                  <span className="font-medium text-gray-800">{formatRupiah(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sudah Dibayar</span>
                  <span className="font-medium text-green-600">{formatRupiah(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-600 font-medium">Sisa</span>
                  <span className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatRupiah(remaining)}
                  </span>
                </div>
              </div>

              {/* Pelunasan form */}
              {showPelunasan && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-blue-800">Input Pelunasan</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Nominal"
                      value={pelunasanAmount || ''}
                      onChange={(e) => setPelunasanAmount(parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <select
                      value={pelunasanMethod}
                      onChange={(e) => setPelunasanMethod(e.target.value as PaymentMethod)}
                      className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {methodOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handlePelunasan}
                    className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Konfirmasi Pelunasan
                  </button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              {/* Primary actions */}
              <div className="flex gap-2">
                {selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'FULLY_PAID' ? (
                  <button
                    onClick={() => handleStatusChange('CHECKED_IN')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    Check-in
                  </button>
                ) : null}

                {selectedBooking.status === 'CHECKED_IN' ? (
                  <button
                    onClick={() => handleStatusChange('CHECKED_OUT')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    Check-out
                  </button>
                ) : null}

                {remaining > 0 && selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'CHECKED_OUT' ? (
                  <button
                    onClick={() => setShowPelunasan(!showPelunasan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    <Banknote size={15} />
                    Input Pelunasan
                  </button>
                ) : null}
              </div>

              {/* Secondary actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'CHECKED_OUT' && (
                  <button
                    onClick={() => {
                      handleStatusChange('CANCELLED');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <XCircle size={14} />
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
