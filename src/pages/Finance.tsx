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
    MoreHorizontal,
    PieChart,
    ChevronDown,
    Home,
    MessageCircle
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
    const [activeTab, setActiveTab] = useState<'transaksi' | 'pengeluaran' | 'laporan'>('transaksi');
    const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');

    const currentVilla = villas.find(v => v.id === selectedVilla);
    console.log('Finance view for:', currentVilla?.name);

    // Filter logic
    const villaUnits = units.filter(u => u.villaId === selectedVilla);

    // Filter bookings based on selected unit
    const filteredBookings = bookings.filter(b => {
        const u = units.find(unit => unit.id === b.unitId);
        if (!u || u.villaId !== selectedVilla) return false;
        if (selectedUnitFilter !== 'all' && b.unitId !== selectedUnitFilter) return false;
        return true;
    });

    // Filter expenses based on selected unit
    const filteredExpenses = expenses.filter(e => {
        if (e.villaId !== selectedVilla) return false;
        if (selectedUnitFilter !== 'all') {
            // Include expenses directly for this unit OR general villa expenses (shared)
            return e.unitId === selectedUnitFilter || !e.unitId;
        }
        return true;
    });

    // Calculations
    const totalRevenue = filteredBookings.reduce((sum, b) => {
        const paidAmount = b.payments.reduce((pSum, p) => pSum + p.amount, 0);
        return sum + paidAmount;
    }, 0);

    const totalPossibleRevenue = filteredBookings.reduce((sum, b) => {
        if (b.status === 'CANCELLED') return sum;
        return sum + b.totalPrice;
    }, 0);

    const pendingRevenue = totalPossibleRevenue - totalRevenue;
    const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenseAmount;

    // Transactions list
    const allPayments: (Payment & { guestName: string; unitLabel: string })[] = [];
    filteredBookings.forEach(booking => {
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

    const handleShareWhatsApp = () => {
        const unit = villaUnits.find(u => u.id === selectedUnitFilter);
        if (!unit) return;

        const reportText = `*LAPORAN KEUANGAN VILLA PRO*%0A` +
            `-------------------------------%0A` +
            `*Unit:* ${unit.label}%0A` +
            `*Owner:* ${unit.ownerName || '-'}%0A` +
            `*Periode:* April 2026%0A%0A` +
            `*PEMASUKAN:*%0A` +
            `- Total Booking: ${formatIDR(totalRevenue)}%0A%0A` +
            `*PENGELUARAN:*%0A` +
            filteredExpenses.map(e => `- ${e.label}: ${formatIDR(e.amount)}`).join('%0A') + `%0A%0A` +
            `*TOTAL PENGELUARAN:* ${formatIDR(totalExpenseAmount)}%0A` +
            `-------------------------------%0A` +
            `*NET PROFIT:* ${formatIDR(netProfit)}%0A%0A` +
            `_Laporan dikirim otomatis oleh VillaPro Management_`;

        window.open(`https://wa.me/?text=${reportText}`, '_blank');
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#44312a] font-display">Keuangan</h1>
                    <p className="text-[#8c7e7a] text-sm">
                        {selectedUnitFilter === 'all'
                            ? `Ringkasan untuk ${currentVilla?.name || 'Villa'}`
                            : `Laporan Keuangan Unit: ${villaUnits.find(u => u.id === selectedUnitFilter)?.label} (${villaUnits.find(u => u.id === selectedUnitFilter)?.ownerName || 'Tanpa Nama'})`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Unit Selector */}
                    <div className="relative">
                        <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7e7a]" />
                        <select
                            value={selectedUnitFilter}
                            onChange={(e) => setSelectedUnitFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-white border border-[#d4c5b2] rounded-xl text-sm font-medium text-[#44312a] shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c4704b]/20"
                        >
                            <option value="all">Semua Unit (Kompleks)</option>
                            {villaUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>Kavling {unit.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c7e7a] pointer-events-none" />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#d4c5b2] rounded-xl text-sm font-medium text-[#44312a] hover:bg-[#fdf8f6] transition-colors shadow-sm">
                        <Download size={16} />
                        Laporan
                    </button>
                    {selectedUnitFilter !== 'all' && (
                        <button
                            onClick={handleShareWhatsApp}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] rounded-xl text-sm font-medium text-white hover:bg-[#128C7E] transition-colors shadow-sm shadow-green-500/20"
                        >
                            <MessageCircle size={16} />
                            Kirim WA
                        </button>
                    )}
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#c4704b] rounded-xl text-sm font-medium text-white hover:bg-[#a65d3d] transition-colors shadow-sm shadow-terracotta/20">
                        <Plus size={16} />
                        Input Transaksi
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Pemasukan */}
                <div className="bk-card flex flex-col justify-between p-5 border-l-4 border-[#7c8c6e] min-h-[150px]">
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
                <div className="bk-card flex flex-col justify-between p-5 border-l-4 border-amber-500 min-h-[150px]">
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
                <div className="bk-card flex flex-col justify-between p-5 border-l-4 border-rose-500 min-h-[150px]">
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
                <div className="bk-card flex flex-col justify-between p-5 border-l-4 border-[#c4704b] min-h-[150px]">
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
                            className={`px-4 py-2 text-sm font-bold transition-all relative ${activeTab === 'pengeluaran' ? 'text-[#c4704b]' : 'text-[#8c7e7a]'}`}
                        >
                            Pengeluaran
                            {activeTab === 'pengeluaran' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c4704b] rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('laporan')}
                            className={`px-4 py-2 text-sm font-bold transition-all relative ${activeTab === 'laporan' ? 'text-[#c4704b]' : 'text-[#8c7e7a]'}`}
                        >
                            Laporan Bulanan
                            {activeTab === 'laporan' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c4704b] rounded-t-full"></div>}
                        </button>
                    </div>

                    {/* List */}
                    {(activeTab === 'transaksi' || activeTab === 'pengeluaran') && (
                        <div className="bk-card flex flex-col overflow-hidden col-span-1 lg:col-span-2">
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

                            <div className="md:hidden divide-y divide-[#f3eee8]">
                                {activeTab === 'transaksi' ? (
                                    allPayments.map((payment) => (
                                        <div key={payment.id} className="p-4 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-semibold text-[#44312a]">{payment.guestName}</div>
                                                <div className="text-sm font-bold text-[#44312a] font-mono">{formatIDR(payment.amount)}</div>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-1.5 py-0.5 bg-[#f3eee8] rounded font-bold">{payment.unitLabel}</span>
                                                    <span className={payment.type === 'DP' ? 'text-[#c4704b]' : 'text-[#7c8c6e]'}>
                                                        {payment.type === 'DP' ? 'DP' : 'Lunas'}
                                                    </span>
                                                </div>
                                                <span className="text-[#8c7e7a]">
                                                    {new Date(payment.paidAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <div key={expense.id} className="p-4 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-semibold text-[#44312a]">{expense.label}</div>
                                                <div className="text-sm font-bold text-rose-500 font-mono">-{formatIDR(expense.amount)}</div>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <div className="flex items-center gap-2 uppercase font-bold text-rose-400">
                                                    {expense.category}
                                                    {expense.unitId && (
                                                        <span className="px-1 bg-rose-50 text-[8px] border border-rose-100 rounded">Unit {units.find(u => u.id === expense.unitId)?.label}</span>
                                                    )}
                                                </div>
                                                <span className="text-[#8c7e7a]">
                                                    {new Date(expense.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#fdf8f6] text-[10px] uppercase tracking-wider text-[#8c7e7a] font-bold">
                                        <tr>
                                            <th className="px-6 py-4 w-[120px]">Tanggal</th>
                                            <th className="px-6 py-4">Keterangan</th>
                                            <th className="px-6 py-4 w-[100px]">Metode</th>
                                            <th className="px-6 py-4 text-right w-[160px]">Nominal</th>
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
                                            filteredExpenses.map((expense) => (
                                                <tr key={expense.id} className="hover:bg-[#fdf8f6]/50 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-xs font-mono text-[#44312a]">
                                                            {new Date(expense.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-semibold text-[#44312a]">{expense.label}</div>
                                                        <div className="text-[10px] text-rose-400 font-bold uppercase tracking-tight flex items-center gap-2">
                                                            {expense.category}
                                                            {expense.unitId && (
                                                                <span className="px-1 bg-rose-50 text-[8px] border border-rose-100 rounded">Unit {units.find(u => u.id === expense.unitId)?.label}</span>
                                                            )}
                                                        </div>
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
                    )}

                    {activeTab === 'laporan' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Summary per Kavling Table (Show only when All Units is selected) */}
                            {selectedUnitFilter === 'all' && (
                                <div className="bk-card overflow-hidden">
                                    <div className="px-6 py-4 border-b border-[#f3eee8] bg-[#fdf8f6]/50">
                                        <h4 className="text-sm font-bold text-[#44312a]">Ringkasan Keuangan per Kavling - April 2026</h4>
                                    </div>
                                    <div className="md:hidden divide-y divide-[#f3eee8]">
                                        {villaUnits.map(u => {
                                            const uIncome = bookings.filter(b => b.unitId === u.id).reduce((s, b) => {
                                                const paid = b.payments.reduce((ps, p) => ps + p.amount, 0);
                                                return s + paid;
                                            }, 0);
                                            const uExp = expenses.filter(e => e.unitId === u.id).reduce((s, e) => s + e.amount, 0);
                                            return (
                                                <div key={u.id} className="p-4 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold text-[#44312a]">Unit {u.label}</span>
                                                        <span className="text-sm font-bold text-[#44312a] font-mono">{formatIDR(uIncome - uExp)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-[#7c8c6e]">In: {formatIDR(uIncome)}</span>
                                                        <span className="text-rose-500">Out: {formatIDR(uExp)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-[#fdf8f6] font-bold text-[#8c7e7a] uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-3">Kavling</th>
                                                    <th className="px-6 py-3 text-right">Pemasukan</th>
                                                    <th className="px-6 py-3 text-right">Pengeluaran</th>
                                                    <th className="px-6 py-3 text-right">Net Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#f3eee8]">
                                                {villaUnits.map(u => {
                                                    const uIncome = bookings.filter(b => b.unitId === u.id).reduce((s, b) => {
                                                        const paid = b.payments.reduce((ps, p) => ps + p.amount, 0);
                                                        return s + paid;
                                                    }, 0);
                                                    const uExp = expenses.filter(e => e.unitId === u.id).reduce((s, e) => s + e.amount, 0);
                                                    return (
                                                        <tr key={u.id} className="hover:bg-[#fdf8f6]/30 transition-colors">
                                                            <td className="px-6 py-3 font-bold text-[#44312a]">Unit {u.label}</td>
                                                            <td className="px-6 py-3 text-right text-[#7c8c6e] font-mono">{formatIDR(uIncome)}</td>
                                                            <td className="px-6 py-3 text-right text-rose-500 font-mono">{formatIDR(uExp)}</td>
                                                            <td className="px-6 py-3 text-right font-bold text-[#44312a] font-mono">{formatIDR(uIncome - uExp)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Monthly Summary Card */}
                                <div className="bk-card p-6">
                                    <h4 className="text-sm font-bold text-[#44312a] mb-6 flex items-center gap-2">
                                        <Plus size={18} className="text-[#7c8c6e]" />
                                        Rincian Pemasukan
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-[#7c8c6e]/5 rounded-2xl border border-[#7c8c6e]/10">
                                            <span className="text-sm font-medium text-[#44312a]">Total Booking</span>
                                            <span className="text-sm font-mono font-bold text-[#7c8c6e]">{formatIDR(totalRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 px-4 text-xs">
                                            <span className="text-[#8c7e7a]">Confirmed (Paid)</span>
                                            <span className="font-mono text-[#44312a]">{formatIDR(totalRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 px-4 text-xs">
                                            <span className="text-[#8c7e7a]">Outstanding (Unpaid)</span>
                                            <span className="font-mono text-amber-600">{formatIDR(pendingRevenue)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Breakdown Card */}
                                <div className="bk-card p-6">
                                    <h4 className="text-sm font-bold text-[#44312a] mb-6 flex items-center gap-2">
                                        <PieChart size={18} className="text-[#c4704b]" />
                                        Kebutuhan & Biaya Operasional
                                    </h4>
                                    <div className="space-y-4">
                                        {Array.from(new Set(filteredExpenses.map(e => e.category))).map(cat => {
                                            const amount = filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
                                            const percent = totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0;
                                            return (
                                                <div key={cat} className="space-y-1">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-bold text-[#44312a]">{cat}</span>
                                                        <span className="font-mono text-[#8c7e7a]">{formatIDR(amount)}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-[#f3eee8] rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#c4704b]" style={{ width: `${percent}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredExpenses.length === 0 && (
                                            <p className="text-xs text-[#8c7e7a] italic text-center py-4">Belum ada data pengeluaran</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Full Breakdown Table */}
                            <div className="bk-card overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#f3eee8] bg-[#fdf8f6]/50">
                                    <h4 className="text-sm font-bold text-[#44312a]">
                                        Itemized Financial Report - April 2026
                                        {selectedUnitFilter !== 'all' && ` (Kavling ${villaUnits.find(u => u.id === selectedUnitFilter)?.label})`}
                                    </h4>
                                </div>
                                <div className="md:hidden divide-y divide-[#f3eee8]">
                                    {/* Pemasukan Mobile */}
                                    <div className="bg-rose-50/20 px-4 py-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">Pemasukan</div>
                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-bold text-[#7c8c6e]">Booking</div>
                                            <div className="text-[10px] text-[#8c7e7a]">Total Pendapatan Sewa</div>
                                        </div>
                                        <div className="text-sm font-bold text-[#7c8c6e] font-mono">{formatIDR(totalRevenue)}</div>
                                    </div>
                                    {/* Pengeluaran Mobile */}
                                    <div className="bg-rose-50/20 px-4 py-2 text-[10px] font-bold text-[#c4704b] uppercase tracking-widest">Pengeluaran</div>
                                    {filteredExpenses.map((exp) => (
                                        <div key={exp.id} className="p-4 flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-bold text-[#c4704b]">{exp.category}</div>
                                                <div className="text-[10px] text-[#44312a]">{exp.label}</div>
                                            </div>
                                            <div className="text-sm font-bold text-[#44312a] font-mono">{formatIDR(exp.amount)}</div>
                                        </div>
                                    ))}
                                    {/* Profit Mobile */}
                                    <div className="bg-[#44312a] p-4 flex justify-between items-center text-white">
                                        <span className="text-xs uppercase tracking-widest font-bold">Net Profit</span>
                                        <span className="text-lg font-bold font-mono">{formatIDR(netProfit)}</span>
                                    </div>
                                </div>

                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-[#fdf8f6]">
                                                <th className="px-6 py-3 font-bold text-[#8c7e7a] text-[10px] uppercase tracking-wider">Kategori</th>
                                                <th className="px-6 py-3 font-bold text-[#8c7e7a] text-[10px] uppercase tracking-wider">Item / Keperluan</th>
                                                <th className="px-6 py-3 font-bold text-[#8c7e7a] text-[10px] uppercase tracking-wider">Unit</th>
                                                <th className="px-6 py-3 font-bold text-[#8c7e7a] text-[10px] uppercase tracking-wider text-right">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-rose-50 border-dashed bg-rose-50/20">
                                                <td colSpan={4} className="px-6 py-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">Pemasukan</td>
                                            </tr>
                                            <tr className="border-b border-[#f3eee8]">
                                                <td className="px-6 py-4 font-bold text-[#7c8c6e]">Booking</td>
                                                <td className="px-6 py-4 text-[#44312a]">Total Pendapatan Sewa</td>
                                                <td className="px-6 py-4 text-[#8c7e7a] text-xs">
                                                    {selectedUnitFilter === 'all' ? 'Seluruh Unit' : `Hanya Unit ${villaUnits.find(u => u.id === selectedUnitFilter)?.label}`}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-bold text-[#7c8c6e]">{formatIDR(totalRevenue)}</td>
                                            </tr>
                                            <tr className="border-b border-rose-50 border-dashed bg-rose-50/20">
                                                <td colSpan={4} className="px-6 py-2 text-[10px] font-bold text-[#c4704b] uppercase tracking-widest">Pengeluaran</td>
                                            </tr>
                                            {filteredExpenses.map((exp) => (
                                                <tr key={exp.id} className="border-b border-[#f3eee8] hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-[#c4704b]">{exp.category}</td>
                                                    <td className="px-6 py-4 text-[#44312a]">{exp.label}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${exp.unitId ? 'bg-[#c4704b]/10 text-[#c4704b]' : 'bg-[#7c8c6e]/10 text-[#7c8c6e]'}`}>
                                                            {exp.unitId ? `Unit ${units.find(u => u.id === exp.unitId)?.label}` : 'Shared'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-[#44312a]">{formatIDR(exp.amount)}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-[#44312a] text-white font-bold">
                                                <td colSpan={3} className="px-6 py-4 text-right uppercase tracking-widest text-[10px]">Net Profit / Margin</td>
                                                <td className="px-6 py-4 text-right font-mono text-lg">{formatIDR(netProfit)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Analytics & Actions */}
                <div className="lg:w-1/3 space-y-6">
                    {/* Chart Placeholder */}
                    <div className="bk-card flex flex-col p-5">
                        <h4 className="text-sm font-bold text-[#44312a] mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-[#c4704b]" />
                            Trend Monthly Revenue
                        </h4>
                        <div className="h-48 flex items-end gap-3 px-2 pb-6 pt-2">
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
                    <div className="bk-card flex flex-col p-5 space-y-4">
                        <h4 className="text-sm font-bold text-[#44312a]">Quick Actions</h4>
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center gap-4 p-4 bg-[#7c8c6e]/5 hover:bg-[#7c8c6e]/10 border border-[#7c8c6e]/20 rounded-2xl transition-all group w-full text-left">
                                <div className="w-10 h-10 rounded-full bg-[#7c8c6e]/20 flex items-center justify-center text-[#7c8c6e] group-hover:scale-110 transition-transform flex-shrink-0">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#7c8c6e] uppercase tracking-wider block">Setoran</span>
                                    <span className="text-[9px] text-[#8c7e7a]">Input dana masuk</span>
                                </div>
                            </button>
                            <button className="flex items-center gap-4 p-4 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-2xl transition-all group w-full text-left">
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform flex-shrink-0">
                                    <ArrowDownRight size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Tagihan</span>
                                    <span className="text-[9px] text-[#8c7e7a]">Input dana keluar</span>
                                </div>
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
