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
      <header className="h-16 border-b border-slate-800 bg-space-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 font-mono tracking-tight">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Dataset SDSS17 Activo (100k)
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                {user.full_name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-200">{user.full_name}</div>
                <div className="text-[10px] font-mono text-cyan-400">{user.role}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/40 transition-all hover:scale-105"
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

