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
    AlertCircle
} from 'lucide-react';
import type { Villa, Unit } from '../types';

interface VillaManagementProps {
    villas: Villa[];
    units: Unit[];
    selectedVilla: string;
}

const VillaManagement: React.FC<VillaManagementProps> = ({
    villas,
    units,
    selectedVilla,
}) => {
    const currentVilla = villas.find(v => v.id === selectedVilla);
    const villaUnits = units.filter(u => u.villaId === selectedVilla);

    const [isEditingVilla, setIsEditingVilla] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

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
                                onClick={() => setIsEditingVilla(!isEditingVilla)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>

                        <div className="px-6 pb-6 -mt-10 relative">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-[#c4704b] mb-4">
                                <Building2 size={32} />
                            </div>

                            {isEditingVilla ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Nama Villa</label>
                                        <input type="text" defaultValue={currentVilla?.name} className="w-full mt-1 px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-lg text-sm text-[#44312a] focus:ring-1 focus:ring-[#c4704b] outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Alamat</label>
                                        <textarea defaultValue={currentVilla?.address} rows={3} className="w-full mt-1 px-3 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-lg text-sm text-[#44312a] focus:ring-1 focus:ring-[#c4704b] outline-none resize-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingVilla(false)} className="flex-1 py-2 bg-[#f3eee8] text-[#8c7e7a] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#e8dfd5]">Batal</button>
                                        <button className="flex-1 py-2 bg-[#c4704b] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#a65d3d] shadow-sm shadow-terracotta/20 flex items-center justify-center gap-2">
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

                                    <div className="pt-4 border-t border-[#f3eee8] space-y-2">
                                        <a href={currentVilla?.cctvLink || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-2">
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

                {/* Units Management */}
                <div className="lg:w-2/3 space-y-6">
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
                                            onClick={() => setEditingUnit(unit)}
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

                                {/* Visual Accent Decoration */}
                                <div className="absolute bottom-0 right-0 w-8 h-8 opacity-5">
                                    <Building2 size={32} />
                                </div>
                            </div>
                        ))}
                    </div>
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
                                <input type="text" defaultValue={editingUnit.label} className="w-full mt-1 px-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm text-[#44312a] font-bold focus:ring-1 focus:ring-[#c4704b] outline-none" />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Harga per Malam</label>
                                <div className="relative mt-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8c7e7a]">Rp</span>
                                    <input type="number" defaultValue={editingUnit.pricePerNight} className="w-full pl-10 pr-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm text-[#44312a] font-mono font-bold focus:ring-1 focus:ring-[#c4704b] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest pl-1">Status Operasional</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button className={`py-3 px-2 rounded-xl border-2 text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${editingUnit.status === 'AVAILABLE' ? 'border-[#7c8c6e] bg-[#7c8c6e]/5 text-[#7c8c6e]' : 'border-[#d4c5b2] text-[#8c7e7a] bg-white'}`}>
                                        <CheckCircle2 size={16} />
                                        Tersedia
                                    </button>
                                    <button className={`py-3 px-2 rounded-xl border-2 text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${editingUnit.status === 'MAINTENANCE' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-[#d4c5b2] text-[#8c7e7a] bg-white'}`}>
                                        <AlertCircle size={16} />
                                        Maintenance
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-[#fdf8f6] border-t border-[#f3eee8] flex gap-2">
                            <button
                                onClick={() => setEditingUnit(null)}
                                className="flex-1 py-3 bg-white border border-[#d4c5b2] text-[#8c7e7a] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#f3eee8] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                className="flex-1 py-3 bg-[#44312a] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#2c1e19] shadow-lg shadow-black/10 transition-colors"
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
