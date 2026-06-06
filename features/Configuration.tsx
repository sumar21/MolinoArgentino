import React, { useState, useRef } from 'react';
import { User, UserRole, InventoryItem, CatalogModel, MaintenancePlan, FrequentFailure, PlanPart } from '../types';
import { 
  Users, Shield, Box, Plus, Edit2, Trash2, Tags, Image as ImageIcon, BookOpen, AlertTriangle, CheckSquare, Save, X, MoreHorizontal, ChevronDown, ExternalLink, ListChecks, FileText, Calendar, Clock, Cpu, Wrench, CalendarClock, Upload, FileUp, Download, Check, Package, Ban
} from 'lucide-react';

interface ConfigurationProps {
  currentView: string;
  users: User[];
  inventory: InventoryItem[];
  modelCatalog: CatalogModel[];
  onUpdateCatalog: (newCatalog: CatalogModel[]) => void;
}

export const Configuration: React.FC<ConfigurationProps> = ({ 
    currentView, users, inventory, modelCatalog, onUpdateCatalog 
}) => {
  const subView = currentView.replace('config-', '');
  
  // --- SUB-COMPONENT: ARTICLES GRID (Unchanged) ---
  const ArticlesGrid = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Box size={20} className="text-purple-600"/> Catálogo de Artículos
            </h3>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                <Plus size={16}/> Nuevo Artículo
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-6 py-4">SKU</th>
                        <th className="px-6 py-4">Descripción</th>
                        <th className="px-6 py-4">Categoría</th>
                        <th className="px-6 py-4 text-right">Costo Ref.</th>
                        <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {inventory.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{item.sku}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                             <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {item.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-700">${item.cost.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-slate-400 hover:text-primary-600 p-1"><Edit2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );

  // --- SUB-COMPONENT: USERS GRID (Unchanged) ---
  const UsersGrid = () => (
    <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-indigo-600"/> Gestión de Usuarios
            </h3>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                <Plus size={16}/> Nuevo Usuario
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Rol Asignado</th>
                        <th className="px-6 py-4">Especialidad</th>
                        <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={u.avatar} className="w-8 h-8 rounded-full bg-slate-200" alt=""/>
                                    <span className="font-medium text-slate-900">{u.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{u.specialty || '-'}</td>
                             <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button className="text-slate-400 hover:text-primary-600"><Edit2 size={16}/></button>
                                    <button className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );

  // --- SUB-COMPONENT: ROLES GRID (Unchanged) ---
  const RolesGrid = () => (
     <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-emerald-600"/> Roles y Permisos
            </h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Nombre del Rol</th>
                        <th className="px-6 py-4">Nivel de Acceso</th>
                        <th className="px-6 py-4">Permisos Clave</th>
                        <th className="px-6 py-4 text-center">Usuarios</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {[UserRole.ADMIN, UserRole.PLANNER, UserRole.TECHNICIAN].map(role => (
                        <tr key={role} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{role}</td>
                            <td className="px-6 py-4 text-slate-600">
                                {role === 'ADMIN' ? 'Acceso Total' : role === 'PLANNER' ? 'Gestión Operativa' : 'Ejecución Limitada'}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                                {role === 'ADMIN' && "Configuración, Usuarios, Compras, Reportes"}
                                {role === 'PLANNER' && "Crear OTs, Planificar, Solicitar Compras"}
                                {role === 'TECHNICIAN' && "Ver Agenda, Completar OTs"}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">
                                    {users.filter(u => u.role === role).length}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );

  // --- NEW SUB-COMPONENT: MODELS TABLE GRID ---
  const ModelsGrid = () => {
      // Main Modal State (Model Edit)
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingId, setEditingId] = useState<string | null>(null);
      const [previewPlansModel, setPreviewPlansModel] = useState<CatalogModel | null>(null);
      const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'plans'>('info');
      const fileInputRef = useRef<HTMLInputElement>(null);

      // Strategy Modal State (Plan Edit)
      const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
      const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
      const [currentPlan, setCurrentPlan] = useState<Partial<MaintenancePlan>>({
          title: '', frequencyDays: 30, estimatedHours: 1, specialtyRequired: 'Mecánica', checklistTemplate: [], requiresDowntime: false, requiredParts: []
      });
      const [tempTask, setTempTask] = useState('');
      
      // New: Temp Part State
      const [tempPartId, setTempPartId] = useState('');
      const [tempPartQty, setTempPartQty] = useState(1);

      // Data States
      const initialModel: Partial<CatalogModel> = {
          brand: '',
          category: '',
          name: '',
          description: '',
          manualUrl: '',
          imageUrl: '',
          standardPlans: [],
          commonFailures: []
      };

      const [formData, setFormData] = useState<Partial<CatalogModel>>(initialModel);
      const [tempFault, setTempFault] = useState<Partial<FrequentFailure>>({
          code: '', title: '', cause: '', solution: ''
      });

      // --- HANDLERS FOR MODEL ---
      const handleOpenCreate = () => {
          setEditingId(null);
          setFormData(initialModel);
          setActiveTab('info');
          setIsModalOpen(true);
      };

      const handleOpenEdit = (model: CatalogModel) => {
          setEditingId(model.id);
          setFormData({ ...model });
          setActiveTab('info');
          setIsModalOpen(true);
      };

      const handleDelete = (id: string) => {
          if (confirm('¿Estás seguro de eliminar este modelo del catálogo?')) {
              onUpdateCatalog(modelCatalog.filter(m => m.id !== id));
          }
      };

      const handleSaveModel = () => {
          if (!formData.name || !formData.category || !formData.brand) {
              alert('Marca, Nombre y Categoría son obligatorios');
              return;
          }

          if (editingId) {
              // Update
              const updatedCatalog = modelCatalog.map(m => 
                  m.id === editingId ? { ...m, ...formData } as CatalogModel : m
              );
              onUpdateCatalog(updatedCatalog);
          } else {
              // Create
              const newModel: CatalogModel = {
                  ...formData,
                  id: `cat-mod-${Date.now()}`,
                  standardPlans: formData.standardPlans || [],
                  commonFailures: formData.commonFailures || []
              } as CatalogModel;
              onUpdateCatalog([...modelCatalog, newModel]);
          }
          setIsModalOpen(false);
      };

      // --- HANDLERS FOR PLANS (STRATEGY) ---
      const handleOpenPlanModal = (index?: number) => {
        if (typeof index === 'number') {
            setEditingPlanIndex(index);
            setCurrentPlan({ ...formData.standardPlans![index] });
        } else {
            setEditingPlanIndex(null);
            setCurrentPlan({
                title: '', 
                frequencyDays: 30, 
                estimatedHours: 1, 
                specialtyRequired: 'Mecánica', 
                checklistTemplate: [],
                requiresDowntime: false,
                requiredParts: []
            });
        }
        setTempTask('');
        setTempPartId('');
        setTempPartQty(1);
        setIsPlanModalOpen(true);
      };

      const handleSavePlan = () => {
        if (!currentPlan.title || !currentPlan.frequencyDays) {
            alert("Título y Frecuencia son obligatorios");
            return;
        }

        const newPlanList = [...(formData.standardPlans || [])];
        
        if (editingPlanIndex !== null) {
            newPlanList[editingPlanIndex] = currentPlan;
        } else {
            newPlanList.push({ ...currentPlan, id: `tpl-${Date.now()}` });
        }
        
        setFormData({ ...formData, standardPlans: newPlanList });
        setIsPlanModalOpen(false);
      };

      const handleRemovePlan = (index: number) => {
          if(confirm("¿Eliminar esta rutina de mantenimiento?")) {
            const newPlanList = formData.standardPlans?.filter((_, i) => i !== index);
            setFormData({ ...formData, standardPlans: newPlanList });
          }
      };

      const handleAddTask = () => {
          if (!tempTask.trim()) return;
          setCurrentPlan({
              ...currentPlan,
              checklistTemplate: [...(currentPlan.checklistTemplate || []), tempTask.trim()]
          });
          setTempTask('');
      };

      const handleRemoveTask = (idx: number) => {
          setCurrentPlan({
              ...currentPlan,
              checklistTemplate: currentPlan.checklistTemplate?.filter((_, i) => i !== idx)
          });
      };

      const handleAddPart = () => {
          if (!tempPartId || tempPartQty <= 0) return;
          const item = inventory.find(i => i.id === tempPartId);
          if (!item) return;

          const newPart: PlanPart = {
              itemId: item.id,
              itemName: item.name,
              quantity: tempPartQty
          };

          setCurrentPlan({
              ...currentPlan,
              requiredParts: [...(currentPlan.requiredParts || []), newPart]
          });
          setTempPartId('');
          setTempPartQty(1);
      };

      const handleRemovePart = (index: number) => {
          setCurrentPlan({
              ...currentPlan,
              requiredParts: currentPlan.requiredParts?.filter((_, i) => i !== index)
          });
      };

      // --- HANDLERS FOR FAULTS ---
      const handleAddFault = () => {
          if (!tempFault.title) return;
          const newFault: FrequentFailure = {
              id: `fail-${Date.now()}`,
              code: tempFault.code || 'GEN',
              title: tempFault.title || '',
              description: tempFault.title,
              cause: tempFault.cause,
              solution: tempFault.solution,
              imageUrl: ''
          };
          setFormData({
              ...formData,
              commonFailures: [...(formData.commonFailures || []), newFault]
          });
          setTempFault({ code: '', title: '', cause: '', solution: '' });
      };

      const handleRemoveFault = (idx: number) => {
          setFormData({
              ...formData,
              commonFailures: formData.commonFailures?.filter((_, i) => i !== idx)
          });
      };

      const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          if(e.target.files && e.target.files[0]){
              const file = e.target.files[0];
              setFormData({ ...formData, manualUrl: file.name });
          }
      };

      const handleImportCSV = () => {
          const demoFaults: FrequentFailure[] = [
              { id: 'f-imp-1', code: 'E01', title: 'Fallo de Encendido', cause: 'Bujía sucia', solution: 'Limpiar o reemplazar bujía', imageUrl: '' },
              { id: 'f-imp-2', code: 'E02', title: 'Sobrecalentamiento', cause: 'Filtro obstruido', solution: 'Limpiar filtro de aire', imageUrl: '' }
          ];
          setFormData({
              ...formData,
              commonFailures: [...(formData.commonFailures || []), ...demoFaults]
          });
          alert('Se han importado 2 fallas de ejemplo.');
      };

      const handleOpenManual = (url?: string) => {
          if (url && url !== '#') {
              if(url.startsWith('http')) window.open(url, '_blank');
              else alert(`Descargando archivo simulado: ${url}`);
          } else {
              alert('Este modelo no tiene un manual enlazado.');
          }
      };

      return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Tags size={20} className="text-pink-600"/> Modelos y Marcas
                </h3>
                <button 
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 shadow-sm transition-colors"
                >
                    <Plus size={16}/> Nuevo Modelo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Modelo</th>
                            <th className="px-6 py-4">Marca / Categoría</th>
                            <th className="px-6 py-4">Descripción</th>
                            <th className="px-6 py-4 text-center">Recursos</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {modelCatalog.map(model => (
                            <tr key={model.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                            {model.imageUrl ? (
                                                <img src={model.imageUrl} className="w-full h-full object-cover" alt=""/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={20}/></div>
                                            )}
                                        </div>
                                        <span className="font-bold text-slate-900">{model.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-slate-700 text-xs">{model.brand}</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200 w-fit">
                                            {model.category}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={model.description}>
                                    {model.description}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => handleOpenManual(model.manualUrl)}
                                            className="text-blue-600 bg-blue-50 border border-blue-100 p-1.5 rounded-lg hover:bg-blue-100 transition-colors" 
                                            title="Ver Manual"
                                        >
                                            <BookOpen size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => setPreviewPlansModel(model)}
                                            className={`p-1.5 rounded-lg border transition-colors ${model.standardPlans.length > 0 ? 'text-teal-600 bg-teal-50 border-teal-100 hover:bg-teal-100' : 'text-slate-300 bg-slate-50 border-slate-200 cursor-not-allowed'}`}
                                            title={`${model.standardPlans.length} Planes Estándar`}
                                            disabled={model.standardPlans.length === 0}
                                        >
                                            <CheckSquare size={16}/>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleOpenEdit(model)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="Editar Modelo"
                                        >
                                            <Edit2 size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(model.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar Modelo"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MAIN MODAL: MODEL EDIT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {editingId ? 'Editar Configuración de Modelo' : 'Nuevo Modelo de Equipo'}
                                </h3>
                                <p className="text-xs text-slate-500">Define las características técnicas y estrategias de mantenimiento.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
                            <button 
                                onClick={() => setActiveTab('info')}
                                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'info' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Tags size={16}/> Ficha Técnica
                            </button>
                            <button 
                                onClick={() => setActiveTab('docs')}
                                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'docs' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <BookOpen size={16}/> Documentación & Fallas
                            </button>
                            <button 
                                onClick={() => setActiveTab('plans')}
                                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'plans' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <ListChecks size={16}/> Estrategia Preventiva
                            </button>
                        </div>
                        
                        {/* Content Area */}
                        <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
                            
                            {/* TAB 1: INFO */}
                            {activeTab === 'info' && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Marca (Fabricante)</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white text-slate-900 shadow-sm"
                                                placeholder="Ej. GIRBAU"
                                                value={formData.brand}
                                                onChange={e => setFormData({...formData, brand: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Categoría de Equipo</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white text-slate-900 shadow-sm"
                                                placeholder="Ej. Túnel de Lavado"
                                                value={formData.category}
                                                onChange={e => setFormData({...formData, category: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nombre del Modelo</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white text-slate-900 shadow-sm"
                                            placeholder="Ej. HS-6023 Inteli"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descripción Técnica</label>
                                        <textarea 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm h-24 resize-none focus:ring-2 focus:ring-pink-500 outline-none bg-white text-slate-900 shadow-sm"
                                            placeholder="Detalles técnicos, capacidades, etc."
                                            value={formData.description}
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL Imagen (Referencia)</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <ImageIcon className="absolute left-3 top-3 text-slate-400" size={16}/>
                                                <input 
                                                    type="text" 
                                                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white text-slate-900 shadow-sm"
                                                    placeholder="https://..."
                                                    value={formData.imageUrl}
                                                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                                                />
                                            </div>
                                            {formData.imageUrl && (
                                                <div className="w-12 h-10 rounded border border-slate-200 overflow-hidden bg-white shrink-0">
                                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: DOCS & FAULTS */}
                            {activeTab === 'docs' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                    
                                    {/* SECTION: USER MANUAL UPLOAD */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                            <BookOpen size={18} className="text-blue-500"/> Documentación Oficial
                                        </h4>
                                        <div 
                                            className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={fileInputRef} 
                                                onChange={handleFileUpload} 
                                                accept=".pdf,.doc,.docx"
                                            />
                                            {formData.manualUrl && !formData.manualUrl.startsWith('http') ? (
                                                <div className="text-center">
                                                    <FileText size={40} className="text-blue-600 mx-auto mb-2"/>
                                                    <p className="text-sm font-bold text-blue-900">{formData.manualUrl}</p>
                                                    <p className="text-xs text-blue-500">Click para cambiar archivo</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload size={40} className="text-blue-400 mx-auto mb-2"/>
                                                    <p className="text-sm font-bold text-slate-700">Cargar Manual de Usuario (PDF)</p>
                                                    <p className="text-xs text-slate-500">Haz clic aquí para seleccionar el archivo</p>
                                                </div>
                                            )}
                                        </div>
                                        {formData.manualUrl && formData.manualUrl.startsWith('http') && (
                                            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                                <ExternalLink size={10}/> Enlazado externamente: <span className="truncate max-w-[200px]">{formData.manualUrl}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* SECTION: FAULT CODES MANAGER */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <AlertTriangle size={18} className="text-orange-500"/> Base de Conocimiento de Fallas
                                            </h4>
                                            <button 
                                                onClick={handleImportCSV}
                                                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"
                                            >
                                                <FileUp size={12}/> Importar CSV
                                            </button>
                                        </div>

                                        {/* Fault Entry Form */}
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                                            <div className="grid grid-cols-12 gap-3 mb-3">
                                                <div className="col-span-3">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Código</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-orange-500 bg-white text-slate-900"
                                                        placeholder="E-001"
                                                        value={tempFault.code}
                                                        onChange={e => setTempFault({...tempFault, code: e.target.value})}
                                                    />
                                                </div>
                                                <div className="col-span-9">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descripción del Fallo</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-orange-500 bg-white text-slate-900"
                                                        placeholder="Ej. Error de temperatura en cámara"
                                                        value={tempFault.title}
                                                        onChange={e => setTempFault({...tempFault, title: e.target.value})}
                                                    />
                                                </div>
                                                <div className="col-span-6">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Causa Probable</label>
                                                    <textarea 
                                                        className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-orange-500 resize-none h-14 bg-white text-slate-900"
                                                        placeholder="Sensor sucio o desconectado..."
                                                        value={tempFault.cause}
                                                        onChange={e => setTempFault({...tempFault, cause: e.target.value})}
                                                    />
                                                </div>
                                                <div className="col-span-6">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Solución Recomendada</label>
                                                    <textarea 
                                                        className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-orange-500 resize-none h-14 bg-white text-slate-900"
                                                        placeholder="Limpiar sensor y reiniciar..."
                                                        value={tempFault.solution}
                                                        onChange={e => setTempFault({...tempFault, solution: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleAddFault}
                                                className="w-full bg-slate-800 text-white py-1.5 rounded text-xs font-bold hover:bg-slate-900"
                                            >
                                                Agregar Falla a la Base de Datos
                                            </button>
                                        </div>

                                        {/* Fault List Table */}
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-100 text-slate-500 font-bold uppercase">
                                                    <tr>
                                                        <th className="px-3 py-2 w-20">Cód</th>
                                                        <th className="px-3 py-2">Falla / Solución</th>
                                                        <th className="px-3 py-2 text-center w-10">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {formData.commonFailures && formData.commonFailures.length > 0 ? (
                                                        formData.commonFailures.map((fail, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50">
                                                                <td className="px-3 py-2 font-mono font-bold text-slate-600 align-top">{fail.code}</td>
                                                                <td className="px-3 py-2 align-top">
                                                                    <div className="font-bold text-slate-800">{fail.title}</div>
                                                                    <div className="text-slate-500 mt-0.5"><span className="font-semibold text-xs text-orange-600">Solución:</span> {fail.solution}</div>
                                                                </td>
                                                                <td className="px-3 py-2 text-center align-top">
                                                                    <button 
                                                                        onClick={() => handleRemoveFault(idx)}
                                                                        className="text-slate-400 hover:text-red-500"
                                                                    >
                                                                        <Trash2 size={14}/>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-3 py-4 text-center text-slate-400">
                                                                No hay fallas registradas.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: PLANS */}
                            {activeTab === 'plans' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-start gap-3">
                                        <ListChecks className="text-teal-600 mt-1" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-teal-900">Planes Preventivos Estándar</h4>
                                            <p className="text-xs text-teal-700 mt-1">
                                                Define las rutinas de mantenimiento. Al crear una máquina de este modelo, estos planes se asignarán automáticamente.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <h5 className="text-xs font-bold text-slate-500 uppercase">Rutinas Definidas ({formData.standardPlans?.length || 0})</h5>
                                        <button 
                                            onClick={() => handleOpenPlanModal()}
                                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                                        >
                                            <Plus size={14}/> Agregar Estrategia/Rutina
                                        </button>
                                    </div>

                                    {/* List of Added Plans */}
                                    <div className="space-y-3">
                                        {formData.standardPlans && formData.standardPlans.length > 0 ? (
                                            formData.standardPlans.map((plan, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-teal-50 p-2.5 rounded-lg text-teal-600">
                                                                <CalendarClock size={20}/>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-sm font-bold text-slate-900">{plan.title}</h4>
                                                                    {plan.requiresDowntime && (
                                                                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-1">
                                                                            <Ban size={10} /> PARADA
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"><Calendar size={12}/> {plan.frequencyDays} días</span>
                                                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"><Clock size={12}/> {plan.estimatedHours}h</span>
                                                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"><Wrench size={12}/> {plan.specialtyRequired}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleOpenPlanModal(idx)}
                                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                                                title="Editar Rutina"
                                                            >
                                                                <Edit2 size={16}/>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRemovePlan(idx)}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Eliminar Rutina"
                                                            >
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {plan.checklistTemplate && plan.checklistTemplate.length > 0 && (
                                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Tareas Incluidas ({plan.checklistTemplate.length})</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {plan.checklistTemplate.slice(0, 4).map((task, tIdx) => (
                                                                    <div key={tIdx} className="flex items-center gap-2 text-xs text-slate-600 truncate">
                                                                        <CheckSquare size={12} className="text-teal-400 shrink-0"/> {task}
                                                                    </div>
                                                                ))}
                                                                {plan.checklistTemplate.length > 4 && (
                                                                    <span className="text-xs text-slate-400 italic pl-5">... y {plan.checklistTemplate.length - 4} más</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                                                <ListChecks size={32} className="mb-2 opacity-50"/>
                                                <p className="text-sm font-medium">No hay rutinas configuradas</p>
                                                <p className="text-xs">Define los planes de mantenimiento para este modelo.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                                Cancelar Operación
                            </button>
                            <button onClick={handleSaveModel} className="bg-pink-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200">
                                {editingId ? 'Guardar Cambios' : 'Crear Modelo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SECONDARY MODAL: PLAN EDITING (NESTED - REDESIGNED WIDE) */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Definir Rutina de Mantenimiento</h3>
                                <p className="text-xs text-slate-500">{editingPlanIndex !== null ? 'Editar plan existente' : 'Crear nueva estrategia de mantenimiento'}</p>
                            </div>
                            <button onClick={() => setIsPlanModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        
                        {/* Body - Split Columns */}
                        <div className="p-6 flex-1 overflow-hidden">
                            <div className="flex flex-col h-full gap-6">
                                
                                {/* Top Section: General Info (Horizontal Layout) */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
                                    <div className="lg:col-span-8">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de la Rutina</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-900"
                                            placeholder="Ej. Mantenimiento Mensual - Mecánica"
                                            value={currentPlan.title}
                                            onChange={e => setCurrentPlan({...currentPlan, title: e.target.value})}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="lg:col-span-4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especialidad</label>
                                        <select 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-900"
                                            value={currentPlan.specialtyRequired}
                                            onChange={e => setCurrentPlan({...currentPlan, specialtyRequired: e.target.value})}
                                        >
                                            <option value="Mecánica">Mecánica</option>
                                            <option value="Electricidad">Electricidad</option>
                                            <option value="Hidráulica">Hidráulica</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                    
                                    <div className="lg:col-span-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frecuencia (Días)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14}/>
                                            <input 
                                                type="number" 
                                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-900"
                                                value={currentPlan.frequencyDays}
                                                onChange={e => setCurrentPlan({...currentPlan, frequencyDays: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                    <div className="lg:col-span-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración (Horas)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 text-slate-400" size={14}/>
                                            <input 
                                                type="number" 
                                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-900"
                                                value={currentPlan.estimatedHours}
                                                onChange={e => setCurrentPlan({...currentPlan, estimatedHours: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                    <div className="lg:col-span-6 flex items-end pb-1">
                                        <label className={`flex items-center gap-3 w-full p-2.5 rounded-lg border cursor-pointer transition-colors ${currentPlan.requiresDowntime ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                                                checked={currentPlan.requiresDowntime || false}
                                                onChange={e => setCurrentPlan({...currentPlan, requiresDowntime: e.target.checked})}
                                            />
                                            <span className={`text-sm font-bold ${currentPlan.requiresDowntime ? 'text-red-700' : 'text-slate-600'}`}>
                                                Requiere Parada de Máquina
                                            </span>
                                            {currentPlan.requiresDowntime && <Ban size={16} className="ml-auto text-red-500"/>}
                                        </label>
                                    </div>
                                </div>

                                {/* Divider */}
                                <hr className="border-slate-100" />

                                {/* Bottom Section: 2 Columns Split */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                                    
                                    {/* Left Column: Checklist */}
                                    <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 p-4">
                                        <div className="flex justify-between items-center mb-3 shrink-0">
                                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <CheckSquare size={14}/> Checklist de Tareas ({currentPlan.checklistTemplate?.length || 0})
                                            </label>
                                        </div>
                                        
                                        <div className="flex gap-2 mb-3 shrink-0">
                                            <input 
                                                type="text" 
                                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-900"
                                                placeholder="Describir tarea..."
                                                value={tempTask}
                                                onChange={e => setTempTask(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                            />
                                            <button 
                                                onClick={handleAddTask}
                                                className="bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                            >
                                                <Plus size={18}/>
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                            {currentPlan.checklistTemplate && currentPlan.checklistTemplate.length > 0 ? (
                                                currentPlan.checklistTemplate.map((task, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded border border-slate-200 text-sm group shadow-sm">
                                                        <span className="text-teal-500 font-bold mt-0.5">•</span>
                                                        <span className="flex-1 text-slate-700 leading-snug">{task}</span>
                                                        <button 
                                                            onClick={() => handleRemoveTask(idx)}
                                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                                    <ListChecks size={32} className="mb-2 opacity-50"/>
                                                    <p className="text-xs italic">No hay tareas definidas.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Parts */}
                                    <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 p-4">
                                        <div className="flex justify-between items-center mb-3 shrink-0">
                                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <Package size={14}/> Repuestos Necesarios
                                            </label>
                                        </div>

                                        <div className="flex gap-2 mb-3 shrink-0">
                                            <select
                                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none bg-white text-slate-900 truncate"
                                                value={tempPartId}
                                                onChange={e => setTempPartId(e.target.value)}
                                            >
                                                <option value="">Seleccionar Repuesto...</option>
                                                {inventory.map(item => (
                                                    <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 border border-slate-300 rounded-lg px-2 py-2 text-sm text-center outline-none bg-white text-slate-900"
                                                value={tempPartQty}
                                                onChange={e => setTempPartQty(Number(e.target.value))}
                                            />
                                            <button
                                                onClick={handleAddPart}
                                                className="bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                            >
                                                <Plus size={18}/>
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                            {currentPlan.requiredParts && currentPlan.requiredParts.length > 0 ? (
                                                currentPlan.requiredParts.map((part, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200 text-sm shadow-sm">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="bg-blue-50 p-1 rounded text-blue-500 shrink-0"><Package size={12}/></div>
                                                            <span className="text-slate-700 font-medium truncate">{part.itemName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600">x{part.quantity}</span>
                                                            <button onClick={() => handleRemovePart(idx)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                                    <Package size={32} className="mb-2 opacity-50"/>
                                                    <p className="text-xs italic">No se requieren repuestos.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => setIsPlanModalOpen(false)}
                                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSavePlan}
                                className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-teal-700 shadow-lg shadow-teal-100 flex items-center gap-2 transition-colors"
                            >
                                <Check size={16}/> {editingPlanIndex !== null ? 'Actualizar Rutina' : 'Agregar Rutina'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW PLANS MODAL (Read Only) */}
            {previewPlansModel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-teal-100 bg-teal-50 rounded-t-xl flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-teal-900 flex items-center gap-2">
                                    <CheckSquare size={18}/> Planes Estándar
                                </h3>
                                <p className="text-xs text-teal-700">{previewPlansModel.name}</p>
                            </div>
                            <button onClick={() => setPreviewPlansModel(null)} className="text-teal-400 hover:text-teal-700"><X size={20}/></button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            {previewPlansModel.standardPlans.length > 0 ? (
                                <div className="space-y-3">
                                    {previewPlansModel.standardPlans.map((plan, idx) => (
                                        <div key={idx} className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-slate-800 text-sm">{plan.title}</span>
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">{plan.specialtyRequired}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 flex gap-3">
                                                <span>Frec: {plan.frequencyDays} días</span>
                                                <span>•</span>
                                                <span>Duración: {plan.estimatedHours}h</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-slate-400 text-sm py-4">No hay planes configurados.</p>
                            )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 rounded-b-xl text-center">
                            <button onClick={() => setPreviewPlansModel(null)} className="text-sm font-medium text-slate-500 hover:text-slate-800">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Configuración</h2>
        <p className="text-slate-500">Administración de datos maestros del sistema.</p>
      </div>

      {subView === 'models' && <ModelsGrid />}
      {subView === 'articles' && <ArticlesGrid />}
      {subView === 'users' && <UsersGrid />}
      {subView === 'roles' && <RolesGrid />}
    </div>
  );
};