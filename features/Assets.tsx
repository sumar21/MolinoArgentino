import React, { useState, useEffect } from 'react';
import { User, Asset, InventoryItem, TaskTemplate, MaintenancePlan, PlanPart, CatalogModel } from '../types';
import { 
  Cpu, Plus, Search, FileText, AlertTriangle, X, BookOpen, Download, ClipboardList, CheckSquare, Save, Clock, Calendar, ArrowRight, Eye, ChevronDown, Ban, Package, Sparkles, Trash2, CalendarClock, Tags, Wrench, HelpCircle, CheckCircle2, Info, AlertCircle
} from 'lucide-react';

interface AssetsProps {
  assets: Asset[];
  inventory: InventoryItem[];
  taskTemplates: TaskTemplate[];
  maintenancePlans: MaintenancePlan[];
  modelCatalog: CatalogModel[];
  onCreatePlan: (plan: MaintenancePlan) => void;
  onDeletePlan: (planId: string) => void;
  onCreateAsset: (asset: Asset) => void;
}

export const Assets: React.FC<AssetsProps> = ({ 
    assets, inventory, taskTemplates, maintenancePlans, modelCatalog, onCreatePlan, onDeletePlan, onCreateAsset 
}) => {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

    // State for Add Machine Modal
    const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
    const [newMachine, setNewMachine] = useState<Partial<Asset>>({
        status: 'OPERATIONAL',
        brand: '',
        category: '',
        model: ''
    });

    // States for "Create Plan" inside Detail View
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<MaintenancePlan>>({
        frequencyDays: 30,
        estimatedHours: 1,
        specialtyRequired: 'Mecánica',
        checklistTemplate: [],
        requiresDowntime: false,
        requiredParts: []
    });
    const [tempTask, setTempTask] = useState('');
    
    // States for Fault Modal
    const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
    const [faultSearchTerm, setFaultSearchTerm] = useState('');
    
    // States for Parts Selector inside Modal
    const [selectedPartId, setSelectedPartId] = useState('');
    const [partQty, setPartQty] = useState(1);

    // Derived Lists for Cascading Dropdowns
    const availableBrands = Array.from(new Set(modelCatalog.map(m => m.brand))).sort();
    
    const availableCategories = newMachine.brand 
        ? Array.from(new Set(modelCatalog.filter(m => m.brand === newMachine.brand).map(m => m.category))).sort()
        : [];

    const availableModels = newMachine.brand && newMachine.category
        ? modelCatalog.filter(m => m.brand === newMachine.brand && m.category === newMachine.category).sort((a,b) => a.name.localeCompare(b.name))
        : [];

    const selectedModelData = availableModels.find(m => m.name === newMachine.model);

    const openDetail = (asset: Asset) => {
        setSelectedAsset(asset);
        setViewMode('detail');
    };

    const closeDetail = () => {
        setSelectedAsset(null);
        setViewMode('list');
    };

    // Machine Creation Logic
    const handleCreateMachine = () => {
        if (!newMachine.name || !newMachine.location) return alert("Nombre y Ubicación son obligatorios.");
        
        const asset: Asset = {
            id: `a-${Date.now()}`,
            name: newMachine.name,
            location: newMachine.location,
            sector: newMachine.sector || 'General',
            brand: newMachine.brand,
            category: newMachine.category,
            model: newMachine.model,
            serialNumber: newMachine.serialNumber || 'S/N',
            status: newMachine.status as 'OPERATIONAL' | 'DOWN' || 'OPERATIONAL',
            frequentFailures: []
        };
        
        onCreateAsset(asset);
        setIsAddMachineOpen(false);
        setNewMachine({ status: 'OPERATIONAL', brand: '', category: '', model: '' });
    };

    // Plan Management Logic
    const handleAddPlan = () => {
        if (!selectedAsset || !newPlan.title || !newPlan.frequencyDays) return alert("Faltan datos obligatorios.");
        
        const plan: MaintenancePlan = {
            id: `mp-${Date.now()}`,
            assetId: selectedAsset.id,
            assetName: selectedAsset.name,
            title: newPlan.title,
            frequencyDays: Number(newPlan.frequencyDays),
            nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Default tomorrow
            estimatedHours: Number(newPlan.estimatedHours),
            specialtyRequired: newPlan.specialtyRequired || 'Mecánica',
            checklistTemplate: newPlan.checklistTemplate || [],
            requiresDowntime: newPlan.requiresDowntime,
            requiredParts: newPlan.requiredParts
        };

        onCreatePlan(plan);
        setIsPlanModalOpen(false);
        setNewPlan({ frequencyDays: 30, estimatedHours: 1, specialtyRequired: 'Mecánica', checklistTemplate: [], requiresDowntime: false, requiredParts: [] });
    };

    const addTask = () => {
        if (tempTask.trim()) {
            setNewPlan(prev => ({ ...prev, checklistTemplate: [...(prev.checklistTemplate || []), tempTask.trim()] }));
            setTempTask('');
        }
    };
    
    const addPart = () => {
        if (selectedPartId && partQty > 0) {
            const item = inventory.find(i => i.id === selectedPartId);
            if (item) {
                const newPart: PlanPart = {
                    itemId: item.id,
                    itemName: item.name,
                    quantity: partQty
                };
                setNewPlan(prev => ({
                    ...prev,
                    requiredParts: [...(prev.requiredParts || []), newPart]
                }));
                setSelectedPartId('');
                setPartQty(1);
            }
        }
    };
    
    const removePart = (idx: number) => {
        setNewPlan(prev => ({
            ...prev,
            requiredParts: prev.requiredParts?.filter((_, i) => i !== idx)
        }));
    };

    // Helper for Fault Filtering
    const getFilteredFaults = () => {
        if (!selectedAsset || !selectedAsset.frequentFailures) return [];
        if (!faultSearchTerm) return selectedAsset.frequentFailures;
        
        const term = faultSearchTerm.toLowerCase();
        return selectedAsset.frequentFailures.filter(f => 
            f.code.toLowerCase().includes(term) ||
            f.title.toLowerCase().includes(term) ||
            (f.cause && f.cause.toLowerCase().includes(term)) ||
            (f.solution && f.solution.toLowerCase().includes(term))
        );
    };

    const filteredFaults = getFilteredFaults();

    // Render List Mode
    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Cpu size={24} className="text-primary-600"/> Gestión de Activos
                        </h2>
                        <p className="text-slate-500 text-sm">Inventario de maquinaria y equipos.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddMachineOpen(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                        <Plus size={16}/> Nuevo Máquina
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Máquina</th>
                                <th className="px-6 py-4">Marca / Modelo</th>
                                <th className="px-6 py-4">Sector / Ubicación</th>
                                <th className="px-6 py-4">N° Serie</th>
                                <th className="px-6 py-4 text-center">Planes Prev.</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assets.map(asset => {
                                const assetPlans = maintenancePlans.filter(p => p.assetId === asset.id);
                                return (
                                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openDetail(asset)}>
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                <Cpu size={18} />
                                            </div>
                                            <div>
                                              <div>{asset.name}</div>
                                              {asset.tag && (
                                                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{asset.tag}</span>
                                              )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {asset.category ? (
                                                <div>
                                                    <div className="font-bold text-slate-700">{asset.category}</div>
                                                    {asset.sector && <div className="text-xs text-slate-400">{asset.sector}</div>}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="font-medium text-slate-800">{asset.sector || 'N/A'}</div>
                                            <div className="text-xs text-slate-400">{asset.location}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{asset.serialNumber || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            {assetPlans.length > 0 ? (
                                                <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs font-bold border border-teal-100">
                                                    <ClipboardList size={12}/> {assetPlans.length} Activos
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${asset.status === 'OPERATIONAL' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {asset.status === 'OPERATIONAL' ? 'OPERATIVO' : 'PARADA'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); openDetail(asset); }}
                                                className="text-primary-600 hover:text-primary-800 font-medium text-xs flex items-center justify-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                                            >
                                                <Eye size={14}/> Ficha Técnica
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* MODAL: NEW MACHINE */}
                {isAddMachineOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                                <div>
                                    <h3 className="font-bold text-slate-800">Alta de Nueva Máquina</h3>
                                    <p className="text-xs text-slate-500">Registrar un nuevo activo en el sistema.</p>
                                </div>
                                <button onClick={() => setIsAddMachineOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                            </div>
                            
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Equipo <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                                        placeholder="Ej. Compresor de Tornillo #2"
                                        value={newMachine.name || ''}
                                        onChange={e => setNewMachine({...newMachine, name: e.target.value})}
                                    />
                                </div>

                                {/* CASCADING DROPDOWNS: BRAND -> CATEGORY -> MODEL */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marca (Fabricante)</label>
                                            <select 
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                                                value={newMachine.brand || ''}
                                                onChange={e => setNewMachine({...newMachine, brand: e.target.value, category: '', model: ''})}
                                            >
                                                <option value="">Seleccionar Marca...</option>
                                                {availableBrands.map(brand => (
                                                    <option key={brand} value={brand}>{brand}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría (Tipo)</label>
                                            <select 
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                                                value={newMachine.category || ''}
                                                onChange={e => setNewMachine({...newMachine, category: e.target.value, model: ''})}
                                                disabled={!newMachine.brand}
                                            >
                                                <option value="">Seleccionar Tipo...</option>
                                                {availableCategories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modelo Específico</label>
                                        <select 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                                            value={newMachine.model || ''}
                                            onChange={e => setNewMachine({...newMachine, model: e.target.value})}
                                            disabled={!newMachine.category}
                                        >
                                            <option value="">Seleccionar Modelo...</option>
                                            {availableModels.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* SMART PREVIEW */}
                                {selectedModelData && (
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                                Configuración Automática Detectada
                                            </h4>
                                            <p className="text-xs text-indigo-700 mt-1">
                                                Al crear este equipo, se importarán automáticamente:
                                            </p>
                                            <ul className="mt-2 space-y-1 text-xs text-indigo-800">
                                                <li className="flex items-center gap-1"><CheckSquare size={12}/> {selectedModelData.standardPlans.length} Planes Preventivos Recomendados</li>
                                                <li className="flex items-center gap-1"><BookOpen size={12}/> Manual de Usuario Oficial</li>
                                                <li className="flex items-center gap-1"><AlertTriangle size={12}/> Base de Fallas Comunes</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sector / Área</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                                            placeholder="Ej. Sala de Máquinas"
                                            value={newMachine.sector || ''}
                                            onChange={e => setNewMachine({...newMachine, sector: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación Física <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                                            placeholder="Ej. Nave Industrial B"
                                            value={newMachine.location || ''}
                                            onChange={e => setNewMachine({...newMachine, location: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número de Serie</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 font-mono"
                                        placeholder="S/N-12345-XYZ"
                                        value={newMachine.serialNumber || ''}
                                        onChange={e => setNewMachine({...newMachine, serialNumber: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado Inicial</label>
                                    <select 
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                                        value={newMachine.status}
                                        onChange={e => setNewMachine({...newMachine, status: e.target.value as any})}
                                    >
                                        <option value="OPERATIONAL">OPERATIVO</option>
                                        <option value="DOWN">PARADA (Fuera de Servicio)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                                <button onClick={() => setIsAddMachineOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
                                <button 
                                    onClick={handleCreateMachine}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-sm flex items-center gap-2"
                                >
                                    <Save size={18}/> Crear Máquina
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render Detail Mode
    if (viewMode === 'detail' && selectedAsset) {
        const assetPlans = maintenancePlans.filter(p => p.assetId === selectedAsset.id);

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Breadcrumb / Header */}
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                    <button onClick={closeDetail} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowRight size={20} className="rotate-180" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {selectedAsset.name}
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${selectedAsset.status === 'OPERATIONAL' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {selectedAsset.status}
                            </span>
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="font-mono bg-slate-100 px-1.5 rounded">{selectedAsset.serialNumber}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{selectedAsset.brand}</span>
                            <span>•</span>
                            <span className="text-slate-600">{selectedAsset.category}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">{selectedAsset.model || 'Modelo Genérico'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: General Info & Docs */}
                    <div className="space-y-6">
                        {selectedAsset.imageUrl && (
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                                <img src={selectedAsset.imageUrl} alt={selectedAsset.name} className="w-full h-48 object-cover rounded-lg" />
                            </div>
                        )}

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
                                <BookOpen size={16} className="text-primary-500"/> Documentación
                            </h4>
                            <div className="space-y-3">
                                {selectedAsset.manualUrl && selectedAsset.manualUrl !== '#' && (
                                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded border border-indigo-200 text-indigo-500"><FileText size={20}/></div>
                                            <div>
                                                <p className="text-sm font-bold text-indigo-900">Manual de Fabricante</p>
                                                <p className="text-xs text-indigo-600">Oficial • PDF</p>
                                            </div>
                                        </div>
                                        <button className="text-indigo-600 hover:text-indigo-800"><Download size={18}/></button>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded border border-slate-200 text-slate-500"><FileText size={20}/></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">Diagrama Eléctrico</p>
                                            <p className="text-xs text-slate-400">PDF • 5.1 MB</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-600 hover:text-slate-800"><Download size={18}/></button>
                                </div>

                                {/* MANUAL DE FALLAS ACCESS */}
                                <button 
                                    onClick={() => {
                                        setFaultSearchTerm('');
                                        setIsFaultModalOpen(true);
                                    }}
                                    className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 group hover:bg-orange-100 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded border border-orange-200 text-orange-500 group-hover:border-orange-300">
                                            <HelpCircle size={20}/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-orange-900">Manual de Fallas</p>
                                            <p className="text-xs text-orange-700">Base de conocimiento y soluciones</p>
                                        </div>
                                    </div>
                                    <div className="text-orange-400 group-hover:text-orange-600">
                                        <ArrowRight size={18}/>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Maintenance Strategy (Preventive Plans) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <CalendarClock size={20} className="text-teal-600"/> Estrategia de Mantenimiento
                                    </h3>
                                    <p className="text-sm text-slate-500">Planes preventivos recurrentes asignados a este equipo.</p>
                                </div>
                                <button 
                                    onClick={() => setIsPlanModalOpen(true)}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Plus size={16}/> Agregar Plan
                                </button>
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto bg-slate-50">
                                {assetPlans.length === 0 ? (
                                    <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                        <ClipboardList size={32} className="mb-2 opacity-50"/>
                                        <p className="text-sm font-medium">Este equipo no tiene planes preventivos.</p>
                                        <p className="text-xs">Agrega uno para automatizar la generación de OTs.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assetPlans.map(plan => (
                                            <div key={plan.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                             <h4 className="text-base font-bold text-slate-900">{plan.title}</h4>
                                                             {plan.requiresDowntime && (
                                                                 <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-1">
                                                                     <Ban size={10} /> PARADA
                                                                 </span>
                                                             )}
                                                             {plan.requiredParts && plan.requiredParts.length > 0 && (
                                                                 <span className="bg-primary-100 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary-200 flex items-center gap-1">
                                                                     <Package size={10} /> REPUESTOS
                                                                 </span>
                                                             )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium"><Calendar size={12}/> Cada {plan.frequencyDays} días</span>
                                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium"><Clock size={12}/> {plan.estimatedHours}h Est.</span>
                                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium"><Cpu size={12}/> {plan.specialtyRequired}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            if(confirm('¿Eliminar este plan?')) onDeletePlan(plan.id);
                                                        }}
                                                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                                
                                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Tareas ({plan.checklistTemplate.length})</p>
                                                    <div className="space-y-1">
                                                        {plan.checklistTemplate.slice(0, 3).map((task, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                                <CheckSquare size={14} className="mt-0.5 text-teal-500 shrink-0"/>
                                                                <span className="truncate">{task}</span>
                                                            </div>
                                                        ))}
                                                        {plan.checklistTemplate.length > 3 && (
                                                            <p className="text-xs text-slate-400 pl-6 italic">+ {plan.checklistTemplate.length - 3} tareas más...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL: ADD MAINTENANCE PLAN */}
                {isPlanModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                                <div>
                                    <h3 className="font-bold text-slate-800">Nuevo Plan Preventivo</h3>
                                    <p className="text-xs text-slate-500">Asignar rutina de mantenimiento a: <span className="font-bold">{selectedAsset.name}</span></p>
                                </div>
                                <button onClick={() => setIsPlanModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                            </div>
                            
                            <div className="p-6 space-y-6 overflow-y-auto">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título del Plan <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="Ej. Lubricación Semanal de Rodamientos"
                                            value={newPlan.title || ''}
                                            onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frecuencia (Días)</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                                <input 
                                                    type="number" 
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                    value={newPlan.frequencyDays}
                                                    onChange={e => setNewPlan({...newPlan, frequencyDays: Number(e.target.value)})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración Estimada (Horas)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                                <input 
                                                    type="number" 
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                    value={newPlan.estimatedHours}
                                                    onChange={e => setNewPlan({...newPlan, estimatedHours: Number(e.target.value)})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especialidad</label>
                                            <div className="relative">
                                                <Cpu className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                                <select 
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                                    value={newPlan.specialtyRequired}
                                                    onChange={e => setNewPlan({...newPlan, specialtyRequired: e.target.value})}
                                                >
                                                    <option value="Mecánica">Mecánica</option>
                                                    <option value="Electricidad">Electricidad</option>
                                                    <option value="Hidráulica">Hidráulica</option>
                                                    <option value="General">General</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                                    checked={newPlan.requiresDowntime}
                                                    onChange={e => setNewPlan({...newPlan, requiresDowntime: e.target.checked})}
                                                />
                                                <span className="text-sm font-medium text-slate-700">Requiere Parada de Máquina</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100"/>

                                {/* Checklist Builder */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Checklist de Tareas</label>
                                    <div className="flex gap-2 mb-3">
                                        <input 
                                            type="text" 
                                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="Describir tarea..."
                                            value={tempTask}
                                            onChange={e => setTempTask(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addTask()}
                                        />
                                        <button 
                                            onClick={addTask}
                                            className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 font-bold text-sm"
                                        >
                                            <Plus size={18}/>
                                        </button>
                                    </div>
                                    
                                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 min-h-[100px] max-h-[200px] overflow-y-auto space-y-1">
                                        {newPlan.checklistTemplate && newPlan.checklistTemplate.length > 0 ? (
                                            newPlan.checklistTemplate.map((task, idx) => (
                                                <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-slate-100 text-sm">
                                                    <span className="text-teal-500 font-bold">{idx + 1}.</span>
                                                    <span className="flex-1 text-slate-700">{task}</span>
                                                    <button 
                                                        onClick={() => setNewPlan(prev => ({...prev, checklistTemplate: prev.checklistTemplate?.filter((_, i) => i !== idx)}))}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4">
                                                <CheckSquare size={24} className="mb-1 opacity-50"/>
                                                <span className="text-xs">Agrega tareas al checklist</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <hr className="border-slate-100"/>

                                {/* Parts Requirement */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Repuestos Necesarios</label>
                                    <div className="flex gap-2 mb-3">
                                        <select 
                                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                            value={selectedPartId}
                                            onChange={e => setSelectedPartId(e.target.value)}
                                        >
                                            <option value="">Seleccionar Repuesto...</option>
                                            {inventory.map(item => (
                                                <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity})</option>
                                            ))}
                                        </select>
                                        <input 
                                            type="number" 
                                            className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                            min="1"
                                            value={partQty}
                                            onChange={e => setPartQty(Number(e.target.value))}
                                        />
                                        <button 
                                            onClick={addPart}
                                            className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 font-bold text-sm"
                                        >
                                            <Plus size={18}/>
                                        </button>
                                    </div>

                                    {newPlan.requiredParts && newPlan.requiredParts.length > 0 && (
                                        <div className="space-y-1">
                                            {newPlan.requiredParts.map((part, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-100 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Wrench size={14} className="text-blue-500"/>
                                                        <span className="text-blue-900 font-medium">{part.itemName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-white px-2 py-0.5 rounded text-xs font-bold border border-blue-200">x{part.quantity}</span>
                                                        <button 
                                                            onClick={() => removePart(idx)}
                                                            className="text-blue-400 hover:text-red-500"
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                                <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
                                <button 
                                    onClick={handleAddPlan}
                                    className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 shadow-sm flex items-center gap-2"
                                >
                                    <Save size={18}/> Guardar Plan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: MANUAL DE FALLAS (TROUBLESHOOTING) */}
                {isFaultModalOpen && selectedAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col">
                            
                            {/* Header */}
                            <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white rounded-t-xl shrink-0">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-100 p-3 rounded-xl text-orange-600 shadow-sm">
                                            <AlertTriangle size={32}/>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Base de Conocimiento: Fallas Comunes</h3>
                                            <p className="text-sm text-slate-500">
                                                Guía de solución de problemas para <span className="font-bold text-slate-700">{selectedAsset.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsFaultModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                                    <input 
                                        type="text" 
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none bg-white shadow-sm transition-all"
                                        placeholder="Buscar por código de error, descripción o causa..."
                                        value={faultSearchTerm}
                                        onChange={(e) => setFaultSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Body */}
                            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
                                {filteredFaults.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <div className="bg-white p-4 rounded-full mb-3 shadow-sm border border-slate-100">
                                            <Search size={48} className="text-slate-200" />
                                        </div>
                                        <p className="font-medium text-lg text-slate-600">No se encontraron resultados</p>
                                        <p className="text-sm">Intenta con otro código o palabra clave.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredFaults.map((fail, i) => (
                                            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col lg:flex-row gap-6">
                                                {/* Left: Code & Title */}
                                                <div className="lg:w-1/3 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-sm font-bold bg-slate-800 text-white px-3 py-1 rounded shadow-sm tracking-wider">
                                                            {fail.code}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Error / Alarma</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-lg leading-snug">
                                                        {fail.title}
                                                    </h4>
                                                    
                                                    {fail.cause && (
                                                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-800 flex items-start gap-2 mt-2">
                                                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                                                            <div>
                                                                <span className="font-bold block text-xs text-red-500 uppercase mb-1">Causa Probable</span>
                                                                {fail.cause}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Solution */}
                                                <div className="lg:w-2/3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col">
                                                     <div className="flex items-center gap-2 mb-3 pb-3 border-b border-emerald-100">
                                                         <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600">
                                                             <CheckCircle2 size={18} />
                                                         </div>
                                                         <h5 className="font-bold text-emerald-900 text-sm uppercase tracking-wide">Acción Recomendada</h5>
                                                     </div>
                                                     <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                         {fail.solution || "Consulte el manual del fabricante para más detalles sobre este código."}
                                                     </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Footer */}
                            <div className="p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-400">
                                Mostrando {filteredFaults.length} de {selectedAsset.frequentFailures?.length || 0} registros
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
}