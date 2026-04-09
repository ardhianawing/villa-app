import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Plus,
    Search,
    Calendar,
    MoreHorizontal
} from 'lucide-react';
import type { Booking, Villa, Unit, Expense, Payment } from '../types';

interface FinanceProps {
    bookings: Booking[];
    units: Unit[];
    villas: Villa[];
    selectedVilla: string;
    expenses: Expense[];
}

const Finance: React.FC<FinanceProps> = ({
    bookings,
    units,
    villas,
    selectedVilla,
    expenses,
}) => {
    const [activeTab, setActiveTab] = useState<'transaksi' | 'pengeluaran'>('transaksi');

    const currentVilla = villas.find(v => v.id === selectedVilla);
    console.log('Finance view for:', currentVilla?.name);

    // Filter specific villa
    const villaBookings = bookings.filter(b => units.find(u => u.id === b.unitId)?.villaId === selectedVilla);
    const villaExpenses = expenses.filter(e => e.villaId === selectedVilla);

    // Calculations
    const totalRevenue = villaBookings.reduce((sum, b) => {
        const paidAmount = b.payments.reduce((pSum, p) => pSum + p.amount, 0);
        return sum + paidAmount;
    }, 0);

    const totalPossibleRevenue = villaBookings.reduce((sum, b) => {
        if (b.status === 'CANCELLED') return sum;
        return sum + b.totalPrice;
    }, 0);

    const pendingRevenue = totalPossibleRevenue - totalRevenue;
    const totalExpenseAmount = villaExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenseAmount;

    // Transactions list
    const allPayments: (Payment & { guestName: string; unitLabel: string })[] = [];
    villaBookings.forEach(booking => {
        const unit = units.find(u => u.id === booking.unitId);
        booking.payments.forEach(payment => {
            allPayments.push({
                ...payment,
                guestName: booking.guestName,
                unitLabel: unit?.label || 'Unit'
            });
        });
    });

    // Sort by date descending
    allPayments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#44312a] font-display">Keuangan</h1>
                    <p className="text-[#8c7e7a] text-sm">Ringkasan pamasukan dan pengeluaran properti</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#d4c5b2] rounded-xl text-sm font-medium text-[#44312a] hover:bg-[#fdf8f6] transition-colors shadow-sm">
                        <Download size={16} />
                        Laporan
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#c4704b] rounded-xl text-sm font-medium text-white hover:bg-[#a65d3d] transition-colors shadow-sm shadow-terracotta/20">
                        <Plus size={16} />
                        Input Transaksi
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Pemasukan */}
                <div className="bk-card p-5 border-l-4 border-[#7c8c6e]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold text-[#8c7e7a] uppercase tracking-wider mb-1">Total Pemasukan</p>
                            <h3 className="text-xl font-bold text-[#44312a] font-mono">{formatIDR(totalRevenue)}</h3>
                        </div>
                        <div className="p-2 bg-[#7c8c6e]/10 rounded-lg text-[#7c8c6e]">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-[#7c8c6e] font-medium">
                        <ArrowUpRight size={14} className="mr-1" />
                        <span>12% dari bulan lalu</span>
                    </div>
                </div>

                {/* Pending / Sisa Tagihan */}
                <div className="bk-card p-5 border-l-4 border-amber-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold text-[#8c7e7a] uppercase tracking-wider mb-1">Piutang / Pending</p>
                            <h3 className="text-xl font-bold text-[#44312a] font-mono">{formatIDR(pendingRevenue)}</h3>
                        </div>
                        <div className="p-2 bg-amber-50/50 rounded-lg text-amber-600">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-[#8c7e7a]">Akumulasi sisa pembayaran</p>
                </div>

                {/* Total Pengeluaran */}
                <div className="bk-card p-5 border-l-4 border-rose-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold text-[#8c7e7a] uppercase tracking-wider mb-1">Total Pengeluaran</p>
                            <h3 className="text-xl font-bold text-[#44312a] font-mono">{formatIDR(totalExpenseAmount)}</h3>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-rose-500 font-medium">
                        <ArrowDownRight size={14} className="mr-1" />
                        <span>5% dari bulan lalu</span>
                    </div>
                </div>

                {/* Profit Bersih */}
                <div className="bk-card p-5 border-l-4 border-[#c4704b]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold text-[#8c7e7a] uppercase tracking-wider mb-1">Profit Bersih</p>
                            <h3 className="text-xl font-bold text-[#44312a] font-mono">{formatIDR(netProfit)}</h3>
                        </div>
                        <div className="p-2 bg-[#c4704b]/10 rounded-lg text-[#c4704b]">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-[#8c7e7a]">Pemasukan - Pengeluaran</p>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3 space-y-4">
                    {/* Tabs */}
                    <div className="flex bg-white p-1 rounded-xl border border-[#d4c5b2] w-fit shadow-sm">
                        <button
                            onClick={() => setActiveTab('transaksi')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'transaksi'
                                ? 'bg-[#c4704b] text-white shadow-sm'
                                : 'text-[#8c7e7a] hover:text-[#44312a]'
                                }`}
                        >
                            Riwayat Transaksi
                        </button>
                        <button
                            onClick={() => setActiveTab('pengeluaran')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pengeluaran'
                                ? 'bg-[#c4704b] text-white shadow-sm'
                                : 'text-[#8c7e7a] hover:text-[#44312a]'
                                }`}
                        >
                            Biaya Operasional
                        </button>
                    </div>

                    {/* List */}
                    <div className="bk-card overflow-hidden">
                        <div className="p-4 border-b border-[#f3eee8] flex items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7e7a]" size={16} />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'transaksi' ? "Cari nama tamu atau unit..." : "Cari pengeluaran..."}
                                    className="w-full pl-10 pr-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#c4704b] transition-all"
                                />
                            </div>
                            <button className="p-2 bg-white border border-[#d4c5b2] rounded-lg text-[#44312a] hover:bg-[#fdf8f6] transition-colors">
                                <Filter size={18} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fdf8f6] text-[10px] uppercase tracking-wider text-[#8c7e7a] font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">{activeTab === 'transaksi' ? 'Keterangan' : 'Item'}</th>
                                        <th className="px-6 py-4">Metode</th>
                                        <th className="px-6 py-4 text-right">Nominal</th>
                                        <th className="px-6 py-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f3eee8]">
                                    {activeTab === 'transaksi' ? (
                                        allPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-[#fdf8f6]/50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs font-mono text-[#44312a]">
                                                        {new Date(payment.paidAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-[#44312a]">{payment.guestName}</div>
                                                    <div className="text-[10px] text-[#8c7e7a] flex items-center gap-1">
                                                        <span className="px-1.5 py-0.5 bg-[#f3eee8] rounded text-[9px] font-bold">{payment.unitLabel}</span>
                                                        <span>•</span>
                                                        <span className={payment.type === 'DP' ? 'text-[#c4704b]' : 'text-[#7c8c6e]'}>
                                                            {payment.type === 'DP' ? 'Deposit (DP)' : 'Pelunasan'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-white border border-[#d4c5b2] rounded text-[10px] font-bold text-[#44312a]">
                                                        {payment.method}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-bold text-[#44312a] font-mono">
                                                        {formatIDR(payment.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="p-1.5 text-[#8c7e7a] hover:text-[#44312a] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        villaExpenses.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-[#fdf8f6]/50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs font-mono text-[#44312a]">
                                                        {new Date(expense.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-[#44312a]">{expense.label}</div>
                                                    <div className="text-[10px] text-rose-400 font-bold uppercase tracking-tight">{expense.category}</div>
                                                </td>
                                                <td className="px-6 py-4 text-[#8c7e7a] text-xs">—</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-bold text-rose-500 font-mono">
                                                        -{formatIDR(expense.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="p-1.5 text-[#8c7e7a] hover:text-[#44312a] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="px-6 py-4 bg-[#fdf8f6]/30 flex items-center justify-between border-t border-[#f3eee8]">
                            <span className="text-xs text-[#8c7e7a]">Menampilkan 1-10 dari 24 transaksi</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-[#d4c5b2] bg-white text-xs font-bold rounded-lg text-[#8c7e7a] cursor-not-allowed">Sebelummya</button>
                                <button className="px-3 py-1 border border-[#d4c5b2] bg-white text-xs font-bold rounded-lg text-[#44312a] hover:bg-[#fdf8f6]">Selanjutnya</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Analytics & Actions */}
                <div className="lg:w-1/3 space-y-6">
                    {/* Chart Placeholder */}
                    <div className="bk-card p-5">
                        <h4 className="text-sm font-bold text-[#44312a] mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-[#c4704b]" />
                            Trend Monthly Revenue
                        </h4>
                        <div className="h-40 flex items-end justify-between gap-1 px-2">
                            {[35, 45, 30, 60, 85, 40].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className={`w-full rounded-t-lg transition-all ${i === 4 ? 'bg-[#c4704b]' : 'bg-[#d4c5b2] hover:bg-[#c4704b]/60'}`}
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div className="mt-2 text-[9px] text-center font-bold text-[#8c7e7a]">M{i + 1}</div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#44312a] text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono pointer-events-none">
                                        Rp {h / 10}jt
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bk-card p-5 space-y-4">
                        <h4 className="text-sm font-bold text-[#44312a]">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-4 bg-[#7c8c6e]/5 hover:bg-[#7c8c6e]/10 border border-[#7c8c6e]/20 rounded-2xl transition-all group">
                                <div className="w-10 h-10 rounded-full bg-[#7c8c6e]/20 flex items-center justify-center text-[#7c8c6e] mb-2 group-hover:scale-110 transition-transform">
                                    <ArrowUpRight size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-[#7c8c6e] uppercase tracking-wider">Setoran</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-2xl transition-all group">
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-2 group-hover:scale-110 transition-transform">
                                    <ArrowDownRight size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Tagihan</span>
                            </button>
                        </div>
                        <button className="w-full py-3 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-xs font-bold text-[#44312a] hover:bg-[#f3eee8] transition-colors uppercase tracking-widest">
                            Export Rekap Bulanan
                        </button>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-[#44312a] to-[#2c1e19] rounded-3xl text-white shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h4 className="text-sm font-bold mb-1">Financial Health</h4>
                        <p className="text-white/60 text-[10px] mb-4">Unit performance this month</p>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="opacity-80">Occupancy Target</span>
                                    <span className="font-mono">82%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#7c8c6e]" style={{ width: '82%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="opacity-80">Collection Rate</span>
                                    <span className="font-mono">94%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#c4704b]" style={{ width: '94%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
