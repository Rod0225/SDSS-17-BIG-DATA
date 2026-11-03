import React, { useState } from 'react';
import { X, Lock, Mail, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      login(res.access_token, res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-space-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl glow-cyan animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-900/40">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Acceso a la Plataforma SDSS-17</h2>
          <p className="text-xs text-slate-400 mt-1">Ingresa con tus credenciales seguras o selecciona una cuenta de prueba</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-700/50 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@sdss.astro"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Quick Credentials Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center mb-3">
            Cuentas Pre-configuradas de Demostración
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@sdss.astro', 'Admin123!')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-mono text-cyan-300 transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('analyst@sdss.astro', 'Analyst123!')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-mono text-purple-300 transition-colors"
            >
              🔬 Analista
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('viewer@sdss.astro', 'Viewer123!')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-mono text-slate-300 transition-colors"
            >
              🔭 Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

