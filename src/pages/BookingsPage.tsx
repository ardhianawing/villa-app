import { useState, useMemo } from 'react';
import {
  Search, Filter, X, Phone, Users, Calendar,
  Banknote, ChevronDown, MessageCircle,
  CheckCircle, XCircle, LogIn, LogOut,
  Clock, ArrowUpDown,
} from 'lucide-react';
import type { Booking, BookingStatus, BookingSource, PaymentMethod, Unit, Villa } from '../types';
import StatusBadge from '../components/StatusBadge';

interface BookingsPageProps {
  bookings: Booking[];
  units: Unit[];
  villas: Villa[];
  selectedVilla: string;
  onUpdateBooking: (booking: Booking) => void;
  isReadOnly?: boolean;
}

const TODAY = '2026-04-08';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const sourceLabel: Record<string, string> = {
  WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', WALK_IN: 'Walk-in',
  REFERRAL: 'Referral', AIRBNB: 'Airbnb', TRAVELOKA: 'Traveloka', OTHER: 'Lainnya',
};

const statusOrder: BookingStatus[] = ['CHECKED_IN', 'CONFIRMED', 'FULLY_PAID', 'INQUIRY', 'CHECKED_OUT', 'CANCELLED'];

type StatusFilter = 'ALL' | BookingStatus;
type SortField = 'checkIn' | 'guestName' | 'totalPrice' | 'status';

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'TRANSFER', label: 'Transfer Bank' },
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
];

