import React, { useState } from 'react';
import { X, Lock, Mail, Shield, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 border border-sky-300 flex items-center justify-center text-sky-600 mb-3 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-wide">Acceso a la Plataforma SDSS-17</h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">Ingresa con tus credenciales seguras o selecciona una cuenta de prueba</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@sdss.astro"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 font-mono transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 font-mono transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-sky-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Quick Credentials Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <span className="block text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider text-center mb-3">
            Cuentas Pre-configuradas de Demostración
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@sdss.astro', 'Admin123!')}
              className="px-2 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-xs font-mono font-bold text-sky-800 transition-colors shadow-sm"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('analyst@sdss.astro', 'Analyst123!')}
              className="px-2 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-xs font-mono font-bold text-purple-800 transition-colors shadow-sm"
            >
              🔬 Analista
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('viewer@sdss.astro', 'Viewer123!')}
              className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-mono font-bold text-slate-800 transition-colors shadow-sm"
            >
              🔭 Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
