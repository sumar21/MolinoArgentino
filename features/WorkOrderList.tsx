
import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus, Priority, User, UserRole, WorkOrderType, Asset, WorkOrderOrigin } from '../types';
import { Calendar, User as UserIcon, AlertTriangle, Clock, Filter, Plus, CalendarClock, Wrench, Activity, LayoutList, LayoutGrid, X, Save, FileText, ChevronDown, Eye, CheckSquare, Image as ImageIcon, MapPin, Download } from 'lucide-react';

function exportR199CSV(orders: WorkOrder[]) {
  const header = ['Sector','Cargado','Nombre de la Maquinaria','Actividad a realizar','Fecha de Aviso','Responsable','Reparación temporal','Tiempo de reparación (hs)','Reparado','LIBERÓ','Observaciones'];
  const rows = orders.map(o => [
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
  const content = [header, ...rows].map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `R-199_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ORIGIN_LABELS: Record<string, string> = {
  [WorkOrderOrigin.DAILY_TASK]:  'Tareas del día',
  [WorkOrderOrigin.INSPECTION]:  'Relevamiento',
  [WorkOrderOrigin.THIRD_PARTY]: 'Terceros',
  [WorkOrderOrigin.PREVENTIVE]:  'Preventivo',
  [WorkOrderOrigin.MANUAL]:      'Manual',
};
const ORIGIN_COLORS: Record<string, string> = {
  [WorkOrderOrigin.DAILY_TASK]:  'bg-blue-100 text-blue-700',
  [WorkOrderOrigin.INSPECTION]:  'bg-amber-100 text-amber-700',
  [WorkOrderOrigin.THIRD_PARTY]: 'bg-purple-100 text-purple-700',
  [WorkOrderOrigin.PREVENTIVE]:  'bg-green-100 text-green-700',
  [WorkOrderOrigin.MANUAL]:      'bg-slate-100 text-slate-600',
};

interface WorkOrderListProps {
  orders: WorkOrder[];
  users: User[];
  assets: Asset[];
  onAssign: (orderId: string, technicianId: string) => void;
  onCreate: (order: WorkOrder) => void;
  onUpdate: (order: WorkOrder) => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({ orders, users, assets, onAssign, onCreate, onUpdate }) => {
  const [filterSpecialty, setFilterSpecialty] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [isClosingOrder, setIsClosingOrder] = useState(false);
  // Close/update form state
  const [closeComment, setCloseComment] = useState('');
  const [closeHours, setCloseHours] = useState('');
  const [closeReleasedBy, setCloseReleasedBy] = useState('');
  const [closeTempRepair, setCloseTempRepair] = useState(false);

  // Create Form State
  const [newOrderTitle, setNewOrderTitle] = useState('');
  const [newOrderDesc, setNewOrderDesc] = useState('');
  const [newOrderAsset, setNewOrderAsset] = useState('');
  const [newOrderPriority, setNewOrderPriority] = useState<Priority>(Priority.MEDIUM);
  const [newOrderSpecialty, setNewOrderSpecialty] = useState('Mecánica');
  const [newOrderDate, setNewOrderDate] = useState('');

  const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);
  const specialties = Array.from(new Set(technicians.map(t => t.specialty).filter(Boolean)));

  const sectors = Array.from(new Set(orders.map(o => o.sector).filter(Boolean)));

  const filteredOrders = orders.filter(order => {
    const matchesSpecialty = filterSpecialty === 'ALL' || order.specialtyRequired === filterSpecialty;
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesOrigin = filterOrigin === 'ALL' || order.origin === filterOrigin;
    const matchesSector = filterSector === 'ALL' || order.sector === filterSector;
    return matchesSpecialty && matchesStatus && matchesOrigin && matchesSector;
  });

  const openCloseModal = (order: WorkOrder) => {
    setSelectedOrder(order);
    setIsClosingOrder(true);
    setCloseComment(order.completionComment || '');
    setCloseHours(order.repairHours !== undefined ? String(order.repairHours) : '');
    setCloseReleasedBy(order.releasedBy || '');
    setCloseTempRepair(order.isTemporaryRepair || false);
  };

  const handleCloseOrder = () => {
    if (!selectedOrder) return;
    const updated: WorkOrder = {
      ...selectedOrder,
      status: WorkOrderStatus.COMPLETED,
      completionComment: closeComment,
      repairHours: closeHours ? parseFloat(closeHours) : undefined,
      releasedBy: closeReleasedBy,
      isTemporaryRepair: closeTempRepair,
      endTime: new Date().toISOString(),
    };
    onUpdate(updated);
    setIsClosingOrder(false);
    setSelectedOrder(null);
    alert('✅ Orden cerrada. El R-199 se actualizó automáticamente.');
  };

  const getPriorityConfig = (p: Priority) => {
    switch (p) {
      case Priority.CRITICAL: return { color: 'text-red-700 bg-red-50 border-red-100', label: 'Crítica', dot: 'bg-red-500' };
      case Priority.HIGH: return { color: 'text-orange-700 bg-orange-50 border-orange-100', label: 'Alta', dot: 'bg-orange-500' };
      case Priority.MEDIUM: return { color: 'text-yellow-700 bg-yellow-50 border-yellow-100', label: 'Media', dot: 'bg-yellow-500' };
      default: return { color: 'text-primary-700 bg-primary-50 border-primary-100', label: 'Baja', dot: 'bg-primary-500' };
    }
  };

  const getStatusConfig = (s: WorkOrderStatus) => {
    switch (s) {
      case WorkOrderStatus.COMPLETED: return { color: 'bg-emerald-100 text-emerald-800', label: 'Completada' };
      case WorkOrderStatus.IN_PROGRESS: return { color: 'bg-primary-100 text-primary-800', label: 'En Progreso' };
      default: return { color: 'bg-slate-100 text-slate-600', label: 'Pendiente' };
    }
  };

  const getTypeConfig = (type: WorkOrderType) => {
    if (type === WorkOrderType.PREVENTIVE) {
      return { 
        icon: CalendarClock, 
        text: 'Preventivo', 
        style: 'text-primary-600 bg-primary-50 border-primary-100' 
      };
    }
    return { 
      icon: Activity, 
      text: 'Correctivo', 
      style: 'text-amber-600 bg-amber-50 border-amber-100' 
    };
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderTitle || !newOrderAsset || !newOrderDate) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    const selectedAsset = assets.find(a => a.id === newOrderAsset);

    const newOrder: WorkOrder = {
      id: `ot-${Date.now()}`,
      title: newOrderTitle,
      description: newOrderDesc,
      assetId: newOrderAsset,
      assetName: selectedAsset?.name || 'Desconocido',
      type: WorkOrderType.CORRECTIVE, // Default for manual creation
      priority: newOrderPriority,
      status: WorkOrderStatus.PENDING,
      dueDate: newOrderDate,
      specialtyRequired: newOrderSpecialty,
    };

    onCreate(newOrder);
    setIsModalOpen(false);
    
    // Reset form
    setNewOrderTitle('');
    setNewOrderDesc('');
    setNewOrderAsset('');
    setNewOrderPriority(Priority.MEDIUM);
    setNewOrderDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Órdenes (OT)</h2>
          <p className="text-slate-500">Supervisión y asignación de tareas de mantenimiento.</p>
        </div>
        <div className="flex items-center gap-3">
            <button
              onClick={() => exportR199CSV(filteredOrders)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-600 hover:text-green-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
              title="Exportar R-199 como CSV"
            >
              <Download size={16} /> R-199 CSV
            </button>
            {/* View Toggle (Desktop Only) */}
            <div className="hidden md:flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Vista de Tabla"
                >
                    <LayoutList size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Vista de Tarjetas"
                >
                    <LayoutGrid size={18} />
                </button>
            </div>

            <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary-200 active:scale-95"
            >
            <Plus size={18} />
            Nueva OT
            </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center sticky top-0 z-10 backdrop-blur-xl bg-white/90">
        <div className="flex items-center gap-2 text-slate-500 px-2">
          <Filter size={18} />
          <span className="text-sm font-bold uppercase tracking-wide">Filtros</span>
        </div>
        
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <select
          className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 outline-none hover:bg-slate-50 transition-colors cursor-pointer"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Todos los Estados</option>
          <option value={WorkOrderStatus.PENDING}>Pendientes</option>
          <option value={WorkOrderStatus.IN_PROGRESS}>En Progreso</option>
          <option value={WorkOrderStatus.COMPLETED}>Completadas</option>
          <option value={WorkOrderStatus.BLOCKED}>Bloqueadas</option>
        </select>

        <select
          className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 outline-none hover:bg-slate-50 transition-colors cursor-pointer"
          value={filterOrigin}
          onChange={(e) => setFilterOrigin(e.target.value)}
        >
          <option value="ALL">Todos los Orígenes</option>
          {Object.entries(ORIGIN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select
          className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 outline-none hover:bg-slate-50 transition-colors cursor-pointer"
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
        >
          <option value="ALL">Todos los Sectores</option>
          {sectors.map(s => <option key={s} value={s as string}>{s}</option>)}
        </select>

        <select
          className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 outline-none hover:bg-slate-50 transition-colors cursor-pointer"
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
        >
          <option value="ALL">Todas las Especialidades</option>
          {specialties.map(s => <option key={s} value={s as string}>{s}</option>)}
        </select>

        <div className="ml-auto text-xs text-slate-400 font-medium hidden md:block">
          Mostrando {filteredOrders.length} órdenes
        </div>
      </div>

      {/* TABLE VIEW (Desktop Default) */}
      <div className={`hidden md:block ${viewMode === 'grid' ? '!hidden' : ''}`}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs tracking-wider font-semibold">
                    <tr>
                        <th className="px-4 py-3">Origen</th>
                        <th className="px-4 py-3">Sector</th>
                        <th className="px-4 py-3">ID / Asunto</th>
                        <th className="px-4 py-3">Maquinaria</th>
                        <th className="px-4 py-3">Prioridad</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Responsable</th>
                        <th className="px-4 py-3 text-right">F. Aviso</th>
                        <th className="px-4 py-3 w-16 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(ot => {
                        const typeConfig = getTypeConfig(ot.type);
                        const priorityConfig = getPriorityConfig(ot.priority);
                        const statusConfig = getStatusConfig(ot.status);
                        const TypeIcon = typeConfig.icon;
                        
                        return (
                            <tr key={ot.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-4 py-3">
                                    {ot.origin ? (
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${ORIGIN_COLORS[ot.origin] || 'bg-slate-100 text-slate-600'}`}>
                                        {ORIGIN_LABELS[ot.origin] || ot.origin}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{ot.sector || '—'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors text-sm truncate max-w-[180px]" title={ot.title}>{ot.title}</span>
                                        {ot.needsScheduling && (
                                          <span className="text-[9px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded mt-0.5 w-fit">A PROGRAMAR</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 text-xs">
                                    <div className="flex flex-col">
                                      <span className="truncate max-w-[130px] font-medium" title={ot.assetName}>{ot.assetName}</span>
                                      {ot.contractor && <span className="text-purple-600 text-[10px] font-semibold">{ot.contractor}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${priorityConfig.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`}></span>
                                        {priorityConfig.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {ot.status === WorkOrderStatus.COMPLETED ? (
                                        <span className="text-xs font-medium text-slate-700">{ot.technicianName || ot.contractor || '—'}</span>
                                    ) : (
                                        <select
                                            className="w-full bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-md py-1.5 pl-2 pr-1 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                            value={ot.assignedTechnicianId || ''}
                                            onChange={(e) => onAssign(ot.id, e.target.value)}
                                        >
                                            <option value="">Sin asignar</option>
                                            {technicians.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-xs text-slate-500">{ot.reportDate || ot.dueDate}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center gap-1 justify-center">
                                      <button
                                          onClick={() => { setSelectedOrder(ot); setIsClosingOrder(false); }}
                                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all"
                                          title="Ver detalle"
                                      >
                                          <Eye size={14} />
                                      </button>
                                      {ot.status !== WorkOrderStatus.COMPLETED && (
                                        <button
                                            onClick={() => openCloseModal(ot)}
                                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-green-600 hover:border-green-200 transition-all"
                                            title="Cerrar OT"
                                        >
                                            <CheckSquare size={14} />
                                        </button>
                                      )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
             {filteredOrders.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-slate-50 rounded-full text-slate-300 mb-3">
                        <Filter size={32} />
                    </div>
                    <p className="text-slate-900 font-medium">No se encontraron órdenes</p>
                </div>
            )}
        </div>
      </div>

      {/* GRID VIEW (Mobile Default, Desktop Optional) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${viewMode === 'table' ? 'md:hidden' : ''}`}>
        {filteredOrders.map(ot => {
          const typeConfig = getTypeConfig(ot.type);
          const priorityConfig = getPriorityConfig(ot.priority);
          const statusConfig = getStatusConfig(ot.status);
          const TypeIcon = typeConfig.icon;

          return (
            <div key={ot.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-primary-200 transition-all duration-300 flex flex-col">
              
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex justify-between items-start mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${typeConfig.style}`}>
                        <TypeIcon size={14} />
                        {typeConfig.text}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setSelectedOrder(ot)}
                            className="p-1.5 bg-slate-50 text-slate-400 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                            <Eye size={16} />
                        </button>
                    </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary-600 transition-colors line-clamp-1" title={ot.title}>
                    {ot.title}
                </h3>
                
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3 font-medium">
                    <Wrench size={12} />
                    {ot.assetName}
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 h-10 leading-relaxed">
                    {ot.description}
                </p>
                
                <div className="mt-2 flex gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${priorityConfig.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`}></span>
                        {priorityConfig.label}
                    </span>
                    {ot.planId && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            PLAN
                        </span>
                    )}
                </div>
              </div>

              {/* Card Meta & Status */}
              <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar size={14} className="text-slate-400"/>
                    <span className={new Date(ot.dueDate) < new Date() && ot.status !== WorkOrderStatus.COMPLETED ? "text-red-600 font-bold" : ""}>
                        {ot.dueDate}
                    </span>
                 </div>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusConfig.color}`}>
                    {statusConfig.label}
                 </span>
              </div>

              {/* Assignment Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3">
                 <div className={`p-1.5 rounded-full ${ot.assignedTechnicianId ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                    <UserIcon size={16} />
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    {ot.status === WorkOrderStatus.COMPLETED ? (
                         <div className="text-xs font-bold text-slate-700 truncate">
                            {ot.technicianName}
                         </div>
                    ) : (
                        <select 
                            className="w-full bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer truncate"
                            value={ot.assignedTechnicianId || ''}
                            onChange={(e) => onAssign(ot.id, e.target.value)}
                        >
                            <option value="">Asignar Técnico...</option>
                            {technicians
                                .filter(t => t.specialty === ot.specialtyRequired)
                                .map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                            <option disabled className="bg-slate-100 text-xs">--- Otros ---</option>
                            {technicians
                                .filter(t => t.specialty !== ot.specialtyRequired)
                                .map(t => (
                                <option key={t.id} value={t.id}>{t.name} (Otr)</option>
                            ))}
                        </select>
                    )}
                    {ot.assignedTechnicianId && ot.status !== WorkOrderStatus.COMPLETED && (
                        <p className="text-[10px] text-primary-600 font-medium truncate">Asignado</p>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
        
        {filteredOrders.length === 0 && viewMode === 'grid' && (
             <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-dashed border-slate-300">
                <div className="p-4 bg-slate-50 rounded-full text-slate-300 mb-3">
                    <Filter size={32} />
                </div>
                <p className="text-slate-900 font-medium">No se encontraron órdenes</p>
             </div>
        )}
      </div>

      {/* CLOSE ORDER MODAL */}
      {isClosingOrder && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cerrar Orden de Trabajo</h3>
                <p className="text-sm text-slate-500 truncate max-w-sm">{selectedOrder.title}</p>
              </div>
              <button onClick={() => { setIsClosingOrder(false); setSelectedOrder(null); }} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiempo de reparación (hs)</label>
                  <input
                    type="number" step="0.5" min="0"
                    value={closeHours}
                    onChange={e => setCloseHours(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: 2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Liberó el equipo</label>
                  <input
                    type="text"
                    value={closeReleasedBy}
                    onChange={e => setCloseReleasedBy(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="temp-repair"
                  checked={closeTempRepair}
                  onChange={e => setCloseTempRepair(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600"
                />
                <label htmlFor="temp-repair" className="text-sm text-slate-700 font-medium">Reparación temporal</label>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observaciones</label>
                <textarea
                  value={closeComment}
                  onChange={e => setCloseComment(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Qué se hizo, repuestos usados, novedades..."
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => { setIsClosingOrder(false); setSelectedOrder(null); }} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleCloseOrder} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                <Save size={16} /> Cerrar OT
              </button>
            </div>
          </div>
        </div>
      )}

       {/* CREATE MODAL */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Nueva Orden de Trabajo</h3>
                <p className="text-sm text-slate-500">Generar ticket de mantenimiento correctivo o solicitud.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
                <form id="create-ot-form" onSubmit={handleCreateSubmit} className="space-y-6">
                    
                    {/* Title Section */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Título del Incidente <span className="text-red-500">*</span>
                        </label>
                        <input 
                            autoFocus
                            required
                            type="text" 
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                            placeholder="Ej. Ruido excesivo en bomba de agua"
                            value={newOrderTitle}
                            onChange={e => setNewOrderTitle(e.target.value)}
                        />
                    </div>

                    {/* Grid Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Asset Selection */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Activo Afectado <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Wrench className="absolute left-3 top-3 text-slate-400" size={18} />
                                <select 
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white appearance-none transition-all cursor-pointer"
                                    value={newOrderAsset}
                                    onChange={e => setNewOrderAsset(e.target.value)}
                                >
                                    <option value="">Seleccionar Equipo...</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none">
                                    <ChevronDown className="text-slate-400" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prioridad</label>
                            <div className="relative">
                                 <AlertTriangle className="absolute left-3 top-3 text-slate-400" size={18} />
                                <select 
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white appearance-none transition-all cursor-pointer"
                                    value={newOrderPriority}
                                    onChange={e => setNewOrderPriority(e.target.value as Priority)}
                                >
                                    <option value={Priority.LOW}>🟢 Baja</option>
                                    <option value={Priority.MEDIUM}>🟡 Media</option>
                                    <option value={Priority.HIGH}>🟠 Alta</option>
                                    <option value={Priority.CRITICAL}>🔴 Crítica</option>
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none">
                                    <ChevronDown className="text-slate-400" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Specialty */}
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Especialidad Sugerida</label>
                             <div className="relative">
                                <Activity className="absolute left-3 top-3 text-slate-400" size={18} />
                                <select 
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white appearance-none transition-all cursor-pointer"
                                    value={newOrderSpecialty}
                                    onChange={e => setNewOrderSpecialty(e.target.value)}
                                >
                                    <option value="Mecánica">Mecánica</option>
                                    <option value="Electricidad">Electricidad</option>
                                    <option value="Hidráulica">Hidráulica</option>
                                    <option value="Instrumentación">Instrumentación</option>
                                    <option value="General">General</option>
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none">
                                    <ChevronDown className="text-slate-400" size={16} />
                                </div>
                             </div>
                        </div>

                        {/* Due Date */}
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Fecha Límite <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input 
                                    required
                                    type="date"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white transition-all"
                                    value={newOrderDate}
                                    onChange={e => setNewOrderDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción Detallada</label>
                        <textarea 
                            className="w-full border border-slate-200 rounded-lg p-4 text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none h-32 resize-none bg-white transition-all placeholder:text-slate-400"
                            placeholder="Describa los síntomas, ruidos extraños, códigos de error, etc..."
                            value={newOrderDesc}
                            onChange={e => setNewOrderDesc(e.target.value)}
                        />
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl sticky bottom-0">
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    form="create-ot-form"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <Save size={18} />
                    Crear Orden
                </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             {/* Header */}
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-2xl sticky top-0 z-10">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">#{selectedOrder.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusConfig(selectedOrder.status).color}`}>
                        {getStatusConfig(selectedOrder.status).label}
                      </span>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedOrder.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
             </div>

             {/* Content */}
             <div className="p-6 overflow-y-auto space-y-8">
                {/* Meta Tags Row */}
                <div className="flex flex-wrap gap-4">
                     <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getTypeConfig(selectedOrder.type).style}`}>
                         {React.createElement(getTypeConfig(selectedOrder.type).icon, {size: 16})}
                         <span className="text-xs font-bold">{getTypeConfig(selectedOrder.type).text}</span>
                     </div>
                     <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getPriorityConfig(selectedOrder.priority).color}`}>
                         <AlertTriangle size={16} />
                         <span className="text-xs font-bold">{getPriorityConfig(selectedOrder.priority).label}</span>
                     </div>
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                         <Activity size={16} />
                         <span className="text-xs font-bold">{selectedOrder.specialtyRequired}</span>
                     </div>
                </div>

                {/* Main Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalles del Activo</h4>
                        <div className="flex items-start gap-3">
                             <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                 <Wrench size={24} />
                             </div>
                             <div>
                                 <p className="font-bold text-slate-900 text-lg">{selectedOrder.assetName}</p>
                                 <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                     <MapPin size={14} />
                                     <span>{assets.find(a => a.id === selectedOrder.assetId)?.location || 'Ubicación no disponible'}</span>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div>
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Asignación & Fechas</h4>
                         <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                 <UserIcon size={18} className="text-slate-400" />
                                 <span className="text-sm font-medium text-slate-700">
                                     {selectedOrder.assignedTechnicianId ? selectedOrder.technicianName : <span className="text-slate-400 italic">Sin asignar</span>}
                                 </span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <Calendar size={18} className="text-slate-400" />
                                 <span className="text-sm text-slate-600">
                                     Vencimiento: <span className="font-bold text-slate-800">{selectedOrder.dueDate}</span>
                                 </span>
                             </div>
                             {selectedOrder.startTime && (
                                 <div className="flex items-center gap-3">
                                     <Clock size={18} className="text-slate-400" />
                                     <span className="text-sm text-slate-600">
                                         Inicio: {new Date(selectedOrder.startTime).toLocaleDateString()}
                                     </span>
                                 </div>
                             )}
                         </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Descripción de la Tarea</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-sm">
                        {selectedOrder.description}
                    </div>
                </div>

                {/* Checklist (Read Only) */}
                {selectedOrder.checklist && selectedOrder.checklist.length > 0 && (
                     <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Checklist de Tareas</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {selectedOrder.checklist.map((task, idx) => (
                                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${task.completed ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100'}`}>
                                    <div className={`mt-0.5 ${task.completed ? 'text-green-600' : 'text-slate-300'}`}>
                                        <CheckSquare size={18} />
                                    </div>
                                    <span className={`text-sm ${task.completed ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                        {task.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                     </div>
                )}

                {/* Execution Report (If Completed) */}
                {selectedOrder.status === WorkOrderStatus.COMPLETED && (
                    <div className="border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-primary-600"/> Reporte de Cierre Técnico
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">Comentarios</span>
                                <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 min-h-[80px]">
                                    {selectedOrder.completionComment || "Sin comentarios adicionales."}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">Evidencia Fotográfica</span>
                                {selectedOrder.evidenceImageUrl ? (
                                    <div className="relative h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                                        <img 
                                            src={selectedOrder.evidenceImageUrl} 
                                            alt="Evidencia" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-white text-xs font-bold flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                <ImageIcon size={14} /> Ver Original
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-40 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                        <ImageIcon size={24} className="mb-2 opacity-50"/>
                                        <span className="text-xs">No se adjuntó evidencia</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-sm"
                >
                  Cerrar
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
