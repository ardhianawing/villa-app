import React from 'react';
import {
  LogIn, LogOut, Home, TrendingUp, Calendar,
  Users, MapPin, Phone, ExternalLink, MessageCircle,
} from 'lucide-react';
import type { Booking, Unit, Villa } from '../types';
import StatusBadge from '../components/StatusBadge';

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const sourceLabel: Record<string, string> = {
  WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', WALK_IN: 'Walk-in',
  REFERRAL: 'Referral', AIRBNB: 'Airbnb', TRAVELOKA: 'Traveloka', OTHER: 'Lainnya',
};

const Dashboard: React.FC<DashboardProps> = ({ bookings, units, villas, selectedVilla, onNavigate }) => {
  const villa = villas.find((v) => v.id === selectedVilla);
  const villaUnits = units.filter((u) => u.villaId === selectedVilla);
  const villaUnitIds = villaUnits.map((u) => u.id);
  const villaBookings = bookings.filter((b) => villaUnitIds.includes(b.unitId));

  const checkInsToday = villaBookings.filter((b) => b.checkIn === TODAY && b.status !== 'CANCELLED');
  const checkOutsToday = villaBookings.filter((b) => b.checkOut === TODAY && b.status !== 'CANCELLED');
  const occupiedUnits = villaBookings.filter(
    (b) => b.checkIn <= TODAY && b.checkOut > TODAY && b.status === 'CHECKED_IN'
  );
  const monthlyRevenue = villaBookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => {
      const paid = b.payments
        .filter((p) => p.paidAt.startsWith('2026-04') && p.type !== 'REFUND')
        .reduce((s, p) => s + p.amount, 0);
      return sum + paid;
    }, 0);

  const upcomingBookings = villaBookings
    .filter((b) => b.checkIn >= TODAY && !['CANCELLED', 'CHECKED_OUT'].includes(b.status))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 10);

  const getUnit = (unitId: string) => villaUnits.find((u) => u.id === unitId);

  const statCards = [
    { label: 'Check-in Hari Ini', value: checkInsToday.length, unit: 'tamu', icon: LogIn, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Check-out Hari Ini', value: checkOutsToday.length, unit: 'tamu', icon: LogOut, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Unit Terisi', value: occupiedUnits.length, unit: `/ ${villaUnits.length}`, icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pendapatan Bulan Ini', value: formatRupiah(monthlyRevenue), unit: 'Apr 2026', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', isRevenue: true },
  ];

  return (
    <div className="space-y-4">
      {/* Villa info */}
      {villa && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin size={12} />
          <span>{villa.address}, {villa.city}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 leading-tight">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0 ml-1`}>
                  <Icon size={15} className={card.color} />
                </div>
              </div>
              {card.isRevenue ? (
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{card.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{card.unit}</p>
                </div>
              ) : (
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-400 mb-0.5">{card.unit}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Check-ins */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIn size={15} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800 text-sm">Check-in Hari Ini</h3>
            </div>
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {checkInsToday.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {checkInsToday.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Tidak ada check-in hari ini</p>
            ) : (
              checkInsToday.map((b) => {
                const unit = getUnit(b.unitId);
                return (
                  <div key={b.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Users size={13} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{b.guestName}</p>
                        <p className="text-xs text-gray-400">{unit?.label} · {b.guestCount} tamu</p>
                      </div>
                    </div>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Check-outs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogOut size={15} className="text-orange-600" />
              <h3 className="font-semibold text-gray-800 text-sm">Check-out Hari Ini</h3>
            </div>
            <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {checkOutsToday.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {checkOutsToday.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Tidak ada check-out hari ini</p>
            ) : (
              checkOutsToday.map((b) => {
                const unit = getUnit(b.unitId);
                const totalPaid = b.payments.filter((p) => p.type !== 'REFUND').reduce((s, p) => s + p.amount, 0);
                const remaining = b.totalPrice - totalPaid;
                return (
                  <div key={b.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Users size={13} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{b.guestName}</p>
                        <p className="text-xs text-gray-400">{unit?.label} · {b.nights} malam</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {remaining > 0 ? (
                        <p className="text-[11px] font-medium text-red-600">Sisa {formatRupiah(remaining)}</p>
                      ) : (
                        <p className="text-[11px] font-medium text-green-600">Lunas</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800 text-sm">Upcoming Bookings</h3>
          </div>
          <button
            onClick={() => onNavigate('availability')}
            className="flex items-center gap-1 text-xs text-primary-600 font-medium cursor-pointer"
          >
            Lihat Grid <ExternalLink size={11} />
          </button>
        </div>

        {/* Mobile: card list */}
        <div className="divide-y divide-gray-50 lg:hidden">
          {upcomingBookings.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Tidak ada upcoming booking</p>
          ) : (
            upcomingBookings.map((b) => {
              const unit = getUnit(b.unitId);
              return (
                <div key={b.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{b.guestName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone size={10} /> {b.guestPhone}
                      </p>
                    </div>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Home size={11} /> {unit?.label}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={11} /> {sourceLabel[b.source]}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{b.nights} malam</span>
                    <span className="text-sm font-semibold text-gray-800">{formatRupiah(b.totalPrice)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tamu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Malam</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {upcomingBookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-400 py-10">Tidak ada upcoming booking</td></tr>
              ) : (
                upcomingBookings.map((b) => {
                  const unit = getUnit(b.unitId);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{b.guestName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} />{b.guestPhone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{unit?.label}</td>
                      <td className="px-4 py-3.5 text-gray-600">{formatDate(b.checkIn)}</td>
                      <td className="px-4 py-3.5 text-gray-600">{formatDate(b.checkOut)}</td>
                      <td className="px-4 py-3.5 text-gray-600">{b.nights}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-800">{formatRupiah(b.totalPrice)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={b.status} size="sm" /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
