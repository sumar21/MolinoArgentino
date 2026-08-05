import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
  Factory, Droplets, Package, Gauge, Boxes, ArrowLeft, ChevronRight,
  Activity, CheckCircle2, CircleDot, GitBranch, ClipboardList,
} from 'lucide-react';
import {
  LINEAS, LOTES, PRODUCCION_POR_TURNO, PRODUCCION_SEMANAL, MIX_PRODUCTO,
  type Linea, type EstadoLinea, type Lote, type EstadoLote,
} from '../mock/produccion';

type Tab = 'panel' | 'lotes' | 'oee';

const PIE_COLORS = ['#a05b38', '#b56f47', '#c5875e', '#d6a886', '#e6c9b2'];

const lineaColor: Record<EstadoLinea, string> = {
  'En marcha': 'bg-emerald-100 text-emerald-700',
  'Parada': 'bg-red-100 text-red-700',
  'Setup / Cambio': 'bg-amber-100 text-amber-700',
  'Limpieza CIP': 'bg-primary-100 text-primary-700',
  'Mantenimiento': 'bg-indigo-100 text-indigo-700',
};

const loteColor: Record<EstadoLote, string> = {
  'En curso': 'bg-primary-100 text-primary-700',
  'Pausado': 'bg-amber-100 text-amber-700',
  'Finalizado': 'bg-slate-100 text-slate-600',
  'Liberado': 'bg-emerald-100 text-emerald-700',
  'Retenido': 'bg-red-100 text-red-700',
};

const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}>
    {children}
  </span>
);

const KpiCard = ({ title, value, icon: Icon, colorClass, footer }: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass.replace('bg-', 'text-')} size={22} />
      </div>
    </div>
    {footer && <span className="text-xs text-slate-400 mt-3">{footer}</span>}
  </div>
);

