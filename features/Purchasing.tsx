
import React, { useState } from 'react';
import { PurchaseRequest, PurchaseRequestStatus, User, UserRole } from '../types';
import { Check, X, Clock, PackageCheck, ShoppingCart, User as UserIcon, Calendar, ArrowRight, Truck, FileText, AlertCircle, Save, History, Search } from 'lucide-react';

interface PurchasingProps {
  purchaseRequests: PurchaseRequest[];
  user: User;
  onApprovePurchase: (reqId: string, approvedQty: number) => void;
  onRejectPurchase: (reqId: string) => void;
  onProcessPurchase: (reqId: string, provider: string) => void;
  onReceivePurchase: (reqId: string, qtyReceived: number, remito: string, forceClose: boolean) => void;
}

export const Purchasing: React.FC<PurchasingProps> = ({ 
  purchaseRequests, 
  user, 
  onApprovePurchase,
  onRejectPurchase,
  onProcessPurchase,
  onReceivePurchase
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'purchasing' | 'receiving'>('approvals');

  // State for Approval Stage (Editable Quantity)
  const [approvalQtys, setApprovalQtys] = useState<Record<string, number>>({});

  // State for Purchasing Stage (Provider Input)
  const [providerInputs, setProviderInputs] = useState<Record<string, string>>({});

  // State for Reception Modal
  const [receptionModalOpen, setReceptionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [receptionQty, setReceptionQty] = useState<number>(0);
  const [remitoNumber, setRemitoNumber] = useState('');
  const [forceClose, setForceClose] = useState(false);

  // Filters
  const pendingRequests = purchaseRequests.filter(pr => pr.status === PurchaseRequestStatus.PENDING_APPROVAL);
  const approvedRequests = purchaseRequests.filter(pr => pr.status === PurchaseRequestStatus.APPROVED);
  const activeOrders = purchaseRequests.filter(pr => 
    pr.status === PurchaseRequestStatus.PURCHASED || 
    pr.status === PurchaseRequestStatus.PARTIALLY_RECEIVED
  );

  // Handlers
  const handleApprovalChange = (id: string, val: string) => {
    setApprovalQtys(prev => ({ ...prev, [id]: Number(val) }));
  };

  const handleProviderChange = (id: string, val: string) => {
    setProviderInputs(prev => ({ ...prev, [id]: val }));
  };

  const openReceptionModal = (req: PurchaseRequest) => {
    setSelectedRequest(req);
    setReceptionQty(req.approvedQuantity - req.receivedQuantity); // Default to remaining
    setRemitoNumber('');
    setForceClose(false);
    setReceptionModalOpen(true);
  };

  const submitReception = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequest && receptionQty > 0 && remitoNumber) {
        onReceivePurchase(selectedRequest.id, receptionQty, remitoNumber, forceClose);
        setReceptionModalOpen(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, count, color }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-4 border-b-2 transition-all flex items-center justify-center gap-2 ${
        activeTab === id 
          ? `border-${color}-600 text-${color}-600 bg-${color}-50` 
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      <Icon size={18} />
      <span className="font-bold text-sm">{label}</span>
      {count > 0 && (
        <span className={`ml-1 text-xs px-2 py-0.5 rounded-full bg-${color}-100 text-${color}-700`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Compras</h2>
          <p className="text-slate-500">Flujo de abastecimiento: Aprobación, Compras y Recepción.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white rounded-t-xl border-b border-slate-200 shadow-sm overflow-hidden">
        <TabButton id="approvals" label="Aprobaciones" icon={Clock} count={pendingRequests.length} color="amber" />
        <TabButton id="purchasing" label="Compras" icon={ShoppingCart} count={approvedRequests.length} color="blue" />
        <TabButton id="receiving" label="Recepciones" icon={Truck} count={activeOrders.length} color="emerald" />
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-slate-200 min-h-[400px] p-6">
        
        {/* === TAB 1: APROBACIONES (Jefatura) === */}
        {activeTab === 'approvals' && (
           <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Solicitudes Pendientes</h3>
                    <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Jefatura revisa y aprueba cantidades.
                    </div>
                </div>

                {pendingRequests.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <Check size={40} className="mx-auto mb-3 opacity-50 text-amber-400" />
                        <p>No hay solicitudes pendientes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pendingRequests.map(pr => (
                            <div key={pr.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900">{pr.itemName}</span>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            Orig: {pr.originalQuantity} un.
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 flex items-center gap-3">
                                        <span className="flex items-center gap-1"><UserIcon size={12}/> {pr.requestedBy}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {pr.date}</span>
                                        <span className="font-semibold text-slate-700">${pr.estimatedCost} (Est.)</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-3 rounded-lg">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Aprobar Cant.</label>
                                        <input 
                                            type="number" 
                                            className="w-20 border border-slate-300 rounded px-2 py-1 text-sm font-bold text-center focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                            value={approvalQtys[pr.id] ?? pr.originalQuantity}
                                            onChange={(e) => handleApprovalChange(pr.id, e.target.value)}
                                            min="1"
                                        />
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                                    <button 
                                        onClick={() => onApprovePurchase(pr.id, approvalQtys[pr.id] ?? pr.originalQuantity)}
                                        className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                        title="Aprobar"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button 
                                        onClick={() => onRejectPurchase(pr.id)}
                                        className="bg-white border border-slate-200 text-slate-400 p-2 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                                        title="Rechazar"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
           </div>
        )}

        {/* === TAB 2: COMPRAS (Cotizar y Asignar) === */}
        {activeTab === 'purchasing' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Órdenes por Procesar</h3>
                    <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Compras cotiza y asigna proveedor.
                    </div>
                </div>

                {approvedRequests.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <ShoppingCart size={40} className="mx-auto mb-3 opacity-50 text-blue-400" />
                        <p>No hay solicitudes aprobadas esperando compra.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {approvedRequests.map(pr => (
                             <div key={pr.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 text-lg">{pr.itemName}</span>
                                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200">
                                                Aprobado: {pr.approvedQuantity} un.
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">ID: {pr.id}</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row items-end gap-4">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Proveedor Asignado</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 text-blue-300" size={16}/>
                                            <input 
                                                type="text" 
                                                className="w-full pl-9 pr-4 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                placeholder="Nombre del Proveedor..."
                                                value={providerInputs[pr.id] || ''}
                                                onChange={(e) => handleProviderChange(pr.id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(!providerInputs[pr.id]) return alert('Debes asignar un proveedor');
                                            onProcessPurchase(pr.id, providerInputs[pr.id]);
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                                    >
                                        Generar Orden <ArrowRight size={16} />
                                    </button>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* === TAB 3: RECEPCIÓN (Almacén) === */}
        {activeTab === 'receiving' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Mercadería en Tránsito / Recepción</h3>
                    <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Ingreso de stock (Total o Parcial).
                    </div>
                </div>

                {activeOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <Truck size={40} className="mx-auto mb-3 opacity-50 text-emerald-400" />
                        <p>No hay órdenes de compra activas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {activeOrders.map(pr => {
                            const progress = (pr.receivedQuantity / pr.approvedQuantity) * 100;
                            const isPartial = pr.receivedQuantity > 0;

                            return (
                                <div key={pr.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{pr.itemName}</h4>
                                            <div className="flex items-center gap-2 text-xs mt-1">
                                                <span className="text-slate-500">Prov: <span className="font-semibold text-slate-700">{pr.provider}</span></span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-slate-500">Orden: <span className="font-mono text-slate-600">{pr.orderDate}</span></span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {isPartial && (
                                                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase mb-1 inline-block">
                                                    Parcial
                                                </span>
                                            )}
                                            <div className="text-sm font-bold text-slate-700">
                                                {pr.receivedQuantity} / <span className="text-slate-500">{pr.approvedQuantity}</span> un.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-1 w-full bg-slate-100">
                                        <div className="h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                    </div>

                                    <div className="p-4 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            {pr.receptionLog && pr.receptionLog.length > 0 && (
                                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                                    <History size={12} /> {pr.receptionLog.length} ingresos previos
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => openReceptionModal(pr)}
                                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-emerald-200 shadow-sm"
                                        >
                                            <PackageCheck size={16} /> Ingresar Stock
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* RECEPTION MODAL POPUP */}
      {receptionModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Truck size={20} className="text-emerald-600"/> Recepción de Mercadería
                    </h3>
                    <button onClick={() => setReceptionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submitReception} className="p-6 space-y-5">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-bold uppercase mb-1">Ítem</p>
                        <p className="font-medium text-blue-900">{selectedRequest.itemName}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                            <div>
                                <span className="text-blue-500 text-xs">Solicitado:</span>
                                <span className="ml-1 font-bold">{selectedRequest.approvedQuantity}</span>
                            </div>
                            <div>
                                <span className="text-blue-500 text-xs">Pendiente:</span>
                                <span className="ml-1 font-bold">{selectedRequest.approvedQuantity - selectedRequest.receivedQuantity}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">N° Remito / Factura</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                            <input 
                                required
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium uppercase bg-white"
                                placeholder="R-0001-XXXXXX"
                                value={remitoNumber}
                                onChange={e => setRemitoNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad Recibida</label>
                        <input 
                            required
                            type="number" 
                            min="1"
                            max={selectedRequest.approvedQuantity - selectedRequest.receivedQuantity} // Max is remaining
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg bg-white"
                            value={receptionQty}
                            onChange={e => setReceptionQty(Number(e.target.value))}
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Ingresando {receptionQty} de {selectedRequest.approvedQuantity - selectedRequest.receivedQuantity} pendientes.
                        </p>
                    </div>

                    {/* Logic for Force Close if partial */}
                    {(selectedRequest.receivedQuantity + receptionQty) < selectedRequest.approvedQuantity && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <input 
                                type="checkbox" 
                                id="forceClose"
                                checked={forceClose}
                                onChange={e => setForceClose(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <label htmlFor="forceClose" className="text-xs text-slate-600 font-medium cursor-pointer">
                                Cerrar orden con faltantes (Finalizar compra)
                            </label>
                        </div>
                    )}

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"
                        >
                            <Save size={18} /> Confirmar Ingreso
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
