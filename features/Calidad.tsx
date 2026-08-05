import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts';
import {
  ShieldCheck, AlertTriangle, ClipboardCheck, CalendarCheck, BadgeCheck,
  FileWarning, ArrowLeft, ArrowRight, CheckCircle2, Clock, Activity,
  Gauge, ListChecks, FlaskConical, Search, AlertCircle, ChevronRight,
} from 'lucide-react';
import {
  CERTIFICACIONES, NO_CONFORMIDADES, REGISTROS_PROCESO, AUDITORIAS,
  CHECKLIST_AUDITORIA_EN_CURSO, NC_POR_MES,
  type Certificacion, type NoConformidad, type Severidad, type EstadoNC,
  type EstadoParametro, type RegistroProceso, type Auditoria,
} from '../mock/calidad';

type Tab = 'panel' | 'nc' | 'registros' | 'auditorias';

// ── Helpers de estilo (badges) ───────────────────────────────────────────────
const sevColor: Record<Severidad, string> = {
  'Crítica': 'bg-red-100 text-red-700',
  'Mayor': 'bg-orange-100 text-orange-700',
  'Menor': 'bg-amber-100 text-amber-700',
  'Observación': 'bg-slate-100 text-slate-600',
};

const estadoNCColor: Record<EstadoNC, string> = {
  'Abierta': 'bg-red-100 text-red-700',
  'En análisis': 'bg-amber-100 text-amber-700',
  'En ejecución': 'bg-primary-100 text-primary-700',
  'Verificación': 'bg-indigo-100 text-indigo-700',
  'Cerrada': 'bg-emerald-100 text-emerald-700',
};

const paramColor: Record<EstadoParametro, string> = {
  'OK': 'bg-emerald-100 text-emerald-700',
  'Alerta': 'bg-amber-100 text-amber-700',
  'Desvío': 'bg-red-100 text-red-700',
};

