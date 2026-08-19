/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Star, 
  Lightbulb, 
  FileText,
  User,
  Settings,
  ArrowRight,
  TrendingUp,
  Inbox,
  Pencil,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { SugestaoCEO, StatusSugestaoCEO } from '../../types/ceo';
import { SectorType } from '../../types/department';
import { UserProfile } from '../../types/user';
import { PlanoAcao } from '../../types/actionPlan';
import { ActionPlanRepository } from '../../services/database/repositories/actionPlan.repository';

interface SugestoesCEOProps {
  suggestions: SugestaoCEO[];
  user: UserProfile;
  onAddSuggestion: (suggestion: Partial<SugestaoCEO>) => Promise<boolean>;
  onUpdateSuggestion: (id: string, updates: Partial<SugestaoCEO>) => Promise<boolean>;
  onDeleteSuggestion?: (id: string) => Promise<boolean>;
  sectors: SectorType[];
  planos?: PlanoAcao[];
  onAddPlano?: (plano: PlanoAcao) => void;
  onNavigateToPlanos?: () => void;
}

export const SugestoesCEO: React.FC<SugestoesCEOProps> = ({
  suggestions,
  user,
  onAddSuggestion,
  onUpdateSuggestion,
  onDeleteSuggestion,
  sectors,
  planos = [],
  onAddPlano,
  onNavigateToPlanos
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit State
  const [editingItem, setEditingItem] = useState<SugestaoCEO | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSector, setEditSector] = useState<SectorType>(sectors[0] || 'Costura');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSector, setNewSector] = useState<SectorType>(sectors[0] || 'Costura');

  // Evaluation Panel State
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [evalStatus, setEvalStatus] = useState<StatusSugestaoCEO>('Aprovada');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalImpact, setEvalImpact] = useState(3);
  const [evalEase, setEvalEase] = useState(3);

  // Delete State
  const [sugToDelete, setSugToDelete] = useState<SugestaoCEO | null>(null);

  // Filter ideas
  const filteredSuggestions = suggestions.filter(s => {
    const matchesSearch = (s.titulo || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                          (s.descricao || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                          (s.codigo || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesStatus = selectedStatus === 'TODOS' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const code = `SUG-CEO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const success = await onAddSuggestion({
      codigo: code,
      titulo: newTitle,
      descricao: newDesc,
      setor: newSector,
      autor: user.email,
      dataSubmissao: new Date().toISOString().split('T')[0],
      status: 'Submetida',
      notaImpacto: 0,
      notaFacilidade: 0
    });

    if (success) {
      setNewTitle('');
      setNewDesc('');
      setIsAdding(false);
    }
  };

  const startEdit = (sug: SugestaoCEO) => {
    setEditingItem(sug);
    setEditTitle(sug.titulo);
    setEditDesc(sug.descricao);
    setEditSector(sug.setor);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim() || !editDesc.trim()) return;

    const success = await onUpdateSuggestion(editingItem.id, {
      titulo: editTitle.trim(),
      descricao: editDesc.trim(),
      setor: editSector
    });

    if (success) {
      setEditingItem(null);
    }
  };

  const handleDelete = (sug: SugestaoCEO) => {
    setSugToDelete(sug);
  };

  const confirmDeleteSug = async () => {
    if (!sugToDelete) return;
    const targetId = sugToDelete.id;
    if (onDeleteSuggestion) {
      await onDeleteSuggestion(targetId);
    } else {
      // Fallback local deletion
      const saved = localStorage.getItem('sgq_vickytex_ceo_ideas');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((i: any) => i.id !== targetId);
        localStorage.setItem('sgq_vickytex_ceo_ideas', JSON.stringify(filtered));
        window.location.reload();
      }
    }
    setSugToDelete(null);
    setEditingItem(null);
    setEvaluatingId(null);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingId) return;

    const currentEvalFeedback = evalFeedback;
    const targetSugId = evaluatingId;
    const isApproving = evalStatus === 'Aprovada';

    const updates: Partial<SugestaoCEO> = {
      status: evalStatus,
      avaliacaoComite: evalFeedback,
      notaImpacto: evalImpact,
      notaFacilidade: evalEase
    };

    const success = await onUpdateSuggestion(targetSugId, updates);
    if (success) {
      if (isApproving) {
        await instantiateActionPlan(targetSugId, currentEvalFeedback);
      }
      setEvaluatingId(null);
      setEvalFeedback('');
    }
  };

  // Automated instantiation of Action Plan 5W2H
  const instantiateActionPlan = async (sugId: string, customFeedback?: string) => {
    const sug = suggestions.find(s => s.id === sugId);
    if (!sug) return;

    try {
      const feedbackText = customFeedback !== undefined ? customFeedback : (sug.avaliacaoComite || evalFeedback || 'Aprovado pelo comitê técnico do CEO.');
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      const deadlineStr = deadline.toISOString().split('T')[0];

      const newPlanoCode = `PA-${sug.codigo || `SUG-${Date.now().toString().slice(-4)}`}`;
      const newPlano: PlanoAcao = {
        id: `plano-ceo-${sug.id || Date.now()}`,
        codigo: newPlanoCode,
        titulo: `Implantar Melhoria: ${sug.titulo}`,
        setor: sug.setor,
        status: 'Planejado',
        dataCriacao: new Date().toISOString().split('T')[0],
        oQue: `Implementar melhoria contínua (${sug.codigo}): ${sug.titulo}`,
        porQue: `Ideia de melhoria submetida por ${sug.autor || 'Colaborador'}. Detalhes: ${sug.descricao}`,
        onde: `Setor de ${sug.setor} - Instalações da Vickytex`,
        quando: deadlineStr,
        quem: sug.autor || user?.name || user?.email || 'Qualidade Vickytex',
        como: `1. Mapear escopo e viabilidade técnica;\n2. Executar cronograma conforme diretrizes do comitê: ${feedbackText};\n3. Acompanhar ganhos de produtividade e qualidade.`,
        quantoCusta: 0
      };

      // 1. Salvar no Firestore
      try {
        await ActionPlanRepository.create(newPlano);
      } catch (err) {
        console.error('Erro ao salvar plano no Firestore via repository:', err);
      }

      // 2. Salvar no estado global do App (se passado)
      if (onAddPlano) {
        onAddPlano(newPlano);
      }

      // 3. Fallback no localStorage
      try {
        const savedPlanosRaw = localStorage.getItem('sgq_vickytex_planos');
        const currentPlanos: PlanoAcao[] = savedPlanosRaw ? JSON.parse(savedPlanosRaw) : [];
        if (!currentPlanos.some(p => p.id === newPlano.id || p.codigo === newPlano.codigo)) {
          currentPlanos.unshift(newPlano);
          localStorage.setItem('sgq_vickytex_planos', JSON.stringify(currentPlanos));
        }
      } catch (lsErr) {
        console.error('Erro ao atualizar localStorage de planos:', lsErr);
      }

      // 4. Vincular Plano ID à Sugestão
      await onUpdateSuggestion(sugId, { planoAcaoId: newPlano.id });
    } catch (err) {
      console.error('Failed to instantiate 5W2H Action Plan', err);
    }
  };

  const startEvaluation = (sug: SugestaoCEO) => {
    setEvaluatingId(sug.id);
    setEvalStatus(sug.status === 'Submetida' ? 'Aprovada' : sug.status);
    setEvalFeedback(sug.avaliacaoComite || '');
    setEvalImpact(sug.notaImpacto || 3);
    setEvalEase(sug.notaFacilidade || 3);
  };

  const getStatusBadge = (status: StatusSugestaoCEO) => {
    const styles = {
      'Submetida': 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50',
      'Em Análise': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50',
      'Aprovada': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50',
      'Em Implantação': 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200/50',
      'Concluída': 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      'Rejeitada': 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const isEvaluator = ['Qualidade', 'Gerente', 'Diretor', 'Administrador', 'Gestor', 'Supervisor'].some(r => user?.role?.includes(r));

  return (
    <div id="ceo-suggestions-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT 2 COLUMNS: LIST & SUBMISSION */}
      <div className="lg:col-span-2 space-y-5">
        
        {/* Actions header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar sugestões por título, descrição, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold focus:outline-hidden"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Submetida">Submetidas</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Aprovada">Aprovadas</option>
              <option value="Em Implantação">Em Implantação</option>
              <option value="Concluída">Concluídas</option>
              <option value="Rejeitada">Rejeitadas</option>
            </select>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center space-x-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enviar Ideia</span>
            </button>
          </div>
        </div>

        {/* New Idea Submission Form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Formulário de Submissão de Ideias (VickyIdeia)</span>
              </span>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Sugestão</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Dispositivo anti-erro no enfesto PV..."
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Setor Impactado</label>
                <select 
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value as SectorType)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                >
                  {sectors.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Detalhada</label>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                placeholder="Descreva o problema observado, a oportunidade de melhoria e como essa ideia ajudará a rotina do setor..."
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Submeter para Avaliação
              </button>
            </div>
          </form>
        )}

        {/* Suggestions list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map(sug => {
              const priorityScore = (sug.notaImpacto || 0) * (sug.notaFacilidade || 0);

              return (
                <div 
                  key={sug.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{sug.codigo}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(sug.status)}
                        <button
                          type="button"
                          onClick={() => startEdit(sug)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Editar Sugestão"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sug)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Excluir Sugestão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1 mb-1.5">
                      {sug.titulo}
                    </h4>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {sug.descricao}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Por: {sug.autor?.split('@')[0] || 'Sem Autor'}</span>
                      </span>
                      <span className="font-bold text-slate-600 dark:text-slate-400">Setor {sug.setor}</span>
                    </div>

                    {/* Committee Ratings if evaluated */}
                    {sug.notaImpacto ? (
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-[10px]">
                        <div className="flex gap-2">
                          <span className="text-slate-400">Imp: <b className="text-slate-600 dark:text-slate-300">{sug.notaImpacto}/5</b></span>
                          <span className="text-slate-400">Fac: <b className="text-slate-600 dark:text-slate-300">{sug.notaFacilidade}/5</b></span>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Filtro PICK: {priorityScore >= 16 ? 'Implement' : priorityScore >= 9 ? 'Possible' : priorityScore >= 4 ? 'Challenge' : 'Kill'}</span>
                        </span>
                      </div>
                    ) : null}

                    {/* Action plan linkage info */}
                    {sug.planoAcaoId ? (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-2 mt-1">
                        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Plano 5W2H Vinculado</span>
                        </div>
                        {onNavigateToPlanos && (
                          <button
                            type="button"
                            onClick={onNavigateToPlanos}
                            className="inline-flex items-center space-x-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-lg transition-colors shadow-2xs"
                          >
                            <span>Abrir Planos</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : sug.status === 'Aprovada' ? (
                      <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-2 mt-1">
                        <div className="flex items-center space-x-1 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Ideia Aprovada</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => instantiateActionPlan(sug.id, sug.avaliacaoComite)}
                          className="inline-flex items-center space-x-1 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Gerar 5W2H</span>
                        </button>
                      </div>
                    ) : null}

                    {/* Evaluator trigger */}
                    {isEvaluator && (
                      <button
                        onClick={() => startEvaluation(sug)}
                        className="w-full mt-2 inline-flex items-center justify-center space-x-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-[10px] transition-colors"
                      >
                        <Settings className="w-3 h-3" />
                        <span>{sug.notaImpacto ? 'Reavaliar Sugestão' : 'Avaliar / Comitê'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 h-60 flex flex-col items-center justify-center text-xs text-slate-400 gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Inbox className="w-8 h-8 text-slate-300 animate-pulse" />
              <span>Nenhuma sugestão encontrada para os filtros atuais.</span>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: EVALUATION SIDEBAR */}
      <div className="space-y-4">
        {evaluatingId ? (
          <form onSubmit={handleEvaluate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 sticky top-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Parecer Técnico do Comitê</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                Avaliando: <span className="font-mono text-slate-500">{suggestions.find(s => s.id === evaluatingId)?.codigo}</span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Status da Avaliação</label>
              <select
                value={evalStatus}
                onChange={(e) => setEvalStatus(e.target.value as StatusSugestaoCEO)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="Em Análise">Em Análise</option>
                <option value="Aprovada">Aprovar (Cria Plano 5W2H)</option>
                <option value="Rejeitada">Rejeitar</option>
                <option value="Em Implantação">Em Implantação</option>
                <option value="Concluída">Marcar como Concluída</option>
              </select>
            </div>

            {/* Impact Scale 1 to 5 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Impacto Operacional</label>
                <span className="text-xs font-mono font-bold text-blue-600">{evalImpact} de 5</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setEvalImpact(num)}
                    className={`flex-1 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                      evalImpact === num 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Feasibility / Ease 1 to 5 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Facilidade de Implantação</label>
                <span className="text-xs font-mono font-bold text-emerald-600">{evalEase} de 5</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setEvalEase(num)}
                    className={`flex-1 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                      evalEase === num 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* SWOT-based scoring explanation */}
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Matriz de Priorização PICK</span>
              O cruzamento de Impacto ({evalImpact}) x Facilidade ({evalEase}) gera uma nota de <b className="text-slate-800 dark:text-slate-100 font-mono">{evalImpact * evalEase}</b>. 
              {evalImpact * evalEase >= 16 
                ? ' Esta ideia é um ganho rápido de altíssimo impacto (Implement).' 
                : evalImpact * evalEase >= 9 
                ? ' Esta ideia é recomendável, mas exige algum esforço (Possible).' 
                : ' Esta ideia é considerada de baixa viabilidade (Challenge/Kill).'}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Comentários e Requisitos</label>
              <textarea
                value={evalFeedback}
                onChange={(e) => setEvalFeedback(e.target.value)}
                rows={3}
                placeholder="Insira observações técnicas, orçamento permitido ou justificativa de aprovação/rejeição..."
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEvaluatingId(null)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 font-bold rounded-xl text-xs bg-white dark:bg-slate-950"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetSug = suggestions.find(s => s.id === evaluatingId);
                  if (targetSug) {
                    await handleDelete(targetSug);
                    setEvaluatingId(null);
                  }
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                title="Excluir Sugestão"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Salvar Parecer
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Instruções do VickyIdeia</span>
            </h4>
            <div className="space-y-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <p>
                Qualquer colaborador cadastrado no SGQ pode submeter sugestões de melhoria contínua para o seu setor.
              </p>
              <p>
                O comitê técnico do <b>Centro de Excelência Operacional (CEO)</b> revisará as ideias atribuindo notas de Impacto e Facilidade.
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-200/40">
                <span className="font-bold block mb-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Automatização de Fluxo</span>
                </span>
                Ao aprovar uma ideia, o sistema gera de forma 100% automatizada um **Plano de Ação 5W2H** no módulo de planos, vinculando o criador como responsável.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT SUGGESTION MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Editar Sugestão de Melhoria</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{editingItem.codigo}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Título da Ideia</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Setor Produtivo Beneficiado</label>
                <select
                  value={editSector}
                  onChange={(e) => setEditSector(e.target.value as SectorType)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                >
                  {sectors.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Descrição da Ideia & Diagnóstico</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={async () => {
                    if (editingItem) {
                      await handleDelete(editingItem);
                      setEditingItem(null);
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Sugestão</span>
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!sugToDelete}
        title="Excluir Sugestão"
        message={`Tem certeza que deseja excluir permanentemente a sugestão "${sugToDelete?.codigo || ''} — ${sugToDelete?.titulo || ''}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Sugestão"
        onConfirm={confirmDeleteSug}
        onClose={() => setSugToDelete(null)}
      />

    </div>
  );
};
export default SugestoesCEO;
