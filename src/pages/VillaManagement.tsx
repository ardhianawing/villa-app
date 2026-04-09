import React, { useState } from 'react';
import {
    Building2,
    Plus,
    Edit2,
    Trash2,
    Settings2,
    ExternalLink,
    Video,
    MapPin,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    Tag,
    Calendar,
    PlusCircle,
    Trash
} from 'lucide-react';
import type { Villa, Unit, PricingRule, PricingRuleType } from '../types';

interface VillaManagementProps {
    villas: Villa[];
    units: Unit[];
    selectedVilla: string;
    onUpdateVilla: (updated: Villa) => void;
    onUpdateUnit: (updated: Unit) => void;
    pricingRules: PricingRule[];
    onUpdatePricingRule: (updated: PricingRule) => void;
    onAddPricingRule: (rule: PricingRule) => void;
    onDeletePricingRule: (id: string) => void;
}

const VillaManagement: React.FC<VillaManagementProps> = ({
    villas,
    units,
    selectedVilla,
    onUpdateVilla,
    onUpdateUnit,
    pricingRules,
    onUpdatePricingRule,
    onAddPricingRule,
    onDeletePricingRule
}) => {
    const [activeTab, setActiveTab] = useState<'units' | 'pricing'>('units');
    const currentVilla = villas.find(v => v.id === selectedVilla);
    const villaUnits = units.filter(u => u.villaId === selectedVilla);

    const [isEditingVilla, setIsEditingVilla] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    // Form states
    const [villaForm, setVillaForm] = useState({ name: '', address: '' });
    const [unitForm, setUnitForm] = useState({ label: '', price: 0, status: 'AVAILABLE' as 'AVAILABLE' | 'MAINTENANCE' });

    const startEditVilla = () => {
        if (!currentVilla) return;
        setVillaForm({ name: currentVilla.name, address: currentVilla.address });
        setIsEditingVilla(true);
    };

    const handleSaveVilla = () => {
        if (!currentVilla) return;
        onUpdateVilla({
            ...currentVilla,
            name: villaForm.name,
            address: villaForm.address
        });
        setIsEditingVilla(false);
    };

    const startEditUnit = (unit: Unit) => {
        setEditingUnit(unit);
        setUnitForm({
            label: unit.label,
            price: unit.pricePerNight,
            status: unit.status
        });
    };

    const handleSaveUnit = () => {
        if (!editingUnit) return;
        onUpdateUnit({
            ...editingUnit,
            label: unitForm.label,
            pricePerNight: unitForm.price,
            status: unitForm.status
        });
        setEditingUnit(null);
    };

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
            {/* Header & Villa Info */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3 space-y-4">
                    <div className="bk-card overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-[#c4704b] to-[#a65d3d] relative">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                            <button
                                onClick={startEditVilla}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                        <div className="p-6 pt-4 relative">
                            {isEditingVilla ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Nama Villa</label>
                                        <input
                                            type="text"
                                            value={villaForm.name}
                                            onChange={e => setVillaForm({ ...villaForm, name: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-lg text-sm text-[#44312a] focus:ring-1 focus:ring-[#c4704b] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Alamat</label>
                                        <textarea
                                            value={villaForm.address}
                                            onChange={e => setVillaForm({ ...villaForm, address: e.target.value })}
                                            rows={3}
                                            className="w-full mt-1 px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-lg text-sm text-[#44312a] focus:ring-1 focus:ring-[#c4704b] outline-none resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingVilla(false)} className="flex-1 py-2 bg-[#f3eee8] text-[#8c7e7a] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#e8dfd5]">Batal</button>
                                        <button
                                            onClick={handleSaveVilla}
                                            className="flex-1 py-2 bg-[#c4704b] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#a65d3d] shadow-sm shadow-terracotta/20 flex items-center justify-center gap-2"
                                        >
                                            <Save size={14} /> Simpan
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#44312a]">{currentVilla?.name}</h2>
                                        <p className="text-xs text-[#8c7e7a] flex items-start gap-1.5 mt-1">
                                            <MapPin size={14} className="flex-shrink-0 text-[#c4704b]" />
                                            {currentVilla?.address}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 bg-[#7c8c6e]/10 text-[#7c8c6e] text-[10px] font-bold rounded-full border border-[#7c8c6e]/20 uppercase tracking-tight">Active</span>
                                        <span className="px-2.5 py-1 bg-[#fdf8f6] text-[#8c7e7a] text-[10px] font-bold rounded-full border border-[#d4c5b2] uppercase tracking-tight">{villaUnits.length} Units</span>
                                    </div>

                                    <div className="pt-4 border-t border-[#f3eee8]">
                                        <a href="#" className="flex items-center justify-between group p-3 bg-[#fdf8f6] hover:bg-[#c4704b]/5 rounded-2xl transition-all">
                                            <div className="flex items-center gap-3">
                                                <Video size={16} className="text-[#8c7e7a]" />
                                                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Akses CCTV</span>
                                            </div>
                                            <ExternalLink size={14} className="text-slate-400" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 bg-[#fdf8f6] rounded-3xl border border-[#d4c5b2] border-dashed">
                        <h4 className="text-sm font-bold text-[#44312a] mb-2 flex items-center gap-2">
                            <Settings2 size={16} className="text-[#c4704b]" />
                            Setup Info
                        </h4>
                        <p className="text-[10px] text-[#8c7e7a] leading-relaxed">
                            Semua info villa di atas akan ditampilkan pada dashboard Owner dan digunakan sebagai header pada invoice tamu.
                        </p>
                    </div>
                </div>

                {/* Right Content */}
                <div className="lg:w-2/3 space-y-6">
                    {/* Tabs Header */}
                    <div className="flex border-b border-[#f3eee8] mb-6 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('units')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'units' ? 'text-[#c4704b]' : 'text-[#8c7e7a]'}`}
                        >
                            Daftar Unit
                            {activeTab === 'units' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c4704b] rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'pricing' ? 'text-[#c4704b]' : 'text-[#8c7e7a]'}`}
                        >
                            <Tag size={16} />
                            Manajemen Harga
                            {activeTab === 'pricing' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c4704b] rounded-t-full"></div>}
                        </button>
                    </div>

                    {activeTab === 'units' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h3 className="text-lg font-bold text-[#44312a]">Daftar Unit Kavling</h3>
                                    <p className="text-xs text-[#8c7e7a]">Kelola harga dan ketersediaan unit individual</p>
                                </div>
                                <button className="flex items-center gap-2 bg-[#c4704b] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#a65d3d] transition-all shadow-sm shadow-terracotta/20">
                                    <Plus size={16} />
                                    Tambah Unit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {villaUnits.map((unit) => (
                                    <div key={unit.id} className="bk-card group relative p-5 hover:border-[#c4704b]/30 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unit.status === 'AVAILABLE' ? 'bg-[#7c8c6e]/10 text-[#7c8c6e]' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#44312a]">{unit.label}</h4>
                                                    <p className="text-[10px] font-mono font-bold text-[#c4704b]">#{unit.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditUnit(unit)}
                                                    className="p-1.5 hover:bg-[#fdf8f6] text-[#8c7e7a] hover:text-[#c4704b] rounded-lg transition-colors"
                                                    title="Edit Unit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="p-1.5 hover:bg-rose-50 text-[#8c7e7a] hover:text-rose-500 rounded-lg transition-colors" title="Hapus Unit">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-wider">Harga Default</span>
                                                <span className="text-sm font-bold text-[#44312a] font-mono">{formatIDR(unit.pricePerNight)}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-wider">Status Unit</span>
                                                <div className="flex items-center gap-1.5">
                                                    {unit.status === 'AVAILABLE' ? (
                                                        <>
                                                            <CheckCircle2 size={12} className="text-[#7c8c6e]" />
                                                            <span className="text-[11px] font-bold text-[#7c8c6e] uppercase tracking-tighter">Ready</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle size={12} className="text-amber-500" />
                                                            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-tighter">Maintenance</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h3 className="text-lg font-bold text-[#44312a]">Aturan Harga Dinamis</h3>
                                    <p className="text-xs text-[#8c7e7a]">Atur penyesuaian harga otomatis untuk weekend atau hari libur</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const newRule: PricingRule = {
                                            id: 'pr-' + Math.random().toString(36).substr(2, 9),
                                            villaId: selectedVilla,
                                            type: 'WEEKEND',
                                            label: 'Aturan Baru',
                                            adjustmentType: 'PERCENTAGE',
                                            adjustmentValue: 0,
                                            active: true,
                                            daysOfWeek: [5, 6]
                                        };
                                        onAddPricingRule(newRule);
                                    }}
                                    className="flex items-center gap-2 bg-[#c4704b] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#a65d3d] transition-all shadow-sm shadow-terracotta/20"
                                >
                                    <PlusCircle size={18} />
                                    Tambah Aturan
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pricingRules.filter(r => r.villaId === selectedVilla).map((rule) => (
                                    <div key={rule.id} className="bk-card flex flex-col p-5 space-y-4 border-2 border-transparent hover:border-[#d4c5b2]/30 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${rule.type === 'WEEKEND' ? 'bg-[#7c8c6e]/10 text-[#7c8c6e]' : 'bg-[#c4704b]/10 text-[#c4704b]'}`}>
                                                    {rule.type === 'WEEKEND' ? <Calendar size={20} /> : <Tag size={20} />}
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={rule.label}
                                                        onChange={(e) => onUpdatePricingRule({ ...rule, label: e.target.value })}
                                                        className="text-sm font-bold text-[#44312a] bg-transparent focus:outline-none border-b border-transparent hover:border-[#d4c5b2] focus:border-[#c4704b]"
                                                    />
                                                    <p className="text-[10px] text-[#8c7e7a] font-bold uppercase tracking-widest">{rule.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={rule.active}
                                                        onChange={(e) => onUpdatePricingRule({ ...rule, active: e.target.checked })}
                                                    />
                                                    <div className="w-10 h-5 bg-[#d4c5b2] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7c8c6e]"></div>
                                                </label>
                                                <button
                                                    onClick={() => onDeletePricingRule(rule.id)}
                                                    className="p-2 text-[#8c7e7a] hover:text-[#dc2626] transition-colors"
                                                    title="Hapus Aturan"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-2">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Tipe Aturan</label>
                                                <select
                                                    value={rule.type}
                                                    onChange={(e) => onUpdatePricingRule({ ...rule, type: e.target.value as PricingRuleType })}
                                                    className="w-full px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-xs font-bold text-[#44312a] focus:outline-none"
                                                >
                                                    <option value="WEEKEND">Weekend</option>
                                                    <option value="SEASONAL">Seasonal (Range)</option>
                                                    <option value="SPECIFIC_DATE">Tanggal Spesifik</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Penyesuaian</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={rule.adjustmentValue}
                                                        onChange={(e) => onUpdatePricingRule({ ...rule, adjustmentValue: parseFloat(e.target.value) || 0 })}
                                                        className="w-full px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-xs font-bold text-[#44312a] focus:outline-none"
                                                    />
                                                    <select
                                                        value={rule.adjustmentType}
                                                        onChange={(e) => onUpdatePricingRule({ ...rule, adjustmentType: e.target.value as any })}
                                                        className="w-20 px-2 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-xs font-bold text-[#44312a] focus:outline-none"
                                                    >
                                                        <option value="PERCENTAGE">%</option>
                                                        <option value="FIXED">IDR</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {rule.type !== 'WEEKEND' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Mulai</label>
                                                    <input
                                                        type="date"
                                                        value={rule.startDate || ''}
                                                        onChange={(e) => onUpdatePricingRule({ ...rule, startDate: e.target.value })}
                                                        className="w-full px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-xs font-bold text-[#44312a] focus:outline-none"
                                                    />
                                                </div>
                                                {rule.type === 'SEASONAL' && (
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest">Selesai</label>
                                                        <input
                                                            type="date"
                                                            value={rule.endDate || ''}
                                                            onChange={(e) => onUpdatePricingRule({ ...rule, endDate: e.target.value })}
                                                            className="w-full px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-xs font-bold text-[#44312a] focus:outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {rule.type === 'WEEKEND' && (
                                            <div className="flex gap-2 pt-2">
                                                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                                    const daysShort = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
                                                    const isActive = rule.daysOfWeek?.includes(day);
                                                    return (
                                                        <button
                                                            key={day}
                                                            onClick={() => {
                                                                const current = rule.daysOfWeek || [];
                                                                const next = current.includes(day)
                                                                    ? current.filter(d => d !== day)
                                                                    : [...current, day];
                                                                onUpdatePricingRule({ ...rule, daysOfWeek: next });
                                                            }}
                                                            className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${isActive ? 'bg-[#7c8c6e] text-white' : 'bg-[#fdf8f6] text-[#8c7e7a] border border-[#d4c5b2]'
                                                                }`}
                                                        >
                                                            {daysShort[day]}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Unit Modal (Overlay) */}
            {editingUnit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#44312a]/40 backdrop-blur-sm" onClick={() => setEditingUnit(null)}></div>

                    <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-[#f3eee8] flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-[#44312a]">Edit Unit {editingUnit.label}</h4>
                                <p className="text-[10px] text-[#8c7e7a] font-mono">ID: {editingUnit.id}</p>
                            </div>
                            <button
                                onClick={() => setEditingUnit(null)}
                                className="p-1.5 bg-[#fdf8f6] text-[#8c7e7a] hover:text-[#44312a] rounded-xl transition-colors"
                                title="Tutup"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Label Unit</label>
                                <input
                                    type="text"
                                    value={unitForm.label}
                                    onChange={e => setUnitForm({ ...unitForm, label: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm text-[#44312a] font-bold focus:ring-1 focus:ring-[#c4704b] outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Harga per Malam</label>
                                <div className="relative mt-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8c7e7a]">Rp</span>
                                    <input
                                        type="number"
                                        value={unitForm.price}
                                        onChange={e => setUnitForm({ ...unitForm, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full pl-10 pr-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm text-[#44312a] font-mono font-bold focus:ring-1 focus:ring-[#c4704b] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Status Operasional</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        onClick={() => setUnitForm({ ...unitForm, status: 'AVAILABLE' })}
                                        className={`py-3 px-2 rounded-xl border-2 text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${unitForm.status === 'AVAILABLE' ? 'border-[#7c8c6e] bg-[#7c8c6e]/5 text-[#7c8c6e]' : 'border-[#d4c5b2] text-[#8c7e7a] bg-white'}`}
                                    >
                                        <CheckCircle2 size={16} />
                                        Tersedia
                                    </button>
                                    <button
                                        onClick={() => setUnitForm({ ...unitForm, status: 'MAINTENANCE' })}
                                        className={`py-3 px-2 rounded-xl border-2 text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${unitForm.status === 'MAINTENANCE' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-[#d4c5b2] text-[#8c7e7a] bg-white'}`}
                                    >
                                        <AlertCircle size={16} />
                                        Maintenance
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-[#fdf8f6] border-t border-[#f3eee8] flex gap-2">
                            <button
                                onClick={() => setEditingUnit(null)}
                                className="flex-1 py-3 bg-white border border-[#d4c5b2] text-[#8c7e7a] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#f3eee8] transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveUnit}
                                className="flex-1 py-3 bg-[#44312a] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2c1e19] transition-all shadow-lg shadow-black/10"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillaManagement;