const certColor: Record<string, string> = {
  'Vigente': 'bg-emerald-100 text-emerald-700',
  'Por vencer': 'bg-amber-100 text-amber-700',
  'En recertificación': 'bg-primary-100 text-primary-700',
  'Vencida': 'bg-red-100 text-red-700',
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

export const Calidad: React.FC = () => {
  const [tab, setTab] = useState<Tab>('panel');
  const [selectedNC, setSelectedNC] = useState<NoConformidad | null>(null);

  // KPIs derivados
  const ncAbiertas = NO_CONFORMIDADES.filter(n => n.estado !== 'Cerrada').length;
  const ncCriticas = NO_CONFORMIDADES.filter(n => n.severidad === 'Crítica' && n.estado !== 'Cerrada').length;
  const desvios = REGISTROS_PROCESO.filter(r => r.estado === 'Desvío').length;
  const auditoriasProx = AUDITORIAS.filter(a => a.estado === 'Programada').length;
  const certPorVencer = CERTIFICACIONES.filter(c => c.estado === 'Por vencer' || c.estado === 'En recertificación').length;

  const TabButton = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: any }) => (
    <button
      onClick={() => { setTab(id); setSelectedNC(null); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calidad e Inocuidad</h2>
          <p className="text-slate-500 text-sm">
            Gestión ISO 22000 · ISO-TS 22002-1 · FSSC 22000 — inocuidad del huevo líquido y en polvo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner flex-wrap">
            <TabButton id="panel" label="Panel" icon={Gauge} />
            <TabButton id="nc" label="No Conformidades" icon={FileWarning} />
            <TabButton id="registros" label="Registros de Proceso" icon={FlaskConical} />
            <TabButton id="auditorias" label="Auditorías" icon={ClipboardCheck} />
          </div>
        </div>
      </div>

      {tab === 'panel' && <PanelCalidad
        ncAbiertas={ncAbiertas} ncCriticas={ncCriticas} desvios={desvios}
        auditoriasProx={auditoriasProx} certPorVencer={certPorVencer}
        onVerNC={() => setTab('nc')}
      />}

      {tab === 'nc' && !selectedNC && <ListaNC onSelect={setSelectedNC} />}
      {tab === 'nc' && selectedNC && <DetalleNC nc={selectedNC} onBack={() => setSelectedNC(null)} />}

      {tab === 'registros' && <RegistrosProceso />}
      {tab === 'auditorias' && <Auditorias />}
    </div>
  );
};

// ── PANEL — certificaciones + KPIs + tendencia ───────────────────────────────
const PanelCalidad: React.FC<{
  ncAbiertas: number; ncCriticas: number; desvios: number;
  auditoriasProx: number; certPorVencer: number; onVerNC: () => void;
}> = ({ ncAbiertas, ncCriticas, desvios, auditoriasProx, certPorVencer, onVerNC }) => (
  <div className="space-y-6">
    {/* KPI grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="No conformidades abiertas" value={ncAbiertas} icon={FileWarning} colorClass="bg-primary-100 text-primary-600" footer={`${ncCriticas} crítica(s)`} />
      <KpiCard title="Desvíos de proceso" value={desvios} icon={AlertTriangle} colorClass="bg-red-100 text-red-600" footer="PCC/PC fuera de límite" />
      <KpiCard title="Auditorías programadas" value={auditoriasProx} icon={CalendarCheck} colorClass="bg-indigo-100 text-indigo-600" footer="próximas 4 semanas" />
      <KpiCard title="Certificaciones a renovar" value={certPorVencer} icon={BadgeCheck} colorClass="bg-amber-100 text-amber-600" footer="por vencer / en ciclo" />
    </div>

    {/* Certificaciones */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex items-center gap-2">
        <ShieldCheck className="text-emerald-500" size={20} />
        <h3 className="font-bold text-slate-800">Estado de certificaciones</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
        {CERTIFICACIONES.map(cert => <CertCard key={cert.id} cert={cert} />)}
      </div>
    </div>

    {/* Tendencia NC + accesos */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-slate-400" /> No conformidades — abiertas vs. cerradas
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={NC_POR_MES} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Abiertas" name="Abiertas" fill="#ef4444" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Cerradas" name="Cerradas" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Próximos compromisos</h3>
        <p className="text-xs text-slate-500 mb-4">Calidad e inocuidad</p>
        <ul className="space-y-3 flex-1">
          {AUDITORIAS.filter(a => a.estado === 'Programada').slice(0, 3).map(a => (
            <li key={a.id} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500"><CalendarCheck size={16} /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{a.codigo} · {a.norma}</p>
                <p className="text-xs text-slate-400">{a.fecha} — {a.alcance}</p>
              </div>
            </li>
          ))}
          {CERTIFICACIONES.filter(c => c.diasParaVencer <= 60).map(c => (
            <li key={c.id} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-500"><Clock size={16} /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{c.norma}</p>
                <p className="text-xs text-slate-400">Vence en {c.diasParaVencer} días — {c.vencimiento}</p>
              </div>
            </li>
          ))}
        </ul>
        <button onClick={onVerNC} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">
          Ver no conformidades <ArrowRight size={14} />
        </button>
      </div>
    </div>
  </div>
);

const CertCard: React.FC<{ cert: Certificacion }> = ({ cert }) => (
  <div className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500 shrink-0"><BadgeCheck size={18} /></div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{cert.norma}</p>
          <p className="text-[11px] text-slate-400 truncate">{cert.organismo}</p>
        </div>
      </div>
      <Badge className={certColor[cert.estado]}>{cert.estado}</Badge>
    </div>
    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cert.nombre}</p>
    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
      <span>Vence: <span className="font-semibold text-slate-600">{cert.vencimiento}</span></span>
      <span>Próx. auditoría: <span className="font-semibold text-slate-600">{cert.proximaAuditoria}</span></span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full ${cert.diasParaVencer < 60 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${cert.cobertura}%` }} />
    </div>
    <p className="text-[10px] text-slate-400 mt-1">{cert.diasParaVencer} días para vencimiento · ciclo {cert.cobertura}%</p>
  </div>
);

// ── LISTA NO CONFORMIDADES ───────────────────────────────────────────────────
const ListaNC: React.FC<{ onSelect: (nc: NoConformidad) => void }> = ({ onSelect }) => {
  const [filtro, setFiltro] = useState<'todas' | EstadoNC>('todas');
  const data = filtro === 'todas' ? NO_CONFORMIDADES : NO_CONFORMIDADES.filter(n => n.estado === filtro);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['todas', 'Abierta', 'En análisis', 'En ejecución', 'Verificación', 'Cerrada'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              filtro === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}>
            {f === 'todas' ? 'Todas' : f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Código</th>
                <th className="px-5 py-3 font-semibold">No conformidad</th>
                <th className="px-5 py-3 font-semibold">Origen</th>
                <th className="px-5 py-3 font-semibold text-center">Severidad</th>
                <th className="px-5 py-3 font-semibold text-center">Estado</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map(nc => (
                <tr key={nc.id} onClick={() => onSelect(nc)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-slate-700">{nc.codigo}</td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800">{nc.titulo}</div>
                    <div className="text-xs text-slate-400">{nc.sector} · {nc.fecha}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{nc.origen}</td>
                  <td className="px-5 py-3 text-center"><Badge className={sevColor[nc.severidad]}>{nc.severidad}</Badge></td>
                  <td className="px-5 py-3 text-center"><Badge className={estadoNCColor[nc.estado]}>{nc.estado}</Badge></td>
                  <td className="px-5 py-3 text-slate-600 text-xs">{nc.responsable}</td>
                  <td className="px-5 py-3 text-right">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors inline" />
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

// ── DETALLE NO CONFORMIDAD + CAPA ────────────────────────────────────────────
const capaEstadoColor: Record<string, string> = {
  'Pendiente': 'bg-slate-100 text-slate-600',
  'En curso': 'bg-primary-100 text-primary-700',
  'Completada': 'bg-emerald-100 text-emerald-700',
  'Verificada': 'bg-emerald-100 text-emerald-700',
};

const DetalleNC: React.FC<{ nc: NoConformidad; onBack: () => void }> = ({ nc, onBack }) => (
  <div className="space-y-5">
    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
      <ArrowLeft size={16} /> Volver al listado
    </button>

    {/* Cabecera */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm font-bold text-slate-700">{nc.codigo}</span>
            <Badge className={sevColor[nc.severidad]}>{nc.severidad}</Badge>
            <Badge className={estadoNCColor[nc.estado]}>{nc.estado}</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{nc.titulo}</h2>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Detectada: <span className="font-semibold text-slate-600">{nc.fecha}</span></p>
          <p>Vencimiento: <span className="font-semibold text-red-500">{nc.vencimiento}</span></p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-50 text-sm">
        <Field label="Origen" value={nc.origen} />
        <Field label="Sector" value={nc.sector} />
        <Field label="Responsable" value={nc.responsable} />
        <Field label="Cláusula" value={nc.clausula || '—'} />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Descripción + causa raíz */}
      <div className="space-y-5">
        <Panel icon={AlertCircle} iconClass="text-red-500" title="Descripción del desvío">
          <p className="text-sm text-slate-600 leading-relaxed">{nc.descripcion}</p>
        </Panel>

        <Panel icon={Search} iconClass="text-primary-500" title="Análisis de causa raíz">
          {nc.metodoAnalisis && (
            <p className="text-xs font-semibold text-slate-500 mb-2">Método: <span className="text-primary-600">{nc.metodoAnalisis}</span></p>
          )}
          {nc.causaRaiz
            ? <p className="text-sm text-slate-600 leading-relaxed mb-3">{nc.causaRaiz}</p>
            : <p className="text-sm text-slate-400 italic mb-3">Análisis en curso…</p>}
          {nc.porques && (
            <ol className="space-y-1.5 border-l-2 border-slate-100 pl-4">
              {nc.porques.map((p, i) => (
                <li key={i} className="text-xs text-slate-500 leading-relaxed">{p}</li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      {/* Acciones CAPA */}
      <Panel icon={ListChecks} iconClass="text-emerald-500" title="Acciones correctivas / preventivas (CAPA)">
        <div className="space-y-3">
          {nc.acciones.map(a => (
            <div key={a.id} className="border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{a.tipo}</span>
                <Badge className={capaEstadoColor[a.estado]}>{a.estado}</Badge>
              </div>
              <p className="text-sm text-slate-700">{a.descripcion}</p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>👤 {a.responsable}</span>
                <span>📅 {a.fechaCompromiso}</span>
              </div>
              {a.eficacia && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={13} className={a.eficacia === 'Eficaz' ? 'text-emerald-500' : 'text-amber-500'} />
                  <span className="text-slate-500">Eficacia: <span className="font-semibold">{a.eficacia}</span></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </div>
);

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
    <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
  </div>
);

const Panel: React.FC<{ icon: any; iconClass?: string; title: string; children: React.ReactNode }> = ({ icon: Icon, iconClass = 'text-slate-400', title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-5 border-b border-slate-50 flex items-center gap-2">
      <Icon className={iconClass} size={20} />
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── REGISTROS DE PROCESO (a pie de máquina) ──────────────────────────────────
const RegistrosProceso: React.FC = () => {
  const [open, setOpen] = useState<string | null>(REGISTROS_PROCESO[0]?.id ?? null);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50 text-primary-500"><FlaskConical size={18} /></div>
        <p className="text-sm text-slate-500">
          Registros de control durante el proceso — <span className="font-semibold text-slate-700">pasteurización, deshidratación, lavado y cascado</span>. Capturados a pie de máquina por turno.
        </p>
      </div>

      <div className="space-y-3">
        {REGISTROS_PROCESO.map(reg => <RegistroRow key={reg.id} reg={reg} open={open === reg.id} onToggle={() => setOpen(open === reg.id ? null : reg.id)} />)}
      </div>
    </div>
  );
};

const RegistroRow: React.FC<{ reg: RegistroProceso; open: boolean; onToggle: () => void }> = ({ reg, open, onToggle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left">
      <div className={`p-2.5 rounded-lg ${reg.estado === 'OK' ? 'bg-emerald-50 text-emerald-500' : reg.estado === 'Alerta' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
        <FlaskConical size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800">{reg.proceso}</span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{reg.tipoControl}</span>
        </div>
        <p className="text-xs text-slate-400">{reg.linea} · Lote {reg.lote} · {reg.registro}</p>
      </div>
      <div className="hidden md:block text-right text-xs text-slate-400">
        <p>Turno {reg.turno} · {reg.hora}</p>
        <p>{reg.operario}</p>
      </div>
      <Badge className={paramColor[reg.estado]}>{reg.estado}</Badge>
      <ChevronRight size={18} className={`text-slate-300 transition-transform ${open ? 'rotate-90' : ''}`} />
    </button>

    {open && (
      <div className="border-t border-slate-50 p-4 bg-slate-50/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 font-semibold">Parámetro</th>
                <th className="px-3 py-2 font-semibold text-center">Valor</th>
                <th className="px-3 py-2 font-semibold text-center">Límite / Spec</th>
                <th className="px-3 py-2 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reg.parametros.map((p, i) => (
                <tr key={i}>
                  <td className="px-3 py-2.5 font-medium text-slate-700">{p.nombre}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-slate-800">{p.valor}{p.unidad ? ` ${p.unidad}` : ''}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">{p.limite}</td>
                  <td className="px-3 py-2.5 text-center"><Badge className={paramColor[p.estado]}>{p.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reg.observaciones && (
          <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" /> {reg.observaciones}
          </p>
        )}
      </div>
    )}
  </div>
);

// ── AUDITORÍAS ───────────────────────────────────────────────────────────────
const audEstadoColor: Record<string, string> = {
  'Programada': 'bg-indigo-100 text-indigo-700',
  'En curso': 'bg-primary-100 text-primary-700',
  'Completada': 'bg-emerald-100 text-emerald-700',
  'Reprogramada': 'bg-amber-100 text-amber-700',
};

const ckColor: Record<string, string> = {
  'Conforme': 'bg-emerald-100 text-emerald-700',
  'No conforme': 'bg-red-100 text-red-700',
  'Observación': 'bg-amber-100 text-amber-700',
  'Pendiente': 'bg-slate-100 text-slate-600',
};

const Auditorias: React.FC = () => {
  const enCurso = AUDITORIAS.find(a => a.estado === 'En curso');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Calendario / listado */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-2">
          <CalendarCheck className="text-indigo-500" size={20} />
          <h3 className="font-bold text-slate-800">Calendario de auditorías</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {AUDITORIAS.map(a => <AuditoriaRow key={a.id} a={a} />)}
        </div>
      </div>

      {/* Checklist de la auditoría en curso */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <ListChecks className="text-primary-500" size={20} />
            <h3 className="font-bold text-slate-800">Checklist en curso</h3>
          </div>
          {enCurso && <p className="text-xs text-slate-400 mt-1">{enCurso.codigo} · {enCurso.norma} — avance {enCurso.avanceChecklist}%</p>}
        </div>
        {enCurso && (
          <div className="px-5 pt-4">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${enCurso.avanceChecklist}%` }} />
            </div>
          </div>
        )}
        <div className="divide-y divide-slate-50 p-2 flex-1 overflow-y-auto max-h-[420px]">
          {CHECKLIST_AUDITORIA_EN_CURSO.map(item => (
            <div key={item.id} className="px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{item.punto} · {item.requisito}</p>
              </div>
              <Badge className={ckColor[item.resultado]}>{item.resultado}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AuditoriaRow: React.FC<{ a: Auditoria }> = ({ a }) => (
  <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg w-14 h-14 shrink-0 border border-slate-100">
      <span className="text-[10px] font-bold uppercase text-slate-400">{a.fecha.slice(5, 7)}/{a.fecha.slice(2, 4)}</span>
      <span className="text-lg font-bold text-slate-700 leading-none">{a.fecha.slice(8, 10)}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold text-slate-800">{a.codigo}</span>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{a.tipo}</span>
      </div>
      <p className="text-xs text-slate-500">{a.norma} — {a.alcance}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">Líder: {a.auditorLider} · {a.duracionDias} día(s)</p>
    </div>
    <div className="hidden md:flex flex-col items-end gap-1 text-[11px]">
      {a.estado === 'Completada' || a.estado === 'En curso' ? (
        <div className="flex gap-1">
          {a.hallazgosMayores > 0 && <Badge className="bg-red-100 text-red-700">{a.hallazgosMayores} May</Badge>}
          {a.hallazgosMenores > 0 && <Badge className="bg-amber-100 text-amber-700">{a.hallazgosMenores} Men</Badge>}
          {a.observaciones > 0 && <Badge className="bg-slate-100 text-slate-600">{a.observaciones} Obs</Badge>}
          {a.hallazgosMayores + a.hallazgosMenores + a.observaciones === 0 && <Badge className="bg-emerald-100 text-emerald-700">Sin hallazgos</Badge>}
        </div>
      ) : null}
    </div>
    <Badge className={audEstadoColor[a.estado]}>{a.estado}</Badge>
  </div>
);