export const Produccion: React.FC = () => {
  const [tab, setTab] = useState<Tab>('panel');
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);

  const TabButton = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: any }) => (
    <button
      onClick={() => { setTab(id); setSelectedLote(null); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Producción</h2>
          <p className="text-slate-500 text-sm">Lotes en curso, rendimiento de líneas y trazabilidad — huevo líquido y en polvo.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner flex-wrap">
          <TabButton id="panel" label="Panel" icon={Gauge} />
          <TabButton id="lotes" label="Lotes" icon={Boxes} />
          <TabButton id="oee" label="Eficiencia / OEE" icon={Activity} />
        </div>
      </div>

      {tab === 'panel' && <PanelProduccion />}
      {tab === 'lotes' && !selectedLote && <ListaLotes onSelect={setSelectedLote} />}
      {tab === 'lotes' && selectedLote && <DetalleLote lote={selectedLote} onBack={() => setSelectedLote(null)} />}
      {tab === 'oee' && <PanelOEE />}
    </div>
  );
};

// ── PANEL ────────────────────────────────────────────────────────────────────
const PanelProduccion: React.FC = () => {
  const litrosHoy = PRODUCCION_POR_TURNO.reduce((a, t) => a + t.litrosLiquido, 0);
  const kgHoy = PRODUCCION_POR_TURNO.reduce((a, t) => a + t.kgPolvo, 0);
  const lotesCurso = LOTES.filter(l => l.estado === 'En curso').length;
  const oeeProm = Math.round(LINEAS.filter(l => l.estado === 'En marcha').reduce((a, l) => a + l.oee, 0) / Math.max(1, LINEAS.filter(l => l.estado === 'En marcha').length));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Huevo líquido (hoy)" value={`${litrosHoy.toLocaleString()} L`} icon={Droplets} colorClass="bg-primary-100 text-primary-600" footer={`${PRODUCCION_POR_TURNO.length} turnos`} />
        <KpiCard title="Huevo en polvo (hoy)" value={`${kgHoy.toLocaleString()} kg`} icon={Package} colorClass="bg-amber-100 text-amber-600" footer="secado spray" />
        <KpiCard title="Lotes en curso" value={lotesCurso} icon={Boxes} colorClass="bg-indigo-100 text-indigo-600" footer={`${LOTES.length} lotes activos`} />
        <KpiCard title="OEE líneas activas" value={`${oeeProm}%`} icon={Gauge} colorClass="bg-emerald-100 text-emerald-600" footer="promedio en marcha" />
      </div>

      {/* Estado de líneas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-2">
          <Factory className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">Estado de líneas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {LINEAS.map(l => <LineaCard key={l.id} l={l} />)}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-slate-400" /> Producción semanal
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PRODUCCION_SEMANAL}>
                <defs>
                  <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a05b38" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a05b38" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPolvo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => v.toLocaleString()} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="liquido" name="Líquido (L)" stroke="#a05b38" strokeWidth={3} fillOpacity={1} fill="url(#colorLiquido)" />
                <Area type="monotone" dataKey="polvo" name="Polvo (kg)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPolvo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Mix de producto</h3>
          <p className="text-xs text-slate-500 mb-4">Equivalente semanal (L/kg)</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={MIX_PRODUCTO} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {MIX_PRODUCTO.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Producción por turno */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Producción por turno (hoy)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PRODUCCION_POR_TURNO} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="turno" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => v.toLocaleString()} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="litrosLiquido" name="Líquido (L)" fill="#a05b38" radius={[3, 3, 0, 0]} />
              <Bar dataKey="kgPolvo" name="Polvo (kg)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const LineaCard: React.FC<{ l: Linea }> = ({ l }) => {
  const activa = l.estado === 'En marcha';
  return (
    <div className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <CircleDot size={14} className={activa ? 'text-emerald-500 animate-pulse' : 'text-slate-300'} />
          <p className="text-sm font-bold text-slate-800 truncate">{l.nombre}</p>
        </div>
        <Badge className={lineaColor[l.estado]}>{l.estado}</Badge>
      </div>
      <p className="text-xs text-slate-400 mb-3">{l.producto}{l.loteActual ? ` · ${l.loteActual}` : ''}</p>
      {activa ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">OEE</span>
            <span className={`text-sm font-bold ${l.oee >= 85 ? 'text-emerald-600' : l.oee >= 70 ? 'text-amber-500' : 'text-red-500'}`}>{l.oee}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${l.oee >= 85 ? 'bg-emerald-500' : l.oee >= 70 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${l.oee}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{l.velocidad}</p>
        </>
      ) : (
        <p className="text-[11px] text-slate-400 italic">Línea sin producción activa</p>
      )}
    </div>
  );
};

