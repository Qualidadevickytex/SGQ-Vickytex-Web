import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Plus, Trash2, Check, ArrowRight, Info, Award, ShieldAlert, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import { DocumentType, ApprovalFlow, ApprovalFlowStep, DocumentStatus } from '../../types';

interface FluxosParametrizadosProps {
  onClose?: () => void;
}

export const FLUXO_PADRAO_POP: ApprovalFlow = {
  id: 'flow-pop',
  tipoDocumento: 'POP',
  nome: 'Fluxo Padrão - Procedimento Operacional Padrão',
  etapas: [
    { id: '1', etapaNumero: 1, perfilResponsavel: 'Elaborador', descricao: 'Elaboração inicial do procedimento', statusAlvo: 'Elaboração', statusSeRejeitado: 'Rascunho' },
    { id: '2', etapaNumero: 2, perfilResponsavel: 'Supervisor', descricao: 'Revisão Técnica pelo supervisor da área', statusAlvo: 'Revisão Técnica', statusSeRejeitado: 'Elaboração' },
    { id: '3', etapaNumero: 3, perfilResponsavel: 'Qualidade', descricao: 'Aprovação final de conformidade pela Qualidade', statusAlvo: 'Aprovação', statusSeRejeitado: 'Elaboração' },
    { id: '4', etapaNumero: 4, perfilResponsavel: 'Gerência', descricao: 'Homologação e publicação pela Diretoria', statusAlvo: 'Publicação', statusSeRejeitado: 'Elaboração' }
  ]
};

export const FLUXO_PADRAO_FOR: ApprovalFlow = {
  id: 'flow-for',
  tipoDocumento: 'FOR',
  nome: 'Fluxo Simplificado - Formulários e Registros',
  etapas: [
    { id: '1', etapaNumero: 1, perfilResponsavel: 'Qualidade', descricao: 'Verificação e publicação direta', statusAlvo: 'Publicação', statusSeRejeitado: 'Rascunho' }
  ]
};

export const FLUXO_PADRAO_IT: ApprovalFlow = {
  id: 'flow-it',
  tipoDocumento: 'IT',
  nome: 'Fluxo Padrão - Instrução de Trabalho',
  etapas: [
    { id: '1', etapaNumero: 1, perfilResponsavel: 'Elaborador', descricao: 'Elaboração do posto de trabalho', statusAlvo: 'Elaboração', statusSeRejeitado: 'Rascunho' },
    { id: '2', etapaNumero: 2, perfilResponsavel: 'Supervisor', descricao: 'Validação operacional pelo Supervisor', statusAlvo: 'Revisão Técnica', statusSeRejeitado: 'Elaboração' },
    { id: '3', etapaNumero: 3, perfilResponsavel: 'Qualidade', descricao: 'Homologação pela Qualidade', statusAlvo: 'Publicação', statusSeRejeitado: 'Elaboração' }
  ]
};

export const FLUXO_PADRAO_MAN: ApprovalFlow = {
  id: 'flow-man',
  tipoDocumento: 'MAN',
  nome: 'Fluxo Rígido - Manual da Qualidade',
  etapas: [
    { id: '1', etapaNumero: 1, perfilResponsavel: 'Qualidade', descricao: 'Elaboração detalhada do Manual', statusAlvo: 'Elaboração', statusSeRejeitado: 'Rascunho' },
    { id: '2', etapaNumero: 2, perfilResponsavel: 'Gerência', descricao: 'Revisão Crítica pela Diretoria', statusAlvo: 'Aprovação', statusSeRejeitado: 'Elaboração' },
    { id: '3', etapaNumero: 3, perfilResponsavel: 'Qualidade', descricao: 'Homologação Geral do SGQ', statusAlvo: 'Publicação', statusSeRejeitado: 'Elaboração' }
  ]
};

export const FLUXO_PADRAO_LIST: ApprovalFlow = {
  id: 'flow-list',
  tipoDocumento: 'LIST',
  nome: 'Fluxo Direto - Lista Mestra e Checklists',
  etapas: [
    { id: '1', etapaNumero: 1, perfilResponsavel: 'Supervisor', descricao: 'Elaboração operacional', statusAlvo: 'Elaboração', statusSeRejeitado: 'Rascunho' },
    { id: '2', etapaNumero: 2, perfilResponsavel: 'Qualidade', descricao: 'Verificação e publicação', statusAlvo: 'Publicação', statusSeRejeitado: 'Elaboração' }
  ]
};

