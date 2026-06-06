import React, { useState, useMemo } from 'react';
import { MaintenancePlan, User, WorkOrder, WorkOrderType, WorkOrderStatus, UserRole, InventoryItem, PreventiveLogEntry } from '../types';
import {
    CalendarClock, AlertCircle, Play, CheckSquare, Calendar, ChevronRight, ChevronDown, Filter,
    Search, User as UserIcon, History, BarChart3, CheckCircle2, AlertTriangle, Ban, Package, X, Save, ShoppingCart, PackageCheck, PackageX, CalendarRange
} from 'lucide-react';

interface PreventiveMaintenanceProps {
  plans: MaintenancePlan[];
  workOrders: WorkOrder[];
  users: User[];
  inventory: InventoryItem[];
  preventiveLogs: PreventiveLogEntry[];
  onGenerateOrders: (planIds: string[], technicianId?: string, specificDate?: string) => void;
  onRequestPurchase: (itemId: string, qty: number) => void;
  onLogPreventive: (entry: PreventiveLogEntry) => void;
}

interface MissingStockItem {
    itemId: string;
    itemName: string;
    sku: string;
    required: number;
    available: number;
    missing: number;
    affectedPlans: string[]; // Plan Titles
}

interface ProjectionItem {
    uniqueId: string;
    planId: string;
    date: string;
    rawDate: Date;
    title: string;
    assetName: string;
    frequency: number;
    specialty: string;
    hours: number;
    requiresDowntime?: boolean;
    stockStatus: string;
    missingParts: string[];
}

