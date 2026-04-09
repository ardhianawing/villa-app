import { useState, useMemo } from 'react';
import {
  Search, X, Phone, Users, Calendar,
  Banknote, XCircle, LogIn, LogOut,
  ArrowUpDown, ArrowRight, CreditCard,
} from 'lucide-react';
import type { Booking, BookingStatus, PaymentMethod, Unit, Villa } from '../types';
import StatusBadge from '../components/StatusBadge';

interface BookingsPageProps {
  bookings: Booking[];
  units: Unit[];
  villas: Villa[];
  selectedVilla: string;
  onUpdateBooking: (booking: Booking) => void;
  isReadOnly?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const sourceLabel: Record<string, string> = {
  WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', WALK_IN: 'Walk-in',
  REFERRAL: 'Referral', AIRBNB: 'Airbnb', TRAVELOKA: 'Traveloka', OTHER: 'Lainnya',
};

const sourceIcon: Record<string, string> = {
  WHATSAPP: '💬', INSTAGRAM: '📸', WALK_IN: '🚶', REFERRAL: '🤝',
  AIRBNB: '🏠', TRAVELOKA: '✈️', OTHER: '📋',
};

const statusOrder: BookingStatus[] = ['CHECKED_IN', 'CONFIRMED', 'FULLY_PAID', 'INQUIRY', 'CHECKED_OUT', 'CANCELLED'];

type StatusFilter = 'ALL' | BookingStatus;
type SortField = 'checkIn' | 'guestName' | 'totalPrice' | 'status';

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'TRANSFER', label: 'Transfer Bank' },
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
];

const statusTabConfig: { key: StatusFilter; label: string; color: string }[] = [
  { key: 'ALL', label: 'Semua', color: '#6b4c3b' },
  { key: 'CHECKED_IN', label: 'Check-in', color: '#d97706' },
  { key: 'CONFIRMED', label: 'Confirmed', color: '#2563eb' },
  { key: 'FULLY_PAID', label: 'Lunas', color: '#059669' },
  { key: 'INQUIRY', label: 'Inquiry', color: '#7c3aed' },
  { key: 'CHECKED_OUT', label: 'Selesai', color: '#64748b' },
  { key: 'CANCELLED', label: 'Batal', color: '#dc2626' },
];

const stripColors: Record<BookingStatus, string> = {
  CHECKED_IN: '#f59e0b',
  CONFIRMED: '#3b82f6',
  FULLY_PAID: '#10b981',
  INQUIRY: '#a78bfa',
  CHECKED_OUT: '#94a3b8',
  CANCELLED: '#f87171',
};

const stripBg: Record<BookingStatus, string> = {
  CHECKED_IN: '#fffbeb',
  CONFIRMED: '#eff6ff',
  FULLY_PAID: '#ecfdf5',
  INQUIRY: '#f5f3ff',
  CHECKED_OUT: '#f8fafc',
  CANCELLED: '#fef2f2',
};