// ── LOTES ────────────────────────────────────────────────────────────────────
const ListaLotes: React.FC<{ onSelect: (l: Lote) => void }> = ({ onSelect }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
          <tr>
            <th className="px-5 py-3 font-semibold">Lote</th>
            <th className="px-5 py-3 font-semibold">Producto</th>
            <th className="px-5 py-3 font-semibold">Línea / Turno</th>
            <th className="px-5 py-3 font-semibold text-right">Cantidad</th>
            <th className="px-5 py-3 font-semibold">Avance</th>
            <th className="px-5 py-3 font-semibold text-center">Estado</th>
            <th className="px-5 py-3 font-semibold text-center">Calidad</th>
            <th className="px-5 py-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {LOTES.map(l => (
            <tr key={l.id} onClick={() => onSelect(l)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
              <td className="px-5 py-3 font-mono text-xs font-bold text-slate-700">{l.codigo}</td>
              <td className="px-5 py-3">
                <div className="font-semibold text-slate-800">{l.producto}</div>
                <div className="text-xs text-slate-400">{l.fecha}</div>
              </td>
              <td className="px-5 py-3 text-xs text-slate-500">{l.linea}<br /><span className="text-slate-400">Turno {l.turno}</span></td>
              <td className="px-5 py-3 text-right font-bold text-slate-700">{l.cantidad.toLocaleString()} {l.unidad}</td>
              <td className="px-5 py-3 w-32">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${l.avance}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{l.avance}%</span>
              </td>
              <td className="px-5 py-3 text-center"><Badge className={loteColor[l.estado]}>{l.estado}</Badge></td>
              <td className="px-5 py-3 text-center">
                {l.liberadoCalidad
                  ? <CheckCircle2 size={18} className="text-emerald-500 inline" />
                  : <span className="text-[10px] text-slate-400">pendiente</span>}
              </td>
              <td className="px-5 py-3 text-right"><ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors inline" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DetalleLote: React.FC<{ lote: Lote; onBack: () => void }> = ({ lote, onBack }) => {
  const t = lote.trazabilidad;
  const pasos = [
    { icon: ClipboardList, label: 'Recepción de huevo', value: t.loteRecepcion, sub: t.granjaOrigen },
    { icon: Droplets, label: 'Materia prima', value: lote.producto, sub: t.materiaPrima },
    { icon: Gauge, label: 'Pasteurización (PCC-1)', value: t.pasteurizacion || '—', sub: 'Punto crítico de control' },
    { icon: Package, label: 'Destino', value: t.destino, sub: `Responsable: ${t.responsable}` },
  ];

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} /> Volver a lotes
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm font-bold text-slate-700">{lote.codigo}</span>
              <Badge className={loteColor[lote.estado]}>{lote.estado}</Badge>
              {lote.liberadoCalidad && <Badge className="bg-emerald-100 text-emerald-700">Liberado calidad</Badge>}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{lote.producto}</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">{lote.cantidad.toLocaleString()} {lote.unidad}</p>
            <p className="text-xs text-slate-400">{lote.linea} · Turno {lote.turno} · {lote.fecha}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-2">
          <GitBranch className="text-primary-500" size={20} />
          <h3 className="font-bold text-slate-800">Trazabilidad del lote</h3>
        </div>
        <div className="p-6">
          <ol className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            {pasos.map((p, i) => (
              <li key={i} className="ml-6">
                <span className="absolute -left-[13px] flex items-center justify-center w-6 h-6 bg-primary-50 rounded-full ring-4 ring-white">
                  <p.icon size={13} className="text-primary-600" />
                </span>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{p.label}</p>
                <p className="text-sm font-semibold text-slate-800">{p.value}</p>
                <p className="text-xs text-slate-400">{p.sub}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

// ── OEE ──────────────────────────────────────────────────────────────────────
const PanelOEE: React.FC = () => {
  const activas = LINEAS.filter(l => l.estado === 'En marcha');
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">OEE por línea</h3>
        <p className="text-xs text-slate-500 mb-4">Disponibilidad × Rendimiento × Calidad (líneas en marcha)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activas} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="nombre" width={120} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="oee" name="OEE" fill="#a05b38" radius={[0, 4, 4, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-2">
          <Gauge className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">Desglose de eficiencia</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Línea</th>
                <th className="px-5 py-3 font-semibold text-center">Disponibilidad</th>
                <th className="px-5 py-3 font-semibold text-center">Rendimiento</th>
                <th className="px-5 py-3 font-semibold text-center">Calidad</th>
                <th className="px-5 py-3 font-semibold text-center">OEE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {LINEAS.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700">{l.nombre}<div className="text-[11px] text-slate-400">{l.producto}</div></td>
                  <td className="px-5 py-3 text-center text-slate-600">{l.estado === 'En marcha' ? `${l.disponibilidad}%` : '—'}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{l.estado === 'En marcha' ? `${l.rendimiento}%` : '—'}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{l.estado === 'En marcha' ? `${l.calidad}%` : '—'}</td>
                  <td className="px-5 py-3 text-center">
                    {l.estado === 'En marcha'
                      ? <span className={`font-bold ${l.oee >= 85 ? 'text-emerald-600' : l.oee >= 70 ? 'text-amber-500' : 'text-red-500'}`}>{l.oee}%</span>
                      : <Badge className={lineaColor[l.estado]}>{l.estado}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
