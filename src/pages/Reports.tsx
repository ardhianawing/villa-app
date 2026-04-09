import React, { useState } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    Calendar,
    ArrowUpRight,
    Map,
    Download,
    Share2,
    CalendarDays,
    ChevronDown,
    Home
} from 'lucide-react';
import type { Booking, Villa, Unit } from '../types';

interface ReportsProps {
    bookings: Booking[];
    units: Unit[];
    villas: Villa[];
    selectedVilla: string;
}

const Reports: React.FC<ReportsProps> = ({
    bookings,
    units,
    villas,
    selectedVilla,
}) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '1y'>('30d');
    const [selectedUnit, setSelectedUnit] = useState<string>('all');

    // Filter Logic
    const villaUnits = units.filter(u => u.villaId === selectedVilla);
    const filteredBookings = bookings.filter(b => {
        const u = units.find(unit => unit.id === b.unitId);
        if (!u || u.villaId !== selectedVilla) return false;
        if (selectedUnit !== 'all' && b.unitId !== selectedUnit) return false;
        return true;
    });

    const currentVilla = villas.find(v => v.id === selectedVilla);

    // Stats Calculations
    const occupancyRate = 78; // Mocked for now
    const avgNights = 2.4;
    const repeatGuestRate = 18;
    const totalBookings = filteredBookings.length;

    // Revenue Source Data (Mock)
    const sourceData = [
        { name: 'WhatsApp', value: 45, color: '#25D366' },
        { name: 'Instagram', value: 25, color: '#E1306C' },
        { name: 'Traveloka', value: 15, color: '#0194F3' },
        { name: 'Airbnb', value: 10, color: '#FF5A5F' },
        { name: 'Lainnya', value: 5, color: '#8c7e7a' },
    ];

    return (
        <div className="space-y-6 pb-20 lg:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#44312a] font-display">Laporan & Analitik</h1>
                    <p className="text-[#8c7e7a] text-sm">
                        {selectedUnit === 'all'
                            ? `Wawasan performa untuk ${currentVilla?.name || 'Villa'}`
                            : `Performa Unit: Kavling ${villaUnits.find(u => u.id === selectedUnit)?.label}`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Unit Selector */}
                    <div className="relative">
                        <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7e7a]" />
                        <select
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-white border border-[#d4c5b2] rounded-xl text-sm font-medium text-[#44312a] shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c4704b]/20"
                        >
                            <option value="all">Semua Unit</option>
                            {villaUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>Kavling {unit.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c7e7a] pointer-events-none" />
                    </div>
                    {(['7d', '30d', '3m', '1y'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range
                                ? 'bg-[#c4704b] text-white shadow-sm'
                                : 'text-[#8c7e7a] hover:text-[#44312a]'
                                }`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bk-card flex flex-col justify-between p-5 group hover:border-[#c4704b]/30 transition-all min-h-[160px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#7c8c6e]/10 rounded-lg text-[#7c8c6e]">
                            <CalendarDays size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Occupancy Rate</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-[#44312a] font-mono">{occupancyRate}%</h3>
                        <span className="text-[10px] text-[#7c8c6e] font-bold flex items-center">
                            <ArrowUpRight size={12} className="mr-0.5" /> 5.2%
                        </span>
                    </div>
                    <div className="mt-4 w-full h-1.5 bg-[#f3eee8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7c8c6e]" style={{ width: `${occupancyRate}%` }}></div>
                    </div>
                </div>

                <div className="bk-card flex flex-col justify-between p-5 group hover:border-[#c4704b]/30 transition-all min-h-[160px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#c4704b]/10 rounded-lg text-[#c4704b]">
                            <TrendingUp size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Total Bookings</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-[#44312a] font-mono">{totalBookings}</h3>
                        <span className="text-[10px] text-[#c4704b] font-bold flex items-center">
                            <ArrowUpRight size={12} className="mr-0.5" /> 12
                        </span>
                    </div>
                    <p className="text-[10px] text-[#8c7e7a] mt-4 italic">Pesanan terkonfirmasi bulan ini</p>
                </div>

                <div className="bk-card flex flex-col justify-between p-5 group hover:border-[#c4704b]/30 transition-all min-h-[160px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                            <Calendar size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Avg. Stay</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-[#44312a] font-mono">{avgNights}</h3>
                        <span className="text-[10px] text-[#8c7e7a] font-medium ml-1">Malam</span>
                    </div>
                    <p className="text-[10px] text-[#8c7e7a] mt-4 italic">Rata-rata durasi menginap</p>
                </div>

                <div className="bk-card flex flex-col justify-between p-5 group hover:border-[#c4704b]/30 transition-all min-h-[160px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                            <Users size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Repeat Guests</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-[#44312a] font-mono">{repeatGuestRate}%</h3>
                        <span className="text-[10px] text-[#7c8c6e] font-bold flex items-center">
                            <ArrowUpRight size={12} className="mr-0.5" /> 2.1%
                        </span>
                    </div>
                    <div className="mt-4 flex gap-1">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 2 ? 'bg-purple-400' : 'bg-[#f3eee8]'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Unit Performance Chart */}
                <div className="lg:col-span-2 bk-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-bold text-[#44312a] flex items-center gap-2">
                            <BarChart3 size={18} className="text-[#c4704b]" />
                            Unit Performance Index
                        </h4>
                        <button className="text-[10px] font-bold text-[#c4704b] hover:underline uppercase tracking-wider">Detail Unit</button>
                    </div>

                    <div className="space-y-5">
                        {[
                            { label: 'Villa 1', val: 92, bookings: 14, color: '#7c8c6e' },
                            { label: 'Villa 14', val: 88, bookings: 11, color: '#c4704b' },
                            { label: 'Villa 5', val: 76, bookings: 9, color: '#7c8c6e' },
                            { label: 'Villa 3', val: 68, bookings: 8, color: '#7c8c6e' },
                            { label: 'Villa 10', val: 55, bookings: 6, color: '#d4c5b2' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-end mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#44312a]">{item.label}</span>
                                        <span className="text-[9px] text-[#8c7e7a] font-mono uppercase tracking-tighter bg-[#fdf8f6] px-1.5 py-0.5 rounded border border-[#f3eee8]">
                                            {item.bookings} bookings
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-[#44312a]">{item.val}%</span>
                                </div>
                                <div className="w-full h-2 bg-[#fdf8f6] rounded-full overflow-hidden border border-[#f3eee8]">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${item.val}%`, backgroundColor: item.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#f3eee8] flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#7c8c6e]"></div>
                                <span className="text-[10px] font-bold text-[#8c7e7a]">High Performing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#d4c5b2]"></div>
                                <span className="text-[10px] font-bold text-[#8c7e7a]">Needs Attention</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-[#8c7e7a] font-medium italic">* Berdasarkan tingkat okupansi 30 hari terakhir</p>
                    </div>
                </div>

                {/* Booking Source Breakdown */}
                <div className="bk-card p-6">
                    <h4 className="text-sm font-bold text-[#44312a] mb-8 flex items-center gap-2">
                        <PieChart size={18} className="text-[#c4704b]" />
                        Booking Source
                    </h4>

                    <div className="relative h-48 flex items-center justify-center mb-8">
                        {/* Simple CSS-based circular visualization wrapper */}
                        <div className="w-40 h-40 rounded-full border-[14px] border-[#fdf8f6] flex items-center justify-center relative">
                            <div className="text-center">
                                <div className="text-2xl font-bold font-mono text-[#44312a]">100%</div>
                                <div className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-tighter">Verified</div>
                            </div>

                            {/* Animated rings for visual effect */}
                            <div className="absolute inset-0 border-[14px] border-[#c4704b] rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)', transform: 'rotate(0deg)' }}></div>
                            <div className="absolute inset-0 border-[14px] border-[#7c8c6e] rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)', transform: 'rotate(45deg)' }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {sourceData.map((source) => (
                            <div key={source.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }}></div>
                                    <span className="text-xs font-medium text-[#44312a]">{source.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-[#44312a]">{source.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interactive Map/Location Insights placeholder */}
            <div className="bk-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-[#44312a] flex items-center gap-2">
                        <Map size={18} className="text-[#c4704b]" />
                        Guest Origin Insights
                    </h4>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white border border-[#d4c5b2] rounded-lg text-[#8c7e7a] hover:text-[#44312a] transition-all">
                            <Share2 size={16} />
                        </button>
                        <button className="p-2 bg-white border border-[#d4c5b2] rounded-lg text-[#8c7e7a] hover:text-[#44312a] transition-all">
                            <Download size={16} />
                        </button>
                    </div>
                </div>

                <div className="h-64 bg-[#fdf8f6] rounded-2xl border-2 border-dashed border-[#d4c5b2] flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#c4704b] mb-4">
                        <Map size={32} />
                    </div>
                    <h5 className="font-bold text-[#44312a] mb-1">Geographic Data Visualization</h5>
                    <p className="text-xs text-[#8c7e7a] max-w-sm">
                        Modul ini akan menampilkan peta asal tamu berdasarkan database nomor WhatsApp dan identitas KTP.
                        Fitur ini akan diaktifkan setelah integrasi API Maps selesai.
                    </p>
                    <button className="mt-6 px-6 py-2 bg-white border border-[#d4c5b2] rounded-xl text-[10px] font-bold text-[#44312a] uppercase tracking-widest hover:bg-[#f3eee8] transition-colors">
                        Request Early Access
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
