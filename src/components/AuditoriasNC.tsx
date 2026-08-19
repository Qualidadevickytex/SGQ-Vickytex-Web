/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckSquare, 
  AlertTriangle, 
  Calendar, 
  User, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Clock, 
  FileText,
  BookmarkCheck,
  CheckCircle2,
  X,
  Sparkles,
  Trash2,
  Pencil,
  Award
} from 'lucide-react';
import { Auditoria, NaoConformidade, SectorType, Documento, PlanoAcao } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SECTORS, getSectors, PersonalizacaoGeral } from '../utils/mockData';
import { SystemSettingsRepository } from '../services/database/repositories/systemSettings.repository';

interface AuditoriasNCProps {
  audits: Auditoria[];
  ncs: NaoConformidade[];
  documents: Documento[];
  planos?: PlanoAcao[];
  onAddAudit: (audit: Auditoria) => void;
  onUpdateAudit: (audit: Auditoria) => void;
  onDeleteAudit: (id: string) => void;
  onAddNC: (nc: NaoConformidade) => void;
  onUpdateNC: (nc: NaoConformidade) => void;
  onDeleteNC: (id: string) => void;
  onAddPlano?: (plano: PlanoAcao) => void;
  onNavigateToPlanos?: () => void;
  onAddLog: (action: string, details: string, docId?: string) => void;
  personalizacao?: PersonalizacaoGeral;
}

