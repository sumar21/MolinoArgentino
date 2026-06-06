
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, AlertTriangle, ShoppingCart, Search, Filter } from 'lucide-react';

interface InventoryProps {
  inventory: InventoryItem[];
  onRequestPurchase: (itemId: string, qty: number) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  inventory, 
  onRequestPurchase, 
}) => {
  const [qtyInputs, setQtyInputs] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleQtyChange = (id: string, val: string) => {
    setQtyInputs(prev => ({ ...prev, [id]: parseInt(val) || 0 }));
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Almacén y Stock</h2>
          <p className="text-slate-500">Consulta de disponibilidad y solicitud de reposición.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar SKU o Nombre..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs tracking-wider">
            <tr>
            <th className="px-6 py-4 font-semibold">SKU / Ítem</th>
            <th className="px-6 py-4 font-semibold">Categoría</th>
            <th className="px-6 py-4 font-semibold">Stock Actual</th>
            <th className="px-6 py-4 font-semibold text-right">Reposición</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
            {filteredInventory.map(item => {
            const isLowStock = item.quantity <= item.minStock;
            return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${isLowStock ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{item.sku}</p>
                    </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {item.category}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                        {item.quantity} <span className="text-xs font-normal text-slate-400">un.</span>
                    </span>
                    {isLowStock && (
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                        <AlertTriangle size={10} /> Crítico (Min: {item.minStock})
                        </div>
                    )}
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                            <input 
                                type="number" 
                                min="1"
                                placeholder="10"
                                className="w-20 border border-slate-200 rounded-lg pl-3 pr-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            />
                        </div>
                        <button 
                        onClick={() => onRequestPurchase(item.id, qtyInputs[item.id] || 10)}
                        className="bg-white border border-slate-200 text-primary-600 hover:bg-primary-50 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
                        >
                        <ShoppingCart size={14} /> Solicitar
                        </button>
                    </div>
                </td>
                </tr>
            );
            })}
            {filteredInventory.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No se encontraron artículos.
                    </td>
                </tr>
            )}
        </tbody>
        </table>
      </div>
    </div>
  );
};
