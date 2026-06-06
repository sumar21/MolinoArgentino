import React, { useState, useMemo } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderOrigin, Priority, User, DailyReport } from '../types';
import { MessageSquare, Copy, Check, RefreshCw, Send, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

interface Props {
  users: User[];
  workOrders: WorkOrder[];
  dailyReports: DailyReport[];
  onCreate: (report: DailyReport, orders: WorkOrder[]) => void;
}

const PRIORITY_EMOJI: Record<Priority, string> = {
  [Priority.CRITICAL]: '🔴',
  [Priority.HIGH]:     '🟠',
  [Priority.MEDIUM]:   '🟡',
  [Priority.LOW]:      '⚪',
};

const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
const todayISO = new Date().toISOString().split('T')[0];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildMessage(orders: WorkOrder[], reportDate: string): string {
  const dateLabel = new Date(reportDate + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'
  });

  const pending = orders.filter(o =>
    o.status !== WorkOrderStatus.COMPLETED &&
    o.origin !== WorkOrderOrigin.THIRD_PARTY &&
    o.origin !== WorkOrderOrigin.PREVENTIVE
  );

  const inspections = orders.filter(o =>
    o.status !== WorkOrderStatus.COMPLETED &&
    o.origin === WorkOrderOrigin.INSPECTION
  );

  const thirdParty = orders.filter(o =>
    o.status !== WorkOrderStatus.COMPLETED &&
    o.origin === WorkOrderOrigin.THIRD_PARTY
  );

  const preventive = orders.filter(o =>
    o.status !== WorkOrderStatus.COMPLETED &&
    o.origin === WorkOrderOrigin.PREVENTIVE
  );

  const dailyTasks = orders.filter(o =>
    o.status !== WorkOrderStatus.COMPLETED &&
    o.origin === WorkOrderOrigin.DAILY_TASK
  );

  let msg = `*Tareas ${capitalize(dateLabel)}*\n\n`;

  if (dailyTasks.length > 0) {
    dailyTasks.forEach((o, i) => {
      const emoji = PRIORITY_EMOJI[o.priority] || '🟡';
      const assetPart = o.assetName ? `*${o.assetName}*` : '';
      const locPart = (o as any).location ? ` (${(o as any).location})` : '';
      const respPart = o.technicianName ? ` → ${o.technicianName}` : '';
      const urgente = o.needsScheduling ? ' _(a programar)_' : '';
      msg += `${i + 1}- ${emoji} ${assetPart}${locPart}: ${o.description}${respPart}${urgente}\n`;
    });
  } else {
    msg += '_Sin tareas del día pendientes._\n';
  }

  if (inspections.length > 0) {
    msg += `\n*Relevamiento de rodamientos:*\n`;
    inspections.forEach((o, i) => {
      const emoji = PRIORITY_EMOJI[o.priority] || '🟡';
      const assetPart = o.assetName ? `*${o.assetName}*` : '';
      const locPart = (o as any).location ? ` (${(o as any).location})` : '';
      const urgente = o.needsScheduling ? ' NO ES URGENTE' : '';
      msg += `${i + 1}- ${emoji} ${assetPart}${locPart}: ${o.description}${urgente}\n`;
    });
  }

  if (thirdParty.length > 0) {
    msg += `\n*Trabajos de y con terceros:*\n`;
    // Group by contractor
    const byContractor = thirdParty.reduce<Record<string, WorkOrder[]>>((acc, o) => {
      const key = o.contractor || 'Sin asignar';
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});
    Object.entries(byContractor).forEach(([contractor, tasks]) => {
      msg += `- *${contractor}:* `;
      msg += tasks.map(t => t.description).join('. ') + '\n';
    });
  }

  if (preventive.length > 0) {
    msg += `\n*Preventivos programados:*\n`;
    preventive.forEach((o, i) => {
      msg += `${i + 1}- *${o.assetName}*: ${o.title}\n`;
    });
  }

  // Completed today
  const completedToday = orders.filter(o =>
    o.status === WorkOrderStatus.COMPLETED &&
    o.endTime?.startsWith(reportDate)
  );
  if (completedToday.length > 0) {
    msg += `\n✅ *Completados hoy:*\n`;
    completedToday.forEach(o => {
      msg += `- ${o.assetName}: ${o.title}`;
      if (o.repairHours) msg += ` (${o.repairHours} hs)`;
      msg += '\n';
    });
  }

  return msg.trim();
}

