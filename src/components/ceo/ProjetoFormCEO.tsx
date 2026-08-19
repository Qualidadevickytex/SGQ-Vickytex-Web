/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  X, 
  Save, 
  Layers, 
  DollarSign, 
  Briefcase, 
  Users, 
  Activity, 
  Calendar,
  Trash2
} from 'lucide-react';
import { ProjetoCEO, MetodologiaCEO, StatusProjetoCEO } from '../../types/ceo';
import { SectorType } from '../../types/department';
import { IndicatorRepository } from '../../services/database/repositories/indicator.repository';
import { IndicadorDesempenho } from '../../types/indicator';
import { UserAccount } from '../../types/user';
import { useAuth } from '../../contexts/AuthContext';
import { UserRepository } from '../../services/database/repositories/user.repository';
import { SystemSettingsRepository } from '../../services/database/repositories/systemSettings.repository';

interface ProjetoFormCEOProps {
  project?: ProjetoCEO; // If present, edit mode. Otherwise, create mode.
  onSave: (data: Partial<ProjetoCEO>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  onClose: () => void;
  sectors: SectorType[];
}

export const ProjetoFormCEO: React.FC<ProjetoFormCEOProps> = ({
  project,
  onSave,
  onDelete,
  onClose,
  sectors
}) => {
  const { user } = useAuth();
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
    const unsub = UserRepository.subscribe((items) => {
      if (Array.isArray(items)) {
        setRegisteredUsers(items);
      }
    });
    return () => unsub();
  }, []);

  const [titulo, setTitulo] = useState(project?.titulo || '');
  const [descricao, setDescricao] = useState(project?.descricao || '');
  const [setor, setSetor] = useState<SectorType>(project?.setor || 'Costura');
  const [lider, setLider] = useState(project?.lider || user?.email || 'qualidade@vickytex.com.br');
  const [patrocinador, setPatrocinador] = useState(project?.patrocinador || 'qualidade@vickytex.com.br');
  const [status, setStatus] = useState<StatusProjetoCEO>(project?.status || 'Planejado');
  const [metodologia, setMetodologia] = useState<MetodologiaCEO>(project?.metodologia || 'PDCA');
  const [metodologiasConfig, setMetodologiasConfig] = useState<any[]>([]);

  useEffect(() => {
    const unsub = SystemSettingsRepository.subscribe((records) => {
      const found = records.find(r => r.id === 'sgq_vickytex_metodologias_config');
      if (found && Array.isArray(found.items)) {
        setMetodologiasConfig(found.items);
      }
    });
    return () => unsub();
  }, []);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState(project?.dataInicio || new Date().toISOString().split('T')[0]);
  const [dataFimPlanejada, setDataFimPlanejada] = useState(project?.dataFimPlanejada || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [investimento, setInvestimento] = useState(project?.investimento || 0);
  const [retornoEsperado, setRetornoEsperado] = useState(project?.retornoEsperado || 0);
  const [retornoReal, setRetornoReal] = useState(project?.retornoReal || 0);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(project?.indicadoresImpactados || []);

  // Loaded system indicators
  const [systemIndicators, setSystemIndicators] = useState<IndicadorDesempenho[]>([]);

  useEffect(() => {
    // Carregar indicadores do repositório Firebase/local
    const unsub = IndicatorRepository.subscribe((items) => {
      if (Array.isArray(items) && items.length > 0) {
        setSystemIndicators(items);
      }
    });

    IndicatorRepository.findAll().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setSystemIndicators(res.data);
      }
    }).catch(err => {
      console.error('[ProjetoFormCEO] Erro ao carregar indicadores:', err);
    });

    return () => unsub();
  }, []);

  const handleIndicatorToggle = (identifier: string) => {
    setSelectedIndicators(prev => 
      prev.includes(identifier) ? prev.filter(c => c !== identifier) : [...prev, identifier]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    const payload: Partial<ProjetoCEO> = {
      titulo,
      descricao,
      setor,
      lider,
      patrocinador,
      status,
      metodologia,
      dataInicio,
      dataFimPlanejada,
      investimento: Number(investimento),
      retornoEsperado: Number(retornoEsperado),
      indicadoresImpactados: selectedIndicators
    };

    if (status === 'Concluído') {
      payload.retornoReal = Number(retornoReal);
      payload.dataFimReal = new Date().toISOString().split('T')[0];
    }

    const success = await onSave(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div id="project-form-modal-container" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">
              {project ? `Editar Projeto: ${project.codigo}` : 'Cadastrar Novo Projeto de Melhoria (CEO)'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Projeto</label>
              <input 
                type="text" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Redução de Set-up na Linha de Costura SMED"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição / Escopo do Projeto</label>
              <textarea 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="Qual o escopo do projeto de melhoria contínua, perdas observadas e resultados pretendidos?"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Metodologia</label>
              <select
                value={metodologia}
                onChange={(e) => setMetodologia(e.target.value as MetodologiaCEO)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold focus:outline-hidden"
              >
                <option value="PDCA">PDCA (Plan, Do, Check, Act)</option>
                <option value="DMAIC">DMAIC (Define, Measure, Analyze, Improve, Control)</option>
                <option value="Kaizen">Kaizen (Melhoria Contínua Rápida)</option>
                <option value="A3">A3 (Toyota Problem Solving)</option>
                <option value="Projeto Lean">Projeto Lean Manufacturing</option>
                <option value="Projeto Estratégico">Projeto Estratégico Organizacional</option>
                <option value="Projeto Personalizado">Projeto Personalizado</option>
              </select>

              {/* Explicação dinâmica e educativa sobre a metodologia selecionada */}
              {(() => {
                const explanations = metodologiasConfig.length > 0 ? metodologiasConfig : [
                  {
                    id: 'PDCA',
                    nome: 'PDCA (Plan, Do, Check, Act)',
                    etapas: 'Planejar, Executar, Verificar, Agir',
                    explicacao: 'Ciclo de melhoria contínua de quatro etapas para controle e aprendizado contínuo. Focado em solução de problemas de rotina e padronização rápida.',
                    ferramentas: 'Brainstorming, 5 Whys, Ishikawa, Plano de Ação, Gráfico de Pareto'
                  },
                  {
                    id: 'DMAIC',
                    nome: 'DMAIC (Define, Measure, Analyze, Improve, Control)',
                    etapas: 'Definir, Medir, Analisar, Melhorar, Controlar',
                    explicacao: 'Método rigoroso de cinco fases baseado em dados para redução de variabilidade, controle estatístico de processos e eliminação de defeitos (Seis Sigma).',
                    ferramentas: 'SIPOC, VOC, Matriz GUT, Pareto, 5 Porquês, Ishikawa, Fluxograma'
                  },
                  {
                    id: 'Kaizen',
                    nome: 'Kaizen (Melhoria Contínua Rápida)',
                    etapas: 'Identificar Desperdício, Desenhar Solução, Implementar, Validar',
                    explicacao: 'Foco em melhorias incrementais diárias e rápidas através da eliminação de desperdícios no local de trabalho (Gemba), engajando diretamente os operadores.',
                    ferramentas: '5S, PICK, Diagrama Ishikawa, Cronograma Rápido'
                  },
                  {
                    id: 'A3',
                    nome: 'A3 (Toyota Problem Solving)',
                    etapas: 'Contexto, Situação Atual, Objetivos, Análise de Causa, Contramedidas, Acompanhamento',
                    explicacao: 'Abordagem estruturada de resolução de problemas em uma única página, baseada no pensamento enxuto da Toyota, focando em causa raiz e contramedidas visuais.',
                    ferramentas: 'Fluxograma, Ishikawa, 5 Whys, Swot, Plano de Ação'
                  },
                  {
                    id: 'Projeto Lean',
                    nome: 'Projeto Lean Manufacturing',
                    etapas: 'Mapear Valor (VSM), Identificar Gargalos, Fluxo Contínuo, Puxar Produção, Perfeição',
                    explicacao: 'Focado no mapeamento do fluxo de valor (VSM) e eliminação sistemática dos 8 desperdícios clássicos para aumentar a velocidade, reduzir custos e simplificar operações.',
                    ferramentas: 'SIPOC, Kanban, Lead Time, VSM, 5S'
                  },
                  {
                    id: 'Projeto Estratégico',
                    nome: 'Projeto Estratégico Organizacional',
                    etapas: 'Diagnóstico, Formulação, Desdobramento, Execução, Avaliação',
                    explicacao: 'Alinhamento de diretrizes executivas de liderança com metas operacionais da fábrica, focado em alta competitividade utilizando Hoshin Kanri ou BSC.',
                    ferramentas: 'SWOT, Matriz GUT, Indicadores de Desempenho (KPIs)'
                  },
                  {
                    id: 'Projeto Personalizado',
                    nome: 'Projeto Personalizado',
                    etapas: 'Iniciação, Planejamento, Execução, Monitoramento, Encerramento',
                    explicacao: 'Fluxo de trabalho totalmente flexível para melhorias estruturadas que necessitam de fases, ferramentas e cronogramas customizados por setor.',
                    ferramentas: 'Customizável conforme necessidade do projeto'
                  }
                ];
                const details = explanations.find((m: any) => m.id === metodologia) || explanations[0];
                return (
                  <div className="mt-2.5 p-3.5 bg-blue-50/70 dark:bg-slate-900 rounded-xl border border-blue-100/40 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-350 space-y-1.5 leading-relaxed">
                    <p className="font-extrabold text-blue-800 dark:text-blue-400 font-sans tracking-tight">Sobre a Metodologia {details.nome}:</p>
                    <p className="font-medium text-[11px] text-slate-600 dark:text-slate-350">{details.explicacao}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <strong className="text-slate-700 dark:text-slate-300 font-bold">Fases:</strong> <span className="font-mono">{details.etapas}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300 font-bold">Ferramentas Indicadas:</strong> <span className="italic">{details.ferramentas}</span>
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusProjetoCEO)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold focus:outline-hidden"
              >
                <option value="Planejado">Planejado</option>
                <option value="Em Execução">Em Execução</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Setor de Atuação</label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value as SectorType)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                {sectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Líder do Projeto</label>
              <input 
                type="email" 
                value={lider}
                onChange={(e) => setLider(e.target.value)}
                placeholder="Ex: qualidade@vickytex.com.br"
                list="registered-users-lider-list"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
              />
              <datalist id="registered-users-lider-list">
                {registeredUsers.map(u => (
                  <option key={u.id || u.email} value={u.email}>{u.name} ({u.email})</option>
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patrocinador (Sponsor)</label>
              <input 
                type="text" 
                value={patrocinador}
                onChange={(e) => setPatrocinador(e.target.value)}
                placeholder="Ex: gerencia@vickytex.com.br"
                list="registered-users-patroc-list"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
              />
              <datalist id="registered-users-patroc-list">
                {registeredUsers.map(u => (
                  <option key={u.id || u.email} value={u.email}>{u.name} ({u.email})</option>
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Início</label>
                <input 
                  type="date" 
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                  className="w-full px-2 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prazo Final</label>
                <input 
                  type="date" 
                  value={dataFimPlanejada}
                  onChange={(e) => setDataFimPlanejada(e.target.value)}
                  required
                  className="w-full px-2 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CAPEX Investido (R$)</label>
              <input 
                type="number" 
                value={investimento}
                onChange={(e) => setInvestimento(Number(e.target.value))}
                min={0}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROI Anual Esperado (R$)</label>
              <input 
                type="number" 
                value={retornoEsperado}
                onChange={(e) => setRetornoEsperado(Number(e.target.value))}
                min={0}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
              />
            </div>

            {status === 'Concluído' && (
              <div className="space-y-1 sm:col-span-2 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/40">
                <label className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block mb-1">Retorno Financeiro Real Obtido (R$)</label>
                <input 
                  type="number" 
                  value={retornoReal}
                  onChange={(e) => setRetornoReal(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden"
                />
                <p className="text-[9px] text-emerald-600/80 mt-1">Insira o ROI validado para consolidação nos relatórios executivos.</p>
              </div>
            )}

            {/* Linked KPIs multi-select */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Indicadores de Desempenho Impactados (KPIs)</label>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-950 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {systemIndicators.map(ind => {
                  const codeOrId = ind.codigo || ind.id;
                  const isChecked = selectedIndicators.includes(codeOrId) || selectedIndicators.includes(ind.id) || (ind.codigo ? selectedIndicators.includes(ind.codigo) : false);
                  return (
                    <label key={ind.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 p-1.5 rounded-lg transition-colors">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleIndicatorToggle(codeOrId)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold mr-1">[{codeOrId}]</span>
                        {ind.nome}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
            <div>
              {project && onDelete && (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                  title="Excluir Projeto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Projeto</span>
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 font-bold rounded-xl bg-white dark:bg-slate-950"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="inline-flex items-center space-x-1 px-4.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Projeto</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Confirm Delete Modal */}
      {project && onDelete && (
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          title="Excluir Projeto"
          message={`Tem certeza que deseja excluir permanentemente o projeto "${project.codigo} — ${project.titulo}"? Esta ação removerá o projeto do sistema.`}
          confirmLabel="Excluir Projeto"
          onConfirm={async () => {
            await onDelete(project.id);
            setIsConfirmDeleteOpen(false);
          }}
          onClose={() => setIsConfirmDeleteOpen(false)}
        />
      )}

    </div>
  );
};
export default ProjetoFormCEO;
