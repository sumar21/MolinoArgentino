import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Egg, Eye, EyeOff, LogIn, Zap } from 'lucide-react';

interface Props {
  users: User[];
  onLogin: (user: User) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]:      'Jefatura de Planta',
  [UserRole.PLANNER]:    'Jefe de Mantenimiento',
  [UserRole.TECHNICIAN]: 'Operario de Mantenimiento',
  [UserRole.OPERATIONS]: 'Operaciones / Producción',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string; dot: string }> = {
  [UserRole.ADMIN]:      { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  [UserRole.PLANNER]:    { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', dot: 'bg-primary-500' },
  [UserRole.TECHNICIAN]: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  [UserRole.OPERATIONS]: { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-500' },
};

// Credenciales demo (usuario → contraseña)
const DEMO_CREDENTIALS: Record<string, string> = {
  'jefatura':     '1234',
  'mantenimiento':'1234',
  'walter':       '1234',
  'daniel':       '1234',
  'gonzalez':     '1234',
};

// Mapeo usuario de login → User del sistema
const LOGIN_MAP: Record<string, string> = {
  'jefatura':     'u1',
  'mantenimiento':'u2',
  'walter':       'u3',
  'daniel':       'u4',
  'gonzalez':     'u9',
};

// Accesos rápidos por rol (uno de cada rol)
const QUICK_ACCESS = [
  { userId: 'u1', username: 'jefatura',      label: 'Jefatura de Planta',        role: UserRole.ADMIN },
  { userId: 'u2', username: 'mantenimiento', label: 'Jefe de Mantenimiento',     role: UserRole.PLANNER },
  { userId: 'u3', username: 'walter',        label: 'Operario de Mantenimiento', role: UserRole.TECHNICIAN },
  { userId: 'u9', username: 'gonzalez',      label: 'Operaciones / Producción',  role: UserRole.OPERATIONS },
];

export const Login: React.FC<Props> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = (uid: string) => {
    const user = users.find(u => u.id === uid);
    if (user) {
      setLoading(true);
      setTimeout(() => onLogin(user), 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const key = username.trim().toLowerCase();
    if (DEMO_CREDENTIALS[key] && DEMO_CREDENTIALS[key] === password) {
      doLogin(LOGIN_MAP[key]);
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse overflow-hidden">

      {/* ── Panel derecho (ahora a la derecha): form ── */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-5">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-xl shadow-primary-900/40 mb-2">
            <Egg size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">App de Gestión</h1>
          <p className="text-slate-400 text-sm">Sistema de Mantenimiento · Molino Harinero</p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <p className="text-slate-300 text-sm font-medium">Iniciar sesión</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Usuario</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="jefatura, walter, gonzalez..."
                className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary-900/30 mt-1"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                : <LogIn size={17}/>
              }
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Accesos rápidos */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
              <Zap size={11} /> Acceso rápido (demo)
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACCESS.map(qa => {
              const colors = ROLE_COLORS[qa.role];
              const user = users.find(u => u.id === qa.userId);
              return (
                <button
                  key={qa.userId}
                  onClick={() => doLogin(qa.userId)}
                  disabled={loading}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${colors.bg} ${colors.border} hover:shadow-md transition-all text-left disabled:opacity-50`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user?.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/60"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${colors.dot}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${colors.text}`}>{user?.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-500 truncate leading-tight">{ROLE_LABELS[qa.role]}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-slate-600 text-[10px]">
            Contraseña demo: <span className="font-mono font-bold text-slate-400">1234</span>
          </p>
        </div>

      </div>
      </div>

      {/* ── Panel derecho: visual industrial ── */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0c1a2e 100%)'
      }}>

        {/* Grid de puntos decorativo */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        {/* Círculos de acento */}
        <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a05b38, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #834733, transparent 70%)' }} />

        {/* Contenido centrado */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Logo arriba */}
          <div className="flex items-center gap-3">
            <div className="bg-primary-600/20 border border-primary-500/30 p-2.5 rounded-xl">
              <Egg size={24} className="text-primary-400" />
            </div>
            <span className="text-white/60 font-semibold tracking-widest text-sm uppercase">App de Gestión</span>
          </div>

          {/* Centro: tagline grande */}
          <div className="space-y-6">
            <div>
              <p className="text-primary-400 text-sm font-bold uppercase tracking-widest mb-3">
                Gestión Operativa
              </p>
              <h2 className="text-white font-bold leading-tight" style={{ fontSize: '2.6rem' }}>
                Todo el control<br />
                <span className="text-transparent" style={{
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  backgroundImage: 'linear-gradient(90deg, #c5875e, #a05b38)'
                }}>de tu empresa</span>
                <br />en un lugar.
              </h2>
            </div>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Correctivos, preventivos, partes diarios y registros de auditoría — conectados y automatizados.
            </p>

            {/* Métricas horizontales */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'R-199',  label: 'Registro automático', icon: '📋' },
                { value: 'PL-006', label: 'Plan preventivo',     icon: '📅' },
                { value: '4 roles', label: 'Niveles de acceso', icon: '🔐' },
              ].map(m => (
                <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <p className="text-lg mb-0.5">{m.icon}</p>
                  <p className="text-white font-bold text-sm">{m.value}</p>
                  <p className="text-slate-500 text-[10px] leading-tight">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-500 text-xs">Sistema activo · Demo v1.0</span>
          </div>
        </div>
      </div>

    </div>
  );
};
