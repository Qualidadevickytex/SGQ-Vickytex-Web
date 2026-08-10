/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Save, 
  Info,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  FileText,
  Award
} from 'lucide-react';
import { RiscoOportunidade, SectorType, PlanoAcao } from '../types';
import { SECTORS, getSectors, PersonalizacaoGeral } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';

interface RiscosOportunidadesProps {
  riscos: RiscoOportunidade[];
  planos: PlanoAcao[];
  onAddRisco: (risco: RiscoOportunidade) => void;
  onUpdateRisco: (risco: RiscoOportunidade) => void;
  onDeleteRisco: (id: string) => void;
  onAddLog: (action: string, details: string) => void;
  personalizacao?: PersonalizacaoGeral;
}

export const RiscosOportunidadesComponent: React.FC<RiscosOportunidadesProps> = ({
  riscos,
  planos,
  onAddRisco,
  onUpdateRisco,
  onDeleteRisco,
  onAddLog,
  personalizacao
}) => {
  const { user } = useAuth();
  const [sectorsList] = useState<string[]>(() => getSectors());
  const [riscosCategorias] = useState<string[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_riscos_categorias');
    return saved ? JSON.parse(saved) : [
      "Operacional",
      "Qualidade do Produto",
      "Segurança e Saúde",
      "Ambiental",
      "Financeiro",
      "Prazo / Entrega",
      "Tecnologia",
      "Outros"
    ];
  });

  // Permissões de edição (Qualidade, Gerência, Supervisor, Administrador)
  const canModify = user?.role === 'Qualidade' || user?.role === 'Gestor' || user?.role === 'Supervisor' || user?.role === 'Administrador';

  // Filtros de busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('TODOS');
  const [selectedTipo, setSelectedTipo] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  // Filtro por célula da Matriz de Risco (Probabilidade x Impacto)
  const [matrixFilter, setMatrixFilter] = useState<{ prob: number; imp: number } | null>(null);

  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisco, setEditingRisco] = useState<RiscoOportunidade | null>(null);
  const [riscoToDelete, setRiscoToDelete] = useState<{ id: string; codigo: string } | null>(null);

  // Estados do formulário de criação/edição
  const [formData, setFormData] = useState<Partial<RiscoOportunidade>>({
    codigo: '',
    titulo: '',
    tipo: 'Risco',
    setor: 'Corte',
    descricao: '',
    probabilidade: 3,
    impacto: 3,
    estrategia: 'Mitigar',
    planoAcaoId: '',
    status: 'Identificado',
    responsavel: ''
  });

  // Funções de Cálculo de Cor do Nível de Exposição (ISO 31000 / Cláusula 6.1)
  const getNivelExposicaoLabel = (valor: number, tipo: 'Risco' | 'Oportunidade') => {
    if (tipo === 'Risco') {
      if (valor >= 15) return { text: 'Crítico', color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/50' };
      if (valor >= 10) return { text: 'Alto', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50' };
      if (valor >= 5) return { text: 'Médio', color: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-900/50' };
      return { text: 'Baixo', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50' };
    } else {
      // Oportunidade
      if (valor >= 15) return { text: 'Excelente', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50' };
      if (valor >= 10) return { text: 'Alta', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50' };
      if (valor >= 5) return { text: 'Média', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50' };
      return { text: 'Baixa', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50' };
    }
  };

  const getMatrixCellColor = (prob: number, imp: number) => {
    const valor = prob * imp;
    if (valor >= 15) return 'bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200 dark:border-red-950';
    if (valor >= 10) return 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-200 dark:border-amber-950';
    if (valor >= 5) return 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 border border-yellow-200 dark:border-yellow-950';
    return 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-200 dark:border-emerald-950';
  };

  // Filtragem inteligente de dados
  const filteredRiscos = riscos.filter(item => {
    const matchSearch = 
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsavel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSector = selectedSector === 'TODOS' || item.setor === selectedSector;
    const matchTipo = selectedTipo === 'TODOS' || item.tipo === selectedTipo;
    const matchStatus = selectedStatus === 'TODOS' || item.status === selectedStatus;

    // Filtro específico da Matriz 5x5
    const matchMatrix = !matrixFilter || (item.probabilidade === matrixFilter.prob && item.impacto === matrixFilter.imp);

    return matchSearch && matchSector && matchTipo && matchStatus && matchMatrix;
  });

  // Estatísticas e contadores rápidos
  const totalRiscos = riscos.filter(r => r.tipo === 'Risco').length;
  const totalOportunidades = riscos.filter(r => r.tipo === 'Oportunidade').length;
  const riscosCriticosAltos = riscos.filter(r => r.tipo === 'Risco' && r.probabilidade * r.impacto >= 10).length;
  const tratamentosAtivos = riscos.filter(r => r.status === 'Em Tratamento').length;

  // Handler para Salvar (Criar ou Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) return;

    const prob = Number(formData.probabilidade) || 3;
    const imp = Number(formData.impacto) || 3;

    const finalData: RiscoOportunidade = {
      id: editingRisco ? editingRisco.id : `ro-${Date.now()}`,
      codigo: formData.codigo || (formData.tipo === 'Risco' ? 'RS-NEW-000' : 'OP-NEW-000'),
      titulo: formData.titulo || '',
      tipo: formData.tipo as 'Risco' | 'Oportunidade',
      setor: formData.setor || 'Corte',
      descricao: formData.descricao || '',
      probabilidade: prob,
      impacto: imp,
      nivelExposicao: prob * imp,
      estrategia: formData.estrategia as any,
      planoAcaoId: formData.planoAcaoId || undefined,
      status: formData.status as any,
      dataIdentificacao: formData.dataIdentificacao || new Date().toISOString().split('T')[0],
      responsavel: formData.responsavel || '',
      categoria: formData.categoria
    };

    if (editingRisco) {
      onUpdateRisco(finalData);
      onAddLog('Riscos & Oportunidades', `Editou o item ${finalData.codigo}: ${finalData.titulo}`);
    } else {
      onAddRisco(finalData);
      onAddLog('Riscos & Oportunidades', `Cadastrou o item ${finalData.codigo}: ${finalData.titulo}`);
    }

    setIsModalOpen(false);
    setEditingRisco(null);
  };

  // Abrir modal de criação
  const handleOpenCreateModal = () => {
    setEditingRisco(null);
    setFormData({
      codigo: `RS-${Date.now().toString().slice(-4)}`,
      titulo: '',
      tipo: 'Risco',
      setor: 'Corte',
      descricao: '',
      probabilidade: 3,
      impacto: 3,
      estrategia: 'Mitigar',
      planoAcaoId: '',
      status: 'Identificado',
      responsavel: user?.name || '',
      categoria: riscosCategorias[0] || 'Operacional'
    });
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (item: RiscoOportunidade) => {
    setEditingRisco(item);
    setFormData({
      codigo: item.codigo,
      titulo: item.titulo,
      tipo: item.tipo,
      setor: item.setor,
      descricao: item.descricao,
      probabilidade: item.probabilidade,
      impacto: item.impacto,
      estrategia: item.estrategia,
      planoAcaoId: item.planoAcaoId || '',
      status: item.status,
      dataIdentificacao: item.dataIdentificacao,
      responsavel: item.responsavel,
      categoria: item.categoria || riscosCategorias[0] || 'Operacional'
    });
    setIsModalOpen(true);
  };

  // Excluir item
  const handleDelete = (id: string, codigo: string) => {
    if (!canModify) return;
    setRiscoToDelete({ id, codigo });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="riscos-oportunidades-module-panel">
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="bg-[#0B3A63] dark:bg-slate-900 rounded-xl border border-slate-200/10 dark:border-slate-800 p-6 shadow-sm text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10">
          <ShieldAlert className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/20 uppercase tracking-wider">
                REQUISITO ISO 9001:2015 — SEÇÃO 6.1
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {personalizacao?.riscosTitulo || 'Gestão de Riscos & Oportunidades'}
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              {personalizacao?.riscosSubtitulo || 'Identifique, analise e mitigue proativamente os riscos que impactam a qualidade dos uniformes da Vickytex, garantindo a continuidade operacional e a satisfação dos clientes escolares.'}
            </p>
          </div>
          {canModify && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs shrink-0 self-start md:self-center"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>Novo Risco ou Oportunidade</span>
            </button>
          )}
        </div>
      </div>

      {/* METRICAS DE EXPOSIÇÃO DO MÓDULO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL RISCOS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Riscos Mapeados</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">{totalRiscos}</span>
          </div>
        </div>

        {/* TOTAL OPORTUNIDADES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Oportunidades</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">{totalOportunidades}</span>
          </div>
        </div>

        {/* TRATAMENTOS ATIVOS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Em Tratamento</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">{tratamentosAtivos}</span>
          </div>
        </div>

        {/* RISCOS CRÍTICOS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg">
            <span className="font-bold text-sm">C10</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Nível Crítico/Alto</span>
            <span className="text-2xl font-black text-red-600 font-mono">{riscosCriticosAltos}</span>
          </div>
        </div>
      </div>

      {/* CORE GRID: MATRIZ DE RISCO 5X5 HEATMAP & FILTROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA 1: MATRIZ DE RISCO 5X5 INTERATIVA (HEATMAP) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <span>Matriz de Risco Interativa (5x5)</span>
              </h3>
              {matrixFilter && (
                <button 
                  onClick={() => setMatrixFilter(null)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Limpar Filtro</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Selecione uma célula para filtrar a lista mestra de riscos na tabela ao lado.
            </p>
          </div>

          {/* O GRID DA MATRIZ */}
          <div className="flex flex-col space-y-1.5 py-3">
            {/* Eixo Y: Probabilidade (5 down to 1) */}
            {[5, 4, 3, 2, 1].map((prob) => (
              <div key={prob} className="flex items-center space-x-1.5">
                {/* Rótulo lateral */}
                <div className="w-5 text-right text-[10px] font-bold text-slate-400 font-mono">{prob}</div>
                {/* As 5 colunas de Impacto */}
                <div className="flex-1 grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((imp) => {
                    const count = riscos.filter(
                      r => r.tipo === 'Risco' && r.probabilidade === prob && r.impacto === imp
                    ).length;

                    const isSelected = matrixFilter?.prob === prob && matrixFilter?.imp === imp;

                    return (
                      <button
                        key={imp}
                        onClick={() => setMatrixFilter({ prob, imp })}
                        className={`aspect-square rounded-md flex flex-col items-center justify-center transition-all relative ${getMatrixCellColor(prob, imp)} ${
                          isSelected ? 'ring-3 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950 scale-105 z-10' : ''
                        }`}
                      >
                        <span className="text-[11px] font-black font-mono">{count > 0 ? count : '-'}</span>
                        <span className="text-[7px] text-slate-400 font-bold leading-none mt-0.5">{prob * imp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Rótulos do Eixo X: Impacto (1 to 5) */}
            <div className="flex items-center space-x-1.5 pt-1">
              <div className="w-5"></div> {/* Spacer */}
              <div className="flex-1 grid grid-cols-5 gap-1.5 text-center">
                {[1, 2, 3, 4, 5].map((imp) => (
                  <div key={imp} className="text-[10px] font-bold text-slate-400 font-mono">{imp}</div>
                ))}
              </div>
            </div>
          </div>

          {/* LEGENDA DE RISCO */}
          <div className="bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[9px] grid grid-cols-2 gap-2 mt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/20 border border-emerald-300 dark:border-emerald-800"></span>
              <span className="text-slate-500 font-medium">Baixo (1-4)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-yellow-500/20 border border-yellow-300 dark:border-yellow-800"></span>
              <span className="text-slate-500 font-medium">Médio (5-9)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/20 border border-amber-300 dark:border-amber-800"></span>
              <span className="text-slate-500 font-medium">Alto (10-12)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500/20 border border-red-300 dark:border-red-800"></span>
              <span className="text-slate-500 font-medium">Crítico (15-25)</span>
            </div>
          </div>
        </div>

        {/* COLUNA 2 E 3: TABELA LISTA MESTRA DE RISCOS E OPORTUNIDADES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs lg:col-span-2 space-y-4">
          
          {/* BARRA DE FILTRAGEM */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Busca textual */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar código, título, responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 focus:outline-hidden"
              />
            </div>
            
            {/* Filtros Dropdown */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold focus:outline-hidden"
              >
                <option value="TODOS">Todos Tipos</option>
                <option value="Risco">Risco</option>
                <option value="Oportunidade">Oportunidade</option>
              </select>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold focus:outline-hidden"
              >
                <option value="TODOS">Todos Setores</option>
                {sectorsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold focus:outline-hidden"
              >
                <option value="TODOS">Todos Status</option>
                <option value="Identificado">Identificado</option>
                <option value="Em Tratamento">Em Tratamento</option>
                <option value="Controlado">Controlado</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          {/* INDICADOR SE O FILTRO DA MATRIZ ESTIVER ATIVO */}
          {matrixFilter && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-[10px] flex items-center justify-between">
              <span className="text-blue-800 dark:text-blue-300 font-semibold">
                Filtrando células da Matriz: Probabilidade <strong>{matrixFilter.prob}</strong> × Impacto <strong>{matrixFilter.imp}</strong> (Nível {matrixFilter.prob * matrixFilter.imp})
              </span>
              <button 
                onClick={() => setMatrixFilter(null)}
                className="p-1 text-blue-800 dark:text-blue-300 hover:bg-blue-100 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TABELA DE DADOS */}
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Título / Descrição</th>
                  <th className="p-3 text-center">Nível (P×I)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Ação Vinculada</th>
                  {canModify && <th className="p-3 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredRiscos.length === 0 ? (
                  <tr>
                    <td colSpan={canModify ? 6 : 5} className="p-8 text-center text-slate-400 italic">
                      Nenhum registro encontrado para os filtros ativos.
                    </td>
                  </tr>
                ) : (
                  filteredRiscos.map((item) => {
                    const exposicao = getNivelExposicaoLabel(item.nivelExposicao, item.tipo);
                    const planoVinculado = planos.find(p => p.id === item.planoAcaoId);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0">
                          {item.codigo}
                        </td>
                        <td className="p-3 max-w-xs space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                              item.tipo === 'Risco' 
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' 
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                            }`}>
                              {item.tipo}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">[{item.setor}]</span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100/80 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                              {item.categoria || 'Operacional'}
                            </span>
                          </div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate" title={item.titulo}>
                            {item.titulo}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {item.descricao}
                          </p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${exposicao.color}`}>
                            {item.nivelExposicao} — {exposicao.text}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase font-mono ${
                            item.status === 'Identificado' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                            item.status === 'Em Tratamento' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            item.status === 'Controlado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            'bg-slate-200 text-slate-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {planoVinculado ? (
                            <div className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <FileText className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-mono font-bold underline truncate max-w-[120px] block" title={`${planoVinculado.codigo}: ${planoVinculado.titulo}`}>
                                {planoVinculado.codigo}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Sem plano</span>
                          )}
                        </td>
                        {canModify && (
                          <td className="p-3 text-right">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.codigo)}
                                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Remover"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* METODOLOGIA INFORMATIVA DE RISCOS (ISO 31000) */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3.5">
        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5 uppercase tracking-wider">
          <Info className="w-4 h-4 text-[#0B3A63] dark:text-blue-400" />
          <span>Matriz de Risco ISO 9001:2015 & Metodologia ISO 31000</span>
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          O cálculo da **Exposição de Risco** é feito pela multiplicação de **Probabilidade (1 a 5)** por **Impacto (1 a 5)**. 
          A Vickytex determina as seguintes ações baseadas no nível resultante:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[10px] pt-1">
          <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-emerald-600">Nível 1 a 4 — Baixo</span>
            <p className="text-slate-400 leading-relaxed">Monitoramento periódico simples. O risco é tolerável e as proteções locais são suficientes.</p>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-yellow-600">Nível 5 a 9 — Médio</span>
            <p className="text-slate-400 leading-relaxed">Ações de mitigação preventivas devem ser implementadas e auditadas internamente.</p>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-amber-600">Nível 10 to 12 — Alto</span>
            <p className="text-slate-400 leading-relaxed">Geração obrigatória de Plano de Ação 5W2H no sistema para mitigação sistêmica e acompanhamento mensal.</p>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-red-600">Nível 15 to 25 — Crítico</span>
            <p className="text-slate-400 leading-relaxed">Parada imediata de conformidade se necessário. Envolvimento da Gerência e relatórios de desvio formais.</p>
          </div>
        </div>
      </div>

      {/* Cartão de Ajuda ao Auditor sobre Cláusula ISO */}
      <div id="riscos-help-box" className="p-5 rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/15 flex items-start space-x-3.5">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
            {personalizacao?.riscosAjudaTitulo || 'Abordagem de Riscos e Oportunidades (Requisito ISO 6.1)'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {personalizacao?.riscosAjudaSubtitulo || 'O pensamento baseado em risco permite à organização determinar os fatores que poderiam causar desvios em seus processos e no SGQ, colocando em prática controles preventivos para minimizar efeitos negativos e maximizar as oportunidades que surgirem.'}
          </p>
        </div>
      </div>

      {/* MODAL: NOVO OU EDICAO DE RISCO/OPORTUNIDADE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-slide-in">
            {/* Header Modal */}
            <div className="bg-[#0B3A63] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold tracking-tight">
                  {editingRisco ? `Editar Registro: ${editingRisco.codigo}` : 'Cadastrar Risco ou Oportunidade'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Codigo e Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Código Único</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="Ex: RS-COR-003"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any, estrategia: e.target.value === 'Risco' ? 'Mitigar' : 'Explorar' })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden"
                  >
                    <option value="Risco">Risco ⚠️</option>
                    <option value="Oportunidade">Oportunidade 📈</option>
                  </select>
                </div>
              </div>

              {/* Titulo */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Título Curto</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Instabilidade de temperatura do Flash Cure"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden"
                />
              </div>

              {/* Setor, Responsavel e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Setor Associado</label>
                  <select
                    value={formData.setor}
                    onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden"
                  >
                    {sectorsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria de Risco</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden"
                  >
                    {riscosCategorias.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Responsável</label>
                  <input
                    type="text"
                    required
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Ex: Jorge Dias (Estamparia)"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* Descricao */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Descrição Detalhada do Risco / Causa</label>
                <textarea
                  rows={2}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva as causas potenciais do risco ou o benefício esperado da oportunidade..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 resize-none font-medium focus:outline-hidden"
                />
              </div>

              {/* Probabilidade, Impacto e Exposicao Calculada */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-400 block uppercase">Probabilidade</label>
                  <select
                    value={formData.probabilidade}
                    onChange={(e) => setFormData({ ...formData, probabilidade: Number(e.target.value) })}
                    className="bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md p-1.5 font-bold focus:outline-hidden mx-auto block"
                  >
                    <option value={1}>1 - Muito Rara</option>
                    <option value={2}>2 - Rara</option>
                    <option value={3}>3 - Possível</option>
                    <option value={4}>4 - Frequente</option>
                    <option value={5}>5 - Quase Certa</option>
                  </select>
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-400 block uppercase">Impacto / Gravidade</label>
                  <select
                    value={formData.impacto}
                    onChange={(e) => setFormData({ ...formData, impacto: Number(e.target.value) })}
                    className="bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-md p-1.5 font-bold focus:outline-hidden mx-auto block"
                  >
                    <option value={1}>1 - Insignificante</option>
                    <option value={2}>2 - Menor</option>
                    <option value={3}>3 - Moderado</option>
                    <option value={4}>4 - Maior</option>
                    <option value={5}>5 - Desastroso</option>
                  </select>
                </div>
                <div className="space-y-1 text-center flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Exposição Calculada</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono mt-1">
                    {(Number(formData.probabilidade) || 3) * (Number(formData.impacto) || 3)}
                  </span>
                </div>
              </div>

              {/* Estrategia, Plano Ação Vinculado e Status */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estratégia</label>
                  <select
                    value={formData.estrategia}
                    onChange={(e) => setFormData({ ...formData, estrategia: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden"
                  >
                    {formData.tipo === 'Risco' ? (
                      <>
                        <option value="Mitigar">Mitigar</option>
                        <option value="Evitar">Evitar</option>
                        <option value="Aceitar">Aceitar</option>
                        <option value="Transferir">Transferir</option>
                      </>
                    ) : (
                      <>
                        <option value="Explorar">Explorar</option>
                        <option value="Melhorar">Melhorar</option>
                        <option value="Aceitar">Aceitar</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Plano 5W2H</label>
                  <select
                    value={formData.planoAcaoId}
                    onChange={(e) => setFormData({ ...formData, planoAcaoId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden font-mono"
                  >
                    <option value="">Sem plano vinculado</option>
                    {planos.map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} - {p.titulo}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden"
                  >
                    <option value="Identificado">Identificado</option>
                    <option value="Em Tratamento">Em Tratamento</option>
                    <option value="Controlado">Controlado</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Registro</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE RISCO/OPORTUNIDADE */}
      {riscoToDelete && (
        <div id="delete-risco-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-risco-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Confirmar Remoção de Risco/Oportunidade
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Gerenciamento de Riscos - ISO 31000</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja remover este registro:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  {riscoToDelete.codigo}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Atenção: Esta alteração será refletida no histórico de conformidade do SGQ Vickytex.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRiscoToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRisco(riscoToDelete.id);
                  onAddLog('Riscos & Oportunidades', `Removeu o registro de Risco/Oportunidade ${riscoToDelete.codigo}`);
                  setRiscoToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