export const getSavedFlows = (): ApprovalFlow[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sgq_vickytex_fluxos_documentos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Salva os padrões se for a primeira vez
    const defaultFlows = [FLUXO_PADRAO_POP, FLUXO_PADRAO_FOR, FLUXO_PADRAO_IT, FLUXO_PADRAO_MAN, FLUXO_PADRAO_LIST];
    localStorage.setItem('sgq_vickytex_fluxos_documentos', JSON.stringify(defaultFlows));
    return defaultFlows;
  }
  return [FLUXO_PADRAO_POP, FLUXO_PADRAO_FOR, FLUXO_PADRAO_IT, FLUXO_PADRAO_MAN, FLUXO_PADRAO_LIST];
};

export const FluxosParametrizados: React.FC<FluxosParametrizadosProps> = ({ onClose }) => {
  const [flows, setFlows] = useState<ApprovalFlow[]>(() => getSavedFlows());
  const [selectedType, setSelectedType] = useState<DocumentType>('POP');
  const [activeFlow, setActiveFlow] = useState<ApprovalFlow | null>(null);

  // Perfis dinâmicos cadastrados no sistema (Perfis & Permissões)
  const systemRoles = useMemo(() => {
    const defaultRoles = [
      { value: 'Elaborador', label: 'Elaborador (Autor do Documento)' },
      { value: 'Supervisor', label: 'Supervisor da Área Têxtil' },
      { value: 'Qualidade', label: 'Qualidade (Líder SGQ)' },
      { value: 'Gerência', label: 'Diretoria / Gerência Geral' },
      { value: 'Administrador', label: 'Administrador do Sistema' },
    ];

    try {
      const saved = localStorage.getItem('sgq_vickytex_permissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            if (p.role && !defaultRoles.some(r => r.value.toLowerCase() === p.role.toLowerCase())) {
              defaultRoles.push({ value: p.role, label: `${p.role} (Perfil do Sistema)` });
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    return defaultRoles;
  }, []);

  // Estados para edição/criação de nova etapa
  const [newStepPerfil, setNewStepPerfil] = useState<string>('Supervisor');
  const [newStepDesc, setNewStepDesc] = useState<string>('');
  const [newStepAlvo, setNewStepAlvo] = useState<DocumentStatus>('Revisão Técnica');
  const [newStepRejeitado, setNewStepRejeitado] = useState<DocumentStatus>('Elaboração');

  // Estados para suportar personalização e edição de etapas existentes
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [isCustomPerfil, setIsCustomPerfil] = useState<boolean>(false);
  const [customPerfilText, setCustomPerfilText] = useState<string>('');

  useEffect(() => {
    const flow = flows.find(f => f.tipoDocumento === selectedType);
    if (flow) {
      setActiveFlow(flow);
    } else {
      setActiveFlow({
        id: `flow-${selectedType.toLowerCase()}`,
        tipoDocumento: selectedType,
        nome: `Fluxo Customizado - ${selectedType}`,
        etapas: []
      });
    }
    // Cancelar qualquer edição pendente quando mudar o tipo do documento
    handleCancelEdit();
  }, [selectedType, flows]);

  const handleSaveFlows = (updatedFlows: ApprovalFlow[]) => {
    setFlows(updatedFlows);
    localStorage.setItem('sgq_vickytex_fluxos_documentos', JSON.stringify(updatedFlows));
  };

  const handleCancelEdit = () => {
    setEditingStepId(null);
    setNewStepPerfil('Supervisor');
    setNewStepDesc('');
    setNewStepAlvo('Revisão Técnica');
    setNewStepRejeitado('Elaboração');
    setIsCustomPerfil(false);
    setCustomPerfilText('');
  };

  const handleSaveStep = () => {
    if (!activeFlow) return;

    const finalPerfil = isCustomPerfil ? customPerfilText.trim() : newStepPerfil;
    if (isCustomPerfil && !customPerfilText.trim()) {
      alert('Por favor, digite o nome do perfil responsável.');
      return;
    }
    
    if (editingStepId) {
      // Modo de Edição
      const updatedEtapas = activeFlow.etapas.map(step => {
        if (step.id === editingStepId) {
          return {
            ...step,
            perfilResponsavel: finalPerfil,
            descricao: newStepDesc || `Verificação por parte do ${finalPerfil}`,
            statusAlvo: newStepAlvo,
            statusSeRejeitado: newStepRejeitado
          };
        }
        return step;
      });

      const updatedFlow: ApprovalFlow = {
        ...activeFlow,
        etapas: updatedEtapas
      };

      const updatedFlows = flows.map(f => f.tipoDocumento === selectedType ? updatedFlow : f);
      handleSaveFlows(updatedFlows);
      setEditingStepId(null);
    } else {
      // Modo de Adição
      const newStep: ApprovalFlowStep = {
        id: `step-${Date.now()}`,
        etapaNumero: activeFlow.etapas.length + 1,
        perfilResponsavel: finalPerfil,
        descricao: newStepDesc || `Verificação por parte do ${finalPerfil}`,
        statusAlvo: newStepAlvo,
        statusSeRejeitado: newStepRejeitado
      };

      const updatedFlow: ApprovalFlow = {
        ...activeFlow,
        etapas: [...activeFlow.etapas, newStep]
      };

      const updatedFlows = flows.map(f => f.tipoDocumento === selectedType ? updatedFlow : f);
      if (!flows.some(f => f.tipoDocumento === selectedType)) {
        updatedFlows.push(updatedFlow);
      }

      handleSaveFlows(updatedFlows);
    }

    setNewStepDesc('');
    setCustomPerfilText('');
    setIsCustomPerfil(false);
  };

  const handleMoveStep = (stepIndex: number, dir: 'up' | 'down') => {
    if (!activeFlow) return;
    const targetIndex = dir === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeFlow.etapas.length) return;

    const newEtapas = [...activeFlow.etapas];
    const temp = newEtapas[stepIndex];
    newEtapas[stepIndex] = newEtapas[targetIndex];
    newEtapas[targetIndex] = temp;

    const reorderedSteps = newEtapas.map((s, idx) => ({
      ...s,
      etapaNumero: idx + 1
    }));

    const updatedFlow: ApprovalFlow = {
      ...activeFlow,
      etapas: reorderedSteps
    };

    setActiveFlow(updatedFlow);
    const updatedFlows = flows.map(f => f.tipoDocumento === selectedType ? updatedFlow : f);
    if (!flows.some(f => f.tipoDocumento === selectedType)) {
      updatedFlows.push(updatedFlow);
    }
    handleSaveFlows(updatedFlows);
  };

  const handleRemoveStep = (stepId: string) => {
    if (!activeFlow) return;

    const filteredSteps = activeFlow.etapas.filter(s => s.id !== stepId);
    const reorderedSteps = filteredSteps.map((s, idx) => ({
      ...s,
      etapaNumero: idx + 1
    }));

    const updatedFlow: ApprovalFlow = {
      ...activeFlow,
      etapas: reorderedSteps
    };

    setActiveFlow(updatedFlow);
    const updatedFlows = flows.map(f => f.tipoDocumento === selectedType ? updatedFlow : f);
    handleSaveFlows(updatedFlows);

    if (editingStepId === stepId) {
      handleCancelEdit();
    }
  };

  const handleResetToDefault = () => {
    let def: ApprovalFlow;
    if (selectedType === 'POP') def = FLUXO_PADRAO_POP;
    else if (selectedType === 'FOR') def = FLUXO_PADRAO_FOR;
    else if (selectedType === 'IT') def = FLUXO_PADRAO_IT;
    else if (selectedType === 'MAN') def = FLUXO_PADRAO_MAN;
    else def = FLUXO_PADRAO_LIST;

    const updatedFlows = flows.map(f => f.tipoDocumento === selectedType ? def : f);
    handleSaveFlows(updatedFlows);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Parametrização de Fluxos de Aprovação Têxtil
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Defina os passos, revisores e aprovadores para cada tipo documental de acordo com a ISO 9001.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          Voltar para Lista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Seletor de Tipo Documental */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase">Selecione o Tipo</label>
          <div className="flex flex-col space-y-1.5">
            {(['POP', 'FOR', 'IT', 'MAN', 'LIST'] as DocumentType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-3 text-left rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedType === type
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40'
                }`}
              >
                <span>{type === 'POP' ? 'POP - Procedimento' : type === 'FOR' ? 'FOR - Formulário' : type === 'IT' ? 'IT - Instrução' : type === 'MAN' ? 'MAN - Manual' : 'LIST - Lista Mestra'}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>

          <div className="p-3 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-200/20 rounded-xl space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex gap-1.5">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <span>O fluxo configurado determina por quais etapas o documento passará antes de ser considerado "Publicado e Vigente" no SGQ Vickytex.</span>
            </div>
          </div>
        </div>

        {/* Visualização e Ajustes do Fluxo */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{activeFlow?.nome}</h4>
                <p className="text-[11px] text-slate-400">Sequência oficial de assinaturas digitais do processo</p>
              </div>
              <button
                onClick={handleResetToDefault}
                className="px-2.5 py-1 text-[10px] text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg font-bold border border-rose-500/20 transition-all cursor-pointer"
              >
                Resetar para Padrão
              </button>
            </div>

            {/* Lista das Etapas Atuais */}
            <div className="space-y-3">
              {activeFlow && activeFlow.etapas.length > 0 ? (
                activeFlow.etapas.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3.5 bg-white dark:bg-slate-900 border rounded-xl transition-all ${
                      editingStepId === step.id 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                        : 'border-slate-150 dark:border-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {step.etapaNumero}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Assinatura: {step.perfilResponsavel}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 uppercase tracking-wider">
                          Muda para: {step.statusAlvo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.descricao}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveStep(index, 'up')}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                        title="Mover para Cima (Alterar Posição)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === activeFlow.etapas.length - 1}
                        onClick={() => handleMoveStep(index, 'down')}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                        title="Mover para Baixo (Alterar Posição)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStepId(step.id);
                          const isDefault = ['Elaborador', 'Supervisor', 'Qualidade', 'Gerência', 'Administrador'].includes(step.perfilResponsavel);
                          if (isDefault) {
                            setNewStepPerfil(step.perfilResponsavel);
                            setIsCustomPerfil(false);
                          } else {
                            setNewStepPerfil('Outro');
                            setIsCustomPerfil(true);
                            setCustomPerfilText(step.perfilResponsavel);
                          }
                          setNewStepDesc(step.descricao);
                          setNewStepAlvo(step.statusAlvo);
                          setNewStepRejeitado(step.statusSeRejeitado);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar Etapa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Etapa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl space-y-1.5">
                  <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Sem etapas configuradas</h5>
                  <p className="text-[11px] text-slate-400">Este documento não passará por fluxo e será publicado direto. Recomendado apenas para listas simples.</p>
                </div>
              )}
            </div>
          </div>

          {/* Form de Adição / Edição de Etapa */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" />
                {editingStepId ? 'Editar Informações da Etapa' : 'Adicionar Etapa ao Fluxo de Aprovação'}
              </h4>
              {editingStepId && (
                <button
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 text-[10px] text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Perfil Responsável pela Assinatura</label>
                  <span className="text-[10px] font-bold text-blue-500" title="Acesse 'Perfis & Usuários' no menu lateral para gerenciar os cargos e a matriz de permissões">
                    Gerenciado em: Perfis & Usuários
                  </span>
                </div>
                <select
                  value={isCustomPerfil ? 'Outro' : newStepPerfil}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Outro') {
                      setIsCustomPerfil(true);
                      setNewStepPerfil('Outro');
                    } else {
                      setIsCustomPerfil(false);
                      setNewStepPerfil(val);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  {systemRoles.map(roleObj => (
                    <option key={roleObj.value} value={roleObj.value}>{roleObj.label}</option>
                  ))}
                  <option value="Outro">Outro (Digitar Nome Customizado...)</option>
                </select>
              </div>

              {isCustomPerfil && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Escreva o Nome do Perfil</label>
                  <input
                    type="text"
                    placeholder="Ex: Consultor Externo, Engenheiro Têxtil"
                    value={customPerfilText}
                    onChange={(e) => setCustomPerfilText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-blue-300 dark:border-blue-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição / Instrução da Etapa</label>
                <input
                  type="text"
                  placeholder="Ex: Verificar procedimentos técnicos de fiação e tear"
                  value={newStepDesc}
                  onChange={(e) => setNewStepDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Se Aprovado, Status Alvo</label>
                <select
                  value={newStepAlvo}
                  onChange={(e) => setNewStepAlvo(e.target.value as DocumentStatus)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  <option value="Elaboração">Elaboração</option>
                  <option value="Revisão Técnica">Revisão Técnica</option>
                  <option value="Aprovação">Aprovação</option>
                  <option value="Publicação">Publicação</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Se Reprovado, Volta para</label>
                <select
                  value={newStepRejeitado}
                  onChange={(e) => setNewStepRejeitado(e.target.value as DocumentStatus)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  <option value="Rascunho">Rascunho</option>
                  <option value="Elaboração">Elaboração</option>
                  <option value="Revisão Técnica">Revisão Técnica</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveStep}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {editingStepId ? 'Atualizar Informações da Etapa' : 'Salvar Nova Etapa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
