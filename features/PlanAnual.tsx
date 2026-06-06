import React, { useState, useMemo } from 'react';
import { MaintenancePlan, PreventiveLogEntry, User } from '../types';
import { Grid3X3, CheckCircle2, Clock, TrendingUp, ChevronRight, X, Save } from 'lucide-react';

interface Props {
  plans: MaintenancePlan[];
  preventiveLogs: PreventiveLogEntry[];
  users: User[];
  onLogPreventive: (entry: PreventiveLogEntry) => void;
}

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

// Modal para registrar ejecución sin usar window.prompt
interface LogModalState {
  open: boolean;
  planId: string;
  planLabel: string;
  month: number;
}

export const PlanAnual: React.FC<Props> = ({ plans, preventiveLogs, users, onLogPreventive }) => {
  const [filterSector, setFilterSector] = useState('');
  const [logModal, setLogModal] = useState<LogModalState>({ open: false, planId: '', planLabel: '', month: 0 });
  const [logObs, setLogObs] = useState('Sin novedades');
  const [logResponsible, setLogResponsible] = useState('');

  const sectors = useMemo(() => Array.from(new Set(plans.map(p => p.sector).filter(Boolean))).sort(), [plans]);

  const filteredPlans = filterSector ? plans.filter(p => p.sector === filterSector) : plans;

  // ── KPIs de monitoreo ────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    // Celdas programadas hasta el mes actual
    let scheduled = 0;
    let executed = 0;
    plans.forEach(p => {
      const months = p.scheduledMonths || [];
      const pastMonths = months.filter(m => m <= currentMonth);
      scheduled += pastMonths.length;
      executed += preventiveLogs.filter(l => l.planId === p.id && pastMonths.includes(l.month)).length;
    });
    const rate = scheduled > 0 ? Math.round((executed / scheduled) * 100) : 100;

    // Por sector
    const bySector: Record<string, { scheduled: number; executed: number }> = {};
    plans.forEach(p => {
      const sec = p.sector || 'Sin sector';
      if (!bySector[sec]) bySector[sec] = { scheduled: 0, executed: 0 };
      const pastMonths = (p.scheduledMonths || []).filter(m => m <= currentMonth);
      bySector[sec].scheduled += pastMonths.length;
      bySector[sec].executed += preventiveLogs.filter(l => l.planId === p.id && pastMonths.includes(l.month)).length;
    });

    // Por mes (hasta el actual)
    const byMonth = Array.from({ length: currentMonth }, (_, i) => {
      const m = i + 1;
      const sched = plans.filter(p => p.scheduledMonths?.includes(m)).length;
      const exec = preventiveLogs.filter(l => l.month === m).length;
      return { month: MONTHS[i], scheduled: sched, executed: exec };
    });

    return { rate, scheduled, executed, bySector, byMonth };
  }, [plans, preventiveLogs]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openLogModal = (plan: MaintenancePlan, month: number) => {
    setLogModal({ open: true, planId: plan.id, planLabel: `${plan.element || plan.assetName} — ${MONTHS[month - 1]}`, month });
    setLogObs('Sin novedades');
    setLogResponsible('');
  };

  const handleConfirmLog = () => {
    onLogPreventive({
      id: `pl-${Date.now()}`,
      planId: logModal.planId,
      date: new Date().toISOString().split('T')[0],
      observations: logObs,
      responsible: logResponsible,
      month: logModal.month,
    });
    setLogModal({ open: false, planId: '', planLabel: '', month: 0 });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary-600 p-2 rounded-lg">
          <Grid3X3 className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plan Anual — PL-006</h1>
          <p className="text-slate-500 text-sm">Matriz de mantenimiento preventivo {currentYear} · Registro R-142</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Cumplimiento acum.</p>
          <p className={`text-3xl font-bold ${kpis.rate >= 80 ? 'text-green-600' : kpis.rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
            {kpis.rate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">hasta {MONTHS[currentMonth - 1]}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Ejecutados</p>
          <p className="text-3xl font-bold text-green-600">{kpis.executed}</p>
          <p className="text-xs text-slate-400 mt-1">de {kpis.scheduled} programados</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Pendientes</p>
          <p className="text-3xl font-bold text-amber-500">{kpis.scheduled - kpis.executed}</p>
          <p className="text-xs text-slate-400 mt-1">atrasados o sin registrar</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Ítems en el plan</p>
          <p className="text-3xl font-bold text-slate-700">{plans.length}</p>
          <p className="text-xs text-slate-400 mt-1">actividades anuales</p>
        </div>
      </div>

      {/* Monitoreo por sector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Barra por sector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-600" /> Cumplimiento por sector
          </h3>
          <div className="space-y-3">
            {Object.entries(kpis.bySector)
              .sort((a, b) => {
                const rateA = a[1].scheduled > 0 ? a[1].executed / a[1].scheduled : 1;
                const rateB = b[1].scheduled > 0 ? b[1].executed / b[1].scheduled : 1;
                return rateA - rateB;
              })
              .map(([sec, data]) => {
                const rate = data.scheduled > 0 ? Math.round((data.executed / data.scheduled) * 100) : 100;
                return (
                  <div key={sec}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">{sec}</span>
                      <span className={`text-xs font-bold ${rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {rate}% ({data.executed}/{data.scheduled})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Barra por mes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary-600" /> Ejecución mensual
          </h3>
          <div className="space-y-2">
            {kpis.byMonth.map(({ month, scheduled, executed }) => {
              const rate = scheduled > 0 ? Math.round((executed / scheduled) * 100) : 100;
              const isCurrentMonth = MONTHS[currentMonth - 1] === month;
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-8 ${isCurrentMonth ? 'text-primary-600' : 'text-slate-500'}`}>{month}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.max(rate, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">{executed}/{scheduled}</span>
                  {rate === 100 && scheduled > 0 && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matriz */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-bold text-slate-700 text-sm">Matriz de ejecución {currentYear}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="inline-block w-4 h-4 rounded-full bg-green-100 text-green-700 text-center leading-4 font-bold mr-1">✓</span>ejecutado ·
              <span className="inline-block mx-1 w-4 h-4 rounded-full border-2 border-primary-400 text-primary-500 text-center text-[10px] leading-4 font-bold">○</span>programado — hacé clic para registrar ·
              <span className="text-slate-300 mx-1">·</span>no aplica
            </p>
          </div>
          <select
            value={filterSector}
            onChange={e => setFilterSector(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Todos los sectores</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-left border-b border-slate-200">
                <th className="px-3 py-2.5 font-semibold sticky left-0 bg-slate-50 z-10 min-w-[100px]">Sector</th>
                <th className="px-3 py-2.5 font-semibold min-w-[160px]">Elemento</th>
                <th className="px-3 py-2.5 font-semibold min-w-[130px]">Tarea</th>
                <th className="px-3 py-2.5 font-semibold">Reg.</th>
                <th className="px-3 py-2.5 font-semibold">Frec.</th>
                {MONTHS.map((m, i) => (
                  <th
                    key={m}
                    className={`px-1 py-2.5 font-semibold text-center w-11 ${i + 1 === currentMonth ? 'text-primary-600' : ''}`}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.map(p => {
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-slate-600 sticky left-0 bg-white text-[11px] border-r border-slate-100">{p.sector || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-700 text-[11px]">{p.element || p.assetName}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-[11px]">{p.task || p.title}</td>
                    <td className="px-3 py-2.5">
                      {p.registerCode && (
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold whitespace-nowrap">{p.registerCode}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap text-[11px]">{p.frequencyLabel || `${p.frequencyDays}d`}</td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                      const isScheduled = p.scheduledMonths?.includes(month) ?? false;
                      const log = preventiveLogs.find(l => l.planId === p.id && l.month === month);
                      const done = !!log;
                      const isCurrent = month === currentMonth;
                      const isPast = month < currentMonth;

                      return (
                        <td key={month} className={`px-1 py-2 text-center ${isCurrent ? 'bg-primary-50/30' : ''}`}>
                          {done ? (
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-xs cursor-default"
                              title={`${log.date}\n${log.responsible ? `Resp: ${log.responsible}` : ''}\n${log.observations || ''}`}
                            >✓</span>
                          ) : isScheduled ? (
                            <button
                              onClick={() => openLogModal(p, month)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 font-bold text-xs transition-all ${
                                isCurrent
                                  ? 'border-primary-500 text-primary-600 hover:bg-primary-100 shadow-sm shadow-primary-100'
                                  : isPast
                                  ? 'border-red-300 text-red-400 hover:bg-red-50'
                                  : 'border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-500'
                              }`}
                              title={`Registrar ${MONTHS[month - 1]}`}
                            >○</button>
                          ) : (
                            <span className="text-slate-100 select-none">·</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={17} className="py-10 text-center text-slate-400 text-sm">
                    No hay ítems para el sector seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Leyenda de colores de borde */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-6 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary-500 text-primary-600 font-bold text-[10px]">○</span>
            Mes actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-red-300 text-red-400 font-bold text-[10px]">○</span>
            Atrasado (mes pasado sin registrar)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-200 text-slate-300 font-bold text-[10px]">○</span>
            Próximo (mes futuro)
          </span>
        </div>
      </div>

      {/* Modal registrar ejecución */}
      {logModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <p className="font-bold text-slate-800">Registrar ejecución</p>
                <p className="text-xs text-slate-500 mt-0.5">{logModal.planLabel}</p>
              </div>
              <button onClick={() => setLogModal({ ...logModal, open: false })} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Responsable</label>
                <select
                  value={logResponsible}
                  onChange={e => setLogResponsible(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar...</option>
                  {users.filter(u => u.role !== 'ADMIN').map(u => (
                    <option key={u.id} value={u.name}>{u.name}{u.specialty ? ` (${u.specialty})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observaciones</label>
                <textarea
                  value={logObs}
                  onChange={e => setLogObs(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setLogModal({ ...logModal, open: false })} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleConfirmLog}
                disabled={!logResponsible}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg transition-colors"
              >
                <Save size={15} /> Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