export const PreventiveMaintenance: React.FC<PreventiveMaintenanceProps> = ({
    plans, workOrders, users, inventory, preventiveLogs, onGenerateOrders, onRequestPurchase, onLogPreventive
}) => {
  const [viewDays, setViewDays] = useState(1);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [bulkTechnicianId, setBulkTechnicianId] = useState<string>('');
  
  // Group Collapse State
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [itemToSchedule, setItemToSchedule] = useState<{planId: string, title: string, originalDate: string} | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');

  // Stock Alert Modal State
  const [stockAlertOpen, setStockAlertOpen] = useState(false);
  const [missingStockItems, setMissingStockItems] = useState<MissingStockItem[]>([]);

  const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);

  // --- LOGIC: KPI CALCULATIONS ---
  const kpis = useMemo(() => {
    let theoreticalCount = 0;
    let realizedCount = 0;
    const machineCompliance: Record<string, { total: number, completed: number, name: string }> = {};

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - viewDays);
    
    if (viewDays === 1) {
        // Daily Logic
        plans.forEach(p => {
            const nextDue = new Date(p.nextDueDate);
            if (nextDue <= today) {
                theoreticalCount++;
                if (!machineCompliance[p.assetId]) {
                    machineCompliance[p.assetId] = { total: 0, completed: 0, name: p.assetName };
                }
                machineCompliance[p.assetId].total += 1;
            }
        });
    } else {
        // Range Logic (Approximation)
        plans.forEach(p => {
            const occurrences = Math.ceil(viewDays / p.frequencyDays);
            theoreticalCount += occurrences;
            
            if (!machineCompliance[p.assetId]) {
                machineCompliance[p.assetId] = { total: 0, completed: 0, name: p.assetName };
            }
            machineCompliance[p.assetId].total += occurrences;
        });
    }
    
    // Realized
    workOrders.forEach(wo => {
         const woDate = new Date(wo.endTime || wo.dueDate); 
         if (wo.type === WorkOrderType.PREVENTIVE && wo.status === WorkOrderStatus.COMPLETED && 
             woDate >= startDate && woDate <= today) {
             realizedCount++;
             if (machineCompliance[wo.assetId]) {
                machineCompliance[wo.assetId].completed += 1;
             }
         }
    });

    const complianceRate = theoreticalCount > 0 ? Math.round((realizedCount / theoreticalCount) * 100) : 100;

    // Sort machines by worst compliance
    const machineList = Object.values(machineCompliance)
        .map(m => ({ 
            ...m, 
            rate: m.total > 0 ? Math.round((m.completed / m.total) * 100) : 100 
        }))
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 5); 

    return { theoreticalCount, realizedCount, complianceRate, machineList };
  }, [plans, workOrders, viewDays]);

  // --- LOGIC: STOCK VALIDATION ---
  
  // 1. Simple check for UI display (list view)
  const checkStockAvailability = (plan: MaintenancePlan) => {
      if (!plan.requiredParts || plan.requiredParts.length === 0) return { status: 'none', details: [] };
      
      const missingParts: string[] = [];
      let hasEnough = true;

      plan.requiredParts.forEach(part => {
          const invItem = inventory.find(i => i.id === part.itemId);
          if (!invItem || invItem.quantity < part.quantity) {
              hasEnough = false;
              missingParts.push(`${part.itemName} (Faltan ${part.quantity - (invItem?.quantity || 0)})`);
          }
      });

      return { 
          status: hasEnough ? 'ok' : 'missing', 
          details: missingParts 
      };
  };

  // 2. Strict Batch Validation (When Clicking Generate)
  const validateBatchStock = (planIds: string[]) => {
      const consolidatedReqs: Record<string, { required: number, affectedPlans: string[] }> = {};
      
      // Aggregate requirements
      planIds.forEach(id => {
          const plan = plans.find(p => p.id === id);
          if (plan && plan.requiredParts) {
              plan.requiredParts.forEach(part => {
                  if (!consolidatedReqs[part.itemId]) {
                      consolidatedReqs[part.itemId] = { required: 0, affectedPlans: [] };
                  }
                  consolidatedReqs[part.itemId].required += part.quantity;
                  consolidatedReqs[part.itemId].affectedPlans.push(plan.title);
              });
          }
      });

      const missingItems: MissingStockItem[] = [];

      // Check against inventory
      Object.entries(consolidatedReqs).forEach(([itemId, reqData]) => {
          const invItem = inventory.find(i => i.id === itemId);
          const available = invItem ? invItem.quantity : 0;
          
          if (available < reqData.required) {
              missingItems.push({
                  itemId,
                  itemName: invItem?.name || 'Desconocido',
                  sku: invItem?.sku || 'N/A',
                  required: reqData.required,
                  available: available,
                  missing: reqData.required - available,
                  affectedPlans: reqData.affectedPlans
              });
          }
      });

      return missingItems;
  };

  // --- LOGIC: GENERATE PROJECTIONS (UPCOMING) ---
  const projections = useMemo((): ProjectionItem[] => {
    if (activeTab === 'history') return [];

    const items: ProjectionItem[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const endDate = new Date();
    endDate.setDate(today.getDate() + viewDays); // Range end

    plans.forEach(plan => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!plan.title.toLowerCase().includes(query) && !plan.assetName.toLowerCase().includes(query)) {
                return;
            }
        }

        let currentDate = new Date(plan.nextDueDate);
        currentDate.setHours(12,0,0,0); 
        
        while (currentDate <= endDate) {
            const stockCheck = checkStockAvailability(plan);
            
            items.push({
                uniqueId: `${plan.id}-${currentDate.toISOString()}`, 
                planId: plan.id,
                date: currentDate.toISOString().split('T')[0],
                rawDate: new Date(currentDate),
                title: plan.title,
                assetName: plan.assetName,
                frequency: plan.frequencyDays,
                specialty: plan.specialtyRequired,
                hours: plan.estimatedHours,
                requiresDowntime: plan.requiresDowntime,
                stockStatus: stockCheck.status,
                missingParts: stockCheck.details
            });
            
            currentDate.setDate(currentDate.getDate() + plan.frequencyDays);
            if (currentDate > endDate) break;
        }
    });

    return items.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  }, [plans, viewDays, searchQuery, activeTab, inventory]);

  // --- LOGIC: HISTORY (REALIZED) ---
  const historyItems = useMemo(() => {
    if (activeTab === 'upcoming') return [];

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - viewDays);

    return workOrders.filter(wo => {
        const woDate = new Date(wo.dueDate); 
        const matchesDate = woDate >= startDate && woDate <= today;
        const matchesType = wo.type === WorkOrderType.PREVENTIVE && wo.status === WorkOrderStatus.COMPLETED;
        
        let matchesSearch = true;
        if (searchQuery) {
             const query = searchQuery.toLowerCase();
             matchesSearch = wo.title.toLowerCase().includes(query) || wo.assetName.toLowerCase().includes(query);
        }

        return matchesDate && matchesType && matchesSearch;
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()); 

  }, [workOrders, viewDays, searchQuery, activeTab]);

  // Group projections by Date for better UI
  const groupByDate = (items: any[]) => {
    const groups: Record<string, any[]> = {};
    items.forEach(item => {
        const dateKey = activeTab === 'upcoming' 
            ? item.rawDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
            : new Date(item.dueDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(item);
    });
    return groups;
  };

  const groupedItems = groupByDate(activeTab === 'upcoming' ? projections : historyItems);

  // --- HANDLERS ---
  const toggleSelection = (uniqueId: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(uniqueId)) newSet.delete(uniqueId);
    else newSet.add(uniqueId);
    setSelectedItemIds(newSet);
  };

  const toggleGroupCollapse = (dateLabel: string) => {
      const newSet = new Set(collapsedGroups);
      if (newSet.has(dateLabel)) newSet.delete(dateLabel);
      else newSet.add(dateLabel);
      setCollapsedGroups(newSet);
  };

  const handleSelectAll = () => {
      const allUniqueIds = projections.map(p => p.uniqueId);
      const allSelected = allUniqueIds.length > 0 && allUniqueIds.every(id => selectedItemIds.has(id));
      
      if (allSelected) {
          setSelectedItemIds(new Set());
      } else {
          setSelectedItemIds(new Set(allUniqueIds));
      }
  };

  const isAllSelected = projections.length > 0 && projections.every(p => selectedItemIds.has(p.uniqueId));

  const handleBulkGenerate = () => {
    if (selectedItemIds.size === 0) return alert('Selecciona al menos un mantenimiento.');

    const selectedItems = projections.filter(p => selectedItemIds.has(p.uniqueId));
    
    // Validate Stock based on Plans involved
    const planIds: string[] = Array.from(new Set(selectedItems.map(p => p.planId)));
    const missing = validateBatchStock(planIds);

    if (missing.length > 0) {
        setMissingStockItems(missing);
        setStockAlertOpen(true);
        return;
    }

    // Group items by Date to ensure we generate orders for correct dates
    // If we select "Feb 12" task, we want the OT to be for "Feb 12" even if nextDueDate is earlier
    const itemsByDate: Record<string, string[]> = {};
    
    selectedItems.forEach(item => {
        if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
        itemsByDate[item.date].push(item.planId);
    });

    // Execute generation for each date group
    Object.entries(itemsByDate).forEach(([date, ids]) => {
        onGenerateOrders(ids, bulkTechnicianId || undefined, date);
    });

    setSelectedItemIds(new Set());
    setBulkTechnicianId('');
  };
  
  const openScheduleModal = (e: React.MouseEvent, item: any) => {
      e.stopPropagation();
      setItemToSchedule({
          planId: item.planId,
          title: item.title,
          originalDate: item.date
      });
      setNewScheduleDate(item.date);
      setScheduleModalOpen(true);
  };
  
  const confirmSchedule = () => {
      if (itemToSchedule && newScheduleDate) {
          const missing = validateBatchStock([itemToSchedule.planId]);
          
          if (missing.length > 0) {
              setMissingStockItems(missing);
              setStockAlertOpen(true);
              setScheduleModalOpen(false); 
              return;
          }

          onGenerateOrders([itemToSchedule.planId], undefined, newScheduleDate);
          setScheduleModalOpen(false);
          setItemToSchedule(null);
      }
  };

  const handleQuickPurchase = (itemId: string, qty: number) => {
      onRequestPurchase(itemId, qty);
  };

  // Solicita compra de todos los repuestos faltantes de un plan
  const handleRequestAllMissingParts = (planId: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan?.requiredParts) return;
      let count = 0;
      plan.requiredParts.forEach(part => {
          const invItem = inventory.find(i => i.id === part.itemId);
          const available = invItem?.quantity || 0;
          if (available < part.quantity) {
              onRequestPurchase(part.itemId, part.quantity - available);
              count++;
          }
      });
      if (count > 0) alert(`✅ Se generaron ${count} solicitud(es) de compra. Revisá en el módulo Compras.`);
  };

  return (
    <div className="space-y-6">
      
      {/* --- SECTION 1: KPIS & STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-end">
                  <div>
                      <h2 className="text-2xl font-bold mb-1">Cumplimiento Global</h2>
                      <p className="text-slate-300 text-sm mb-4">
                          {viewDays === 1 
                            ? 'Ejecución en tiempo real (Hoy)' 
                            : `Promedio histórico (Últimos ${viewDays} días)`}
                      </p>
                      <div className="flex items-end gap-3">
                          <span className="text-5xl font-bold text-emerald-400">{kpis.complianceRate}%</span>
                          <span className="text-sm text-slate-400 mb-2">Tasa de Ejecución</span>
                      </div>
                  </div>
                  <div className="hidden md:block">
                       <div className="flex gap-8 text-right">
                           <div>
                               <div className="text-2xl font-bold">{kpis.theoreticalCount}</div>
                               <div className="text-xs text-slate-400 uppercase">Programados</div>
                           </div>
                           <div>
                               <div className="text-2xl font-bold text-emerald-400">{kpis.realizedCount}</div>
                               <div className="text-xs text-slate-400 uppercase">Realizados</div>
                           </div>
                       </div>
                  </div>
              </div>
              <BarChart3 className="absolute right-[-20px] bottom-[-20px] text-slate-800 opacity-50" size={180} />
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                   <AlertTriangle size={18} className="text-amber-500"/> Alertas por Equipo
               </h3>
               <div className="space-y-3">
                   {kpis.machineList.map((m, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm">
                           <span className="text-slate-600 truncate max-w-[150px]" title={m.name}>{m.name}</span>
                           <div className="flex items-center gap-2">
                               <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                        className={`h-full rounded-full ${m.rate < 50 ? 'bg-red-500' : m.rate < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                        style={{width: `${m.rate}%`}}
                                    ></div>
                               </div>
                               <span className="text-xs font-bold text-slate-700 w-8 text-right">{m.rate}%</span>
                           </div>
                       </div>
                   ))}
                   {kpis.machineList.length === 0 && <p className="text-xs text-slate-400 italic">Datos insuficientes para análisis.</p>}
               </div>
          </div>
      </div>

      {/* --- SECTION 2: TOOLBAR --- */}
      <div className="flex flex-col gap-4">
           {/* Tabs */}
           <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'upcoming' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <CalendarClock size={16}/> Proyección
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <History size={16}/> Histórico
                </button>
           </div>

           {/* Actions Bar */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                
                {/* Search & Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Buscar plan o máquina..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 pr-3">
                         <div className="bg-white p-1.5 rounded shadow-sm text-slate-500"><Calendar size={16}/></div>
                         <select 
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                            value={viewDays}
                            onChange={(e) => setViewDays(Number(e.target.value))}
                         >
                             <option value={1}>Hoy</option>
                             <option value={7}>Esta Semana</option>
                             <option value={15}>15 Días</option>
                             <option value={30}>30 Días</option>
                             <option value={90}>3 Meses</option>
                         </select>
                     </div>
                </div>
                
                {/* Bulk Actions (Only for Upcoming) */}
                {activeTab === 'upcoming' && (
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                         {selectedItemIds.size > 0 && (
                             <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                <div className="relative">
                                    <select 
                                        className="appearance-none bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer font-medium bg-white"
                                        value={bulkTechnicianId}
                                        onChange={(e) => setBulkTechnicianId(e.target.value)}
                                    >
                                        <option value="">Asignar Técnico (Opcional)</option>
                                        {technicians.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <UserIcon size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none"/>
                                </div>
                                <button 
                                    onClick={handleBulkGenerate}
                                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md shadow-primary-200 hover:bg-primary-700 transition-all"
                                >
                                    <Play size={16} fill="currentColor" />
                                    Generar {selectedItemIds.size} OTs
                                </button>
                             </div>
                         )}
                    </div>
                )}
           </div>
      </div>

      {/* --- SECTION 3: LIST VIEW --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
         <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
             <div className="flex items-center gap-2">
                <Filter size={14}/>
                <span>{Object.values(groupedItems).flat().length} Registros encontrados</span>
             </div>
             {activeTab === 'upcoming' && (
                 <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={handleSelectAll}>
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isAllSelected ? 'bg-primary-600 border-primary-600' : 'border-slate-400 bg-white'}`}>
                        {isAllSelected && <CheckSquare size={10} className="text-white"/>}
                    </div>
                    <span>Seleccionar Todos</span>
                 </div>
             )}
         </div>
         
         <div className="divide-y divide-slate-100">
            {Object.keys(groupedItems).length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <CalendarClock size={48} className="mb-3 opacity-20"/>
                    <p>No hay mantenimientos en este rango.</p>
                </div>
            )}

            {Object.entries(groupedItems).map(([dateLabel, items]) => {
                const isCollapsed = collapsedGroups.has(dateLabel);
                return (
                    <div key={dateLabel}>
                        <div 
                            className="bg-slate-50/80 px-6 py-2.5 border-b border-slate-100 sticky top-0 backdrop-blur-sm z-0 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors group/header select-none"
                            onClick={() => toggleGroupCollapse(dateLabel)}
                        >
                            <h3 className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${activeTab === 'upcoming' ? 'bg-primary-400' : 'bg-purple-400'}`}></span>
                                {dateLabel.toUpperCase()}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                    {items.length} Tareas
                                </span>
                                <div className={`text-slate-400 transition-transform duration-200 group-hover/header:text-slate-600 ${isCollapsed ? '-rotate-90' : ''}`}>
                                    <ChevronDown size={16}/>
                                </div>
                            </div>
                        </div>
                        
                        {!isCollapsed && items.map((item) => {
                            const isSelected = activeTab === 'upcoming' && selectedItemIds.has(item.uniqueId);
                            const isOverdue = activeTab === 'upcoming' && new Date(item.date) < new Date(new Date().setHours(0,0,0,0));
                            const hasParts = item.stockStatus !== 'none';
                            const stockOk = item.stockStatus === 'ok';
                            const hasDowntime = !!item.requiresDowntime;

                            return (
                                <div
                                    key={activeTab === 'upcoming' ? item.uniqueId : item.id}
                                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-primary-50/40' : ''}`}
                                >
                                    {/* Checkbox / Icon */}
                                    {activeTab === 'upcoming' ? (
                                        <div
                                            className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white'}`}
                                            onClick={() => toggleSelection(item.uniqueId)}
                                        >
                                            {isSelected && <CheckSquare size={14} className="text-white"/>}
                                        </div>
                                    ) : (
                                        <div className="w-5 shrink-0 flex justify-center">
                                            <CheckCircle2 size={18} className="text-emerald-500"/>
                                        </div>
                                    )}

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => activeTab === 'upcoming' && toggleSelection(item.uniqueId)}>
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <h4 className={`font-bold text-sm ${isSelected ? 'text-primary-700' : 'text-slate-900'}`}>{item.title}</h4>
                                            {isOverdue && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">VENCIDO</span>}
                                            {activeTab === 'history' && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-200">COMPLETADO</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="font-medium text-slate-600 flex items-center gap-1"><ChevronRight size={12}/> {item.assetName}</span>
                                            {activeTab === 'upcoming' && (
                                                <>
                                                    <span>•</span>
                                                    <span>Cada {item.frequency}d</span>
                                                    <span>•</span>
                                                    <span>{item.hours}h est.</span>
                                                </>
                                            )}
                                            {activeTab === 'history' && item.technicianName && (
                                                <span className="flex items-center gap-1"><UserIcon size={11}/>{item.technicianName}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Iconos de acción siempre visibles ── */}
                                    {activeTab === 'upcoming' && (
                                        <div className="shrink-0 flex items-center gap-1.5">

                                            {/* Especialidad */}
                                            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                {item.specialty}
                                            </span>

                                            {/* Repuestos: stock OK / falta stock / sin repuestos */}
                                            {hasParts ? (
                                                stockOk ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 cursor-default"
                                                        title={`Repuestos disponibles`}
                                                    >
                                                        <PackageCheck size={13}/> Stock OK
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRequestAllMissingParts(item.planId); }}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                                                        title={`Sin stock: ${item.missingParts.join(' · ')} — Click para solicitar compra`}
                                                    >
                                                        <PackageX size={13}/> Pedir repuestos
                                                    </button>
                                                )
                                            ) : null}

                                            {/* Parada de máquina: siempre visible, click para reprogramar */}
                                            {hasDowntime && (
                                                <button
                                                    onClick={(e) => openScheduleModal(e, item)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                                    title="Requiere parada de máquina — Click para reprogramar fecha"
                                                >
                                                    <CalendarRange size={13}/> Reprogramar
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'history' && (
                                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                            {item.specialtyRequired}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
         </div>
      </div>
      
      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && itemToSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-amber-50 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg mt-0.5">
                            <CalendarRange size={18} className="text-amber-700"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Reprogramar mantenimiento</h3>
                            <p className="text-xs text-slate-600 mt-0.5 max-w-xs">{itemToSchedule.title}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded mt-1.5">
                                <Ban size={9}/> Requiere parada de máquina
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={18}/>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                        Al confirmar, se genera la OT con la fecha acordada y el plan se reprograma automáticamente.
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha proyectada original</label>
                        <p className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">{itemToSchedule.originalDate}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nueva fecha acordada <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                            value={newScheduleDate}
                            onChange={(e) => setNewScheduleDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={() => setScheduleModalOpen(false)} className="flex-1 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button onClick={confirmSchedule} className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 flex items-center justify-center gap-2 transition-colors">
                        <Save size={15}/> Confirmar fecha
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* STOCK ALERT MODAL (BLOCKING) */}
      {stockAlertOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-red-100 bg-red-50 rounded-t-xl flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-full text-red-600">
                          <AlertCircle size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-red-700">Stock Insuficiente</h3>
                          <p className="text-xs text-red-500">No se pueden generar las órdenes de trabajo.</p>
                      </div>
                  </div>

                  <div className="p-6 overflow-y-auto">
                      <p className="text-sm text-slate-600 mb-4">
                          Los siguientes repuestos no tienen existencias suficientes para cubrir los mantenimientos seleccionados:
                      </p>
                      
                      <div className="space-y-3">
                          {missingStockItems.map((item, idx) => (
                              <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <p className="font-bold text-slate-800">{item.itemName}</p>
                                          <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                                      </div>
                                      <div className="text-right">
                                          <span className="block text-xs text-slate-500">Faltante</span>
                                          <span className="font-bold text-red-600 text-lg">-{item.missing}</span>
                                      </div>
                                  </div>
                                  
                                  {/* Quick Actions */}
                                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                                      <div className="text-xs text-slate-500">
                                          Req: <strong>{item.required}</strong> | Disp: <strong>{item.available}</strong>
                                      </div>
                                      <button 
                                          onClick={() => handleQuickPurchase(item.itemId, item.missing)}
                                          className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                                      >
                                          <ShoppingCart size={12} /> Solicitar Compra
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl text-right">
                      <button 
                          onClick={() => setStockAlertOpen(false)}
                          className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-900"
                      >
                          Entendido, cerrar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};