/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  Search, 
  LogOut, 
  Moon, 
  Sun, 
  Database,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  FolderLock,
  GraduationCap,
  Wrench,
  ClipboardList,
  Sliders,
  ShieldAlert,
  Users,
  Truck,
  Activity,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole, RolePermission, SystemModuleId } from '../types';
import { PersonalizacaoGeral } from '../utils/mockData';
import { canUserPerform } from '../utils/permissionManager';

interface MainLayoutProps {
  children: React.ReactNode;
  activeSection: 'dashboard' | 'documentos' | 'auditorias' | 'riscos' | '5s' | 'integracao' | 'database' | 'treinamentos' | 'calibracao' | 'planos' | 'configuracoes' | 'usuarios' | 'registros' | 'fornecedores' | 'indicadores' | 'ceo';
  setActiveSection: (section: 'dashboard' | 'documentos' | 'auditorias' | 'riscos' | '5s' | 'integracao' | 'database' | 'treinamentos' | 'calibracao' | 'planos' | 'configuracoes' | 'usuarios' | 'registros' | 'fornecedores' | 'indicadores' | 'ceo') => void;
  onOpenSearch: () => void;
  personalizacao?: PersonalizacaoGeral;
  permissions?: RolePermission[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeSection,
  setActiveSection,
  onOpenSearch,
  personalizacao,
  permissions
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const allowedSections = React.useMemo(() => {
    if (!user) {
      return ['dashboard', 'documentos', 'registros', 'indicadores', 'ceo'];
    }

    const allModuleKeys: SystemModuleId[] = [
      'dashboard', 'documentos', 'indicadores', 'ceo', 'registros', 'fornecedores', 
      'auditorias', 'riscos', 'planos', '5s', 'treinamentos', 'calibracao', 
      'usuarios', 'configuracoes', 'integracao', 'database'
    ];

    // Verificar se o usuário possui permissão de leitura ('ver') no módulo
    return allModuleKeys.filter(modId => {
      return canUserPerform(user, modId, 'ver', undefined, permissions);
    });
  }, [user, permissions]);

  const MENU_ITEMS = [
    { id: 'dashboard' as const, label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'documentos' as const, label: 'Lista Mestra', icon: FileText },
    { id: 'indicadores' as const, label: 'Indicadores & KPIs', icon: Activity },
    { id: 'ceo' as const, label: 'Melhoria Contínua', icon: Award },
    { id: 'registros' as const, label: 'Controle de Registros', icon: FolderLock },
    { id: 'fornecedores' as const, label: 'Gestão de Fornecedores', icon: Truck },
    { id: 'auditorias' as const, label: 'Auditorias & NC', icon: CheckSquare },
    { id: 'riscos' as const, label: 'Riscos & Oportunidades', icon: ShieldAlert },
    { id: 'planos' as const, label: 'Planos de Ação (5W2H)', icon: ClipboardList },
    { id: '5s' as const, label: 'Programa 5S (Lean)', icon: Sparkles },
    { id: 'treinamentos' as const, label: 'Treinamentos (ISO 7.2)', icon: GraduationCap },
    { id: 'calibracao' as const, label: 'Calibração (ISO 7.1.5)', icon: Wrench },
    { id: 'usuarios' as const, label: 'Perfis & Usuários', icon: Users },
    { id: 'configuracoes' as const, label: 'Configurações (Parâmetros)', icon: Sliders },
    { id: 'integracao' as const, label: 'Painel Google Workspace', icon: Settings },
    { id: 'database' as const, label: 'Database Live View', icon: Database }
  ];

  const filteredMenuItems = MENU_ITEMS.filter(item => allowedSections.includes(item.id));

  return (
    <div id="main-layout" className="min-h-screen bg-[#F4F5F7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside id="desktop-sidebar" className="hidden lg:flex flex-col w-64 bg-[#0B3A63] text-white shrink-0 shadow-lg justify-between border-r border-slate-200/10">
        <div>
          {/* Logo Brand */}
          <div id="sidebar-logo" className="px-6 py-5 border-b border-white/10 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0B3A63] font-black">
              {personalizacao?.nomeEmpresa ? personalizacao.nomeEmpresa.substring(0, 2).toUpperCase() : 'VI'}
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider leading-none uppercase">{personalizacao?.nomeEmpresa || 'VICKYTEX'}</h1>
              <span className="text-[10px] text-blue-200/80 font-bold font-mono">{personalizacao?.versaoSistema || 'SGQ WEB v1.0.0'}</span>
            </div>
          </div>
 
          {/* Menu Navigation */}
          <nav id="sidebar-nav" className="p-4 space-y-1 mt-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-item-${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isSelected 
                      ? 'bg-white/15 text-white shadow-xs translate-x-1' 
                      : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-200'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar with Active Profile details */}
        <div id="sidebar-footer" className="p-4 border-t border-white/10 space-y-3">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center space-x-2.5">
              <img 
                src={user?.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                alt="Foto" 
                className="w-8 h-8 rounded-full border border-white/25 shrink-0 object-cover" 
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate leading-tight">{user?.name}</p>
                <span className="text-[9px] bg-blue-500/30 text-blue-100 font-bold px-1.5 py-0.5 rounded-sm font-mono mt-0.5 inline-block">
                  {user?.role ? user.role.toUpperCase() : 'USUÁRIO'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-blue-200 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do SGQ</span>
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div id="main-content-panel" className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar Header */}
        <header id="top-navbar" className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
          
          {/* Left - Hamburger menu & Quick Search */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Spotlight Search Trigger */}
            <button 
              onClick={onOpenSearch}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all text-xs font-semibold w-48 sm:w-64 md:w-80"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="truncate">Pesquisa inteligente (Cmd+K)</span>
              <kbd className="hidden sm:inline-block ml-auto text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm font-mono">⌘K</kbd>
            </button>
          </div>

          {/* Right - Profile Switching, Theme Toggle */}
          <div className="flex items-center space-x-4">
            
            {/* Quick switcher preview notification */}
            <span className="hidden xl:inline-flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-3 py-1.5 rounded-lg text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{personalizacao?.normaISO || 'Conformidade ISO 9001:2015'}</span>
            </span>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Mini User Icon Trigger (Desktop only shows text) */}
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <img 
                src={user?.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                alt="Foto" 
                className="w-7.5 h-7.5 rounded-full border border-slate-200 shrink-0 object-cover" 
              />
              <span className="hidden md:inline-block text-xs font-bold text-slate-700 dark:text-slate-200">
                {user?.name.split(' ')[0]}
              </span>
            </div>

          </div>
        </header>

        {/* Content Body viewport */}
        <main id="main-scroll-view" className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer id="brand-footer" className="py-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400 font-medium px-4">
          <p>{personalizacao?.textoRodape || '© 2026 Vickytex — Sistema de Gestão da Qualidade (SGQ) Web Integrado.'}</p>
          <p className="mt-0.5">{personalizacao?.diretrizesRodape || 'Sistemas e diretrizes em conformidade com as normas internacionais de auditoria.'}</p>
        </footer>

      </div>

      {/* Sidebar Mobile Overlay Drawer */}
      {isSidebarOpen && (
        <div id="mobile-sidebar-overlay" className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)} />
          
          {/* Sidebar Drawer Container */}
          <div className="relative w-64 bg-[#0B3A63] text-white flex flex-col justify-between h-full shadow-2xl p-4 animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0B3A63] font-black">
                    {personalizacao?.nomeEmpresa ? personalizacao.nomeEmpresa.substring(0, 2).toUpperCase() : 'VI'}
                  </div>
                  <span className="font-extrabold text-sm tracking-wider uppercase">{personalizacao?.nomeEmpresa || 'VICKYTEX'}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white/60 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected ? 'bg-white/15' : 'text-blue-100 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Profile Switching and Exit inside mobile Drawer */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                  alt="Foto" 
                  className="w-8 h-8 rounded-full border border-white/20 shrink-0" 
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-none">{user?.name}</p>
                  <span className="text-[9px] text-blue-200 font-mono mt-0.5 block">{user?.role ? user.role.toUpperCase() : 'USUÁRIO'}</span>
                </div>
              </div>

              <button 
                onClick={logout}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg border border-white/15 text-center flex items-center justify-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
