/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  Star, 
  Award, 
  ShieldAlert, 
  ArrowLeft,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Fornecedor, AvaliacaoFornecedor } from '../types';
import { INITIAL_FORNECEDORES } from '../utils/mockData';
import { SupplierRepository } from '../services/database/repositories/supplier.repository';

interface FornecedoresProps {
  onAddLog: (action: string, details: string) => void;
  personalizacao?: any;
}

export const Fornecedores: React.FC<FornecedoresProps> = ({ onAddLog, personalizacao }) => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_suppliers') || localStorage.getItem('sgq_vickytex_fornecedores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler fornecedores do localStorage', e);
      }
    }
    return INITIAL_FORNECEDORES;
  });

  // Carregar os fornecedores reais do Banco de Dados/Cache via SupplierRepository na montagem
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await SupplierRepository.findAll();
        if (res.success && res.data && res.data.length > 0) {
          setFornecedores(res.data);
        }
      } catch (err) {
        console.error('Erro ao buscar fornecedores do repositório:', err);
      }
    };
    fetchSuppliers();
  }, []);

  // Salvar no localStorage sempre que houver mudanças para consistência local
  useEffect(() => {
    localStorage.setItem('sgq_vickytex_suppliers', JSON.stringify(fornecedores));
    localStorage.setItem('sgq_vickytex_fornecedores', JSON.stringify(fornecedores));
  }, [fornecedores]);

  // Estados de busca, filtros e modais
  const [categorias, setCategorias] = useState<string[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_fornecedores_categorias');
    return saved ? JSON.parse(saved) : [
      "Fios e Fibras",
      "Serviços de Tinturaria",
      "Embalagens",
      "Produtos Químicos",
      "Manutenção",
      "Calibração",
      "Serviços de Facção/Costura",
      "Outros"
    ];
  });

  // Control inline category creation
  const [showInlineAddCategory, setShowInlineAddCategory] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState('');

  const handleSaveInlineCategory = () => {
    if (newCategoryText && newCategoryText.trim()) {
      const clean = newCategoryText.trim();
      let updated = [...categorias];
      if (!updated.includes(clean)) {
        updated.push(clean);
        setCategorias(updated);
        localStorage.setItem('sgq_vickytex_fornecedores_categorias', JSON.stringify(updated));
      }
      setCategoria(clean);
      setNewCategoryText('');
      setShowInlineAddCategory(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [selectedCriticidade, setSelectedCriticidade] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  
  const [selectedSupplier, setSelectedSupplier] = useState<Fornecedor | null>(null);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Fornecedor | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<Fornecedor | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

  // Synchronize categories from localStorage when modals open
  useEffect(() => {
    if (isAddingSupplier || editingSupplier) {
      const saved = localStorage.getItem('sgq_vickytex_fornecedores_categorias');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCategorias(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isAddingSupplier, editingSupplier]);

  // Form states para Fornecedor
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoEmail, setContatoEmail] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [categoria, setCategoria] = useState<any>(() => categorias[0] || 'Fios e Fibras');
  const [criticidade, setCriticidade] = useState<Fornecedor['criticidade']>('Alta');
  const [observacoes, setObservacoes] = useState('');

  // Form states para Avaliação
  const [evaluator, setEvaluator] = useState('');
  const [criterioQualidade, setCriterioQualidade] = useState<number>(100);
  const [criterioPrazo, setCriterioPrazo] = useState<number>(100);
  const [criterioAtendimento, setCriterioAtendimento] = useState<number>(100);
  const [parecerTecnico, setParecerTecnico] = useState('');

  // Sincronizar form ao editar
  useEffect(() => {
    if (editingSupplier) {
      setCnpj(editingSupplier.cnpj);
      setRazaoSocial(editingSupplier.razaoSocial);
      setNomeFantasia(editingSupplier.nomeFantasia);
      setContatoNome(editingSupplier.contatoNome);
      setContatoEmail(editingSupplier.contatoEmail);
      setContatoTelefone(editingSupplier.contatoTelefone);
      setCategoria(editingSupplier.categoria);
      setCriticidade(editingSupplier.criticidade);
      setObservacoes(editingSupplier.observacoes || '');
    } else {
      resetForm();
    }
  }, [editingSupplier]);

  const resetForm = () => {
    setCnpj('');
    setRazaoSocial('');
    setNomeFantasia('');
    setContatoNome('');
    setContatoEmail('');
    setContatoTelefone('');
    setCategoria(categorias[0] || 'Fios e Fibras');
    setCriticidade('Alta');
    setObservacoes('');
  };

  const resetEvalForm = () => {
    setEvaluator('');
    setCriterioQualidade(100);
    setCriterioPrazo(100);
    setCriterioAtendimento(100);
    setParecerTecnico('');
  };

  // Handlers
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial || !cnpj) {
      alert('Razão Social e CNPJ são obrigatórios.');
      return;
    }

    const newSupplier: Fornecedor = {
      id: `forn-${Date.now()}`,
      cnpj,
      razaoSocial,
      nomeFantasia: nomeFantasia || razaoSocial,
      contatoNome,
      contatoEmail,
      contatoTelefone,
      categoria,
      criticidade,
      statusQualificacao: 'Em Avaliação',
      historicoAvaliacoes: [],
      observacoes
    };

    setFornecedores([newSupplier, ...fornecedores]);
    setIsAddingSupplier(false);
    resetForm();
    onAddLog('Cadastro de Fornecedor', `Cadastrou o fornecedor ${newSupplier.nomeFantasia} (CNPJ: ${cnpj})`);

    try {
      await SupplierRepository.create(newSupplier);
    } catch (err) {
      console.error('Falha ao salvar fornecedor remoto:', err);
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !razaoSocial || !cnpj) return;

    let updatedItem: Fornecedor | null = null;
    const updated = fornecedores.map(f => {
      if (f.id === editingSupplier.id) {
        updatedItem = {
          ...f,
          cnpj,
          razaoSocial,
          nomeFantasia: nomeFantasia || razaoSocial,
          contatoNome,
          contatoEmail,
          contatoTelefone,
          categoria,
          criticidade,
          observacoes
        };
        return updatedItem;
      }
      return f;
    });

    setFornecedores(updated);
    setEditingSupplier(null);
    resetForm();
    onAddLog('Atualização de Fornecedor', `Atualizou os dados do fornecedor ${nomeFantasia || razaoSocial}`);

    if (updatedItem) {
      try {
        await SupplierRepository.update(editingSupplier.id, updatedItem);
      } catch (err) {
        console.error('Falha ao atualizar fornecedor remoto:', err);
      }
    }
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    setSupplierToDelete({ id, name });
  };

  const confirmDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    const { id, name } = supplierToDelete;
    setFornecedores(fornecedores.filter(f => f.id !== id));
    if (selectedSupplier?.id === id) {
      setSelectedSupplier(null);
    }
    onAddLog('Exclusão de Fornecedor', `Removeu o fornecedor ${name}`);
    setSupplierToDelete(null);

    try {
      await SupplierRepository.delete(id);
    } catch (err) {
      console.error('Falha ao deletar fornecedor remoto:', err);
    }
  };

  const handlePerformEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEvaluating) return;

    const parsedQualidade = Number(criterioQualidade);
    const parsedPrazo = Number(criterioPrazo);
    const parsedAtendimento = Number(criterioAtendimento);
    const finalGrade = Math.round((parsedQualidade + parsedPrazo + parsedAtendimento) / 3);

    // Critério padrão ISO 9001 Vickytex:
    // >= 85: Aprovado (Qualificado)
    // >= 70 e < 85: Aprovado com Restrições (Qualificado com Restrições)
    // < 70: Reprovado (Não Qualificado)
    let result: 'Aprovado' | 'Aprovado com Restrições' | 'Reprovado' = 'Aprovado';
    let status: Fornecedor['statusQualificacao'] = 'Qualificado';

    if (finalGrade < 70) {
      result = 'Reprovado';
      status = 'Não Qualificado';
    } else if (finalGrade < 85) {
      result = 'Aprovado com Restrições';
      status = 'Qualificado com Restrições';
    }

    const newEval: AvaliacaoFornecedor = {
      id: `eval-${Date.now()}`,
      dataAvaliacao: new Date().toISOString().split('T')[0],
      avaliador: evaluator || 'Qualidade (Vickytex)',
      criterioQualidade: parsedQualidade,
      criterioPrazo: parsedPrazo,
      criterioAtendimento: parsedAtendimento,
      notaGeral: finalGrade,
      resultado: result,
      parecerTecnico: parecerTecnico
    };

    let updatedItem: Fornecedor | null = null;
    const updated = fornecedores.map(f => {
      if (f.id === isEvaluating.id) {
        const newHistory = [newEval, ...f.historicoAvaliacoes];
        // Calcular média geral
        const avgScore = Math.round(newHistory.reduce((sum, ev) => sum + ev.notaGeral, 0) / newHistory.length);
        updatedItem = {
          ...f,
          statusQualificacao: status,
          dataQualificacao: newEval.dataAvaliacao,
          notaAvaliacao: avgScore,
          historicoAvaliacoes: newHistory
        };
        return updatedItem;
      }
      return f;
    });

    setFornecedores(updated);
    
    // Se o fornecedor estiver em visualização detalhada, atualizar o estado selecionado
    const updatedSelected = updated.find(f => f.id === isEvaluating.id);
    if (updatedSelected) {
      setSelectedSupplier(updatedSelected);
    }

    setIsEvaluating(null);
    resetEvalForm();
    onAddLog('Avaliação de Fornecedor', `Realizou avaliação ISO 8.4 para ${isEvaluating.nomeFantasia}. Nota: ${finalGrade}% - Status: ${status}`);

    if (updatedItem) {
      try {
        await SupplierRepository.update(isEvaluating.id, updatedItem);
      } catch (err) {
        console.error('Falha ao atualizar avaliação remota:', err);
      }
    }
  };

  // Filtragem dos fornecedores
  const filteredFornecedores = fornecedores.filter(f => {
    const matchesSearch = 
      f.nomeFantasia.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.razaoSocial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cnpj.includes(searchQuery) ||
      f.contatoNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.categoria.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoria === 'todos' || f.categoria === selectedCategoria;
    const matchesCriticidade = selectedCriticidade === 'todos' || f.criticidade === selectedCriticidade;
    const matchesStatus = selectedStatus === 'todos' || f.statusQualificacao === selectedStatus;

    return matchesSearch && matchesCategory && matchesCriticidade && matchesStatus;
  });

  // Estatísticas
  const totalFornecedores = fornecedores.length;
  const qualificadosCount = fornecedores.filter(f => f.statusQualificacao === 'Qualificado').length;
  const qualificacaoRestricaoCount = fornecedores.filter(f => f.statusQualificacao === 'Qualificado com Restrições').length;
  const emAvaliacaoCount = fornecedores.filter(f => f.statusQualificacao === 'Em Avaliação').length;
  const naoQualificadosCount = fornecedores.filter(f => f.statusQualificacao === 'Não Qualificado').length;
  const criticidadeAltaCount = fornecedores.filter(f => f.criticidade === 'Alta').length;

  const getStatusBadge = (status: Fornecedor['statusQualificacao']) => {
    switch (status) {
      case 'Qualificado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Qualificado
          </span>
        );
      case 'Qualificado com Restrições':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Com Restrições
          </span>
        );
      case 'Em Avaliação':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Em Avaliação
          </span>
        );
      case 'Não Qualificado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Não Qualificado
          </span>
        );
    }
  };

  const getCriticidadeBadge = (crit: Fornecedor['criticidade']) => {
    switch (crit) {
      case 'Alta':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Alta</span>;
      case 'Média':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Média</span>;
      case 'Baixa':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Baixa</span>;
    }
  };

  return (
    <div id="fornecedores-module" className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-sans tracking-tight">
              {personalizacao?.fornecedoresTitulo || 'Avaliação de Fornecedores'}
            </h1>
            <p className="text-xs text-gray-500">
              {personalizacao?.fornecedoresSubtitulo || 'Qualificação, monitoramento de desempenho e conformidade de serviços e materiais externos (ISO 9001:2015 8.4)'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddingSupplier(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Fornecedor
        </button>
      </div>

      {/* Indicadores Estatísticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total de Fornecedores</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalFornecedores}</h3>
            <p className="text-[10px] text-gray-500">{criticidadeAltaCount} de alta criticidade</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Homologados / Qualificados</p>
            <h3 className="text-2xl font-bold text-emerald-600">{qualificadosCount + qualificacaoRestricaoCount}</h3>
            <p className="text-[10px] text-gray-500">{qualificacaoRestricaoCount} com restrições técnicas</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Em Avaliação Inicial</p>
            <h3 className="text-2xl font-bold text-blue-600">{emAvaliacaoCount}</h3>
            <p className="text-[10px] text-gray-500">Amostragem ou documentação</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bloqueados / Reprovados</p>
            <h3 className="text-2xl font-bold text-rose-600">{naoQualificadosCount}</h3>
            <p className="text-[10px] text-gray-500">Requer substituição ou auditoria</p>
          </div>
        </div>

      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar fornecedores por Razão Social, Nome Fantasia, CNPJ, Contato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg px-2 py-1">
              <span className="text-[11px] text-gray-400">Categoria:</span>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 border-none outline-none focus:ring-0"
              >
                <option value="todos">Todas</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg px-2 py-1">
              <span className="text-[11px] text-gray-400">Criticidade:</span>
              <select
                value={selectedCriticidade}
                onChange={(e) => setSelectedCriticidade(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 border-none outline-none focus:ring-0"
              >
                <option value="todos">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg px-2 py-1">
              <span className="text-[11px] text-gray-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 border-none outline-none focus:ring-0"
              >
                <option value="todos">Todos</option>
                <option value="Qualificado">Qualificado</option>
                <option value="Qualificado com Restrições">Com Restrições</option>
                <option value="Em Avaliação">Em Avaliação</option>
                <option value="Não Qualificado">Não Qualificado</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Lista Principal de Fornecedores */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredFornecedores.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-gray-700">Nenhum fornecedor localizado</h3>
            <p className="text-xs text-gray-500 mt-1">Experimente alterar os parâmetros de pesquisa ou filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Fornecedor</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Criticidade</th>
                  <th className="py-3.5 px-4">Status Qualificação</th>
                  <th className="py-3.5 px-4 text-center">Nota Avaliação</th>
                  <th className="py-3.5 px-4">Última Avaliação</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredFornecedores.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <span 
                          onClick={() => setSelectedSupplier(f)}
                          className="font-bold text-blue-600 hover:underline cursor-pointer block text-sm"
                        >
                          {f.nomeFantasia}
                        </span>
                        <span className="text-xs text-gray-400 block font-mono">{f.razaoSocial} • CNPJ: {f.cnpj}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs text-gray-700 font-medium">
                        {f.categoria}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getCriticidadeBadge(f.criticidade)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(f.statusQualificacao)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {f.notaAvaliacao !== undefined ? (
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                            f.notaAvaliacao >= 85 ? 'bg-emerald-50 text-emerald-700' : 
                            f.notaAvaliacao >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {f.notaAvaliacao}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sem notas</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {f.dataQualificacao ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{f.dataQualificacao}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Pendente</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setIsEvaluating(f)}
                          title="Avaliar Desempenho (ISO 8.4)"
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingSupplier(f)}
                          title="Editar Cadastro"
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(f.id, f.nomeFantasia)}
                          title="Remover Fornecedor"
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL DE DETALHES DO FORNECEDOR --- */}
      <AnimatePresence>
        {selectedSupplier && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-gray-100 overflow-hidden my-8"
            >
              {/* Header do Modal */}
              <div className="bg-slate-900 text-white p-6 relative">
                <button 
                  onClick={() => setSelectedSupplier(null)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <Truck className="w-7 h-7 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <h2 className="text-lg font-bold">{selectedSupplier.nomeFantasia}</h2>
                      {getCriticidadeBadge(selectedSupplier.criticidade)}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{selectedSupplier.razaoSocial}</p>
                    <p className="text-xs text-slate-400">CNPJ: {selectedSupplier.cnpj}</p>
                  </div>
                </div>
              </div>

              {/* Corpo do Modal */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Status e Qualificação Geral */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Status de Homologação</span>
                    <div className="mt-1">{getStatusBadge(selectedSupplier.statusQualificacao)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Categoria</span>
                    <span className="text-sm font-semibold text-gray-800 block mt-1">{selectedSupplier.categoria}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Score Geral Vickytex</span>
                    {selectedSupplier.notaAvaliacao !== undefined ? (
                      <span className="text-base font-extrabold font-mono text-blue-600 block mt-0.5">
                        {selectedSupplier.notaAvaliacao}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 block italic mt-1.5">Sem pontuação histórica</span>
                    )}
                  </div>
                </div>

                {/* Contato do Fornecedor */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Informações de Contato
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 border border-gray-100 rounded-lg">
                    <div className="space-y-0.5">
                      <span className="text-xs text-gray-400 block">Responsável</span>
                      <span className="text-sm font-medium text-gray-800">{selectedSupplier.contatoNome || 'Não informado'}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-gray-400 block flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" /> Email
                      </span>
                      <span className="text-sm font-medium text-blue-600 hover:underline">
                        {selectedSupplier.contatoEmail ? (
                          <a href={`mailto:${selectedSupplier.contatoEmail}`}>{selectedSupplier.contatoEmail}</a>
                        ) : (
                          <span className="text-gray-400 italic">Não informado</span>
                        )}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-gray-400 block flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" /> Telefone
                      </span>
                      <span className="text-sm font-medium text-gray-800">{selectedSupplier.contatoTelefone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {selectedSupplier.observacoes && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Instruções Técnicas & Observações
                    </h4>
                    <p className="text-xs text-gray-600 bg-slate-50 p-3.5 rounded-lg border border-gray-100 leading-relaxed font-mono">
                      {selectedSupplier.observacoes}
                    </p>
                  </div>
                )}

                {/* Histórico de Avaliações */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Histórico de Avaliações Técnicas (ISO 8.4)
                    </h4>
                    <button
                      onClick={() => setIsEvaluating(selectedSupplier)}
                      className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1" />
                      Nova Avaliação
                    </button>
                  </div>

                  {selectedSupplier.historicoAvaliacoes.length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                      Nenhuma avaliação registrada ainda. Realize a primeira avaliação para habilitar o status de homologação.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedSupplier.historicoAvaliacoes.map(ev => (
                        <div key={ev.id} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-white hover:border-gray-200 transition-colors">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <span className="text-xs font-bold text-gray-700 block">Realizado por: {ev.avaliador}</span>
                              <span className="text-[10px] text-gray-400 block font-mono">Em {ev.dataAvaliacao}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                                ev.resultado === 'Aprovado' ? 'bg-emerald-50 text-emerald-700' :
                                ev.resultado === 'Aprovado com Restrições' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {ev.resultado}
                              </span>
                              <span className="text-sm font-extrabold font-mono text-slate-800">
                                Score: {ev.notaGeral}%
                              </span>
                            </div>
                          </div>

                          {/* Detalhamento de notas por critérios */}
                          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-2.5 rounded text-xs font-mono">
                            <div>
                              <span className="text-[10px] text-gray-400 block uppercase">Qualidade Matéria-Prima</span>
                              <span className="font-bold text-gray-700">{ev.criterioQualidade}/100</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block uppercase">Pontualidade Prazo</span>
                              <span className="font-bold text-gray-700">{ev.criterioPrazo}/100</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block uppercase">Atendimento Comercial</span>
                              <span className="font-bold text-gray-700">{ev.criterioAtendimento}/100</span>
                            </div>
                          </div>

                          {ev.parecerTecnico && (
                            <p className="text-xs text-gray-600 italic bg-gray-50/50 p-2 rounded border-l-2 border-slate-300">
                              <strong>Parecer Técnico:</strong> {ev.parecerTecnico}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Rodapé do Modal */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FORMULÁRIO DE CADASTRO DE FORNECEDOR --- */}
      <AnimatePresence>
        {isAddingSupplier && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden"
            >
              <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Cadastrar Novo Fornecedor (ISO 8.4)
                </h3>
                <button onClick={() => setIsAddingSupplier(false)} className="text-white hover:text-blue-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Razão Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Fiação e Tecelagem Vickytex S.A."
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Nome Fantasia</label>
                    <input
                      type="text"
                      placeholder="Ex: Fiação Vickytex"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">CNPJ *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 00.000.000/0001-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-600 block">Categoria Têxtil/Serviço</label>
                      <button
                        type="button"
                        onClick={() => setShowInlineAddCategory(!showInlineAddCategory)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {showInlineAddCategory ? 'Cancelar' : '+ Nova Categoria'}
                      </button>
                    </div>

                    {showInlineAddCategory ? (
                      <div className="flex gap-1.5 mt-1">
                        <input
                          type="text"
                          placeholder="Ex: Aviamentos, Serviços de Lavanderia"
                          value={newCategoryText}
                          onChange={(e) => setNewCategoryText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveInlineCategory();
                            }
                          }}
                          className="flex-1 border border-blue-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/30"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveInlineCategory}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shrink-0"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value as any)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        {categorias.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Contato (Nome)</label>
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={contatoNome}
                      onChange={(e) => setContatoNome(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Contato (Email)</label>
                    <input
                      type="email"
                      placeholder="Ex: comercial@fornecedor.com"
                      value={contatoEmail}
                      onChange={(e) => setContatoEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Contato (Telefone)</label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 98765-4321"
                      value={contatoTelefone}
                      onChange={(e) => setContatoTelefone(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Criticidade do Fornecimento</label>
                    <select
                      value={criticidade}
                      onChange={(e) => setCriticidade(e.target.value as Fornecedor['criticidade'])}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="Alta">Alta (Impacta diretamente no produto final)</option>
                      <option value="Média">Média (Impacto operacional moderado)</option>
                      <option value="Baixa">Baixa (Pouco impacto no produto final)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 block flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 mr-1" /> Status Inicial
                    </label>
                    <div className="py-2 px-3 bg-slate-50 rounded-lg text-xs font-semibold text-slate-500 border border-slate-100 font-mono">
                      EM AVALIAÇÃO INICIAL
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">Critérios Especiais ou Instruções de Recebimento</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Exigir laudo de pureza química do lote de tintura no momento da entrega do material..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-2 -mx-6 -mb-6 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddingSupplier(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Salvar Cadastro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FORMULÁRIO DE EDIÇÃO DE FORNECEDOR --- */}
      <AnimatePresence>
        {editingSupplier && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden"
            >
              <div className="bg-slate-850 text-white p-5 flex items-center justify-between" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="font-bold text-base flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-blue-400" />
                  Editar Cadastro do Fornecedor
                </h3>
                <button onClick={() => setEditingSupplier(null)} className="text-white hover:text-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateSupplier} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Razão Social *</label>
                    <input
                      type="text"
                      required
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Nome Fantasia</label>
                    <input
                      type="text"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-600 block">Categoria Têxtil/Serviço</label>
                      <button
                        type="button"
                        onClick={() => setShowInlineAddCategory(!showInlineAddCategory)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {showInlineAddCategory ? 'Cancelar' : '+ Nova Categoria'}
                      </button>
                    </div>

                    {showInlineAddCategory ? (
                      <div className="flex gap-1.5 mt-1">
                        <input
                          type="text"
                          placeholder="Ex: Aviamentos, Serviços de Lavanderia"
                          value={newCategoryText}
                          onChange={(e) => setNewCategoryText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveInlineCategory();
                            }
                          }}
                          className="flex-1 border border-blue-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/30"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveInlineCategory}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shrink-0"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value as any)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        {categorias.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Contato (Nome)</label>
                    <input
                      type="text"
                      value={contatoNome}
                      onChange={(e) => setContatoNome(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Contato (Email)</label>
                    <input
                      type="email"
                      value={contatoEmail}
                      onChange={(e) => setContatoEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Contato (Telefone)</label>
                    <input
                      type="text"
                      value={contatoTelefone}
                      onChange={(e) => setContatoTelefone(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">Criticidade do Fornecimento</label>
                  <select
                    value={criticidade}
                    onChange={(e) => setCriticidade(e.target.value as Fornecedor['criticidade'])}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Alta">Alta (Impacta diretamente no produto final)</option>
                    <option value="Média">Média (Impacto operacional moderado)</option>
                    <option value="Baixa">Baixa (Pouco impacto no produto final)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">Critérios Especiais ou Instruções de Recebimento</label>
                  <textarea
                    rows={3}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-2 -mx-6 -mb-6 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingSupplier(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FORMULÁRIO DE REALIZAÇÃO DE AVALIAÇÃO TÉCNICA (ISO 8.4) --- */}
      <AnimatePresence>
        {isEvaluating && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden"
            >
              <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-400" />
                  Nova Avaliação Técnica: {isEvaluating.nomeFantasia}
                </h3>
                <button onClick={() => {
                  setIsEvaluating(null);
                  resetEvalForm();
                }} className="text-white hover:text-blue-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePerformEvaluation} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">Nome do Avaliador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos (Qualidade / Vickytex)"
                    value={evaluator}
                    onChange={(e) => setEvaluator(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Critérios com sliders/inputs */}
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Critérios de Avaliação (0 a 100%)</h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-600">Qualidade da Matéria-Prima / Serviço:</span>
                      <span className="text-blue-600 font-bold font-mono">{criterioQualidade}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criterioQualidade}
                      onChange={(e) => setCriterioQualidade(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-600">Pontualidade de Entrega / Cronograma:</span>
                      <span className="text-blue-600 font-bold font-mono">{criterioPrazo}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criterioPrazo}
                      onChange={(e) => setCriterioPrazo(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-600">Suporte, Atendimento e Laudos Técnicos:</span>
                      <span className="text-blue-600 font-bold font-mono">{criterioAtendimento}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criterioAtendimento}
                      onChange={(e) => setCriterioAtendimento(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Score Previsto e Indicação */}
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Média Geral Projetada:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold text-blue-700 font-mono">
                      {Math.round((Number(criterioQualidade) + Number(criterioPrazo) + Number(criterioAtendimento)) / 3)}%
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      Math.round((Number(criterioQualidade) + Number(criterioPrazo) + Number(criterioAtendimento)) / 3) >= 85 ? 'bg-emerald-100 text-emerald-800' :
                      Math.round((Number(criterioQualidade) + Number(criterioPrazo) + Number(criterioAtendimento)) / 3) >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round((Number(criterioQualidade) + Number(criterioPrazo) + Number(criterioAtendimento)) / 3) >= 85 ? 'Aprovado' :
                       Math.round((Number(criterioQualidade) + Number(criterioPrazo) + Number(criterioAtendimento)) / 3) >= 70 ? 'Aprovado com Restrições' : 'Reprovado'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">Parecer Técnico / Notas da Auditoria do Lote</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Amostragem de fios apresentou boa estabilidade dimensional e sem quebras em teares de alta velocidade..."
                    value={parecerTecnico}
                    onChange={(e) => setParecerTecnico(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-2 -mx-6 -mb-6 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEvaluating(null);
                      resetEvalForm();
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Registrar Avaliação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- CONFIRMAÇÃO DE EXCLUSÃO DE FORNECEDOR --- */}
      <AnimatePresence>
        {supplierToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-full shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Confirmar Exclusão de Fornecedor
                  </h3>
                  <p className="text-[10px] text-gray-400">Qualidade Vickytex — Homologação de Fornecedores</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Deseja realmente remover permanentemente o registro do fornecedor:
                  <strong className="text-gray-900 font-extrabold block mt-1 text-sm bg-slate-50 px-3 py-2 rounded-lg border border-gray-200 font-mono">
                    {supplierToDelete.name}
                  </strong>
                </p>
                <p className="text-[10px] text-rose-600 font-semibold bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                  Atenção: Essa operação é permanente e removerá todo o histórico de avaliações vinculadas a este fornecedor.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSupplierToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteSupplier}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Sim, Remover Fornecedor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cartão de Ajuda ao Auditor sobre Cláusula ISO */}
      <div id="fornecedores-help-box" className="p-5 rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/15 flex items-start space-x-3.5 mt-6">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
            {personalizacao?.fornecedoresAjudaTitulo || 'Controle de Processos, Produtos e Serviços Providos Externamente (ISO 8.4)'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {personalizacao?.fornecedoresAjudaSubtitulo || 'A organização deve assegurar que processos, produtos e serviços providos externamente estejam em conformidade com os requisitos. Isso inclui a definição e aplicação de critérios para a avaliação, seleção, monitoramento de desempenho e reavaliação de fornecedores externos.'}
          </p>
        </div>
      </div>

    </div>
  );
};
