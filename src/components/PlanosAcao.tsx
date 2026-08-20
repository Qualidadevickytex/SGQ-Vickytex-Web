/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Pencil, 
  Calendar, 
  Search, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  Printer, 
  X, 
  TrendingUp, 
  Filter, 
  Info,
  MapPin,
  User,
  Activity,
  ArrowRight,
  Award
} from 'lucide-react';
import { Documento, Auditoria, NaoConformidade, SectorType, PlanoAcao } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSectors } from '../hooks/useSectors';
import { SECTORS, getSectors, PersonalizacaoGeral } from '../utils/mockData';

interface PlanosAcaoProps {
  planos: PlanoAcao[];
  documents: Documento[];
  audits: Auditoria[];
  ncs: NaoConformidade[];
  onAddPlano: (plano: PlanoAcao) => void;
  onUpdatePlano: (plano: PlanoAcao) => void;
  onDeletePlano: (id: string) => void;
  onAddLog: (action: string, details: string, docId?: string) => void;
  personalizacao?: PersonalizacaoGeral;
}

export const PlanosAcaoComponent: React.FC<PlanosAcaoProps> = ({
  planos,
  documents,
  audits,
  ncs,
  onAddPlano,
  onUpdatePlano,
  onDeletePlano,
  onAddLog,
  personalizacao
}) => {
  const { user } = useAuth();
  const sectorsList = useSectors();

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  // Modais
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [is5W2HGuideOpen, setIs5W2HGuideOpen] = useState(false);

  // Estados de edição / impressão
  const [editingPlano, setEditingPlano] = useState<PlanoAcao | null>(null);
  const [selectedPrintPlano, setSelectedPrintPlano] = useState<PlanoAcao | null>(null);
  const [planoToDelete, setPlanoToDelete] = useState<PlanoAcao | null>(null);

  const handlePrintPlano = () => {
    if (!selectedPrintPlano) return;
    
    // Remover qualquer container de impressão anterior para evitar duplicidade
    const existing = document.querySelector('.print-container');
    if (existing) {
      existing.remove();
    }
    
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    
    const content = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        .print-wrapper {
          font-family: 'Inter', sans-serif;
          padding: 40px;
          background-color: #fff;
          color: #0f172a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header-container {
          border: 2px solid #0f172a;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .logo-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 40px;
          height: 40px;
          background-color: #0b3a63;
          color: #ffffff;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border-radius: 4px;
        }
        .company-name {
          font-size: 14px;
          font-weight: 800;
          margin: 0;
        }
        .company-sub {
          font-size: 10px;
          color: #64748b;
          margin: 0;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }
        .header-ref {
          text-align: right;
        }
        .ref-code {
          font-size: 12px;
          font-weight: 900;
          background-color: #0f172a;
          color: #ffffff;
          padding: 4px 8px;
          display: inline-block;
          margin: 0;
        }
        .ref-sub {
          font-size: 9px;
          color: #64748b;
          margin: 4px 0 0 0;
          font-weight: bold;
        }
        .grid-container {
          display: grid;
          grid-template-cols: repeat(4, 1fr);
          border: 1px solid #94a3b8;
          margin-bottom: 24px;
          font-size: 12px;
        }
        .grid-cell {
          padding: 8px 12px;
          border-bottom: 1px solid #cbd5e1;
          border-right: 1px solid #cbd5e1;
        }
        .grid-cell:nth-child(4n) {
          border-right: none;
        }
        .grid-cell:nth-last-child(-n+4) {
          border-bottom: none;
        }
        .grid-label {
          font-weight: bold;
          background-color: #f8fafc;
          color: #334155;
        }
        .grid-val {
          color: #0f172a;
        }
        .grid-val-bold {
          font-weight: 800;
          color: #0f172a;
        }
        .grid-val-mono {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
        }
        .table-5w2h {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #94a3b8;
          margin-bottom: 32px;
          font-size: 12px;
        }
        .table-5w2h th {
          background-color: #0f172a;
          color: #ffffff;
          padding: 10px 12px;
          font-weight: bold;
          text-align: left;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.05em;
          border: 1px solid #94a3b8;
        }
        .table-5w2h td {
          padding: 12px;
          border: 1px solid #cbd5e1;
          vertical-align: top;
        }
        .question-col {
          width: 30%;
          background-color: #f8fafc;
          font-weight: bold;
          color: #1e293b;
        }
        .question-sub {
          font-size: 9px;
          color: #64748b;
          font-weight: normal;
          margin-top: 2px;
          display: block;
        }
        .value-col {
          width: 70%;
          color: #0f172a;
        }
        .val-bold {
          font-weight: 700;
        }
        .val-heavy {
          font-weight: 800;
        }
        .sign-container {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 40px;
          margin-top: 48px;
          font-size: 12px;
        }
        .sign-box {
          text-align: center;
        }
        .sign-line {
          border-top: 1px solid #64748b;
          width: 80%;
          margin: 0 auto 12px auto;
        }
        .sign-name {
          font-weight: bold;
          color: #0f172a;
          margin: 0;
        }
        .sign-role {
          font-size: 10px;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .footer-info {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          font-size: 10px;
          color: #64748b;
          text-align: center;
          line-height: 1.5;
          margin-top: 40px;
        }
      </style>
      <div class="print-wrapper">
        <div class="header-container">
          <div class="logo-title">
            <div class="logo">VT</div>
            <div>
              <h1 class="company-name">VICKYTEX S.A.</h1>
              <p class="company-sub">SISTEMA DE GESTÃO DA QUALIDADE (SGQ)</p>
            </div>
          </div>
          <div class="header-ref">
            <h2 class="ref-code">FORMULÁRIO 5W2H</h2>
            <p class="ref-sub">Conformidade ISO 9001:2015</p>
          </div>
        </div>
        
        <div class="grid-container">
          <div class="grid-cell grid-label">Código do Plano:</div>
          <div class="grid-cell grid-val-mono">${selectedPrintPlano.codigo}</div>
          <div class="grid-cell grid-label">Data de Emissão:</div>
          <div class="grid-cell grid-val">${new Date(selectedPrintPlano.dataCriacao).toLocaleDateString('pt-BR')}</div>
          
          <div class="grid-cell grid-label">Título do Plano:</div>
          <div class="grid-cell grid-val-bold" style="grid-column: span 3;">${selectedPrintPlano.titulo}</div>
        </div>
        
        <table class="table-5w2h">
          <thead>
            <tr>
              <th>Perguntas (Questões)</th>
              <th>Planejamento e Ação Executiva</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="question-col">
                WHAT (O quê?)
                <span class="question-sub">Qual ação será executada?</span>
              </td>
              <td class="value-col val-bold">${selectedPrintPlano.oQue}</td>
            </tr>
            <tr>
              <td class="question-col">
                WHY (Por quê?)
                <span class="question-sub">Qual a justificativa / motivo?</span>
              </td>
              <td class="value-col">${selectedPrintPlano.porQue || '-'}</td>
            </tr>
            <tr>
              <td class="question-col">
                WHERE (Onde?)
                <span class="question-sub">Onde será aplicada?</span>
              </td>
              <td class="value-col">${selectedPrintPlano.onde || '-'}</td>
            </tr>
            <tr>
              <td class="question-col">
                WHEN (Quando?)
                <span class="question-sub">Qual o prazo limite?</span>
              </td>
              <td class="value-col val-bold">${new Date(selectedPrintPlano.quando).toLocaleDateString('pt-BR')}</td>
            </tr>
            <tr>
              <td class="question-col">
                WHO (Quem?)
                <span class="question-sub">Quem é o executor?</span>
              </td>
              <td class="value-col val-bold">${selectedPrintPlano.quem}</td>
            </tr>
            <tr>
              <td class="question-col">
                HOW (Como?)
                <span class="question-sub">Qual método de execução?</span>
              </td>
              <td class="value-col">${selectedPrintPlano.como || '-'}</td>
            </tr>
            <tr>
              <td class="question-col">
                HOW MUCH (Quanto?)
                <span class="question-sub">Custos estimados?</span>
              </td>
              <td class="value-col val-heavy">R$ ${selectedPrintPlano.quantoCusta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="sign-container">
          <div class="sign-box">
            <div class="sign-line"></div>
            <p class="sign-name">${selectedPrintPlano.quem}</p>
            <p class="sign-role">Responsável pela Ação</p>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <p class="sign-name">${user?.name ? `${user.name} (Qualidade)` : 'Gestão da Qualidade Vickytex'}</p>
            <p class="sign-role">Gestão da Qualidade Vickytex</p>
          </div>
        </div>
        
        <div class="footer-info">
          Este documento é uma evidência oficial do SGQ Vickytex. Conforme as diretrizes do requisito de planejamento de mudanças e ações para abordar riscos e oportunidades da norma ISO 9001:2015.
        </div>
      </div>
    `;
    
    printContainer.innerHTML = content;
    document.body.appendChild(printContainer);
    
    // Evento afterprint para garantir remoção segura do container apenas depois que a impressão é iniciada/fechada
    const handleAfterPrint = () => {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Fallback de segurança caso afterprint não dispare
    setTimeout(handleAfterPrint, 15000);
    
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('Error triggering print:', err);
        handleAfterPrint();
      }
    }, 300);
  };

  // Formulário
  const [formPlano, setFormPlano] = useState({
    codigo: '',
    titulo: '',
    setor: 'Corte' as SectorType,
    status: 'Planejado' as 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada',
    oQue: '',
    porQue: '',
    onde: '',
    quando: '',
    quem: '',
    como: '',
    quantoCusta: 0,
    documentoId: '',
    auditoriaId: '',
    naoConformidadeId: ''
  });

  // Limpar formulário para novo plano
  const handleOpenNewPlano = () => {
    const nextNum = planos.length + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    const autoCodigo = `PA-2026-${formattedNum}`;

    setEditingPlano(null);
    setFormPlano({
      codigo: autoCodigo,
      titulo: '',
      setor: user?.sector || 'Corte',
      status: 'Planejado',
      oQue: '',
      porQue: '',
      onde: '',
      quando: new Date().toISOString().split('T')[0],
      quem: user?.name || '',
      como: '',
      quantoCusta: 0,
      documentoId: '',
      auditoriaId: '',
      naoConformidadeId: ''
    });
    setIsPlanoModalOpen(true);
  };

  // Abrir modal com dados de edição
  const handleOpenEditPlano = (plano: PlanoAcao) => {
    setEditingPlano(plano);
    setFormPlano({
      codigo: plano.codigo,
      titulo: plano.titulo,
      setor: plano.setor,
      status: plano.status,
      oQue: plano.oQue,
      porQue: plano.porQue,
      onde: plano.onde,
      quando: plano.quando,
      quem: plano.quem,
      como: plano.como,
      quantoCusta: plano.quantoCusta,
      documentoId: plano.documentoId || '',
      auditoriaId: plano.auditoriaId || '',
      naoConformidadeId: plano.naoConformidadeId || ''
    });
    setIsPlanoModalOpen(true);
  };

  // Salvar novo ou editado
  const handleSubmitPlano = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlano.codigo || !formPlano.titulo || !formPlano.oQue || !formPlano.quem || !formPlano.quando) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (editingPlano) {
      const updated: PlanoAcao = {
        ...editingPlano,
        codigo: formPlano.codigo.toUpperCase().trim(),
        titulo: formPlano.titulo.trim(),
        setor: formPlano.setor,
        status: formPlano.status,
        oQue: formPlano.oQue.trim(),
        porQue: formPlano.porQue.trim(),
        onde: formPlano.onde.trim(),
        quando: formPlano.quando,
        quem: formPlano.quem.trim(),
        como: formPlano.como.trim(),
        quantoCusta: Number(formPlano.quantoCusta),
        documentoId: formPlano.documentoId || undefined,
        auditoriaId: formPlano.auditoriaId || undefined,
        naoConformidadeId: formPlano.naoConformidadeId || undefined
      };
      onUpdatePlano(updated);
      onAddLog('Editou Plano de Ação', `O Plano de Ação 5W2H ${updated.codigo} foi atualizado com sucesso.`, updated.documentoId);
    } else {
      const novo: PlanoAcao = {
        id: `pa_${Date.now()}`,
        codigo: formPlano.codigo.toUpperCase().trim(),
        titulo: formPlano.titulo.trim(),
        setor: formPlano.setor,
        status: formPlano.status,
        dataCriacao: new Date().toISOString().split('T')[0],
        oQue: formPlano.oQue.trim(),
        porQue: formPlano.porQue.trim(),
        onde: formPlano.onde.trim(),
        quando: formPlano.quando,
        quem: formPlano.quem.trim(),
        como: formPlano.como.trim(),
        quantoCusta: Number(formPlano.quantoCusta),
        documentoId: formPlano.documentoId || undefined,
        auditoriaId: formPlano.auditoriaId || undefined,
        naoConformidadeId: formPlano.naoConformidadeId || undefined
      };
      onAddPlano(novo);
      onAddLog('Criou Plano de Ação', `Novo Plano de Ação 5W2H ${novo.codigo} registrado no SGQ.`, novo.documentoId);
    }

    setIsPlanoModalOpen(false);
    setEditingPlano(null);
  };

  // Excluir plano de ação
  const handleDeletePlanoClick = (plano: PlanoAcao) => {
    setPlanoToDelete(plano);
  };

  // Filtros aplicados
  const filteredPlanos = planos.filter(plano => {
    const matchesSearch = 
      plano.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.oQue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.quem.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === 'Todos' || plano.setor === selectedSector;
    const matchesStatus = selectedStatus === 'Todos' || plano.status === selectedStatus;

    return matchesSearch && matchesSector && matchesStatus;
  });

  // Métricas
  const totalInvestido = filteredPlanos.reduce((acc, p) => acc + p.quantoCusta, 0);
  const planejados = filteredPlanos.filter(p => p.status === 'Planejado').length;
  const emAndamento = filteredPlanos.filter(p => p.status === 'Em Andamento').length;
  const concluidos = filteredPlanos.filter(p => p.status === 'Concluído').length;

  // Renderizar badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Planejado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">Planejado</span>;
      case 'Em Andamento':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">Em Andamento</span>;
      case 'Concluído':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">Concluído</span>;
      case 'Cancelada':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900">Cancelado</span>;
      default:
        return null;
    }
  };

  // Permissões
  const canModify = user?.role === 'Qualidade' || user?.role === 'Gestor' || user?.role === 'Administrador' || user?.role === 'Supervisor';

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {personalizacao?.planosTitulo || 'Planos de Ação 5W2H'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {personalizacao?.planosSubtitulo || 'Metodologia de planejamento para ações corretivas e preventivas.'} Em total conformidade com a cláusula 10.2 da norma {personalizacao?.normaISO || 'ISO 9001:2015'}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setIs5W2HGuideOpen(true)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-4 h-4" />
            Guia 5W2H
          </button>
          
          {canModify && (
            <button
              onClick={handleOpenNewPlano}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Novo Plano 5W2H
            </button>
          )}
        </div>
      </div>

      {/* KPI Dashboard Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total de Planos</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{filteredPlanos.length}</span>
            <span className="text-[10px] font-bold text-slate-400">ativos</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider">Planejados</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{planejados}</span>
            <span className="text-[10px] font-bold text-blue-400">aguardando</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">Em Andamento</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{emAndamento}</span>
            <span className="text-[10px] font-bold text-amber-400">em execução</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider">Concluídos</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{concluidos}</span>
            <span className="text-[10px] font-bold text-emerald-400">eficazes</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs col-span-2 md:col-span-1">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Investimento Estimado</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-slate-800 dark:text-white">R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por plano, código, descrição ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-hidden dark:text-slate-100"
          />
        </div>
        
        {/* Sector Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Setor:</span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full md:w-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-hidden font-semibold dark:text-slate-200"
          >
            <option value="Todos">Todos os Setores</option>
            {sectorsList.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-hidden font-semibold dark:text-slate-200"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Planejado">Planejado</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelada">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Main List Grid */}
      {filteredPlanos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Nenhum plano de ação encontrado</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Não encontramos planos de ação correspondentes aos seus termos de busca ou filtros selecionados.
          </p>
          {canModify && (
            <button
              onClick={handleOpenNewPlano}
              className="mt-4 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs hover:bg-blue-700 transition-colors"
            >
              Criar Primeiro Plano
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPlanos.map((plano) => {
            const relDoc = documents.find(d => d.id === plano.documentoId);
            const relAudit = audits.find(a => a.id === plano.auditoriaId);
            const relNC = ncs.find(n => n.id === plano.naoConformidadeId);

            return (
              <div 
                key={plano.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
              >
                {/* Header card info */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[10px] font-mono font-bold bg-[#0B3A63] text-white px-2.5 py-1 rounded-md tracking-wider">
                      {plano.codigo}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                      {plano.titulo}
                    </h4>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">
                      {plano.setor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {getStatusBadge(plano.status)}
                    
                    {/* Imprimir button */}
                    <button
                      onClick={() => {
                        setSelectedPrintPlano(plano);
                        setIsPrintModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      title="Imprimir Modelo 5W2H"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Editar button */}
                    {canModify && (
                      <button
                        onClick={() => handleOpenEditPlano(plano)}
                        className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors"
                        title="Editar Plano de Ação"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* Excluir button */}
                    {canModify && (
                      <button
                        onClick={() => handleDeletePlanoClick(plano)}
                        className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500 transition-colors"
                        title="Excluir Plano de Ação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 5W2H Matrix Body */}
                <div className="p-6">
                  <p className="text-[9px] font-mono font-extrabold text-[#0B3A63] dark:text-blue-400 uppercase tracking-widest mb-3 border-b border-slate-150 dark:border-slate-800 pb-1">ESTRUTURA DETALHADA 5W2H</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    
                    {/* WHAT */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">WHAT</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(O quê?)</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {plano.oQue}
                      </p>
                    </div>

                    {/* WHY */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">WHY</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(Por quê?)</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {plano.porQue || <em className="text-slate-400 font-normal">Não informado</em>}
                      </p>
                    </div>

                    {/* WHERE */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">WHERE</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(Onde?)</span>
                      </div>
                      <div className="flex items-center text-[11px] font-medium text-slate-700 dark:text-slate-300 gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{plano.onde || 'Qualquer'}</span>
                      </div>
                    </div>

                    {/* WHEN */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">WHEN</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(Quando/Prazo?)</span>
                      </div>
                      <div className="flex items-center text-[11px] font-medium text-slate-700 dark:text-slate-300 gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-100">{new Date(plano.quando).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* WHO */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-black text-[#0B3A63] dark:text-blue-400">WHO</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(Quem/Responsável?)</span>
                      </div>
                      <div className="flex items-center text-[11px] font-medium text-slate-700 dark:text-slate-300 gap-1 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-100">{plano.quem}</span>
                      </div>
                    </div>

                    {/* HOW */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-black text-[#0B3A63] dark:text-blue-400">HOW</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(Como?)</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {plano.como || <em className="text-slate-400 font-normal">Não informado</em>}
                      </p>
                    </div>

                    {/* HOW MUCH */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-black text-[#0B3A63] dark:text-blue-400">HOW MUCH</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(Quanto custa?)</span>
                      </div>
                      <div className="flex items-center text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 gap-1 mt-1">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>R$ {plano.quantoCusta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* DATA CRIAÇÃO */}
                    <div className="p-3 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">DATA REGISTRO</span>
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {new Date(plano.dataCriacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Integrations Badges Footer */}
                  {(plano.documentoId || plano.auditoriaId || plano.naoConformidadeId) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">Rastreabilidade SGQ:</span>
                      
                      {/* Document integration */}
                      {plano.documentoId && (
                        <div className="flex items-center bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 px-2 py-1 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>Doc: {relDoc ? `${relDoc.codigo} - ${relDoc.titulo.substring(0, 20)}...` : plano.documentoId}</span>
                        </div>
                      )}

                      {/* Audit integration */}
                      {plano.auditoriaId && (
                        <div className="flex items-center bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 px-2 py-1 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 space-x-1">
                          <CheckSquare className="w-3 h-3" />
                          <span>Auditoria: {relAudit ? `${relAudit.codigo} - ${relAudit.titulo.substring(0, 20)}...` : plano.auditoriaId}</span>
                        </div>
                      )}

                      {/* Non-conformity integration */}
                      {plano.naoConformidadeId && (
                        <div className="flex items-center bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 px-2 py-1 rounded text-[10px] font-bold text-rose-600 dark:text-rose-400 space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>RNC: {relNC ? `${relNC.codigo} - ${relNC.titulo.substring(0, 20)}...` : plano.naoConformidadeId}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cartão de Ajuda ao Auditor sobre Cláusula ISO */}
      <div id="planos-help-box" className="p-5 rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/15 flex items-start space-x-3.5">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
            {personalizacao?.planosAjudaTitulo || 'Planejamento de Ações Corretivas e Preventivas (ISO 10.2)'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {personalizacao?.planosAjudaSubtitulo || 'A metodologia 5W2H (O que, Por que, Onde, Quem, Quando, Como, Quanto) garante que cada plano de ação de tratativa seja detalhado de forma inequívoca e auditable, demonstrando o controle rigoroso de prazos e responsabilidades exigidos pelos auditores externos do SGQ.'}
          </p>
        </div>
      </div>

      {/* MODAL: NOVO OU EDITAR PLANO DE AÇÃO */}
      {isPlanoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <ClipboardList className="w-4.5 h-4.5" />
                {editingPlano ? `Editar Plano de Ação: ${editingPlano.codigo}` : 'Novo Plano de Ação 5W2H (ISO 9001)'}
              </h3>
              <button 
                onClick={() => setIsPlanoModalOpen(false)} 
                className="text-white/60 hover:text-white font-mono text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitPlano} className="p-6 space-y-4">
              
              {/* Row 1: Code, Title, Sector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Código do Plano *</label>
                  <input
                    type="text"
                    required
                    value={formPlano.codigo}
                    onChange={(e) => setFormPlano({ ...formPlano, codigo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="PA-2026-001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título do Plano *</label>
                  <input
                    type="text"
                    required
                    value={formPlano.titulo}
                    onChange={(e) => setFormPlano({ ...formPlano, titulo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Ex: Treinamento prático de calibração"
                  />
                </div>
              </div>

              {/* Row 2: Sector and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Setor do Processo *</label>
                  <select
                    value={formPlano.setor}
                    onChange={(e) => setFormPlano({ ...formPlano, setor: e.target.value as SectorType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  >
                    {sectorsList.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status de Implementação</label>
                  <select
                    value={formPlano.status}
                    onChange={(e) => setFormPlano({ ...formPlano, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  >
                    <option value="Planejado">Planejado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelada">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* 5W2H Section Divider */}
              <div className="border-t border-slate-150 dark:border-slate-800 pt-3">
                <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 tracking-widest uppercase">Campos Metodologia 5W2H</span>
              </div>

              {/* WHAT & WHY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHAT - O que fazer? *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formPlano.oQue}
                    onChange={(e) => setFormPlano({ ...formPlano, oQue: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Descrição da ação corretiva, preventiva ou melhoria..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHY - Por que fazer?
                  </label>
                  <textarea
                    rows={2}
                    value={formPlano.porQue}
                    onChange={(e) => setFormPlano({ ...formPlano, porQue: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Justificativa ou problema que será resolvido..."
                  />
                </div>
              </div>

              {/* WHERE, WHEN, WHO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHERE - Onde?
                  </label>
                  <input
                    type="text"
                    value={formPlano.onde}
                    onChange={(e) => setFormPlano({ ...formPlano, onde: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Ex: Máquina 03, Estoque"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHEN - Quando (Prazo)? *
                  </label>
                  <input
                    type="date"
                    required
                    value={formPlano.quando}
                    onChange={(e) => setFormPlano({ ...formPlano, quando: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHO - Quem fará? *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPlano.quem}
                    onChange={(e) => setFormPlano({ ...formPlano, quem: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Responsável pela execução"
                  />
                </div>
              </div>

              {/* HOW & HOW MUCH */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    HOW - Como fará? (Método)
                  </label>
                  <input
                    type="text"
                    value={formPlano.como}
                    onChange={(e) => setFormPlano({ ...formPlano, como: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Passo a passo, ferramentas ou métodos utilizados..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    HOW MUCH - Quanto custa? (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPlano.quantoCusta}
                    onChange={(e) => setFormPlano({ ...formPlano, quantoCusta: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Integrations Section Divider */}
              <div className="border-t border-slate-150 dark:border-slate-800 pt-3">
                <span className="text-[10px] font-mono font-black text-[#0B3A63] dark:text-blue-400 tracking-widest uppercase">Integrações de Rastreabilidade</span>
              </div>

              {/* Document, Audit, NC integrations select */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Documento Vinculado</label>
                  <select
                    value={formPlano.documentoId}
                    onChange={(e) => setFormPlano({ ...formPlano, documentoId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  >
                    <option value="">-- Nenhum documento --</option>
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>{d.codigo} - {d.titulo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Auditoria Vinculada</label>
                  <select
                    value={formPlano.auditoriaId}
                    onChange={(e) => setFormPlano({ ...formPlano, auditoriaId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  >
                    <option value="">-- Nenhuma auditoria --</option>
                    {audits.map(a => (
                      <option key={a.id} value={a.id}>{a.codigo} - {a.titulo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Não Conformidade (RNC) Vinculada</label>
                  <select
                    value={formPlano.naoConformidadeId}
                    onChange={(e) => setFormPlano({ ...formPlano, naoConformidadeId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  >
                    <option value="">-- Nenhuma RNC --</option>
                    {ncs.map(n => (
                      <option key={n.id} value={n.id}>{n.codigo} - {n.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlanoModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {editingPlano ? 'Salvar Alterações' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GUIA METODOLÓGICO 5W2H */}
      {is5W2HGuideOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Info className="w-4.5 h-4.5" />
                Guia Metodológico 5W2H (ISO 9001)
              </h3>
              <button 
                onClick={() => setIs5W2HGuideOpen(false)} 
                className="text-white/60 hover:text-white font-mono text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-300 overflow-y-auto max-h-[70vh]">
              <p>
                O <strong>5W2H</strong> é um checklist administrativo para garantir que as ações propostas sejam claras, executáveis e monitoráveis. Ele evita ambiguidades na liderança de projetos de qualidade e auditorias.
              </p>

              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-slate-800 dark:text-white block">WHAT (O que fazer)</strong>
                  <span>Descrição da ação prática proposta. Deve ser direta e específica.</span>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-slate-800 dark:text-white block">WHY (Por que fazer)</strong>
                  <span>Justificativa da ação. Explica a causa raiz da não-conformidade a ser mitigada.</span>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-slate-800 dark:text-white block">WHERE (Onde fazer)</strong>
                  <span>Localização física, máquina ou departamento onde a ação se aplicará.</span>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-slate-800 dark:text-white block">WHEN (Quando)</strong>
                  <span>Prazo final (Deadline) limite de entrega para a conclusão da ação corretiva.</span>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-slate-800 dark:text-white block">WHO (Quem fará)</strong>
                  <span>Colaborador ou líder responsável por executar a tarefa.</span>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-slate-800 dark:text-white block">HOW (Como fazer)</strong>
                  <span>Instrução, procedimento, ferramenta ou passos necessários para concluir a ação.</span>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-slate-800 dark:text-white block">HOW MUCH (Quanto custa)</strong>
                  <span>Custos e recursos financeiros necessários. Preencha R$ 0,00 se for sem custo direto.</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-400 mt-2">
                <strong>Relação com a Norma ISO 9001:2015 Cláusula 10.2:</strong><br/>
                Ao auditar ou detectar desvios em produtos ou processos, o SGQ exige que a organização reaja imediatamente, avalie as causas do desvio e implemente planos robustos como o 5W2H para evitar a reincidência do problema.
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIs5W2HGuideOpen(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPRESSÃO DETALHADA DO MODELO 5W2H */}
      {isPrintModalOpen && selectedPrintPlano && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Printer className="w-4.5 h-4.5" />
                Impressão de Folha de Plano 5W2H
              </h3>
              <button 
                onClick={() => setIsPrintModalOpen(false)} 
                className="text-white/60 hover:text-white font-mono text-xl"
              >
                &times;
              </button>
            </div>

            {/* Printable View Container */}
            <div id="printable-5w2h-area" className="p-8 bg-white text-slate-900 font-sans space-y-6">
              
              {/* Printable Header */}
              <div className="border-2 border-slate-900 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-[#0B3A63] flex items-center justify-center text-white font-black text-lg">
                    VT
                  </div>
                  <div>
                    <h1 className="text-base font-extrabold tracking-tight">VICKYTEX S.A.</h1>
                    <p className="text-[10px] font-bold text-slate-500 font-mono">SISTEMA DE GESTÃO DA QUALIDADE (SGQ)</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xs font-black bg-slate-900 text-white px-2 py-1 inline-block">FORMULÁRIO 5W2H</h2>
                  <p className="text-[9px] font-bold text-slate-500 mt-1">Conformidade ISO 9001:2015</p>
                </div>
              </div>

              {/* Plano de Ação Identifiers */}
              <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-400 text-xs">
                <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Código do Plano:</div>
                <div className="p-2 border-r border-b border-slate-300 font-mono font-extrabold">{selectedPrintPlano.codigo}</div>
                <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Data de Emissão:</div>
                <div className="p-2 border-b border-slate-300">{new Date(selectedPrintPlano.dataCriacao).toLocaleDateString('pt-BR')}</div>

                <div className="p-2 border-r border-slate-300 bg-slate-50 font-bold">Título do Plano:</div>
                <div className="p-2 border-r border-slate-300 font-bold col-span-3">{selectedPrintPlano.titulo}</div>
              </div>

              {/* 5W2H Matrix Grid Table */}
              <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-bold tracking-wider">
                    <th className="p-2 border border-slate-400 w-1/4">Perguntas (Questões)</th>
                    <th className="p-2 border border-slate-400 w-3/4">Planejamento e Ação Executiva</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-300 bg-slate-50 font-bold">
                      WHAT (O quê?)<br/>
                      <span className="text-[9px] font-normal text-slate-500">Qual ação será executada?</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-medium">{selectedPrintPlano.oQue}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 bg-slate-50 font-bold">
                      WHY (Por quê?)<br/>
                      <span className="text-[9px] font-normal text-slate-500">Qual a justificativa / motivo?</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-medium">{selectedPrintPlano.porQue || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 bg-slate-50 font-bold">
                      WHERE (Onde?)<br/>
                      <span className="text-[9px] font-normal text-slate-500">Onde será aplicada?</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-medium">{selectedPrintPlano.onde || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 bg-slate-50 font-bold">
                      WHEN (Quando?)<br/>
                      <span className="text-[9px] font-normal text-slate-500">Qual o prazo limite?</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-bold text-slate-800">{new Date(selectedPrintPlano.quando).toLocaleDateString('pt-BR')}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 bg-slate-50 font-bold">
                      WHO (Quem?)<br/>
                      <span className="text-[9px] font-normal text-slate-500">Quem é o executor?</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-bold">{selectedPrintPlano.quem}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 bg-slate-50 font-bold">
                      HOW (Como?)<br/>
                      <span className="text-[9px] font-normal text-slate-500">Qual método de execução?</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-medium">{selectedPrintPlano.como || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 bg-slate-50 font-bold">
                      HOW MUCH (Quanto?)<br/>
                      <span className="text-[9px] font-normal text-slate-500">Custos estimados?</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-extrabold text-slate-800">
                      R$ {selectedPrintPlano.quantoCusta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Rastreabilidade / Sign-off section */}
              <div className="grid grid-cols-2 gap-6 pt-10 text-xs">
                <div className="text-center space-y-8">
                  <div className="border-t border-slate-500 w-4/5 mx-auto"></div>
                  <div>
                    <p className="font-bold">{selectedPrintPlano.quem}</p>
                    <p className="text-[10px] text-slate-500">Responsável pela Ação</p>
                  </div>
                </div>
                <div className="text-center space-y-8">
                  <div className="border-t border-slate-500 w-4/5 mx-auto"></div>
                  <div>
                    <p className="font-bold">{user?.name ? `${user.name} (Qualidade)` : 'Gestão da Qualidade Vickytex'}</p>
                    <p className="text-[10px] text-slate-500">Gestão da Qualidade Vickytex</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Print trigger footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
              >
                Fechar
              </button>
              <button
                onClick={handlePrintPlano}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE PLANO DE AÇÃO */}
      {planoToDelete && (
        <div id="delete-plano-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-plano-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <FileText className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Confirmar Exclusão do Plano de Ação
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Planos de Ação 5W2H - SGQ</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja excluir permanentemente o seguinte plano de ação:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  {planoToDelete.codigo} - {planoToDelete.titulo}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Atenção: Esta ação é permanente e removerá o plano 5W2H do sistema de forma irreversível.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPlanoToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePlano(planoToDelete.id);
                  onAddLog('Excluiu Plano de Ação', `Removeu o Plano de Ação ${planoToDelete.codigo} do SGQ.`, planoToDelete.documentoId);
                  setPlanoToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Plano
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
