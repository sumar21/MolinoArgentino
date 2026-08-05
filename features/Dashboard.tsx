
import React, { useState } from 'react';
import { WorkOrder, InventoryItem, PurchaseRequest, MaintenancePlan, PreventiveLogEntry, WorkOrderType, Priority, WorkOrderStatus, PurchaseRequestStatus } from '../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  PackageX,
  ArrowRight,
  Clock,
  Briefcase,
  CalendarClock,
} from 'lucide-react';

const MONTHS_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

interface DashboardProps {
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
  purchaseRequests: PurchaseRequest[];
  maintenancePlans: MaintenancePlan[];
  preventiveLogs: PreventiveLogEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ workOrders, inventory, purchaseRequests, maintenancePlans, preventiveLogs }) => {
  const [activeView, setActiveView] = useState<'operativo' | 'preventivo'>('operativo');
  const currentMonth = new Date().getMonth() + 1;

  // --- KPI CALCULATIONS ---
  const totalOrders = workOrders.length;
  const completedOrders = workOrders.filter(wo => wo.status === WorkOrderStatus.COMPLETED).length;
  const pendingOrders = workOrders.filter(wo => wo.status !== WorkOrderStatus.COMPLETED).length;
  const completionRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;
  
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const monthlySpend = purchaseRequests
    .filter(pr => pr.status === PurchaseRequestStatus.COMPLETED || pr.status === PurchaseRequestStatus.PURCHASED)
    .reduce((acc, pr) => acc + pr.estimatedCost, 0);

  // --- DATA PREPARATION FOR CHARTS ---
  const categorySpend: Record<string, number> = {};
  purchaseRequests.forEach(pr => {
    if (pr.status !== PurchaseRequestStatus.REJECTED && pr.status !== PurchaseRequestStatus.PENDING_APPROVAL) {
      const item = inventory.find(i => i.id === pr.itemId);
      const cat = item ? item.category : 'Otros';
      categorySpend[cat] = (categorySpend[cat] || 0) + pr.estimatedCost;
    }
  });
  
  const spendChartData = Object.keys(categorySpend).map(cat => ({
    name: cat,
    value: categorySpend[cat]
  })).sort((a, b) => b.value - a.value);

  // Mock Data
  const activityData = [
    { day: 'Lun', creadas: 4, completadas: 2 },
    { day: 'Mar', creadas: 3, completadas: 5 },
    { day: 'Mié', creadas: 6, completadas: 4 },
    { day: 'Jue', creadas: 2, completadas: 3 },
    { day: 'Vie', creadas: 5, completadas: 6 },
    { day: 'Sáb', creadas: 1, completadas: 1 },
    { day: 'Dom', creadas: 0, completadas: 0 },
  ];

  const criticalWorkOrders = workOrders
    .filter(wo => (wo.priority === Priority.CRITICAL || wo.priority === Priority.HIGH) && wo.status !== WorkOrderStatus.COMPLETED)
    .slice(0, 5);

  // --- PREVENTIVE MONITORING ---
  // Tareas programadas hasta el mes actual
  const prevScheduled = maintenancePlans.reduce((acc, p) => {
    return acc + (p.scheduledMonths?.filter(m => m <= currentMonth).length ?? 0);
  }, 0);
  const prevExecuted = preventiveLogs.filter(l => l.month <= currentMonth).length;
  const prevRate = prevScheduled > 0 ? Math.round((prevExecuted / prevScheduled) * 100) : 100;
  const prevPending = prevScheduled - prevExecuted;

  // Por mes (hasta el actual)
  const prevByMonth = MONTHS_SHORT.slice(0, currentMonth).map((label, i) => {
    const m = i + 1;
    const sched = maintenancePlans.filter(p => p.scheduledMonths?.includes(m)).length;
    const exec = preventiveLogs.filter(l => l.month === m).length;
    return { mes: label, Programados: sched, Ejecutados: exec };
  });

  // Por sector
  const sectorMap: Record<string, { sched: number; exec: number }> = {};
  maintenancePlans.forEach(p => {
    const sec = p.sector || 'General';
    if (!sectorMap[sec]) sectorMap[sec] = { sched: 0, exec: 0 };
    const past = (p.scheduledMonths || []).filter(m => m <= currentMonth);
    sectorMap[sec].sched += past.length;
    sectorMap[sec].exec += preventiveLogs.filter(l => l.planId === p.id && past.includes(l.month)).length;
  });
  const sectorData = Object.entries(sectorMap)
    .map(([name, d]) => ({ name, Ejecutados: d.exec, Pendientes: Math.max(0, d.sched - d.exec) }))
    .sort((a, b) => b.Pendientes - a.Pendientes)
    .slice(0, 6);

  const KpiCard = ({ title, value, trend, trendValue, icon: Icon, colorClass, footer }: any) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass.replace('bg-', 'text-')} size={22} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        {trend === 'up' && <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-1"/> {trendValue}</div>}
        {trend === 'down' && <div className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded"><TrendingDown size={12} className="mr-1"/> {trendValue}</div>}
        {trend === 'neutral' && <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"><Activity size={12} className="mr-1"/> {trendValue}</div>}
        <span className="text-xs text-slate-400">{footer}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      
      {/* HEADER + BOTONERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {activeView === 'operativo' ? 'Centro de Comando' : 'Monitoreo Preventivo'}
          </h2>
          <p className="text-slate-500 text-sm">
            {activeView === 'operativo' ? 'Visión global del rendimiento operativo y financiero.' : `PL-006 — Cumplimiento acumulado al mes ${MONTHS_SHORT[currentMonth - 1]}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveView('operativo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'operativo'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity size={16} /> Operativo
            </button>
            <button
              onClick={() => setActiveView('preventivo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'preventivo'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalendarClock size={16} /> Preventivo
            </button>
          </div>
          <div className="flex gap-2 text-xs text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Clock size={14} /> {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {activeView === 'operativo' && <div className="space-y-6">

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Tasa de Resolución" 
          value={`${completionRate}%`} 
          trend="up" 
          trendValue="+5%"
          footer="vs. mes anterior"
          icon={CheckCircle2}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <KpiCard 
          title="Órdenes Activas" 
          value={pendingOrders}
          trend={pendingOrders > 5 ? "down" : "neutral"}
          trendValue={pendingOrders > 5 ? "+2" : "Estable"}
          footer="Pendientes de cierre"
          icon={Briefcase}
          colorClass="bg-primary-100 text-primary-600"
        />
        <KpiCard 
          title="Gasto Ejecutado" 
          value={`$${monthlySpend.toLocaleString()}`} 
          trend="up"
          trendValue="+12%"
          footer="vs. presupuesto"
          icon={DollarSign}
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <KpiCard 
          title="Alertas de Stock" 
          value={lowStockItems.length} 
          trend={lowStockItems.length > 0 ? "down" : "neutral"}
          trendValue={lowStockItems.length}
          footer="Items bajo mínimo"
          icon={AlertTriangle}
          colorClass="bg-amber-100 text-amber-600"
        />
      </div>

      {/* MAIN CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Chart (Left 2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-slate-400"/> Actividad Semanal
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorCreadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a05b38" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#a05b38" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}}/>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="creadas" name="OTs Creadas" stroke="#a05b38" strokeWidth={3} fillOpacity={1} fill="url(#colorCreadas)" />
                <Area type="monotone" dataKey="completadas" name="OTs Completadas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletadas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Categories (Right 1/3) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Gasto por Categoría</h3>
          <p className="text-xs text-slate-500 mb-4">Distribución de costos aprobados</p>
          <div className="flex-1 min-h-[250px]">
            {spendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={spendChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {spendChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#a05b38', '#b56f47', '#c5875e', '#d6a886'][index % 4]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <DollarSign size={48} className="mb-2 opacity-50"/>
                    <p className="text-sm">Sin datos de gastos aún</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONABLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Critical OTs List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={20}/> Atención Requerida
                </h3>
                <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-full">
                    {criticalWorkOrders.length} Críticas
                </span>
            </div>
            
            <div className="flex-1 overflow-x-auto">
                {criticalWorkOrders.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-50">
                            {criticalWorkOrders.map(wo => (
                                <tr key={wo.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="font-bold text-slate-800">{wo.title}</div>
                                        <div className="text-xs text-slate-500">{wo.assetName}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            wo.priority === Priority.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {wo.priority === Priority.CRITICAL ? 'Crítica' : 'Alta'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <span className="text-xs font-medium text-slate-400 group-hover:hidden">
                                            {wo.dueDate}
                                        </span>
                                        <button className="hidden group-hover:inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors">
                                            Ver <ArrowRight size={12} className="ml-1"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-slate-400">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400 opacity-50"/>
                        <p className="text-sm">¡Excelente! No hay órdenes críticas pendientes.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <PackageX className="text-amber-500" size={20}/> Stock Bajo Mínimo
                </h3>
                {lowStockItems.length > 0 && (
                     <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                        {lowStockItems.length} Ítems
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-x-auto">
                {lowStockItems.length > 0 ? (
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="px-5 py-2 font-semibold">Ítem</th>
                                <th className="px-5 py-2 font-semibold text-center">Disponible</th>
                                <th className="px-5 py-2 font-semibold text-center">Mínimo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {lowStockItems.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-700">
                                        {item.name}
                                        <div className="text-[10px] text-slate-400">{item.sku}</div>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="text-red-600 font-bold">{item.quantity}</span>
                                    </td>
                                    <td className="px-5 py-3 text-center text-slate-500">
                                        {item.minStock}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-slate-400">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400 opacity-50"/>
                        <p className="text-sm">Todo el inventario está en niveles óptimos.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
      </div>
      }

      {activeView === 'preventivo' &&
      <div className="space-y-5">

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`rounded-xl border shadow-sm p-5 flex flex-col items-center justify-center ${prevRate >= 80 ? 'bg-green-50 border-green-100' : prevRate >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-4xl font-bold ${prevRate >= 80 ? 'text-green-600' : prevRate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{prevRate}%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Cumplimiento global</p>
            <p className="text-[10px] text-slate-400 mt-0.5">al mes {MONTHS_SHORT[currentMonth - 1]}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-green-600">{prevExecuted}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Ejecutados</p>
            <p className="text-[10px] text-slate-400 mt-0.5">de {prevScheduled} programados</p>
          </div>
          <div className={`rounded-xl border shadow-sm p-5 flex flex-col items-center justify-center ${prevPending > 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-4xl font-bold ${prevPending > 0 ? 'text-amber-500' : 'text-slate-400'}`}>{prevPending}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Atrasados</p>
            <p className="text-[10px] text-slate-400 mt-0.5">meses pasados sin registrar</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-slate-700">{maintenancePlans.length}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Ítems en el plan</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PL-006 vigente</p>
          </div>
        </div>

        {/* ── Gráficos principales ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Ejecución mensual — más ancha */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700">Avance mensual</p>
              <span className="text-xs text-slate-400">Programados vs Ejecutados</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prevByMonth} barGap={2} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
                    formatter={(val: number, name: string) => [val, name]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Programados" name="Programados" fill="#e2e8f0" radius={[3,3,0,0]} />
                  <Bar dataKey="Ejecutados"  name="Ejecutados"  fill="#10b981" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* % por mes — barras horizontales de progreso */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-bold text-slate-700 mb-4">% avance por mes</p>
            <div className="space-y-2.5">
              {prevByMonth.map(({ mes, Programados, Ejecutados }) => {
                const pct = Programados > 0 ? Math.round((Ejecutados / Programados) * 100) : 100;
                const isCurrentMes = mes === MONTHS_SHORT[currentMonth - 1];
                return (
                  <div key={mes}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`text-xs font-semibold ${isCurrentMes ? 'text-primary-600' : 'text-slate-600'}`}>{mes}</span>
                      <span className={`text-xs font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {pct}% <span className="text-slate-400 font-normal">({Ejecutados}/{Programados})</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Cumplimiento por sector ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Barras horizontales */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-bold text-slate-700 mb-4">Cumplimiento por sector</p>
            <div className="space-y-3">
              {Object.entries(
                maintenancePlans.reduce<Record<string, { sched: number; exec: number }>>((acc, p) => {
                  const sec = p.sector || 'General';
                  if (!acc[sec]) acc[sec] = { sched: 0, exec: 0 };
                  const past = (p.scheduledMonths || []).filter(m => m <= currentMonth);
                  acc[sec].sched += past.length;
                  acc[sec].exec += preventiveLogs.filter(l => l.planId === p.id && past.includes(l.month)).length;
                  return acc;
                }, {})
              )
                .map(([sec, d]) => ({ sec, rate: d.sched > 0 ? Math.round((d.exec / d.sched) * 100) : 100, exec: d.exec, sched: d.sched }))
                .sort((a, b) => a.rate - b.rate)
                .map(({ sec, rate, exec, sched }) => (
                  <div key={sec}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[160px]">{sec}</span>
                      <span className={`text-xs font-bold ${rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {rate}% <span className="text-slate-400 font-normal">({exec}/{sched})</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.max(rate, 2)}%` }}
                      />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Tabla de atrasados */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">Ítems atrasados</p>
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                {maintenancePlans.filter(p =>
                  (p.scheduledMonths || []).some(m => m < currentMonth &&
                    !preventiveLogs.some(l => l.planId === p.id && l.month === m))
                ).length} pendientes
              </span>
            </div>
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-64">
              {maintenancePlans
                .flatMap(p =>
                  (p.scheduledMonths || [])
                    .filter(m => m < currentMonth && !preventiveLogs.some(l => l.planId === p.id && l.month === m))
                    .map(m => ({ plan: p, month: m }))
                )
                .sort((a, b) => a.month - b.month)
                .map(({ plan, month }) => (
                  <div key={`${plan.id}-${month}`} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{plan.element || plan.assetName}</p>
                      <p className="text-[10px] text-slate-400">{plan.sector} · {plan.task || plan.title}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {MONTHS_SHORT[month - 1]} pendiente
                    </span>
                  </div>
                ))
              }
              {maintenancePlans.every(p =>
                !(p.scheduledMonths || []).some(m => m < currentMonth &&
                  !preventiveLogs.some(l => l.planId === p.id && l.month === m))
              ) && (
                <div className="px-4 py-8 text-center text-slate-400">
                  <CheckCircle2 size={28} className="mx-auto mb-2 text-green-400 opacity-60" />
                  <p className="text-sm">Sin ítems atrasados</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      }

    </div>
  );
};