export default function BookingsPage({
  bookings, units, selectedVilla, onUpdateBooking, isReadOnly = false,
}: BookingsPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('checkIn');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPelunasan, setShowPelunasan] = useState(false);
  const [pelunasanAmount, setPelunasanAmount] = useState(0);
  const [pelunasanMethod, setPelunasanMethod] = useState<PaymentMethod>('TRANSFER');

  const villaUnits = units.filter((u) => u.villaId === selectedVilla);
  const villaUnitIds = villaUnits.map((u) => u.id);
  const villaBookings = bookings.filter((b) => villaUnitIds.includes(b.unitId));
  const getUnit = (unitId: string) => villaUnits.find((u) => u.id === unitId);

  const filtered = useMemo(() => {
    let list = villaBookings;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.guestName.toLowerCase().includes(q) ||
        b.guestPhone.includes(q) ||
        getUnit(b.unitId)?.label.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') list = list.filter((b) => b.status === statusFilter);
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: villaBookings.length };
    for (const b of villaBookings) counts[b.status] = (counts[b.status] || 0) + 1;
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
        { id: 'p' + generateId(), bookingId: selectedBooking.id, amount: pelunasanAmount, type: 'PELUNASAN', method: pelunasanMethod, paidAt: new Date().toISOString() },
      ],
    };
    onUpdateBooking(updated);
    setSelectedBooking(updated);
    setShowPelunasan(false);
    setPelunasanAmount(0);
  }

  function openDetail(b: Booking) {
    setSelectedBooking(b);
    setShowPelunasan(false);
  }

  const selUnit = selectedBooking ? getUnit(selectedBooking.unitId) : null;
  const totalPaid = selectedBooking ? selectedBooking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0) : 0;
  const remaining = selectedBooking ? selectedBooking.totalPrice - totalPaid : 0;

  return (
    <div className="bookings-page space-y-5">
      {/* Search */}
      <div className="relative max-w-xl">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a68a7b]" />
        <input
          type="text"
          placeholder="Cari nama tamu, nomor HP, atau unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bk-search"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a68a7b] hover:text-[#6b4c3b] cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status tabs + sort */}
      <div className="flex items-end justify-between border-b border-[#f0ebe6]">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide">
          {statusTabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`bk-tab ${statusFilter === tab.key ? 'bk-tab--active' : ''}`}
              style={{ '--tab-color': tab.color } as React.CSSProperties}
            >
              {tab.label}
              {(statusCounts[tab.key] ?? 0) > 0 && (
                <span className={`ml-1.5 text-[11px] ${statusFilter === tab.key ? 'opacity-100' : 'opacity-50'}`}>
                  {statusCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleSort(sortField)}
          className="flex items-center gap-1 text-xs font-medium text-[#a68a7b] hover:text-[#6b4c3b] pb-2.5 cursor-pointer transition-colors flex-shrink-0 ml-4"
        >
          <ArrowUpDown size={12} />
          {sortAsc ? 'Terlama' : 'Terbaru'}
        </button>
      </div>

      {/* Count */}
      <p className="text-xs tracking-wide" style={{ color: '#a68a7b' }}>
        {filtered.length} booking
      </p>

      {/* Cards */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bk-warm-100)' }}>
              <Search size={22} style={{ color: 'var(--bk-warm-600)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--bk-warm-800)' }}>Tidak ada booking</p>
            <p className="text-xs mt-1" style={{ color: 'var(--bk-warm-600)' }}>Coba ubah filter atau kata kunci</p>
          </div>
        ) : (
          filtered.map((booking, i) => {
            const unit = getUnit(booking.unitId);
            const paid = booking.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0);
            const sisa = booking.totalPrice - paid;
            const ciDate = new Date(booking.checkIn);
            const coDate = new Date(booking.checkOut);

            return (
              <div
                key={booking.id}
                onClick={() => openDetail(booking)}
                className="bk-card bk-card-enter"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Date strip */}
                <div
                  className="bk-date-strip"
                  style={{
                    background: stripBg[booking.status],
                    '--strip-color': stripColors[booking.status],
                  } as React.CSSProperties}
                >
                  <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: stripColors[booking.status] }}>
                    {MONTHS[ciDate.getMonth()]}
                  </span>
                  <span className="text-2xl font-bold leading-none mt-0.5" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>
                    {String(ciDate.getDate()).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] mt-1 font-medium" style={{ color: 'var(--bk-warm-600)' }}>
                    {ciDate.getFullYear()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-semibold truncate" style={{ color: 'var(--bk-warm-900)' }}>
                        {booking.guestName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--bk-warm-600)' }}>{unit?.label}</span>
                        <span className="text-[10px]" style={{ color: 'var(--bk-sand)' }}>·</span>
                        <span className="text-xs" style={{ color: 'var(--bk-warm-600)' }}>
                          {booking.nights} malam
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--bk-sand)' }}>·</span>
                        <span className="text-xs" style={{ color: 'var(--bk-warm-600)' }}>
                          {sourceIcon[booking.source]} {sourceLabel[booking.source]}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--bk-warm-600)' }}>
                      <Calendar size={11} />
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>
                        {ciDate.getDate()} {MONTHS[ciDate.getMonth()]}
                      </span>
                      <ArrowRight size={10} className="mx-0.5 opacity-40" />
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>
                        {coDate.getDate()} {MONTHS[coDate.getMonth()]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {sisa > 0 && booking.status !== 'CANCELLED' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>
                          Sisa {formatRupiah(sisa)}
                        </span>
                      )}
                      <span className="text-sm font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>
                        {formatRupiah(booking.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center p-0 lg:p-6"
          style={{ background: 'rgba(68,49,42,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBooking(null); }}
        >
          <div className="bk-modal bg-white w-full lg:max-w-lg lg:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[93vh] flex flex-col">
            {/* Modal header with color accent */}
            <div className="relative px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: `2px solid ${stripColors[selectedBooking.status]}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: stripColors[selectedBooking.status] }}>
                    {selUnit?.label} · {selectedBooking.nights} malam
                  </p>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--bk-warm-900)' }}>
                    {selectedBooking.guestName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={selectedBooking.status} size="sm" />
                    <span className="text-xs" style={{ color: 'var(--bk-warm-600)' }}>
                      {sourceIcon[selectedBooking.source]} {sourceLabel[selectedBooking.source]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: 'var(--bk-warm-50)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bk-warm-100)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bk-warm-50)'}
                >
                  <X size={16} style={{ color: 'var(--bk-warm-600)' }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Date & guest row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3.5" style={{ background: 'var(--bk-warm-50)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <LogIn size={11} style={{ color: 'var(--bk-warm-600)' }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--bk-warm-600)' }}>Check-in</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>
                    {formatDate(selectedBooking.checkIn)}
                  </p>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: 'var(--bk-warm-50)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <LogOut size={11} style={{ color: 'var(--bk-warm-600)' }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--bk-warm-600)' }}>Check-out</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>
                    {formatDate(selectedBooking.checkOut)}
                  </p>
                </div>
              </div>

              {/* Contact & guests */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--bk-warm-800)' }}>
                  <Phone size={13} style={{ color: 'var(--bk-warm-600)' }} />
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>{selectedBooking.guestPhone || '-'}</span>
                </div>
                <div className="w-px h-4" style={{ background: 'var(--bk-warm-200)' }} />
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--bk-warm-800)' }}>
                  <Users size={13} style={{ color: 'var(--bk-warm-600)' }} />
                  <span>{selectedBooking.guestCount} tamu</span>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="rounded-xl p-3.5 border" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#b45309' }}>Catatan</p>
                  <p className="text-sm" style={{ color: '#92400e' }}>{selectedBooking.notes}</p>
                </div>
              )}

              {/* Payment timeline */}
              <div className="rounded-xl p-4" style={{ background: 'var(--bk-warm-50)', border: '1px solid var(--bk-warm-100)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={13} style={{ color: 'var(--bk-warm-600)' }} />
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--bk-warm-600)' }}>Riwayat Pembayaran</p>
                </div>

                {selectedBooking.payments.length > 0 ? (
                  <div className="space-y-3 mb-3">
                    {selectedBooking.payments.map((p) => {
                      const isRefund = p.type === 'REFUND';
                      const typeLabel = p.type === 'DP' ? 'Down Payment' : p.type === 'PELUNASAN' ? 'Pelunasan' : p.type === 'REFUND' ? 'Refund' : p.type;
                      const payDate = new Date(p.paidAt);
                      return (
                        <div key={p.id} className="bk-timeline-item flex items-start gap-3">
                          <div className="bk-timeline-dot mt-1.5" style={{ background: isRefund ? '#f87171' : '#10b981' }} />
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold" style={{ color: 'var(--bk-warm-900)' }}>{typeLabel}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--bk-warm-600)', fontFamily: "'DM Mono', monospace" }}>
                                {payDate.getDate()} {MONTHS[payDate.getMonth()]} · {p.method}
                              </p>
                            </div>
                            <span className="text-sm font-bold" style={{ color: isRefund ? '#dc2626' : '#059669', fontFamily: "'DM Mono', monospace" }}>
                              {isRefund ? '-' : '+'}{formatRupiah(Math.abs(p.amount))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic mb-3" style={{ color: 'var(--bk-warm-600)' }}>Belum ada pembayaran</p>
                )}

                {/* Summary */}
                <div className="pt-3 space-y-1.5" style={{ borderTop: '1px dashed var(--bk-warm-200)' }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--bk-warm-600)' }}>Total Harga</span>
                    <span className="font-semibold" style={{ color: 'var(--bk-warm-900)', fontFamily: "'DM Mono', monospace" }}>{formatRupiah(selectedBooking.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--bk-warm-600)' }}>Dibayar</span>
                    <span className="font-semibold" style={{ color: '#059669', fontFamily: "'DM Mono', monospace" }}>{formatRupiah(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <span className="font-semibold" style={{ color: 'var(--bk-warm-800)' }}>Sisa</span>
                    <span className="font-bold" style={{ color: remaining > 0 ? '#dc2626' : '#059669', fontFamily: "'DM Mono', monospace", fontSize: 15 }}>
                      {formatRupiah(remaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pelunasan form */}
              {showPelunasan && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bk-sage-light)', border: '1px solid #d1dbc9' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--bk-sage)' }}>Input Pelunasan</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Nominal"
                      value={pelunasanAmount || ''}
                      onChange={(e) => setPelunasanAmount(parseFloat(e.target.value) || 0)}
                      className="px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
                      style={{ borderColor: '#d1dbc9', fontFamily: "'DM Mono', monospace" }}
                    />
                    <select
                      value={pelunasanMethod}
                      onChange={(e) => setPelunasanMethod(e.target.value as PaymentMethod)}
                      className="px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
                      style={{ borderColor: '#d1dbc9' }}
                    >
                      {methodOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handlePelunasan}
                    disabled={pelunasanAmount <= 0}
                    className="bk-action bk-action--pay w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Banknote size={15} />
                    Konfirmasi Pelunasan
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isReadOnly && selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'CHECKED_OUT' && (
              <div className="px-6 py-4 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid var(--bk-warm-100)' }}>
                <div className="flex gap-2">
                  {(selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'FULLY_PAID') && (
                    <button onClick={() => handleStatusChange('CHECKED_IN')} className="bk-action bk-action--checkin flex-1">
                      <LogIn size={15} /> Check-in
                    </button>
                  )}
                  {selectedBooking.status === 'CHECKED_IN' && (
                    <button onClick={() => handleStatusChange('CHECKED_OUT')} className="bk-action bk-action--checkout flex-1">
                      <LogOut size={15} /> Check-out
                    </button>
                  )}
                  {remaining > 0 && (
                    <button onClick={() => setShowPelunasan(!showPelunasan)} className="bk-action bk-action--pay flex-1">
                      <Banknote size={15} /> Pelunasan
                    </button>
                  )}
                </div>
                <button onClick={() => handleStatusChange('CANCELLED')} className="bk-action bk-action--cancel w-full">
                  <XCircle size={14} /> Batalkan Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
