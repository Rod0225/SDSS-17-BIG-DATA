import React, { useState } from 'react';
import { User, LogIn, Sparkles, Database, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle }) => {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-wide flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-600 font-mono font-medium tracking-tight">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Dataset SDSS17 Activo (100k)
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                {user.full_name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
                <div className="text-[10px] font-mono font-bold text-sky-700">{user.role}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};
