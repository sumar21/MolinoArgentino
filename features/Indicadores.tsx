import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, Gauge, Target, DollarSign, Link2,
} from 'lucide-react';
import {
  KPIS_TRANSVERSALES, PRODUCTIVIDAD_MENSUAL, PARADAS_POR_CAUSA,
  LUCRO_CESANTE_MENSUAL, SCRAP_POR_LINEA, RESUMEN_POR_AREA,
  type KpiTransversal, type EstadoKpi,
} from '../mock/indicadores';

const estadoColor: Record<EstadoKpi, string> = {
  bueno: 'text-emerald-600',
  alerta: 'text-amber-500',
  critico: 'text-red-500',
};
const estadoDot: Record<EstadoKpi, string> = {
  bueno: 'bg-emerald-500',
  alerta: 'bg-amber-400',
  critico: 'bg-red-500',
};
const estadoBadge: Record<EstadoKpi, string> = {
  bueno: 'bg-emerald-100 text-emerald-700',
  alerta: 'bg-amber-100 text-amber-700',
  critico: 'bg-red-100 text-red-700',
};

export const Indicadores: React.FC = () => (
  <div className="space-y-6 pb-8">
    {/* HEADER */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Indicadores / Eficiencia</h2>
        <p className="text-slate-500 text-sm">Tablero transversal de planta — productividad, paradas, scrap y cumplimiento de preventivos.</p>
      </div>
      <div className="flex gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
        <Activity size={14} className="text-primary-500" /> Período: Junio 2026
      </div>
    </div>

    {/* KPI GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {KPIS_TRANSVERSALES.map(kpi => <KpiBig key={kpi.id} kpi={kpi} />)}
    </div>

    {/* Productividad + cumplimiento preventivos */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-slate-400" /> Productividad vs. cumplimiento de preventivos
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRODUCTIVIDAD_MENSUAL}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} />
              <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => `${v}%`} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="productividad" name="Productividad" stroke="#a05b38" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="preventivos" name="Cumpl. preventivos" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Paradas por causa */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Paradas por causa</h3>
        <p className="text-xs text-slate-500 mb-4">Horas no programadas — mes actual</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PARADAS_POR_CAUSA} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="causa" width={95} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => `${v} h`} />
              <Bar dataKey="horas" name="Horas" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Lucro cesante (link a Mantenimiento) + scrap por línea */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DollarSign size={20} className="text-slate-400" /> Lucro cesante por paradas
          </h3>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
            <Link2 size={12} /> vincula con Mantenimiento
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Pérdida estimada por indisponibilidad ($ millones)</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={LUCRO_CESANTE_MENSUAL}>
              <defs>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => `$ ${v} M`} />
              <Area type="monotone" dataKey="monto" name="Lucro cesante" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorLucro)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Scrap / merma por línea</h3>
        <p className="text-xs text-slate-500 mb-4">% sobre total procesado</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SCRAP_POR_LINEA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="linea" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="scrap" name="Scrap %" fill="#a05b38" radius={[3, 3, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Resumen por área */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex items-center gap-2">
        <Gauge className="text-slate-400" size={20} />
        <h3 className="font-bold text-slate-800">Resumen por área</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Área</th>
              <th className="px-5 py-3 font-semibold text-center">OEE</th>
              <th className="px-5 py-3 font-semibold text-center">Cumpl. preventivos</th>
              <th className="px-5 py-3 font-semibold text-center">Scrap</th>
              <th className="px-5 py-3 font-semibold text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {RESUMEN_POR_AREA.map(r => (
              <tr key={r.area} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-700 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${estadoDot[r.estado]}`} /> {r.area}
                </td>
                <td className="px-5 py-3 text-center font-semibold text-slate-700">{r.oee}%</td>
                <td className="px-5 py-3 text-center text-slate-600">{r.cumplimiento}%</td>
                <td className="px-5 py-3 text-center text-slate-600">{r.scrap}%</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${estadoBadge[r.estado]}`}>
                    {r.estado === 'bueno' ? 'En meta' : r.estado === 'alerta' ? 'Atención' : 'Crítico'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const KpiBig: React.FC<{ kpi: KpiTransversal }> = ({ kpi }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-500">{kpi.titulo}</p>
        <h3 className={`text-3xl font-bold mt-1 ${estadoColor[kpi.estado]}`}>{kpi.valor}</h3>
      </div>
      <div className="flex items-center gap-1.5">
        {kpi.tendencia === 'up' && <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-1" /> {kpi.delta}</span>}
        {kpi.tendencia === 'down' && <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded"><TrendingDown size={12} className="mr-1" /> {kpi.delta}</span>}
        {kpi.tendencia === 'neutral' && <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"><Activity size={12} className="mr-1" /> {kpi.delta}</span>}
      </div>
    </div>
    <p className="text-xs text-slate-400 mt-3">{kpi.detalle}</p>
    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
      <Target size={13} className="text-slate-400" />
      <span className="text-[11px] font-semibold text-slate-500">{kpi.objetivo}</span>
    </div>
  </div>
);
