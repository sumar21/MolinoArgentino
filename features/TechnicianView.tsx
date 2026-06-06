
import React, { useState, useRef } from 'react';
import { WorkOrder, WorkOrderStatus, Priority, ChecklistTask } from '../types';
import { 
    Calendar, MapPin, Play, CheckCircle, Camera, AlertCircle, X, CheckSquare, Square, 
    Briefcase, Clock, Activity, ArrowRight, UserCircle 
} from 'lucide-react';

interface TechnicianViewProps {
  orders: WorkOrder[];
  technicianId: string;
  onStatusChange: (id: string, status: WorkOrderStatus, data?: { comment?: string; evidence?: string; checklist?: ChecklistTask[] }) => void;
}

export const TechnicianView: React.FC<TechnicianViewProps> = ({ orders, technicianId, onStatusChange }) => {
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  
  // Form State for Completion
  const [comment, setComment] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<ChecklistTask[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myOrders = orders.filter(o => o.assignedTechnicianId === technicianId);
  const activeOrder = myOrders.find(o => o.status === WorkOrderStatus.IN_PROGRESS);
  const pendingOrders = myOrders.filter(o => o.status === WorkOrderStatus.PENDING);
  const completedToday = myOrders.filter(o => o.status === WorkOrderStatus.COMPLETED && new Date(o.endTime || '').toDateString() === new Date().toDateString());

  const handleStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onStatusChange(id, WorkOrderStatus.IN_PROGRESS);
  };

  const openCompleteModal = (e: React.MouseEvent, order: WorkOrder) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setChecklistState(order.checklist ? [...order.checklist] : []);
    setCompleteModalOpen(true);
    setComment('');
    setEvidenceFile(null);
    setError('');
  };

  const toggleChecklistTask = (taskId: string) => {
    setChecklistState(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setEvidenceFile(url);
    }
  };

  const submitCompletion = () => {
    if (!comment.trim()) {
      setError('Debes ingresar un comentario técnico.');
      return;
    }
    if (!evidenceFile) {
      setError('Es obligatorio adjuntar una foto de evidencia.');
      return;
    }

    // Validate Checklist
    const allTasksCompleted = checklistState.every(t => t.completed);
    if (checklistState.length > 0 && !allTasksCompleted) {
       setError('Debes completar todas las tareas del check-list.');
       return;
    }

    if (selectedOrder) {
      onStatusChange(selectedOrder.id, WorkOrderStatus.COMPLETED, { 
        comment, 
        evidence: evidenceFile,
        checklist: checklistState
      });
      setCompleteModalOpen(false);
      setSelectedOrder(null);
    }
  };

  // Calculate progress for UI
  const checklistProgress = checklistState.length > 0 
    ? Math.round((checklistState.filter(t => t.completed).length / checklistState.length) * 100) 
    : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full pb-8">
      
      {/* --- COLUMN 1: SIDEBAR SUMMARY --- */}
      <aside className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-primary-200 mb-4 ring-4 ring-primary-50">
                  <UserCircle size={64} className="text-primary-600"/>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Panel Técnico</h2>
              <p className="text-sm text-slate-500 mb-4">Agenda del día</p>
              
              <div className="w-full grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-700">{pendingOrders.length}</div>
                      <div className="text-xs text-blue-600 font-medium uppercase">Pendientes</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <div className="text-2xl font-bold text-emerald-700">{completedToday.length}</div>
                      <div className="text-xs text-emerald-600 font-medium uppercase">Completadas</div>
                  </div>
              </div>
          </div>

          {/* Quick Stats / Info */}
          <div className="bg-slate-900 text-white rounded-xl shadow-md p-5 relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">Estado del Turno</h3>
                  {activeOrder ? (
                      <div>
                          <div className="flex items-center gap-2 text-emerald-400 mb-1">
                              <Activity size={20} />
                              <span className="font-bold">En Actividad</span>
                          </div>
                          <p className="text-xs text-slate-400">Orden #{activeOrder.id} en curso.</p>
                      </div>
                  ) : (
                      <div>
                          <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Clock size={20} />
                              <span className="font-bold">Esperando Tarea</span>
                          </div>
                          <p className="text-xs text-slate-500">Inicia una orden para comenzar.</p>
                      </div>
                  )}
              </div>
              <Activity className="absolute -right-4 -bottom-4 text-white opacity-5 w-32 h-32" />
          </div>
      </aside>

      {/* --- COLUMN 2: MAIN CONTENT --- */}
      <main className="lg:col-span-3 space-y-6">
          
          {/* 1. HERO CARD: ACTIVE ORDER */}
          {activeOrder ? (
              <div className="bg-white rounded-xl shadow-lg border-l-8 border-l-primary-600 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-primary-50 px-6 py-4 border-b border-primary-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="bg-primary-600 text-white p-2 rounded-lg shadow-sm">
                              <Activity size={24} className="animate-pulse" />
                          </div>
                          <div>
                              <span className="text-xs font-bold text-primary-700 uppercase tracking-wide">Tarea en Curso</span>
                              <h3 className="text-xl font-bold text-primary-900">{activeOrder.title}</h3>
                          </div>
                      </div>
                      <span className="bg-white text-primary-700 font-mono text-xs px-3 py-1 rounded border border-primary-200 shadow-sm">
                          #{activeOrder.id}
                      </span>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                          <div className="flex items-start gap-3">
                              <MapPin className="text-slate-400 mt-1" size={20}/>
                              <div>
                                  <p className="text-sm font-bold text-slate-700">Ubicación / Activo</p>
                                  <p className="text-base text-slate-900">{activeOrder.assetName}</p>
                              </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed">
                              {activeOrder.description}
                          </div>
                      </div>

                      <div className="flex flex-col justify-between">
                          {activeOrder.checklist && activeOrder.checklist.length > 0 && (
                              <div className="mb-4">
                                  <div className="flex justify-between items-end mb-2">
                                      <span className="text-xs font-bold text-slate-500 uppercase">Progreso del Checklist</span>
                                      <span className="text-xs font-medium text-primary-600">{activeOrder.checklist.length} items</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                      <div className="bg-primary-500 h-2 rounded-full w-1/3"></div> {/* Visual placeholder */}
                                  </div>
                              </div>
                          )}
                          <button 
                              onClick={(e) => openCompleteModal(e, activeOrder)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                          >
                              <CheckCircle size={20} /> Finalizar Orden
                          </button>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
                  <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold mb-2">No hay tareas activas</h3>
                      <p className="text-slate-400 text-sm">Selecciona una orden de la lista "Pendientes" para comenzar a trabajar.</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-full">
                      <Play size={32} className="text-white opacity-50" />
                  </div>
              </div>
          )}

          {/* 2. PENDING ORDERS LIST */}
          <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-slate-400"/> Cola de Trabajo ({pendingOrders.length})
              </h3>
              
              {pendingOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                      <CheckCircle size={48} className="mx-auto mb-4 text-emerald-200" />
                      <p className="text-slate-500 font-medium">¡Todo al día! No tienes órdenes pendientes.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingOrders.map(ot => (
                          <div 
                              key={ot.id} 
                              className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary-300 transition-all group relative overflow-hidden`}
                          >
                              {/* Priority Stripe */}
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                  ot.priority === Priority.CRITICAL ? 'bg-red-500' : 
                                  ot.priority === Priority.HIGH ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></div>

                              <div className="pl-3">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                          ot.priority === Priority.CRITICAL ? 'bg-red-100 text-red-700' : 
                                          ot.priority === Priority.HIGH ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
                                      }`}>
                                          {ot.priority}
                                      </span>
                                      <span className="text-xs text-slate-400 font-mono">#{ot.id}</span>
                                  </div>
                                  
                                  <h4 className="font-bold text-slate-900 mb-1 truncate" title={ot.title}>{ot.title}</h4>
                                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                      <MapPin size={12}/> {ot.assetName}
                                  </p>
                                  
                                  <div className="flex items-center justify-between mt-4">
                                       <div className="flex items-center gap-2 text-xs text-slate-400">
                                           {ot.checklist && ot.checklist.length > 0 && (
                                               <span className="flex items-center gap-1"><CheckSquare size={12}/> {ot.checklist.length}</span>
                                           )}
                                       </div>
                                       <button 
                                          onClick={(e) => handleStart(e, ot.id)}
                                          disabled={!!activeOrder}
                                          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                              activeOrder 
                                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                                          }`}
                                       >
                                           {activeOrder ? 'Ocupado' : <><Play size={12}/> Iniciar</>}
                                       </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </main>

      {/* Completion Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800">Finalizar Orden</h3>
              <button onClick={() => setCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Checklist Section */}
              {checklistState.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-700 text-sm">Lista de Verificación</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${checklistProgress === 100 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {checklistProgress}% Completo
                    </span>
                  </div>
                  <div className="space-y-2">
                    {checklistState.map(task => (
                      <div 
                        key={task.id} 
                        className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${task.completed ? 'bg-green-50' : 'hover:bg-slate-100'}`}
                        onClick={() => toggleChecklistTask(task.id)}
                      >
                        <div className={`mt-0.5 ${task.completed ? 'text-green-600' : 'text-slate-400'}`}>
                          {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <span className={`text-sm ${task.completed ? 'text-slate-600 line-through' : 'text-slate-800'}`}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comentario Técnico</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none bg-white"
                  placeholder="Describe el trabajo realizado..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Evidencia Fotográfica</label>
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {evidenceFile ? (
                    <div className="relative w-full h-32 bg-slate-100 rounded overflow-hidden">
                       <img src={evidenceFile} className="w-full h-full object-cover" alt="Preview" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity">Cambiar Foto</div>
                    </div>
                  ) : (
                    <>
                      <Camera className="text-slate-400 mb-2" size={32} />
                      <p className="text-xs text-slate-500">Toca para tomar foto</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              <button 
                onClick={() => setCompleteModalOpen(false)}
                className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={submitCompletion}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={checklistState.length > 0 && checklistProgress < 100}
              >
                Completar OT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