export const DailyReportModule: React.FC<Props> = ({ users, workOrders, dailyReports, onCreate }) => {
  const [reportDate, setReportDate] = useState(todayISO);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const activeOrders = useMemo(() =>
    workOrders.filter(o => o.dueDate <= reportDate || o.status !== WorkOrderStatus.COMPLETED),
    [workOrders, reportDate]
  );

  const generatedText = useMemo(() => buildMessage(activeOrders, reportDate), [activeOrders, reportDate]);

  const displayText = editMode ? customText : generatedText;

  const handleStartEdit = () => {
    setCustomText(generatedText);
    setEditMode(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(displayText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleSave = () => {
    const report: DailyReport = {
      id: `dr-${Date.now()}`,
      date: reportDate,
      rawText: displayText,
      createdWorkOrderIds: [],
    };
    onCreate(report, []);
    alert('✅ Parte guardado en el historial.');
  };

  // Stats
  const pendingCount = activeOrders.filter(o => o.status !== WorkOrderStatus.COMPLETED).length;
  const highPriorityCount = activeOrders.filter(o => o.status !== WorkOrderStatus.COMPLETED && (o.priority === Priority.HIGH || o.priority === Priority.CRITICAL)).length;
  const completedTodayCount = activeOrders.filter(o => o.status === WorkOrderStatus.COMPLETED && o.endTime?.startsWith(reportDate)).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="bg-primary-600 p-2 rounded-lg">
          <MessageSquare className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Parte Diario</h1>
          <p className="text-slate-500 text-sm">Mensaje listo para enviar por WhatsApp</p>
        </div>
      </div>

      {/* Fecha + stats */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha del parte</label>
          <input
            type="date"
            value={reportDate}
            onChange={e => { setReportDate(e.target.value); setEditMode(false); }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="text-center px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xl font-bold text-orange-600">{highPriorityCount}</p>
            <p className="text-xs text-orange-500 font-medium">Alta/Crítica</p>
          </div>
          <div className="text-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xl font-bold text-slate-700">{pendingCount}</p>
            <p className="text-xs text-slate-500 font-medium">Pendientes</p>
          </div>
          <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xl font-bold text-green-600">{completedTodayCount}</p>
            <p className="text-xs text-green-500 font-medium">Completadas hoy</p>
          </div>
        </div>
        <button
          onClick={() => setEditMode(false)}
          className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600 border border-slate-200 hover:border-primary-300 px-3 py-2 rounded-lg transition-colors"
          title="Regenerar desde OT"
        >
          <RefreshCw size={14} /> Regenerar
        </button>
      </div>

      {/* Mensaje */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <span className="text-sm font-semibold text-slate-700">
            {editMode ? 'Editando mensaje' : 'Mensaje generado'}
          </span>
          <div className="flex items-center gap-2">
            {!editMode && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit3 size={13} /> Editar
              </button>
            )}
            {editMode && (
              <button
                onClick={() => setEditMode(false)}
                className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                ← Descartar cambios
              </button>
            )}
          </div>
        </div>

        {editMode ? (
          <textarea
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 text-sm font-mono text-slate-800 focus:outline-none resize-y"
          />
        ) : (
          <pre className="px-4 py-4 text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
            {generatedText}
          </pre>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copiado!' : 'Copiar mensaje'}
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <Send size={18} /> Enviar por WhatsApp
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          Guardar en historial
        </button>
      </div>

      {/* Historial */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
        >
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Historial de partes guardados ({dailyReports.length})
        </button>
        {showHistory && (
          <div className="mt-3 space-y-2">
            {dailyReports.length === 0 && <p className="text-sm text-slate-400">Sin partes guardados.</p>}
            {dailyReports.map(dr => (
              <div key={dr.id} className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-700">{dr.date}</p>
                <pre className="mt-2 text-xs text-slate-500 whitespace-pre-wrap font-sans line-clamp-3">{dr.rawText}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
