
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  LayoutDashboard, Wrench, Package, ShoppingCart, LogOut, Menu,
  HardHat, CalendarClock, Settings, Users, Shield, Cpu, Box,
  ChevronDown, Tags, MessageSquare, Egg, AlertTriangle,
  PanelLeftClose, PanelLeftOpen,
  ShieldCheck, Factory, Gauge,
} from 'lucide-react';

interface LayoutProps {
  currentUser: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentUser, currentView, onNavigate, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const canSeeConfig = [UserRole.ADMIN, UserRole.PLANNER].includes(currentUser.role);

  const rolLabel = () => {
    if (currentUser.role === UserRole.ADMIN) return 'Jefatura de Planta';
    if (currentUser.role === UserRole.PLANNER) return 'Jefe de Mantenimiento';
    if (currentUser.role === UserRole.OPERATIONS) return 'Operaciones';
    return 'Operario de Mantenimiento';
  };

  // Nav item — adapta entre modo expandido e ícono solo
  const NavItem = ({ view, label, icon: Icon, restrictedTo, onClick, isSubItem }: any) => {
    if (restrictedTo && !restrictedTo.includes(currentUser.role)) return null;
    const isActive = currentView === view;
    if (collapsed && !isSubItem) {
      return (
        <div className="relative group/tip mb-1">
          <button
            onClick={() => { if (onClick) onClick(); else { onNavigate(view); } }}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors
              ${isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            title={label}
          >
            {Icon && <Icon size={20} />}
          </button>
          {/* Tooltip */}
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
            bg-slate-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg
            opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
          </div>
        </div>
      );
    }
    return (
      <button
        onClick={() => {
          if (onClick) onClick();
          else { onNavigate(view); setIsMobileMenuOpen(false); }
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1
          ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
          ${isSubItem ? 'pl-11 text-xs' : ''}`}
      >
        {Icon && <Icon size={isSubItem ? 16 : 20} />}
        <span className="flex-1 text-left">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar Desktop ── */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-white h-full shadow-xl z-30 transition-all duration-300 ease-in-out ${collapsed ? 'w-[68px]' : 'w-64'}`}
      >
        {/* Header */}
        <div className={`border-b border-slate-800 flex items-center h-[73px] shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}>
          {collapsed ? (
            <div className="bg-primary-600 p-2 rounded-lg shadow-lg">
              <Egg className="text-white" size={22} />
            </div>
          ) : (
            <>
              <div className="bg-primary-600 p-2 rounded-lg shadow-lg shadow-primary-500/20 shrink-0">
                <Egg className="text-white" size={22} />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">MNT App</h1>
                <p className="text-[10px] text-slate-400 leading-tight">Sistema de Mantenimiento</p>
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${collapsed ? 'px-2' : 'px-4'}`}>
          {!collapsed && (
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4">
              Módulos
            </div>
          )}

          <NavItem view="dashboard"    label="Dashboard KPI"       icon={LayoutDashboard} restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="daily-report" label="Parte Diario"        icon={MessageSquare}   restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="work-orders"  label="Órdenes de Trabajo"  icon={Wrench}          restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="preventive"   label="Plan Preventivo"     icon={CalendarClock}   restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="assets"       label="Equipos"             icon={Cpu}             restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="inventory"    label="Almacén & Stock"     icon={Package}         restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="purchasing"   label="Compras"             icon={ShoppingCart}    restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />

          {/* ── Gestión de Planta ── */}
          {!collapsed && canSeeConfig && (
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-3 px-4">
              Gestión de Planta
            </div>
          )}
          <NavItem view="calidad"      label="Calidad e Inocuidad" icon={ShieldCheck}     restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="produccion"   label="Producción"          icon={Factory}         restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          <NavItem view="indicadores"  label="Indicadores"         icon={Gauge}           restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />

          <NavItem view="technician"   label="Mi Agenda"           icon={HardHat}         restrictedTo={[UserRole.TECHNICIAN]} />
          <NavItem view="incident"     label="Reportar Falla"      icon={AlertTriangle}   restrictedTo={[UserRole.OPERATIONS]} />

          {/* Config dropdown — solo en modo expandido */}
          {canSeeConfig && !collapsed && (
            <div className="mt-2">
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1
                  ${isConfigOpen ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className={`transition-transform duration-300 ${isConfigOpen ? 'rotate-90' : ''}`} />
                  <span>Configuración</span>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isConfigOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ${isConfigOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-1 pb-2">
                    <NavItem view="config-users"    label="Usuarios"           icon={Users}  isSubItem restrictedTo={[UserRole.ADMIN]} />
                    <NavItem view="config-roles"    label="Roles"              icon={Shield} isSubItem restrictedTo={[UserRole.ADMIN]} />
                    <NavItem view="config-models"   label="Modelos y Marcas"   icon={Tags}   isSubItem restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
                    <NavItem view="config-articles" label="Catálogo Artículos" icon={Box}    isSubItem restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Config en modo colapsado — solo icono */}
          {canSeeConfig && collapsed && (
            <NavItem view="config-models" label="Configuración" icon={Settings} restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
          )}
        </nav>

        {/* Footer */}
        <div className={`border-t border-slate-800 bg-slate-900 shrink-0 ${collapsed ? 'p-2' : 'p-4'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-primary-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{rolLabel()}</p>
              </div>
            </div>
          )}

          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-primary-500" title={currentUser.name} />
              <button onClick={onLogout} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors" title="Cerrar Sesión">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
              <LogOut size={16} /> Cerrar Sesión
            </button>
          )}
        </div>

        {/* Toggle collapse button */}
        <button
          onClick={() => { setCollapsed(v => !v); setIsConfigOpen(false); }}
          className="absolute top-[22px] -right-3 z-40 hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 hover:bg-primary-600 text-white shadow-md transition-colors border border-slate-600"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          style={{ left: collapsed ? 56 : 248 }}
        >
          {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
        </button>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-20">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Egg className="text-white" size={20} />
            </div>
            <span className="font-bold">MNT App</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-slate-900 z-10 p-4 pt-20 overflow-y-auto">
            <nav className="flex flex-col gap-1">
              <NavItem view="dashboard"    label="Dashboard"          icon={LayoutDashboard} restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="daily-report" label="Parte Diario"       icon={MessageSquare}   restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="work-orders"  label="Órdenes de Trabajo" icon={Wrench}          restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="preventive"   label="Plan Preventivo"    icon={CalendarClock}   restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="assets"       label="Equipos"            icon={Cpu}             restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="inventory"    label="Inventario"         icon={Package}         restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="purchasing"   label="Compras"            icon={ShoppingCart}    restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="calidad"      label="Calidad e Inocuidad" icon={ShieldCheck}    restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="produccion"   label="Producción"         icon={Factory}         restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="indicadores"  label="Indicadores"        icon={Gauge}           restrictedTo={[UserRole.ADMIN, UserRole.PLANNER]} />
              <NavItem view="technician"   label="Mi Agenda"          icon={HardHat}         restrictedTo={[UserRole.TECHNICIAN]} />
              <NavItem view="incident"     label="Reportar Falla"     icon={AlertTriangle}   restrictedTo={[UserRole.OPERATIONS]} />
              {canSeeConfig && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2 px-2">Configuración</p>
                  <NavItem view="config-users"    label="Usuarios"          icon={Users}  restrictedTo={[UserRole.ADMIN]} />
                  <NavItem view="config-roles"    label="Roles"             icon={Shield} restrictedTo={[UserRole.ADMIN]} />
                  <NavItem view="config-models"   label="Modelos y Marcas"  icon={Tags}   restrictedTo={[UserRole.ADMIN]} />
                  <NavItem view="config-articles" label="Artículos"         icon={Box}    restrictedTo={[UserRole.ADMIN]} />
                </div>
              )}
              <hr className="border-slate-800 my-2" />
              <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400">
                <LogOut size={20} /> Cerrar Sesión
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
