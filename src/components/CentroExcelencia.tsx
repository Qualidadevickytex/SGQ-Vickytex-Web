/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConfirmModal } from './common/ConfirmModal';
import { 
  Award, 
  Layers, 
  CheckCircle2, 
  Activity, 
  Database, 
  Briefcase,
  AlertCircle,
  Plus,
  Search,
  Trash2,
  Edit,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { useCEO } from '../contexts/CEOContext';
import { useAuth } from '../contexts/AuthContext';
import { useSectors } from '../hooks/useSectors';
import { getSectors } from '../utils/mockData';
import { SectorType } from '../types/department';
import { ProjetoCEO, SugestaoCEO } from '../types/ceo';
import { PlanoAcao } from '../types/actionPlan';
import { DashboardCEO } from './ceo/DashboardCEO';
import { SugestoesCEO } from './ceo/SugestoesCEO';
import { ProjetoFormCEO } from './ceo/ProjetoFormCEO';
import { ProjetoViewCEO } from './ceo/ProjetoViewCEO';
import { GamificacaoCEO } from './ceo/GamificacaoCEO';

interface CentroExcelenciaProps {
  personalizacao?: any;
  planos?: PlanoAcao[];
  onAddPlano?: (plano: PlanoAcao) => void;
  onNavigateToPlanos?: () => void;
}

export const CentroExcelencia: React.FC<CentroExcelenciaProps> = ({ 
  personalizacao,
  planos = [],
  onAddPlano,
  onNavigateToPlanos
}) => {
  const { user } = useAuth();
  const systemSectors = useSectors() as SectorType[];
  const { 
    projects, 
    suggestions, 
    stats, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject, 
    submitSugestao, 
    updateSugestao,
    deleteSugestao,
    avaliarSugestao 
  } = useCEO();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projetos' | 'sugestoes' | 'gamificacao'>('dashboard');
  
  // Selection states
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjetoCEO | undefined>(undefined);
  const [projectToDelete, setProjectToDelete] = useState<ProjetoCEO | null>(null);

  // Search & Filter state for projects list
  const [projSearch, setProjSearch] = useState('');
  const [projSector, setProjSector] = useState<string>('TODOS');
  const [projStatus, setProjStatus] = useState<string>('TODOS');

  // Currency formatting helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const handleCreateOrUpdate = async (data: Partial<ProjetoCEO>): Promise<boolean> => {
    if (editingProject) {
      return await updateProject(editingProject.id, data);
    } else {
      // Generate a dynamic code prefix
      const code = `PROJ-CEO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      return await createProject({
        ...data,
        codigo: code
      });
    }
  };

  const handleEditTrigger = (proj: ProjetoCEO, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting project view
    setEditingProject(proj);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (proj: ProjetoCEO, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(proj);
  };

  const handleUpdateSuggestion = async (id: string, updates: Partial<SugestaoCEO>): Promise<boolean> => {
    if (updates.status && updates.avaliacaoComite !== undefined) {
      return await avaliarSugestao(
        id, 
        updates.status as any, 
        updates.avaliacaoComite || '', 
        { 
          impacto: updates.notaImpacto || 3, 
          facilidade: updates.notaFacilidade || 3 
        }
      );
    }
    return await updateSugestao(id, updates);
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.titulo || '').toLowerCase().includes(projSearch.toLowerCase()) || 
                          (p.codigo || '').toLowerCase().includes(projSearch.toLowerCase()) ||
                          (p.lider || '').toLowerCase().includes(projSearch.toLowerCase());
    const matchesSector = projSector === 'TODOS' || p.setor === projSector;
    const matchesStatus = projStatus === 'TODOS' || p.status === projStatus;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div id="ceo-container" className="space-y-6">
      
      {/* 1. Header Banner */}
      <div id="ceo-header-banner" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Melhoria Contínua</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Portal Integrado de Melhoria Contínua, Metodologias PDCA/DMAIC, Matrizes SWOT/GUT/PICK e Planos de Ação (ISO 9001:2015)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Módulo Homologado</span>
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span>ISO 9001:2015</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-xs font-bold text-red-600 dark:text-red-400 flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. KPI Summary Stats */}
      <div id="ceo-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Projects */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Projetos Ativos</span>
            <span className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1 block">
              {loading ? '...' : stats?.projetosAtivos || 0}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              Total Planejados: {stats?.totalProjetos || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Total Investment */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Investimento Total (CAPEX)</span>
            <span className="text-2xl font-black text-slate-855 mt-1 block dark:text-slate-100">
              {loading ? '...' : formatCurrency(stats?.investimentoTotal || 0)}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              Garantia e retorno operacional
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* ROI Obtained */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Retorno Obtido (ROI)</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {loading ? '...' : formatCurrency(stats?.retornoTotalReal || 0)}
            </span>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold mt-1 block">
              Histórico de ganhos consolidados
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Suggestions stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Sugestões Recebidas</span>
            <span className="text-2xl font-black text-slate-850 mt-1 block dark:text-slate-100">
              {loading ? '...' : stats?.totalSugestoes || 0}
            </span>
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold mt-1 block">
              {stats?.sugestoesAprovadas || 0} Aprovadas • {stats?.sugestoesPendentes || 0} Pendentes
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. Main Navigation Tab List */}
      {!selectedProjectId ? (
        <div className="flex border-b border-slate-200 dark:border-slate-800/80 gap-1 pb-1">
          {[
            { id: 'dashboard', label: 'Dashboard Executivo/Operacional', icon: TrendingUp },
            { id: 'projetos', label: 'Cadastro & Gestão de Projetos', icon: Briefcase },
            { id: 'sugestoes', label: 'Banco de Sugestões (VickyIdeia)', icon: Award },
            { id: 'gamificacao', label: 'Leaderboard & Gamificação', icon: Award }
          ].map(tb => {
            const Icon = tb.icon;
            const isActive = activeTab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id as any)}
                className={`flex items-center space-x-1 px-4.5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  isActive 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* 4. Tab contents render panel */}
      <div id="ceo-main-view-panel">
        {selectedProjectId && selectedProject ? (
          <ProjetoViewCEO 
            project={selectedProject} 
            onUpdateProject={updateProject}
            onDeleteProject={async (id) => {
              const ok = await deleteProject(id);
              if (ok) setSelectedProjectId(null);
              return ok;
            }}
            onClose={() => setSelectedProjectId(null)}
            sectors={systemSectors}
          />
        ) : (
          <div>
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <DashboardCEO 
                projects={projects} 
                suggestions={suggestions} 
                stats={stats} 
                onSelectProject={(id) => {
                  setSelectedProjectId(id);
                }} 
              />
            )}

            {/* TAB: PROJETOS */}
            {activeTab === 'projetos' && (
              <div className="space-y-4">
                
                {/* Search & filters for projects list */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Buscar projetos por código, líder, título..."
                      value={projSearch}
                      onChange={(e) => setProjSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={projSector}
                      onChange={(e) => setProjSector(e.target.value)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold focus:outline-hidden"
                    >
                      <option value="TODOS">Todos os Setores</option>
                      {getDynamicSectors().map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>

                    <select
                      value={projStatus}
                      onChange={(e) => setProjStatus(e.target.value)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold focus:outline-hidden"
                    >
                      <option value="TODOS">Todos os Status</option>
                      <option value="Planejado">Planejados</option>
                      <option value="Em Execução">Em Execução</option>
                      <option value="Suspenso">Suspensos</option>
                      <option value="Concluído">Concluídos</option>
                      <option value="Cancelado">Cancelados</option>
                    </select>

                    {/* Restricted trigger by Quality roles */}
                    <button
                      onClick={() => {
                        setEditingProject(undefined);
                        setIsFormOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Projeto CEO</span>
                    </button>
                  </div>
                </div>

                {/* Projects table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                          <th className="py-3 px-4">Código</th>
                          <th className="py-3 px-4">Projeto / Metodologia</th>
                          <th className="py-3 px-4">Setor</th>
                          <th className="py-3 px-4">Líder</th>
                          <th className="py-3 px-4 text-right">Investimento (CAPEX)</th>
                          <th className="py-3 px-4 text-right">ROI Esperado</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((proj) => (
                            <tr 
                              key={proj.id} 
                              onClick={() => setSelectedProjectId(proj.id)}
                              className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                            >
                              <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{proj.codigo}</td>
                              <td className="py-3.5 px-4">
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-200">{proj.titulo}</div>
                                  <span className="text-[10px] text-slate-400 font-semibold">{proj.metodologia}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-medium">{proj.setor}</td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">{proj.lider?.split('@')[0] || 'Sem Líder'}</td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                                {formatCurrency(proj.investimento)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(proj.retornoEsperado)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                  proj.status === 'Concluído' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : proj.status === 'Em Execução' 
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {proj.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button
                                    onClick={(e) => handleEditTrigger(proj, e)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                                    title="Editar Metadados"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteTrigger(proj, e)}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                                    title="Excluir Projeto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Inbox className="w-8 h-8 text-slate-300" />
                                <span>Nenhum projeto encontrado para os filtros ativos.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SUGESTOES */}
            {activeTab === 'sugestoes' && (
              <SugestoesCEO 
                suggestions={suggestions} 
                user={user!} 
                onAddSuggestion={submitSugestao} 
                onUpdateSuggestion={handleUpdateSuggestion} 
                onDeleteSuggestion={deleteSugestao}
                sectors={getDynamicSectors()}
                planos={planos}
                onAddPlano={onAddPlano}
                onNavigateToPlanos={onNavigateToPlanos}
              />
            )}

            {/* TAB: GAMIFICACAO */}
            {activeTab === 'gamificacao' && (
              <GamificacaoCEO 
                projects={projects} 
                suggestions={suggestions} 
              />
            )}
          </div>
        )}
      </div>

      {/* 5. Project Creation / Editing Form Modal */}
      {isFormOpen && (
        <ProjetoFormCEO 
          project={editingProject}
          onSave={handleCreateOrUpdate}
          onDelete={async (id) => {
            const ok = await deleteProject(id);
            if (ok) {
              setIsFormOpen(false);
              setEditingProject(undefined);
              if (selectedProjectId === id) setSelectedProjectId(null);
            }
            return ok;
          }}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProject(undefined);
          }}
          sectors={getDynamicSectors()}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        title="Excluir Projeto"
        message={`Tem certeza que deseja excluir permanentemente o projeto "${projectToDelete?.codigo || ''} — ${projectToDelete?.titulo || ''}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Projeto"
        onConfirm={async () => {
          if (projectToDelete) {
            const id = projectToDelete.id;
            const ok = await deleteProject(id);
            if (ok && selectedProjectId === id) {
              setSelectedProjectId(null);
            }
            setProjectToDelete(null);
          }
        }}
        onClose={() => setProjectToDelete(null)}
      />

    </div>
  );
};
export default CentroExcelencia;
