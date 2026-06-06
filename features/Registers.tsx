import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus, MaintenancePlan, PreventiveLogEntry } from '../types';
import { FileText, Download, Filter } from 'lucide-react';

interface Props {
  workOrders: WorkOrder[];
  maintenancePlans: MaintenancePlan[];
  preventiveLogs: PreventiveLogEntry[];
}

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

const reparadoBadge = (status: WorkOrderStatus) =>
  status === WorkOrderStatus.COMPLETED
    ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs">✓</span>
    : <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400 font-bold text-xs">?</span>;

function exportCSV(rows: string[][], filename: string) {
  const content = rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const Registers: React.FC<Props> = ({ workOrders, maintenancePlans, preventiveLogs }) => {
  const [activeTab, setActiveTab] = useState<'r199' | 'r142'>('r199');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSector, setFilterSector] = useState('');

  // ── R-199 ───────────────────────────────────────────────────────────────────
  const sectors = Array.from(new Set(workOrders.map(o => o.sector).filter(Boolean)));

  const filteredOrders = workOrders.filter(o => {
    const monthMatch = filterMonth
      ? (o.reportDate || o.dueDate || '').startsWith(`2026-${filterMonth.padStart(2,'0')}`)
      : true;
    const sectorMatch = filterSector ? o.sector === filterSector : true;
    return monthMatch && sectorMatch;
  });

  const handleExportR199 = () => {
    const header = [
      'Sector','Cargado','Nombre de la Maquinaria','Actividad a realizar',
      'Fecha de Aviso','Responsable','Reparación temporal','Tiempo de reparación (hs)',
      'Reparado','LIBERÓ','Observaciones',
    ];
    const rows = filteredOrders.map(o => [
      o.sector || '',
      o.reportedBy || '',
      o.assetName,
      o.description,
      o.reportDate || o.dueDate || '',
      o.technicianName || o.contractor || '',
      o.isTemporaryRepair ? 'Sí' : 'No',
      String(o.repairHours ?? ''),
      o.status === WorkOrderStatus.COMPLETED ? 'x' : '?',
      o.releasedBy || '',
      o.completionComment || '',
    ]);
    exportCSV([header, ...rows], `R-199_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // ── R-142 ───────────────────────────────────────────────────────────────────
  const plansWithLogs = maintenancePlans.filter(p => p.registerCode && p.registerCode.startsWith('R-142'));

  const getLog = (planId: string, month: number) =>
    preventiveLogs.filter(l => l.planId === planId && l.month === month);

  const handleExportR142 = () => {
    const header = ['Sector','Elemento','Tarea','Registro','Frecuencia',
      ...MONTHS.flatMap(m => [`${m} Fecha`, `${m} Observaciones`, `${m} Responsable`])];
    const rows = plansWithLogs.map(p => {
      const base = [p.sector||'', p.element||'', p.task||'', p.registerCode||'', p.frequencyLabel||''];
      const monthCols = Array.from({length:12}, (_,i) => {
        const logs = getLog(p.id, i+1);
        return logs.length > 0
          ? [logs[0].date, logs[0].observations||'', logs[0].responsible||'']
          : ['','',''];
      }).flat();
      return [...base, ...monthCols];
    });
    exportCSV([header, ...rows], `R-142_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary-600 p-2 rounded-lg">
          <FileText className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Registros / Exportar</h1>
          <p className="text-slate-500 text-sm">Documentos controlados generados automáticamente</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('r199')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'r199' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          R-199 — Seguimiento de Trabajos
        </button>
        <button
          onClick={() => setActiveTab('r142')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'r142' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          R-142 — Registro de Preventivo
        </button>
      </div>

      {/* ── R-199 ─────────────────────────────────────────────────────────── */}
      {activeTab === 'r199' && (
        <div className="space-y-4">
          {/* Encabezado documento */}
          <div className="bg-slate-800 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">R-199 — Seguimiento de Trabajos de Mantenimiento</p>
              <p className="text-slate-400 text-xs mt-0.5">Revisión: 3 · Vigencia: 2026</p>
            </div>
            <button
              onClick={handleExportR199}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} /> Exportar CSV
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los meses</option>
              {MONTHS.map((m, i) => <option key={i} value={String(i+1)}>{m}</option>)}
            </select>
            <select
              value={filterSector}
              onChange={e => setFilterSector(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los sectores</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-xs text-slate-500">{filteredOrders.length} registros</span>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-left">
                  {['Sector','Cargado','Maquinaria','Actividad','Fecha Aviso','Responsable','Rep. Temp.','Tiempo (hs)','Reparado','Liberó','Observaciones'].map(h => (
                    <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{o.sector || '—'}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{o.reportedBy || '—'}</td>
                    <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap max-w-[140px] truncate" title={o.assetName}>{o.assetName}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-[180px]">
                      <span className="line-clamp-2">{o.description}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{o.reportDate || o.dueDate || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {o.contractor
                        ? <span className="text-purple-700 font-medium">{o.contractor}</span>
                        : <span className="text-slate-700">{o.technicianName || '—'}</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {o.isTemporaryRepair
                        ? <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs font-semibold">Sí</span>
                        : <span className="text-slate-400">No</span>}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-700">{o.repairHours ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{reparadoBadge(o.status)}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{o.releasedBy || '—'}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-[160px]">
                      <span className="line-clamp-2">{o.completionComment || '—'}</span>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                      No hay registros para el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── R-142 ─────────────────────────────────────────────────────────── */}
      {activeTab === 'r142' && (
        <div className="space-y-4">
          <div className="bg-slate-800 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">R-142 — Registro de Mantenimiento Preventivo</p>
              <p className="text-slate-400 text-xs mt-0.5">Revisión: 5 · Vigencia: 2026</p>
            </div>
            <button
              onClick={handleExportR142}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} /> Exportar CSV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '1200px' }}>
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-left border-b border-slate-200">
                  <th className="px-3 py-2.5 font-semibold sticky left-0 bg-slate-100 z-10 min-w-[120px]">Sector</th>
                  <th className="px-3 py-2.5 font-semibold min-w-[160px]">Elemento</th>
                  <th className="px-3 py-2.5 font-semibold min-w-[140px]">Tarea</th>
                  <th className="px-3 py-2.5 font-semibold">Reg.</th>
                  <th className="px-3 py-2.5 font-semibold">Frec.</th>
                  {MONTHS.map(m => (
                    <th key={m} className="px-2 py-2.5 font-semibold text-center">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plansWithLogs.map(p => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-medium text-slate-700 sticky left-0 bg-white">{p.sector || '—'}</td>
                      <td className="px-3 py-2 text-slate-700">{p.element || p.assetName}</td>
                      <td className="px-3 py-2 text-slate-600">{p.task || p.title}</td>
                      <td className="px-3 py-2">
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">{p.registerCode}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{p.frequencyLabel || '—'}</td>
                      {Array.from({length:12}, (_,i) => i+1).map(month => {
                        const isScheduled = p.scheduledMonths?.includes(month);
                        const logs = getLog(p.id, month);
                        const done = logs.length > 0;
                        return (
                          <td key={month} className="px-1 py-2 text-center">
                            {done ? (
                              <span
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs cursor-pointer"
                                title={`${logs[0].date} — ${logs[0].responsible}\n${logs[0].observations}`}
                              >
                                ✓
                              </span>
                            ) : isScheduled ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary-400 text-primary-500 font-bold text-xs">
                                ○
                              </span>
                            ) : (
                              <span className="text-slate-200 text-lg">·</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {plansWithLogs.length === 0 && (
                  <tr>
                    <td colSpan={17} className="px-4 py-8 text-center text-slate-400">
                      No hay planes con registro R-142
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold">✓</span>
              Ejecutado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary-400 text-primary-500 font-bold">○</span>
              Programado / pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-300 text-base">·</span>
              No aplica
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
