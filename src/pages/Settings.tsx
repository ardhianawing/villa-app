import React, { useState } from 'react';
import {
    User,
    Bell,
    Shield,
    Settings as SettingsIcon,
    Check,
    Smartphone,
    Mail,
    Globe,
    Camera,
    Save,
    Clock
} from 'lucide-react';
import type { User as UserType, VillaSettings } from '../types';

interface SettingsProps {
    user: UserType;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'profil' | 'operasional' | 'notifikasi' | 'keamanan'>('profil');
    const [isSaved, setIsSaved] = useState(false);

    const [profile, setProfile] = useState({
        name: user.name,
        email: user.email,
        phone: '+62 812 3456 7890'
    });

    const [opSettings, setOpSettings] = useState<VillaSettings>({
        checkInTime: '14:00',
        checkOutTime: '12:00',
        whatsappNotifications: true,
        emailReports: false,
        currency: 'IDR'
    });

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const tabs = [
        { id: 'profil', label: 'Profil Saya', icon: User },
        { id: 'operasional', label: 'Operasional', icon: SettingsIcon },
        { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
        { id: 'keamanan', label: 'Keamanan', icon: Shield },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#44312a] font-display">Pengaturan</h1>
                    <p className="text-[#8c7e7a] text-sm">Kelola profil dan preferensi aplikasi</p>
                </div>
                {isSaved && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7c8c6e]/10 text-[#7c8c6e] rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-2">
                        <Check size={14} />
                        Perubahan Disimpan
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="md:w-64 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-[#c4704b] text-white shadow-md shadow-terracotta/20'
                                        : 'text-[#8c7e7a] hover:bg-white hover:text-[#44312a]'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bk-card flex flex-col p-6 lg:p-8 space-y-8 min-h-[500px]">

                        {activeTab === 'profil' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-[#f3eee8]">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-3xl bg-[#fdf8f6] border-2 border-[#d4c5b2] flex items-center justify-center text-[#c4704b] text-3xl font-bold overflow-hidden shadow-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-[#d4c5b2] rounded-xl text-[#44312a] shadow-sm hover:bg-[#fdf8f6] transition-colors">
                                            <Camera size={16} />
                                        </button>
                                    </div>
                                    <div className="text-center sm:text-left pt-2">
                                        <h3 className="text-lg font-bold text-[#44312a]">{user.name}</h3>
                                        <p className="text-xs text-[#8c7e7a] font-bold uppercase tracking-widest">{user.role}</p>
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#7c8c6e]/10 text-[#7c8c6e] rounded-full text-[10px] font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#7c8c6e] animate-pulse"></div>
                                            Akun Terverifikasi
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest px-1">Nama Lengkap</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4c5b2]" size={16} />
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#c4704b] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest px-1">Alamat Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4c5b2]" size={16} />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                readOnly
                                                className="w-full pl-10 pr-4 py-2 bg-[#fdf8f6]/50 border border-[#d4c5b2]/40 rounded-xl text-sm text-[#8c7e7a] outline-none cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest px-1">Nomor WhatsApp</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4c5b2]" size={16} />
                                            <input
                                                type="text"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#c4704b] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest px-1">Mata Uang</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4c5b2]" size={16} />
                                            <select
                                                className="w-full pl-10 pr-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#c4704b]"
                                                value={opSettings.currency}
                                                onChange={(e) => setOpSettings({ ...opSettings, currency: e.target.value })}
                                            >
                                                <option value="IDR">IDR (Rp)</option>
                                                <option value="USD">USD ($)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'operasional' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <h4 className="text-sm font-bold text-[#44312a] mb-4">Waktu Check-in & Check-out</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-[#fdf8f6] border border-[#d4c5b2] rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg text-[#7c8c6e] shadow-sm">
                                                    <Clock size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-[#8c7e7a]">Waktu Check-in</span>
                                            </div>
                                            <input
                                                type="time"
                                                value={opSettings.checkInTime}
                                                onChange={(e) => setOpSettings({ ...opSettings, checkInTime: e.target.value })}
                                                className="bg-transparent text-sm font-bold text-[#44312a] focus:outline-none"
                                            />
                                        </div>
                                        <div className="p-4 bg-[#fdf8f6] border border-[#d4c5b2] rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg text-[#c4704b] shadow-sm">
                                                    <Clock size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-[#8c7e7a]">Waktu Check-out</span>
                                            </div>
                                            <input
                                                type="time"
                                                value={opSettings.checkOutTime}
                                                onChange={(e) => setOpSettings({ ...opSettings, checkOutTime: e.target.value })}
                                                className="bg-transparent text-sm font-bold text-[#44312a] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-[#fdf8f6] border border-[#d4c5b2] rounded-2xl space-y-4">
                                    <h4 className="text-sm font-bold text-[#44312a]">Ketersediaan Unit Otomatis</h4>
                                    <p className="text-xs text-[#8c7e7a] leading-relaxed">
                                        Jika diaktifkan, unit akan otomatis berubah status menjadi "Maintenance" selama 2 jam setelah tamu check-out untuk proses pembersihan.
                                    </p>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-[#d4c5b2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c8c6e]"></div>
                                        </div>
                                        <span className="text-xs font-medium text-[#44312a]">Aktifkan Buffer Pembersihan</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifikasi' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white border border-[#f3eee8] rounded-2xl hover:border-[#d4c5b2] transition-all">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-[#7c8c6e]/10 rounded-xl text-[#7c8c6e]">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-[#44312a]">WhatsApp Notifications</h5>
                                                <p className="text-[10px] text-[#8c7e7a]">Kirim notifikasi booking baru ke nomor terdaftar</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={opSettings.whatsappNotifications}
                                                onChange={(e) => setOpSettings({ ...opSettings, whatsappNotifications: e.target.checked })}
                                            />
                                            <div className="w-10 h-5 bg-[#d4c5b2] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7c8c6e]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white border border-[#f3eee8] rounded-2xl hover:border-[#d4c5b2] transition-all">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-[#c4704b]/10 rounded-xl text-[#c4704b]">
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-[#44312a]">Weekly Financial Email</h5>
                                                <p className="text-[10px] text-[#8c7e7a]">Laporan keuangan mingguan otomatis ke Owner</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={opSettings.emailReports}
                                                onChange={(e) => setOpSettings({ ...opSettings, emailReports: e.target.checked })}
                                            />
                                            <div className="w-10 h-5 bg-[#d4c5b2] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c4704b]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'keamanan' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-sm">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest px-1">Password Saat Ini</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#c4704b]"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest px-1">Password Baru</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#c4704b]"
                                            placeholder="Min. 8 karakter"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8c7e7a] uppercase tracking-widest px-1">Konfirmasi Password Baru</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 bg-[#fdf8f6] border border-[#d4c5b2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#c4704b]"
                                            placeholder="Ulangi password baru"
                                        />
                                    </div>
                                    <button className="w-full py-3 bg-[#44312a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#2c1e19] transition-colors mt-4 shadow-lg shadow-black/10">
                                        Perbarui Password
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Save Button for profile/op/notifications */}
                        {activeTab !== 'keamanan' && (
                            <div className="mt-auto pt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#44312a] text-white rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:bg-[#2c1e19] transition-all"
                                >
                                    <Save size={18} />
                                    Simpan Perubahan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