export default function BookingsPage({
  bookings, units, villas, selectedVilla, onUpdateBooking, isReadOnly = false,
}: BookingsPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('checkIn');
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Pelunasan state
  const [showPelunasan, setShowPelunasan] = useState(false);
  const [pelunasanAmount, setPelunasanAmount] = useState(0);
  const [pelunasanMethod, setPelunasanMethod] = useState<PaymentMethod>('TRANSFER');

  const villaUnits = units.filter((u) => u.villaId === selectedVilla);
  const villaUnitIds = villaUnits.map((u) => u.id);
  const villaBookings = bookings.filter((b) => villaUnitIds.includes(b.unitId));

  const getUnit = (unitId: string) => villaUnits.find((u) => u.id === unitId);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = villaBookings;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.guestName.toLowerCase().includes(q) ||
        b.guestPhone.includes(q) ||
        getUnit(b.unitId)?.label.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter((b) => b.status === statusFilter);
    }

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'checkIn': cmp = a.checkIn.localeCompare(b.checkIn); break;
        case 'guestName': cmp = a.guestName.localeCompare(b.guestName); break;
        case 'totalPrice': cmp = a.totalPrice - b.totalPrice; break;
        case 'status': cmp = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [villaBookings, search, statusFilter, sortField, sortAsc]);

  // Stats per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: villaBookings.length };
    for (const b of villaBookings) {
      counts[b.status] = (counts[b.status] || 0) + 1;
    }
    return counts;
  }, [villaBookings]);

  function handleSort(field: SortField) {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  }

  function handleStatusChange(newStatus: BookingStatus) {
    if (!selectedBooking) return;
    const updated = { ...selectedBooking, status: newStatus };
    onUpdateBooking(updated);
    setSelectedBooking(updated);
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
    setPelunasanAmount(0);
  }

  const selectedUnit = selectedBooking ? getUnit(selectedBooking.unitId) : null;
  const totalPaid = selectedBooking
    ? selectedBooking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0) : 0;
  const remaining = selectedBooking ? selectedBooking.totalPrice - totalPaid : 0;

  const statusFilterItems: { key: StatusFilter; label: string; color: string }[] = [
    { key: 'ALL', label: 'Semua', color: 'bg-gray-500' },
    { key: 'CHECKED_IN', label: 'Check-in', color: 'bg-amber-500' },
    { key: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-500' },
    { key: 'FULLY_PAID', label: 'Lunas', color: 'bg-green-500' },
    { key: 'INQUIRY', label: 'Inquiry', color: 'bg-purple-500' },
    { key: 'CHECKED_OUT', label: 'Check-out', color: 'bg-gray-400' },
    { key: 'CANCELLED', label: 'Batal', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama tamu, no HP, unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl border cursor-pointer transition-colors ${
              showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={14} />
            Filter
            {statusFilter !== 'ALL' && (
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            )}
          </button>
          <button
            onClick={() => handleSort(sortField)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <ArrowUpDown size={14} />
            {sortAsc ? 'Terlama' : 'Terbaru'}
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 animate-[modal-slide-up_0.2s_ease-out]">
          {statusFilterItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                statusFilter === item.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusFilter === item.key ? 'bg-white' : item.color}`} />
              {item.label}
              {(statusCounts[item.key] ?? 0) > 0 && (
                <span className={`ml-0.5 ${statusFilter === item.key ? 'text-gray-300' : 'text-gray-400'}`}>
                  {statusCounts[item.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400">
        {filtered.length} booking ditemukan
      </p>

      {/* Booking list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <Search size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Tidak ada booking ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          filtered.map((booking) => {
            const unit = getUnit(booking.unitId);
            const paid = booking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0);
            const sisa = booking.totalPrice - paid;
            const isActive = booking.checkIn <= TODAY && booking.checkOut > TODAY && booking.status === 'CHECKED_IN';

            return (
              <div
                key={booking.id}
                onClick={() => { setSelectedBooking(booking); setShowPelunasan(false); }}
                className={`bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  isActive ? 'border-amber-200 border-l-4 border-l-amber-500' : 'border-gray-100'
                }`}
              >
                {/* Mobile layout */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{booking.guestName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Phone size={10} />
                        {booking.guestPhone}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-gray-400" />
                      {formatDateShort(booking.checkIn)} — {formatDateShort(booking.checkOut)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {unit?.label}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} className="text-gray-400" />
                      {booking.guestCount} tamu · {booking.nights} mlm
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={11} className="text-gray-400" />
                      {sourceLabel[booking.source]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
                    <span className="text-sm font-bold text-gray-900">{formatRupiah(booking.totalPrice)}</span>
                    {sisa > 0 && booking.status !== 'CANCELLED' ? (
                      <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        Sisa {formatRupiah(sisa)}
                      </span>
                    ) : booking.status !== 'CANCELLED' ? (
                      <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Lunas
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center p-0 lg:p-6 calendar-backdrop"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBooking(null); }}
        >
          <div className="calendar-modal bg-white w-full lg:max-w-lg lg:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedBooking.guestName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedBooking.status} size="sm" />
                    <span className="text-xs text-gray-400">{selectedUnit?.label}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Check-in</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(selectedBooking.checkIn)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Check-out</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(selectedBooking.checkOut)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Tamu</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedBooking.guestCount} orang · {selectedBooking.nights} malam</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Sumber</p>
                  <p className="text-sm font-semibold text-gray-800">{sourceLabel[selectedBooking.source]}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">{selectedBooking.guestPhone || '-'}</span>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wider mb-1">Catatan</p>
                  <p className="text-sm text-amber-900">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Payment summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Pembayaran</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Harga</span>
                  <span className="font-semibold text-gray-800">{formatRupiah(selectedBooking.totalPrice)}</span>
                </div>

                {/* Payment history */}
                {selectedBooking.payments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {selectedBooking.payments.map((p) => (
                      <div key={p.id} className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {p.type === 'DP' ? 'Down Payment' : p.type === 'PELUNASAN' ? 'Pelunasan' : p.type === 'REFUND' ? 'Refund' : p.type}
                          {' · '}{p.method}
                        </span>
                        <span className={p.type === 'REFUND' ? 'text-red-600' : 'text-green-600'}>
                          {p.type === 'REFUND' ? '-' : '+'}{formatRupiah(Math.abs(p.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-sm border-t border-gray-200 pt-2.5">
                  <span className="font-medium text-gray-600">Sisa Tagihan</span>
                  <span className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatRupiah(remaining)}
                  </span>
                </div>
              </div>

              {/* Pelunasan form */}
              {showPelunasan && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800">Input Pelunasan</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Nominal"
                      value={pelunasanAmount || ''}
                      onChange={(e) => setPelunasanAmount(parseFloat(e.target.value) || 0)}
                      className="px-3 py-2.5 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <select
                      value={pelunasanMethod}
                      onChange={(e) => setPelunasanMethod(e.target.value as PaymentMethod)}
                      className="px-3 py-2.5 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {methodOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handlePelunasan}
                    disabled={pelunasanAmount <= 0}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Konfirmasi Pelunasan
                  </button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!isReadOnly && selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'CHECKED_OUT' && (
              <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">
                <div className="flex gap-2">
                  {(selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'FULLY_PAID') && (
                    <button
                      onClick={() => handleStatusChange('CHECKED_IN')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      <LogIn size={15} />
                      Check-in
                    </button>
                  )}
                  {selectedBooking.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleStatusChange('CHECKED_OUT')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      Check-out
                    </button>
                  )}
                  {remaining > 0 && (
                    <button
                      onClick={() => setShowPelunasan(!showPelunasan)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      <Banknote size={15} />
                      Pelunasan
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleStatusChange('CANCELLED')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 text-sm rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <XCircle size={14} />
                  Batalkan Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