export const AuditoriasNC: React.FC<AuditoriasNCProps> = ({
  audits,
  ncs,
  documents,
  planos = [],
  onAddAudit,
  onUpdateAudit,
  onDeleteAudit,
  onAddNC,
  onUpdateNC,
  onDeleteNC,
  onAddPlano,
  onNavigateToPlanos,
  onAddLog,
  personalizacao
}) => {
  const { user } = useAuth();
  const [sectorsList] = useState<string[]>(() => getSectors());
  const [origens, setOrigens] = useState<string[]>([
    "Auditoria Interna",
    "Auditoria Externa ISO 9001",
    "Reclamação de Cliente",
    "Inspeção de Segurança",
    "Desvio de Processo Interno",
    "Feedback de Colaborador",
    "Outros"
  ]);

  useEffect(() => {
    const unsub = SystemSettingsRepository.subscribe((records) => {
      const found = records.find(r => r.id === 'sgq_vickytex_auditorias_origens');
      if (found && Array.isArray(found.items)) {
        setOrigens(found.items);
      }
    });
    return () => unsub();
  }, []);

  const [activeTab, setActiveTab] = useState<'auditorias' | 'ncs'>('auditorias');

  // Modais
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isNcModalOpen, setIsNcModalOpen] = useState(false);

  // Estados de Edição
  const [editingAudit, setEditingAudit] = useState<Auditoria | null>(null);
  const [editingNC, setEditingNC] = useState<NaoConformidade | null>(null);
  const [auditToDelete, setAuditToDelete] = useState<Auditoria | null>(null);
  const [ncToDelete, setNcToDelete] = useState<NaoConformidade | null>(null);

  // Lista de Auditores e Usuários do Sistema (Perfis & Usuários)
  const systemAuditors = useMemo(() => {
    const list: string[] = [];
    if (user?.name) {
      list.push(user.name);
    }
    const defaultAuditors = [
      'Rodrigo Berto (Qualidade)',
      'Carlos Eduardo (Gerente SGQ)',
      'Roberto Costa (Supervisor Costura)',
      'Ana Souza (Qualidade)'
    ];
    defaultAuditors.forEach(a => {
      if (!list.includes(a)) list.push(a);
    });

    try {
      const savedUsersStr = localStorage.getItem('sgq_vickytex_users');
      if (savedUsersStr) {
        const parsed = JSON.parse(savedUsersStr);
        if (Array.isArray(parsed)) {
          parsed.forEach((u: any) => {
            if (u.name && !list.includes(u.name)) {
              list.push(u.name);
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    return list;
  }, [user]);

  const handleOpenNewAudit = () => {
    setEditingAudit(null);
    setNewAudit({
      codigo: '',
      titulo: '',
      dataPlanejada: '',
      setor: 'Corte',
      auditor: user?.name || systemAuditors[0] || 'Rodrigo Berto (Qualidade)'
    });
    setIsAuditModalOpen(true);
  };

  const handleOpenEditAudit = (aud: Auditoria) => {
    setEditingAudit(aud);
    setNewAudit({
      codigo: aud.codigo,
      titulo: aud.titulo,
      dataPlanejada: aud.dataPlanejada,
      setor: aud.setor,
      auditor: aud.auditor
    });
    setIsAuditModalOpen(true);
  };

  const handleOpenNewNc = () => {
    setEditingNC(null);
    setNewNc({
      codigo: '',
      titulo: '',
      descricao: '',
      setor: 'Corte',
      responsavel: user?.name || systemAuditors[0] || 'Rodrigo Berto (Qualidade)',
      documentoRelacionadoId: '',
      origem: origens[0] || 'Auditoria Interna'
    });
    setIsNcModalOpen(true);
  };

  const handleOpenEditNc = (nc: NaoConformidade) => {
    setEditingNC(nc);
    setNewNc({
      codigo: nc.codigo,
      titulo: nc.titulo,
      descricao: nc.descricao,
      setor: nc.setor,
      responsavel: nc.responsavel,
      documentoRelacionadoId: nc.documentoRelacionadoId || '',
      origem: nc.origem || origens[0] || 'Auditoria Interna'
    });
    setIsNcModalOpen(true);
  };

  // Formulário: Nova Auditoria
  const [newAudit, setNewAudit] = useState({
    codigo: '',
    titulo: '',
    dataPlanejada: '',
    setor: 'Corte' as SectorType,
    auditor: user?.name || 'Rodrigo Berto (Qualidade)'
  });

  // Formulário: Nova Não Conformidade
  const [newNc, setNewNc] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    setor: 'Corte' as SectorType,
    responsavel: user?.name || 'Rodrigo Berto (Qualidade)',
    documentoRelacionadoId: '',
    origem: origens[0] || 'Auditoria Interna'
  });

  // Adicionar ou Editar Auditoria
  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudit.codigo || !newAudit.titulo || !newAudit.dataPlanejada) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingAudit) {
      const updated: Auditoria = {
        ...editingAudit,
        codigo: newAudit.codigo.toUpperCase().trim(),
        titulo: newAudit.titulo.trim(),
        dataPlanejada: newAudit.dataPlanejada,
        setor: newAudit.setor,
        auditor: newAudit.auditor
      };
      onUpdateAudit(updated);
      onAddLog('Editou Auditoria', `Auditoria programada ${updated.codigo} atualizada.`, undefined);
    } else {
      const audit: Auditoria = {
        id: `aud_${Date.now()}`,
        codigo: newAudit.codigo.toUpperCase().trim(),
        titulo: newAudit.titulo.trim(),
        dataPlanejada: newAudit.dataPlanejada,
        setor: newAudit.setor,
        auditor: newAudit.auditor,
        status: 'Agendada'
      };

      onAddAudit(audit);
      onAddLog('Programou Auditoria', `Auditoria interna ${audit.codigo} programada com sucesso para o setor ${audit.setor}.`, undefined);
    }

    setIsAuditModalOpen(false);
    setEditingAudit(null);
    // Reset form
    setNewAudit({
      codigo: '',
      titulo: '',
      dataPlanejada: '',
      setor: 'Corte',
      auditor: user?.name || 'Rodrigo Berto (Qualidade)'
    });
  };

  // Adicionar ou Editar Não Conformidade
  const handleCreateNC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNc.codigo || !newNc.titulo || !newNc.descricao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const defaultResp = user?.name || systemAuditors[0] || 'Rodrigo Berto (Qualidade)';

    if (editingNC) {
      const updated: NaoConformidade = {
        ...editingNC,
        codigo: newNc.codigo.toUpperCase().trim(),
        titulo: newNc.titulo.trim(),
        descricao: newNc.descricao.trim(),
        setor: newNc.setor,
        responsavel: newNc.responsavel.trim() || defaultResp,
        documentoRelacionadoId: newNc.documentoRelacionadoId || undefined,
        origem: newNc.origem
      };
      onUpdateNC(updated);
      onAddLog('Editou RNC', `Relatório de Não Conformidade ${updated.codigo} atualizado.`, updated.documentoRelacionadoId);
    } else {
      const nc: NaoConformidade = {
        id: `nc_${Date.now()}`,
        codigo: newNc.codigo.toUpperCase().trim(),
        titulo: newNc.titulo.trim(),
        descricao: newNc.descricao.trim(),
        dataAbertura: new Date().toISOString().split('T')[0],
        setor: newNc.setor,
        responsavel: newNc.responsavel.trim() || defaultResp,
        status: 'Aberta',
        documentoRelacionadoId: newNc.documentoRelacionadoId || undefined,
        origem: newNc.origem
      };

      onAddNC(nc);
      onAddLog('NC Aberta', `Relatório de Não Conformidade (NC) ${nc.codigo} gerado com sucesso.`, nc.documentoRelacionadoId);
    }

    setIsNcModalOpen(false);
    setEditingNC(null);
    // Reset form
    setNewNc({
      codigo: '',
      titulo: '',
      descricao: '',
      setor: 'Corte',
      responsavel: user?.name || systemAuditors[0] || 'Rodrigo Berto (Qualidade)',
      documentoRelacionadoId: '',
      origem: origens[0] || 'Auditoria Interna'
    });
  };

  // Gerar Plano de Ação 5W2H automaticamente a partir da NC
  const handleGenerate5W2H = (nc: NaoConformidade) => {
    // Verificar se já existe um plano para esta NC
    const existingPlan = planos.find(p => p.naoConformidadeId === nc.id || p.codigo === `PA-${nc.codigo}`);
    
    if (existingPlan) {
      const irParaPlanos = window.confirm(`Já existe o Plano de Ação ${existingPlan.codigo} vinculado a esta NC (${nc.codigo}). Deseja ir para o módulo de Planos de Ação 5W2H para visualizá-lo?`);
      if (irParaPlanos && onNavigateToPlanos) {
        onNavigateToPlanos();
      }
      return;
    }

    // Calcular data limite padrão (+15 dias)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 15);
    const deadlineStr = deadline.toISOString().split('T')[0];

    const newPA: PlanoAcao = {
      id: `pa_${Date.now()}`,
      codigo: `PA-${nc.codigo}`,
      titulo: `Tratativa Corretiva: ${nc.titulo}`,
      setor: nc.setor,
      status: 'Planejado',
      dataCriacao: new Date().toISOString().split('T')[0],
      oQue: `Eliminar a causa-raiz da Não Conformidade (${nc.codigo}): ${nc.descricao}`,
      porQue: `Garantir a conformidade dos processos com a norma ISO 9001 e evitar reincidência de falhas no setor de ${nc.setor}.`,
      onde: `Setor de ${nc.setor} - Instalações da Vickytex`,
      quando: deadlineStr,
      quem: nc.responsavel || user?.name || 'Rodrigo Berto (Qualidade)',
      como: `1. Realizar análise de causa raiz (Ishikawa/5 Porquês);\n2. Definir e executar plano de correção;\n3. Revisar procedimentos operacionais;\n4. Validar eficácia da ação após conclusão.`,
      quantoCusta: 0,
      documentoId: nc.documentoRelacionadoId,
      naoConformidadeId: nc.id
    };

    if (onAddPlano) {
      onAddPlano(newPA);
    }
    onAddLog('5W2H Gerado', `Plano de Ação 5W2H (${newPA.codigo}) gerado automaticamente para a NC ${nc.codigo}.`, nc.documentoRelacionadoId);

    const redirect = window.confirm(`Plano de Ação 5W2H (${newPA.codigo}) gerado com sucesso para a NC ${nc.codigo}!\n\nResponsável: ${newPA.quem}\nPrazo: ${newPA.quando}\n\nDeseja acessar o módulo de Planos de Ação 5W2H agora para detalhar o cronograma?`);
    if (redirect && onNavigateToPlanos) {
      onNavigateToPlanos();
    }
  };

  return (
    <div id="audits-nc-container" className="space-y-6">
      
      {/* Cabeçalho Customizável */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {personalizacao?.auditoriasTitulo || 'Auditorias & Não Conformidades'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {personalizacao?.auditoriasSubtitulo || 'Gerenciamento de auditorias internas programadas e relatórios de desvios para melhoria contínua.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div id="tabs-bar" className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('auditorias')}
          className={`py-3 px-6 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'auditorias'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Auditorias Internas ({personalizacao?.normaISO || 'ISO 9001:2015'} 9.2)</span>
          <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {audits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ncs')}
          className={`py-3 px-6 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'ncs'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Não Conformidades e Ações ({personalizacao?.normaISO || 'ISO 9001:2015'} 10.2)</span>
          <span className="bg-red-50 dark:bg-red-950/40 text-rose-600 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {ncs.length}
          </span>
        </button>
      </div>

      {/* Conteúdo: Auditorias */}
      {activeTab === 'auditorias' && (
        <div id="audits-tab-content" className="space-y-4 animate-fade-in">
          
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Ciclo de Auditoria Ativo</h3>
              <p className="text-[10px] text-slate-400">Verificação periódica dos postos de trabalho de corte, costura e expedição.</p>
            </div>
            
            <button
              onClick={handleOpenNewAudit}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Programar Auditoria</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audits.map((aud) => (
              <div 
                key={aud.id} 
                id={`audit-card-${aud.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      {aud.codigo}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        aud.status === 'Realizada' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {aud.status.toUpperCase()}
                      </span>
                      {(user?.role === 'Qualidade' || user?.role === 'Gestor' || user?.role === 'Administrador') && (
                        <>
                          <button
                            onClick={() => handleOpenEditAudit(aud)}
                            className="text-slate-400 hover:text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Editar Auditoria"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setAuditToDelete(aud)}
                            className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Excluir Auditoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-3">
                    {aud.titulo}
                  </h4>

                  <div className="space-y-2 mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <p className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      Setor: <strong className="ml-1 text-slate-700 dark:text-slate-300 font-semibold">{aud.setor}</strong>
                    </p>
                    <p className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      Data: <strong className="ml-1 text-slate-700 dark:text-slate-300 font-mono font-bold">{aud.dataPlanejada}</strong>
                    </p>
                    <p className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      Auditor: <strong className="ml-1 text-slate-700 dark:text-slate-300">{aud.auditor}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Conteúdo: Não Conformidades */}
      {activeTab === 'ncs' && (
        <div id="nc-tab-content" className="space-y-4 animate-fade-in">
          
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Relatórios de Não Conformidade (RNC)</h3>
              <p className="text-[10px] text-slate-400">Tratamento de desvios, falhas de qualidade no corte, costura e estamparia para melhoria contínua.</p>
            </div>
            
            <button
              onClick={handleOpenNewNc}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir RNC</span>
            </button>
          </div>

          <div className="space-y-3">
            {ncs.map((nc) => (
              <div 
                key={nc.id} 
                id={`nc-card-${nc.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                      {nc.codigo}
                    </span>
                    <span className="text-[10px] text-slate-400">Abertura: {nc.dataAbertura} • Setor: {nc.setor} • Origem: {nc.origem || 'Auditoria Interna'}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      nc.status === 'Fechada' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {nc.status.toUpperCase()}
                    </span>
                    {(user?.role === 'Qualidade' || user?.role === 'Gestor' || user?.role === 'Administrador') && (
                      <>
                        <button
                          onClick={() => handleOpenEditNc(nc)}
                          className="text-slate-400 hover:text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Editar RNC"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setNcToDelete(nc)}
                          className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Excluir RNC"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {nc.titulo}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {nc.descricao}
                  </p>

                  {/* Documento Vinculado */}
                  {nc.documentoRelacionadoId && (
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 px-2 py-1 rounded inline-block">
                      <FileText className="w-3 h-3" />
                      <span>Procedimento Relacionado: {nc.documentoRelacionadoId}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 shrink-0 md:text-right text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Responsável Tratativa</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{nc.responsavel}</p>
                  </div>
                  {(() => {
                    const hasPlan = planos.some(p => p.naoConformidadeId === nc.id || p.codigo === `PA-${nc.codigo}`);
                    return (
                      <button 
                        onClick={() => handleGenerate5W2H(nc)}
                        className={`px-3 py-1.5 font-bold rounded-lg text-[10px] transition-colors flex items-center justify-center space-x-1 ${
                          hasPlan 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                        title={hasPlan ? "Plano de Ação 5W2H já gerado. Clique para abrir/visualizar." : "Gerar Plano de Ação 5W2H automaticamente"}
                      >
                        <BookmarkCheck className={`w-3.5 h-3.5 ${hasPlan ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500'}`} />
                        <span>{hasPlan ? 'Ver Plano 5W2H' : 'Gerar Plano 5W2H'}</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Cartão de Ajuda ao Auditor sobre Cláusula ISO */}
      <div id="auditorias-help-box" className="p-5 rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/15 flex items-start space-x-3.5 mt-6">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
            {personalizacao?.auditoriasAjudaTitulo || 'Auditorias Internas e Não Conformidades (ISO 9.2 & 10.2)'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {personalizacao?.auditoriasAjudaSubtitulo || 'A organização deve planejar, estabelecer e manter um programa de auditoria interna e, ao identificar não-conformidades, reagir imediatamente para controlar e corrigir o desvio, avaliando as causas raiz para evitar que voltem a ocorrer (ações corretivas robustas).'}
          </p>
        </div>
      </div>

      {/* MODAL: Programar Auditoria */}
      {isAuditModalOpen && (
        <div id="audit-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="audit-modal-content" className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button 
              onClick={() => setIsAuditModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center mb-6">
              <Plus className="w-5 h-5 mr-1 text-blue-600" />
              {editingAudit ? `Editar Auditoria: ${editingAudit.codigo}` : 'Programar Auditoria Interna (ISO 9.2)'}
            </h3>

            <form onSubmit={handleCreateAudit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Código Único *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: AUD-2026-004"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden"
                    value={newAudit.codigo}
                    onChange={(e) => setNewAudit({ ...newAudit, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Setor Auditado *</label>
                  <select
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    value={newAudit.setor}
                    onChange={(e) => setNewAudit({ ...newAudit, setor: e.target.value as SectorType })}
                  >
                    {sectorsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Título do Escopo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditoria de Rastreabilidade e Lote da Costura"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  value={newAudit.titulo}
                  onChange={(e) => setNewAudit({ ...newAudit, titulo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Data Planejada *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                    value={newAudit.dataPlanejada}
                    onChange={(e) => setNewAudit({ ...newAudit, dataPlanejada: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Auditor Líder</label>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded" title="Gerenciado no menu Perfis & Usuários">
                      Perfis & Usuários
                    </span>
                  </div>
                  <select
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
                    value={newAudit.auditor}
                    onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                  >
                    {systemAuditors.map((aud) => (
                      <option key={aud} value={aud}>
                        {aud}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                {editingAudit ? 'Salvar Alterações da Auditoria' : 'Salvar e Programar Auditoria'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Abrir RNC */}
      {isNcModalOpen && (
        <div id="nc-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="nc-modal-content" className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsNcModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center mb-6">
              <Plus className="w-5 h-5 mr-1 text-rose-500" />
              {editingNC ? `Editar RNC: ${editingNC.codigo}` : 'Abrir Relatório de Não Conformidade (RNC)'}
            </h3>

            <form onSubmit={handleCreateNC} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Código RNC *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NC-2026-003"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden"
                    value={newNc.codigo}
                    onChange={(e) => setNewNc({ ...newNc, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Setor Relacionado *</label>
                  <select
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    value={newNc.setor}
                    onChange={(e) => setNewNc({ ...newNc, setor: e.target.value as SectorType })}
                  >
                    {sectorsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Título do Desvio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desalinhamento geométrico de bolso em lote de brim militar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  value={newNc.titulo}
                  onChange={(e) => setNewNc({ ...newNc, titulo: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Descrição da Ocorrência e Evidências *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Relate detalhadamente o que foi detectado na amostragem e qual o impacto no lote..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  value={newNc.descricao}
                  onChange={(e) => setNewNc({ ...newNc, descricao: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-sans">Origem da Ocorrência *</label>
                  <select
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                    value={newNc.origem}
                    onChange={(e) => setNewNc({ ...newNc, origem: e.target.value })}
                  >
                    {origens.map((orig) => (
                      <option key={orig} value={orig}>{orig}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-sans">Processo Relacionado (Lista Mestra)</label>
                  <select
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                    value={newNc.documentoRelacionadoId}
                    onChange={(e) => setNewNc({ ...newNc, documentoRelacionadoId: e.target.value })}
                  >
                    <option value="">Nenhum</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>{d.codigo} - {d.titulo.substring(0, 30)}...</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-sans">Responsável Tratativa *</label>
                  <input
                    type="text"
                    list="nc-responsaveis-list"
                    placeholder="Ex: Rodrigo Berto"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden font-medium"
                    value={newNc.responsavel}
                    onChange={(e) => setNewNc({ ...newNc, responsavel: e.target.value })}
                  />
                  <datalist id="nc-responsaveis-list">
                    {systemAuditors.map((resp) => (
                      <option key={resp} value={resp} />
                    ))}
                  </datalist>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                {editingNC ? 'Salvar Alterações da RNC' : 'Registrar RNC e Iniciar Ações Corretivas'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE AUDITORIA */}
      {auditToDelete && (
        <div id="delete-audit-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-audit-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <CheckSquare className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Confirmar Exclusão de Auditoria Interna
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Auditorias & Conformidade (ISO 9001 9.2)</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja remover este registro de auditoria:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  [{auditToDelete.codigo}] {auditToDelete.titulo}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Atenção: A exclusão deste registro removerá permanentemente a programação de auditoria no sistema.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAuditToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAudit(auditToDelete.id);
                  onAddLog('Excluiu Auditoria', `Removeu o registro de auditoria ${auditToDelete.codigo}.`);
                  setAuditToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Auditoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE NÃO CONFORMIDADE (RNC) */}
      {ncToDelete && (
        <div id="delete-nc-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-nc-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <CheckSquare className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Confirmar Exclusão de RNC
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tratamento de Desvios (ISO 9001 10.2)</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja excluir permanentemente esta Não Conformidade:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  [{ncToDelete.codigo}] {ncToDelete.titulo}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Aviso Importante: Relatórios de Não Conformidade são documentos críticos de auditorias do SGQ Vickytex.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setNcToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteNC(ncToDelete.id);
                  onAddLog('Excluiu RNC', `Excluiu o Relatório de Não Conformidade ${ncToDelete.codigo}.`);
                  setNcToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir RNC
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
