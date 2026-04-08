import React from 'react';
import { Building2, Star, Shield, TrendingUp } from 'lucide-react';
import type { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }}
      />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 shadow-lg">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">VillaPro</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sistem Manajemen Villa All-in-One
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { icon: Star, label: 'Multi Villa' },
            { icon: Shield, label: 'Aman & Terpercaya' },
            { icon: TrendingUp, label: 'Laporan Real-time' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-300"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <Icon size={12} className="text-primary-400" />
              {label}
            </div>
          ))}
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          }}
        >
          <h2 className="text-white text-xl font-semibold mb-2 text-center">Selamat Datang</h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            Pilih role untuk melanjutkan ke aplikasi
          </p>

          <div className="space-y-3">
            {/* Operator button */}
            <button
              onClick={() => onLogin('OPERATOR')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-all duration-150 shadow-lg cursor-pointer"
              style={{ boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' }}
            >
              <Shield size={18} />
              Masuk sebagai Operator
            </button>

            {/* Owner button */}
            <button
              onClick={() => onLogin('OWNER')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl text-white font-semibold text-sm transition-all duration-150 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              <Building2 size={18} />
              Masuk sebagai Owner
            </button>
          </div>

          <p className="text-slate-500 text-xs text-center mt-6">
            Mode demo — tidak diperlukan password
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Prototype v1.0 &copy; 2026 VillaPro
        </p>
      </div>
    </div>
  );
};

export default Login;
