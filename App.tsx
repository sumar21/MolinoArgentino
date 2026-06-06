import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './features/Dashboard';
import { WorkOrderList } from './features/WorkOrderList';
import { Inventory } from './features/Inventory';
import { Purchasing } from './features/Purchasing';
import { TechnicianView } from './features/TechnicianView';
import { PreventiveMaintenance } from './features/PreventiveMaintenance';
import { Configuration } from './features/Configuration';
import { Assets } from './features/Assets';
import { DailyReportModule } from './features/DailyReport';
import {
  MOCK_USERS,
  MOCK_WORK_ORDERS,
  MOCK_INVENTORY,
  MOCK_PURCHASE_REQUESTS,
  MOCK_MAINTENANCE_PLANS,
  MOCK_ASSETS,
  MOCK_TASK_TEMPLATES,
  MOCK_MODEL_CATALOG,
  MOCK_DAILY_REPORTS,
  MOCK_PREVENTIVE_LOGS,
} from './constants';
import {
  User,
  UserRole,
  WorkOrder,
  InventoryItem,
  PurchaseRequest,
  WorkOrderStatus,
  PurchaseRequestStatus,
  MaintenancePlan,
  WorkOrderType,
  Priority,
  ChecklistTask,
  ReceptionEntry,
  TaskTemplate,
  Asset,
  CatalogModel,
  DailyReport,
  PreventiveLogEntry,
  WorkOrderOrigin,
} from './types';
import { IncidentReport } from './features/IncidentReport';
import { Login } from './features/Login';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [currentView, setCurrentView] = useState('dashboard');

  // Domain state
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(MOCK_PURCHASE_REQUESTS);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(MOCK_MAINTENANCE_PLANS);
  const [taskTemplates] = useState<TaskTemplate[]>(MOCK_TASK_TEMPLATES);
  const [modelCatalog, setModelCatalog] = useState<CatalogModel[]>(MOCK_MODEL_CATALOG);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(MOCK_DAILY_REPORTS);
  const [preventiveLogs, setPreventiveLogs] = useState<PreventiveLogEntry[]>(MOCK_PREVENTIVE_LOGS);

  // ── Work Orders ──────────────────────────────────────────────────────────────
  const handleAssignTechnician = (orderId: string, technicianId: string) => {
    setWorkOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const tech = MOCK_USERS.find(u => u.id === technicianId);
      return { ...order, assignedTechnicianId: technicianId, technicianName: tech?.name };
    }));
  };

  const handleTechStatusChange = (
    orderId: string,
    newStatus: WorkOrderStatus,
    data?: { comment?: string; evidence?: string; checklist?: ChecklistTask[] }
  ) => {
    setWorkOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: newStatus,
        completionComment: data?.comment,
        evidenceImageUrl: data?.evidence,
        checklist: data?.checklist || order.checklist,
        endTime: newStatus === WorkOrderStatus.COMPLETED ? new Date().toISOString() : undefined,
      };
    }));

    if (newStatus === WorkOrderStatus.COMPLETED) {
      const order = workOrders.find(o => o.id === orderId);
      // Si era correctivo, marcar el activo como OPERATIONAL
      if (order?.type === WorkOrderType.CORRECTIVE && order.assetId) {
        setAssets(prev => prev.map(a => a.id === order.assetId ? { ...a, status: 'OPERATIONAL' } : a));
      }
      if (order?.type === WorkOrderType.PREVENTIVE && order.planId) {
        const plan = maintenancePlans.find(p => p.id === order.planId);
        if (plan) {
          // Avanzar nextDueDate
          const next = new Date();
          next.setDate(next.getDate() + plan.frequencyDays);
          const nextDateISO = next.toISOString().split('T')[0];
          setMaintenancePlans(prev =>
            prev.map(p => p.id === plan.id ? { ...p, nextDueDate: nextDateISO } : p)
          );
          // Registrar automáticamente en el R-142 / PL-006
          const month = new Date().getMonth() + 1;
          const alreadyLogged = preventiveLogs.some(l => l.planId === plan.id && l.month === month);
          if (!alreadyLogged) {
            setPreventiveLogs(prev => [...prev, {
              id: `pl-auto-${Date.now()}`,
              planId: plan.id,
              date: new Date().toISOString().split('T')[0],
              observations: data?.comment || 'Completado desde OT',
              responsible: order.technicianName || order.technicianName || 'Operario',
              month,
            }]);
          }
        }
      }
    }
  };

  const handleUpdateWorkOrder = (updatedOrder: WorkOrder) => {
    setWorkOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

    // Si se cierra un correctivo: restaurar activo a OPERATIONAL
    if (updatedOrder.status === WorkOrderStatus.COMPLETED && updatedOrder.type === WorkOrderType.CORRECTIVE && updatedOrder.assetId) {
      setAssets(prev => prev.map(a => a.id === updatedOrder.assetId ? { ...a, status: 'OPERATIONAL' } : a));
    }

    // Si se cierra una OT preventiva: avanzar plan + registrar en PL-006
    if (updatedOrder.status === WorkOrderStatus.COMPLETED && updatedOrder.type === WorkOrderType.PREVENTIVE && updatedOrder.planId) {
      const plan = maintenancePlans.find(p => p.id === updatedOrder.planId);
      if (plan) {
        const next = new Date();
        next.setDate(next.getDate() + plan.frequencyDays);
        setMaintenancePlans(prev =>
          prev.map(p => p.id === plan.id ? { ...p, nextDueDate: next.toISOString().split('T')[0] } : p)
        );
        const month = new Date().getMonth() + 1;
        const alreadyLogged = preventiveLogs.some(l => l.planId === plan.id && l.month === month);
        if (!alreadyLogged) {
          setPreventiveLogs(prev => [...prev, {
            id: `pl-auto-${Date.now()}`,
            planId: plan.id,
            date: new Date().toISOString().split('T')[0],
            observations: updatedOrder.completionComment || 'Completado',
            responsible: updatedOrder.technicianName || 'Operario',
            month,
          }]);
        }
      }
    }
  };

  const handleCreateWorkOrder = (newOrder: WorkOrder) => {
    setWorkOrders(prev => [newOrder, ...prev]);
  };

  const handleGenerateOrders = (planIds: string[], technicianId?: string, specificDate?: string) => {
    const tech = technicianId ? MOCK_USERS.find(u => u.id === technicianId) : undefined;
    const newOrders: WorkOrder[] = [];

    planIds.forEach(id => {
      const plan = maintenancePlans.find(p => p.id === id);
      if (!plan) return;

      // Evitar duplicado: si ya hay una OT pendiente/en curso para este plan, no generar otra
      const alreadyActive = workOrders.some(
        o => o.planId === plan.id &&
          (o.status === WorkOrderStatus.PENDING || o.status === WorkOrderStatus.IN_PROGRESS)
      );
      if (alreadyActive) return;

      newOrders.push({
        id: `ot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: plan.title,
        description: 'Mantenimiento preventivo generado desde Plan Maestro.',
        assetId: plan.assetId,
        assetName: plan.assetName,
        assignedTechnicianId: technicianId,
        technicianName: tech?.name,
        type: WorkOrderType.PREVENTIVE,
        priority: Priority.MEDIUM,
        status: WorkOrderStatus.PENDING,
        dueDate: specificDate || plan.nextDueDate,
        specialtyRequired: plan.specialtyRequired,
        planId: plan.id,
        origin: WorkOrderOrigin.PREVENTIVE,
        sector: plan.sector,
        checklist: plan.checklistTemplate.map((desc, idx) => ({
          id: `chk-${Date.now()}-${idx}`,
          description: desc,
          completed: false,
        })),
      });
    });

    if (newOrders.length === 0) {
      alert('ℹ️ Todos los planes seleccionados ya tienen una OT activa pendiente.');
      return;
    }

    // Avanzar nextDueDate de cada plan generado
    setMaintenancePlans(prev => prev.map(p => {
      if (!planIds.includes(p.id)) return p;
      const next = new Date(specificDate || p.nextDueDate);
      next.setDate(next.getDate() + p.frequencyDays);
      return { ...p, nextDueDate: next.toISOString().split('T')[0] };
    }));

    setWorkOrders(prev => [...prev, ...newOrders]);
    alert(`✅ Se generaron ${newOrders.length} OT${tech ? ` asignadas a ${tech.name}` : ''}${specificDate ? ` para el ${specificDate}` : ''}.`);
  };

  const handleCreatePlan = (newPlan: MaintenancePlan) => {
    setMaintenancePlans(prev => [...prev, newPlan]);
    alert('✅ Nuevo plan creado exitosamente.');
  };

  const handleDeletePlan = (planId: string) => {
    setMaintenancePlans(prev => prev.filter(p => p.id !== planId));
  };

  // ── Assets ───────────────────────────────────────────────────────────────────
  const handleCreateAsset = (newAsset: Asset) => {
    let finalAsset = { ...newAsset };
    let createdPlansCount = 0;

    if (newAsset.category && newAsset.model) {
      const modelData = modelCatalog.find(m => m.category === newAsset.category && m.name === newAsset.model);
      if (modelData) {
        finalAsset = { ...finalAsset, manualUrl: modelData.manualUrl, imageUrl: modelData.imageUrl, frequentFailures: modelData.commonFailures };
        if (modelData.standardPlans?.length > 0) {
          const autoPlans: MaintenancePlan[] = modelData.standardPlans.map((tpl, idx) => ({
            id: `mp-auto-${Date.now()}-${idx}`,
            assetId: finalAsset.id,
            assetName: finalAsset.name,
            title: tpl.title || 'Mantenimiento Estándar',
            frequencyDays: tpl.frequencyDays || 30,
            nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            estimatedHours: tpl.estimatedHours || 1,
            specialtyRequired: tpl.specialtyRequired || 'General',
            checklistTemplate: tpl.checklistTemplate || [],
            requiresDowntime: tpl.requiresDowntime,
            requiredParts: tpl.requiredParts,
          }));
          setMaintenancePlans(prev => [...prev, ...autoPlans]);
          createdPlansCount = autoPlans.length;
        }
      }
    }

    setAssets(prev => [...prev, finalAsset]);
    let msg = '✅ Equipo creado exitosamente.';
    if (createdPlansCount > 0) msg += `\n📚 Se importaron ${createdPlansCount} planes preventivos.`;
    alert(msg);
  };

  const handleUpdateCatalog = (updatedCatalog: CatalogModel[]) => {
    setModelCatalog(updatedCatalog);
  };

  // ── Purchases ────────────────────────────────────────────────────────────────
  const handleRequestPurchase = (itemId: string, qty: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    const newRequest: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      itemId,
      itemName: item.name,
      originalQuantity: qty,
      approvedQuantity: 0,
      receivedQuantity: 0,
      requestedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      status: PurchaseRequestStatus.PENDING_APPROVAL,
      estimatedCost: item.cost * qty,
    };
    setPurchaseRequests(prev => [...prev, newRequest]);
    alert(`Solicitud de compra generada para ${qty} x ${item.name}.`);
  };

  const handleApprovePurchase = (reqId: string, approvedQty: number) => {
    setPurchaseRequests(prev => prev.map(pr =>
      pr.id === reqId ? { ...pr, status: PurchaseRequestStatus.APPROVED, approvedQuantity: approvedQty } : pr
    ));
  };

  const handleRejectPurchase = (reqId: string) => {
    setPurchaseRequests(prev => prev.map(pr =>
      pr.id === reqId ? { ...pr, status: PurchaseRequestStatus.REJECTED } : pr
    ));
  };

  const handleProcessPurchase = (reqId: string, provider: string) => {
    setPurchaseRequests(prev => prev.map(pr =>
      pr.id === reqId ? { ...pr, status: PurchaseRequestStatus.PURCHASED, provider, orderDate: new Date().toISOString().split('T')[0] } : pr
    ));
  };

  const handleReceivePurchase = (reqId: string, qtyReceived: number, remito: string, forceClose: boolean) => {
    const request = purchaseRequests.find(pr => pr.id === reqId);
    if (!request) return;
    setInventory(prev => prev.map(item =>
      item.id === request.itemId ? { ...item, quantity: item.quantity + qtyReceived } : item
    ));
    setPurchaseRequests(prev => prev.map(pr => {
      if (pr.id !== reqId) return pr;
      const newTotal = pr.receivedQuantity + qtyReceived;
      const newEntry: ReceptionEntry = {
        id: `rec-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        quantity: qtyReceived,
        remito,
        receivedBy: currentUser.name,
      };
      return {
        ...pr,
        receivedQuantity: newTotal,
        receptionLog: [...(pr.receptionLog || []), newEntry],
        status: (newTotal >= pr.approvedQuantity || forceClose)
          ? PurchaseRequestStatus.COMPLETED
          : PurchaseRequestStatus.PARTIALLY_RECEIVED,
      };
    }));
    alert(`✅ Stock actualizado (+${qtyReceived} un).`);
  };

  // ── Daily Report ─────────────────────────────────────────────────────────────
  const handleCreateDailyReport = (report: DailyReport, ordersToCreate: WorkOrder[]) => {
    ordersToCreate.forEach(o => setWorkOrders(prev => [o, ...prev]));
    setDailyReports(prev => [report, ...prev]);
    alert(`✅ Parte del ${report.date} guardado. Se crearon ${ordersToCreate.length} órdenes de trabajo.`);
  };

  // ── Preventive Log ───────────────────────────────────────────────────────────
  const handleLogPreventive = (entry: PreventiveLogEntry) => {
    setPreventiveLogs(prev => [entry, ...prev]);
  };

  // ── Role switch ──────────────────────────────────────────────────────────────
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === UserRole.TECHNICIAN) setCurrentView('technician');
    else if (user.role === UserRole.OPERATIONS) setCurrentView('incident');
    else setCurrentView('dashboard');
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(MOCK_USERS[0]);
    setCurrentView('dashboard');
  };

  const switchRole = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      if (role === UserRole.TECHNICIAN) setCurrentView('technician');
      else if (role === UserRole.OPERATIONS) setCurrentView('incident');
      else setCurrentView('dashboard');
    }
  };

  if (!loggedIn) {
    return <Login users={MOCK_USERS} onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentUser={currentUser}
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      <div className="absolute top-4 right-4 z-50 md:right-8">
        <select
          className="bg-primary-600 text-white text-xs p-2 rounded shadow-lg border border-primary-500 opacity-90 hover:opacity-100 transition-opacity cursor-pointer font-bold focus:ring-2 focus:ring-white outline-none"
          onChange={(e) => switchRole(e.target.value as UserRole)}
          value={currentUser.role}
        >
          <option value={UserRole.ADMIN} className="text-slate-900 bg-white">Simular: Jefatura de Planta</option>
          <option value={UserRole.PLANNER} className="text-slate-900 bg-white">Simular: Jefe de Mantenimiento</option>
          <option value={UserRole.TECHNICIAN} className="text-slate-900 bg-white">Simular: Operario de Mantenimiento</option>
          <option value={UserRole.OPERATIONS} className="text-slate-900 bg-white">Simular: Operaciones (Producción)</option>
        </select>
      </div>

      {currentView === 'dashboard' && (
        <Dashboard
          workOrders={workOrders}
          inventory={inventory}
          purchaseRequests={purchaseRequests}
          maintenancePlans={maintenancePlans}
          preventiveLogs={preventiveLogs}
        />
      )}

      {currentView === 'daily-report' && (
        <DailyReportModule
          users={MOCK_USERS}
          workOrders={workOrders}
          dailyReports={dailyReports}
          onCreate={handleCreateDailyReport}
        />
      )}

      {currentView === 'work-orders' && (
        <WorkOrderList
          orders={workOrders}
          users={MOCK_USERS}
          assets={assets}
          onAssign={handleAssignTechnician}
          onCreate={handleCreateWorkOrder}
          onUpdate={handleUpdateWorkOrder}
        />
      )}

      {currentView === 'assets' && (
        <Assets
          assets={assets}
          inventory={inventory}
          taskTemplates={taskTemplates}
          maintenancePlans={maintenancePlans}
          modelCatalog={modelCatalog}
          onCreateAsset={handleCreateAsset}
          onCreatePlan={handleCreatePlan}
          onDeletePlan={handleDeletePlan}
        />
      )}

      {currentView === 'preventive' && (
        <PreventiveMaintenance
          plans={maintenancePlans}
          workOrders={workOrders}
          users={MOCK_USERS}
          inventory={inventory}
          preventiveLogs={preventiveLogs}
          onGenerateOrders={handleGenerateOrders}
          onRequestPurchase={handleRequestPurchase}
          onLogPreventive={handleLogPreventive}
        />
      )}

      {currentView === 'incident' && (
        <IncidentReport
          assets={assets}
          currentUser={currentUser}
          onCreateWorkOrder={handleCreateWorkOrder}
        />
      )}

      {currentView === 'technician' && (
        <TechnicianView
          orders={workOrders}
          technicianId={currentUser.id}
          onStatusChange={handleTechStatusChange}
        />
      )}

      {currentView === 'inventory' && (
        <Inventory inventory={inventory} onRequestPurchase={handleRequestPurchase} />
      )}

      {currentView === 'purchasing' && (
        <Purchasing
          purchaseRequests={purchaseRequests}
          user={currentUser}
          onApprovePurchase={handleApprovePurchase}
          onRejectPurchase={handleRejectPurchase}
          onProcessPurchase={handleProcessPurchase}
          onReceivePurchase={handleReceivePurchase}
        />
      )}

      {currentView.startsWith('config-') && (
        <Configuration
          currentView={currentView}
          users={MOCK_USERS}
          inventory={inventory}
          modelCatalog={modelCatalog}
          onUpdateCatalog={handleUpdateCatalog}
        />
      )}
    </Layout>
  );
}

export default App;
