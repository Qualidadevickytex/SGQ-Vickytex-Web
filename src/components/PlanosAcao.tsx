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
  AlertTriangle,
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
  Award,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  ListPlus,
  Layers,
  PlusCircle,
  Target,
  History
} from 'lucide-react';
import { Documento, Auditoria, NaoConformidade, SectorType, PlanoAcao, ItemAcao5W2H, HistoricoPrazoAcao } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSectors } from '../hooks/useSectors';
import { SECTORS, getSectors, PersonalizacaoGeral } from '../utils/mockData';
import { useModulePermission } from '../utils/permissionManager';

export const getLocalDateISO = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }
  if (clean.includes('/')) return clean;
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

export const isDateOverdue = (deadlineStr?: string, status?: string): boolean => {
  if (!deadlineStr) return false;
  if (status === 'Concluído' || status === 'Cancelada') return false;
  const todayISO = getLocalDateISO();
  const cleanDeadline = deadlineStr.includes('T') ? deadlineStr.split('T')[0] : deadlineStr;
  return cleanDeadline < todayISO;
};

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
  const [viewMode, setViewMode] = useState<'lista' | 'cards'>('lista');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = filteredPlanos.length > 0 && filteredPlanos.every(p => expandedIds[p.id]);
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next: Record<string, boolean> = {};
      filteredPlanos.forEach(p => {
        next[p.id] = true;
      });
      setExpandedIds(next);
    }
  };

  // Modais
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [is5W2HGuideOpen, setIs5W2HGuideOpen] = useState(false);
  const [isActionItemModalOpen, setIsActionItemModalOpen] = useState(false);

  // Estados de edição / impressão
  const [editingPlano, setEditingPlano] = useState<PlanoAcao | null>(null);
  const [selectedPrintPlano, setSelectedPrintPlano] = useState<PlanoAcao | null>(null);
  const [planoToDelete, setPlanoToDelete] = useState<PlanoAcao | null>(null);
  const [actionToDelete, setActionToDelete] = useState<{
    plano: PlanoAcao;
    action: ItemAcao5W2H;
    isOnlyAction: boolean;
  } | null>(null);
  const [capaFormFeedback, setCapaFormFeedback] = useState<string | null>(null);
  const [actionItemModalError, setActionItemModalError] = useState<string | null>(null);
  const [actionItemTargetPlanoId, setActionItemTargetPlanoId] = useState<string | null>(null);
  const [editingActionItem, setEditingActionItem] = useState<ItemAcao5W2H | null>(null);
  const [justificativaPrazo, setJustificativaPrazo] = useState('');
  const [viewingHistoryAction, setViewingHistoryAction] = useState<ItemAcao5W2H | null>(null);
  const [actionItemForm, setActionItemForm] = useState({
    oQue: '',
    porQue: '',
    onde: '',
    quando: getLocalDateISO(),
    quem: '',
    como: '',
    quantoCusta: 0,
    status: 'Planejado' as 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada'
  });

  // Obter ações filhas da Capa (com fallback para planos legados de ação única)
  const getPlanActions = (plano: PlanoAcao): ItemAcao5W2H[] => {
    if (Array.isArray(plano.acoes) && plano.acoes.length > 0) {
      return plano.acoes;
    }
    if (plano.oQue) {
      return [{
        id: `${plano.id}-1`,
        itemNumero: 1,
        oQue: plano.oQue,
        porQue: plano.porQue || '',
        onde: plano.onde || '',
        quando: plano.quando || plano.dataCriacao,
        quem: plano.quem || plano.coordenador || 'Responsável',
        como: plano.como || '',
        quantoCusta: plano.quantoCusta || 0,
        status: plano.status || 'Planejado'
      }];
    }
    return [];
  };

  // Obter estatísticas consolidadas da Capa
  const getPlanStats = (plano: PlanoAcao) => {
    const actions = getPlanActions(plano);
    const total = actions.length;
    const concluidas = actions.filter(a => a.status === 'Concluído').length;
    const emAndamento = actions.filter(a => a.status === 'Em Andamento').length;
    const canceladas = actions.filter(a => a.status === 'Cancelada').length;
    const planejadas = actions.filter(a => a.status === 'Planejado').length;

    // Ações ativas que demandam execução (excluindo ações canceladas)
    const acoesAtivas = total - canceladas;
    let percent = 0;
    if (acoesAtivas > 0) {
      percent = Math.round((concluidas / acoesAtivas) * 100);
    } else if (total > 0) {
      // Quando todas as ações foram canceladas ou resolvidas, o ciclo está finalizado
      percent = 100;
    } else {
      percent = plano.status === 'Concluído' ? 100 : 0;
    }

    const totalCost = actions.length > 0 
      ? actions.reduce((acc, a) => acc + (Number(a.quantoCusta) || 0), 0)
      : (plano.quantoCusta || 0);

    // Obter o prazo limite final considerando as ações do plano
    const parseDateValue = (d?: string): number => {
      if (!d) return 0;
      const clean = d.includes('T') ? d.split('T')[0] : d;
      if (clean.includes('/')) {
        const parts = clean.split('/');
        if (parts.length === 3) {
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
        }
      }
      return new Date(clean).getTime() || 0;
    };

    let prazoFinal = plano.prazoGeral || plano.quando || plano.dataCriacao;
    if (actions.length > 0) {
      // Ordenar ações pela data de prazo mais distante
      const validActionDates = actions
        .filter(a => a.quando)
        .sort((a, b) => parseDateValue(b.quando) - parseDateValue(a.quando));
      
      if (validActionDates.length > 0) {
        const maxActionDate = validActionDates[0].quando;
        // Se a capa não tiver prazoGeral explícito maior, o prazo limite é a maior data entre as ações
        if (!plano.prazoGeral || parseDateValue(maxActionDate) >= parseDateValue(plano.prazoGeral)) {
          prazoFinal = maxActionDate;
        } else {
          prazoFinal = plano.prazoGeral;
        }
      }
    }
    
    // Status consolidado da Capa
    let statusConsolidado = plano.status;
    if (total > 0) {
      const allResolved = actions.every(a => a.status === 'Concluído' || a.status === 'Cancelada');
      if (allResolved) {
        statusConsolidado = canceladas === total ? 'Cancelada' : 'Concluído';
      } else if (emAndamento > 0 || concluidas > 0) {
        statusConsolidado = 'Em Andamento';
      } else {
        statusConsolidado = 'Planejado';
      }
    }

    return {
      actions,
      total,
      acoesAtivas,
      concluidas,
      emAndamento,
      canceladas,
      planejadas,
      percent,
      totalCost,
      prazoFinal,
      statusConsolidado
    };
  };

  const handlePrintPlano = () => {
    if (!selectedPrintPlano) return;
    
    // Remover qualquer container de impressão anterior para evitar duplicidade
    const existing = document.querySelector('.print-container');
    if (existing) {
      existing.remove();
    }
    
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    
    const stats = getPlanStats(selectedPrintPlano);
    const actions = stats.actions;
    const relDoc = documents.find(d => d.id === selectedPrintPlano.documentoId);
    const relAudit = audits.find(a => a.id === selectedPrintPlano.auditoriaId);
    const relNC = ncs.find(n => n.id === selectedPrintPlano.naoConformidadeId);

    const actionsHtml = actions.map((act, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; font-weight: bold; background: #f8fafc;">${act.itemNumero || idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 600;">
          ${act.oQue}
          ${act.porQue ? `<div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;"><strong>Por quê:</strong> ${act.porQue}</div>` : ''}
          ${act.como ? `<div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;"><strong>Como:</strong> ${act.como}</div>` : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${act.onde || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 11px;">${act.quem}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; white-space: nowrap;">
          ${formatDateBR(act.quando)}
          ${act.historicoPrazos && act.historicoPrazos.length > 0 ? `<div style="font-size: 9px; color: #b45309; font-weight: bold; margin-top: 2px;">(Prorrogado ${act.historicoPrazos.length}x)</div>` : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-size: 11px;">R$ ${(Number(act.quantoCusta) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px; font-weight: bold;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; ${
            act.status === 'Concluído' ? 'background: #dcfce7; color: #15803d;' :
            act.status === 'Em Andamento' ? 'background: #fef3c7; color: #b45309;' :
            act.status === 'Cancelada' ? 'background: #ffe4e6; color: #be123c;' :
            'background: #eff6ff; color: #1d4ed8;'
          }">
            ${act.status}
          </span>
        </td>
      </tr>
    `).join('');

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
            <div class="logo">VI</div>
            <div>
              <h1 class="company-name">VICKYTEX</h1>
              <p class="company-sub">SISTEMA DE GESTÃO DA QUALIDADE (SGQ)</p>
            </div>
          </div>
          <div class="header-ref">
            <h2 class="ref-code">FORMULÁRIO 5W2H</h2>
            <p class="ref-sub">Conformidade ISO 9001:2015</p>
          </div>
        </div>
        
        <div class="grid-container">
          <div class="grid-cell grid-label">Código Mestre:</div>
          <div class="grid-cell grid-val-mono">${selectedPrintPlano.codigo}</div>
          <div class="grid-cell grid-label">Data de Registro:</div>
          <div class="grid-cell grid-val">${formatDateBR(selectedPrintPlano.dataCriacao)}</div>
          
          <div class="grid-cell grid-label">Título da Capa:</div>
          <div class="grid-cell grid-val-bold" style="grid-column: span 3;">${selectedPrintPlano.titulo}</div>

          <div class="grid-cell grid-label">Setor Responsável:</div>
          <div class="grid-cell grid-val-bold">${selectedPrintPlano.setor}</div>
          <div class="grid-cell grid-label">Coordenador do Plano:</div>
          <div class="grid-cell grid-val-bold">${selectedPrintPlano.coordenador || selectedPrintPlano.quem || 'Líder SGQ'}</div>

          <div class="grid-cell grid-label">Prazo Limite:</div>
          <div class="grid-cell grid-val">${stats.prazoFinal ? formatDateBR(stats.prazoFinal) : '-'}</div>
          <div class="grid-cell grid-label">Custo Consolidado:</div>
          <div class="grid-cell grid-val-mono" style="color: #16a34a;">R$ ${stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

          ${selectedPrintPlano.objetivo ? `
            <div style="grid-column: span 4; padding: 10px 12px; background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 11px;">
              <strong>Objetivo & Avaliação de Eficácia da Tratativa:</strong><br/>
              <span style="color: #1e293b;">${selectedPrintPlano.objetivo}</span>
            </div>
          ` : ''}

          ${(relDoc || relAudit || relNC) ? `
            <div style="grid-column: span 4; padding: 8px 12px; background-color: #ffffff; font-size: 10px;">
              <strong>Rastreabilidade SGQ:</strong>
              ${relDoc ? `<span style="display:inline-block; margin-right: 12px;">📄 Doc: ${relDoc.codigo} (${relDoc.titulo})</span>` : ''}
              ${relAudit ? `<span style="display:inline-block; margin-right: 12px;">🔍 Auditoria: ${relAudit.codigo} (${relAudit.titulo})</span>` : ''}
              ${relNC ? `<span style="display:inline-block;">⚠️ RNC: ${relNC.codigo} (${relNC.titulo})</span>` : ''}
            </div>
          ` : ''}
        </div>
        
        <h3 style="font-size: 11px; font-weight: 800; color: #0f172a; margin: 20px 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          Ações Executivas 5W2H (${actions.length} ${actions.length === 1 ? 'Ação Vinculada' : 'Ações Vinculadas'})
        </h3>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #0f172a; margin-bottom: 24px; font-size: 11px;">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center; background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; border: 1px solid #334155;">#</th>
              <th style="background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; border: 1px solid #334155;">O quê / Por quê / Como</th>
              <th style="width: 100px; background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; border: 1px solid #334155;">Onde</th>
              <th style="width: 120px; background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; border: 1px solid #334155;">Quem</th>
              <th style="width: 80px; text-align: center; background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; border: 1px solid #334155;">Quando</th>
              <th style="width: 90px; text-align: right; background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; border: 1px solid #334155;">Custo (R$)</th>
              <th style="width: 90px; text-align: center; background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; border: 1px solid #334155;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${actionsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #0f172a;">
              <td colspan="4" style="padding: 8px; text-align: right; border: 1px solid #cbd5e1;">Totais Consolidados:</td>
              <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1;">${stats.total} ações</td>
              <td style="padding: 8px; text-align: right; font-family: monospace; border: 1px solid #cbd5e1;">R$ ${stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="padding: 8px; text-align: center; color: #16a34a; border: 1px solid #cbd5e1;">${stats.concluidas}/${stats.acoesAtivas > 0 ? stats.acoesAtivas : stats.total} concluídas (${stats.percent}%)${stats.planejadas > 0 ? ` <span style="color: #2563eb; font-size: 10px;">[${stats.planejadas} plan.]</span>` : ''}${stats.canceladas > 0 ? ` <span style="color: #64748b; font-size: 10px;">[${stats.canceladas} canc.]</span>` : ''}</td>
            </tr>
          </tfoot>
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

  // Formulário da Capa
  const [formPlano, setFormPlano] = useState({
    codigo: '',
    titulo: '',
    setor: 'Corte' as SectorType,
    status: 'Planejado' as 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada',
    dataCriacao: getLocalDateISO(),
    coordenador: '',
    objetivo: '',
    prazoGeral: '',
    acoes: [] as ItemAcao5W2H[],
    documentoId: '',
    auditoriaId: '',
    naoConformidadeId: ''
  });

  // Estado para adicionar ação inline dentro do modal da Capa
  const [showAddActionInCapaModal, setShowAddActionInCapaModal] = useState(false);
  const [inlineActionForm, setInlineActionForm] = useState({
    oQue: '',
    porQue: '',
    onde: '',
    quando: getLocalDateISO(),
    quem: '',
    como: '',
    quantoCusta: 0,
    status: 'Planejado' as 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada'
  });

  // Limpar formulário para novo plano (Capa)
  const handleOpenNewPlano = () => {
    const nextNum = planos.length + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    const autoCodigo = `PA-2026-${formattedNum}`;
    const today = getLocalDateISO();

    setEditingPlano(null);
    setShowAddActionInCapaModal(false);
    setFormPlano({
      codigo: autoCodigo,
      titulo: '',
      setor: user?.sector || 'Corte',
      status: 'Planejado',
      dataCriacao: today,
      coordenador: user?.name || '',
      objetivo: '',
      prazoGeral: today,
      acoes: [
        {
          id: `act_${Date.now()}_1`,
          itemNumero: 1,
          oQue: '',
          porQue: '',
          onde: '',
          quando: today,
          quem: user?.name || '',
          como: '',
          quantoCusta: 0,
          status: 'Planejado'
        }
      ],
      documentoId: '',
      auditoriaId: '',
      naoConformidadeId: ''
    });
    setInlineActionForm({
      oQue: '',
      porQue: '',
      onde: '',
      quando: today,
      quem: user?.name || '',
      como: '',
      quantoCusta: 0,
      status: 'Planejado'
    });
    setIsPlanoModalOpen(true);
  };

  // Abrir modal com dados de edição da Capa
  const handleOpenEditPlano = (plano: PlanoAcao) => {
    setEditingPlano(plano);
    setShowAddActionInCapaModal(false);
    const existingActions = getPlanActions(plano);
    setFormPlano({
      codigo: plano.codigo,
      titulo: plano.titulo,
      setor: plano.setor,
      status: plano.status,
      dataCriacao: plano.dataCriacao || getLocalDateISO(),
      coordenador: plano.coordenador || plano.quem || '',
      objetivo: plano.objetivo || '',
      prazoGeral: plano.prazoGeral || plano.quando || '',
      acoes: existingActions,
      documentoId: plano.documentoId || '',
      auditoriaId: plano.auditoriaId || '',
      naoConformidadeId: plano.naoConformidadeId || ''
    });
    setInlineActionForm({
      oQue: '',
      porQue: '',
      onde: '',
      quando: getLocalDateISO(),
      quem: plano.coordenador || plano.quem || user?.name || '',
      como: '',
      quantoCusta: 0,
      status: 'Planejado'
    });
    setIsPlanoModalOpen(true);
  };

  // Funções de manipulação das ações dentro da Capa do Plano
  const handleUpdateCapaAction = (index: number, field: keyof ItemAcao5W2H, val: any) => {
    const newAcoes = [...formPlano.acoes];
    newAcoes[index] = { ...newAcoes[index], [field]: val };
    setFormPlano({ ...formPlano, acoes: newAcoes });
  };

  const handleAddCapaAction = () => {
    const nextIdx = formPlano.acoes.length + 1;
    const newAct: ItemAcao5W2H = {
      id: `act_${Date.now()}_${nextIdx}`,
      itemNumero: nextIdx,
      oQue: '',
      porQue: '',
      onde: formPlano.setor,
      quando: formPlano.prazoGeral || new Date().toISOString().split('T')[0],
      quem: formPlano.coordenador || user?.name || '',
      como: '',
      quantoCusta: 0,
      status: 'Planejado'
    };
    setFormPlano({ ...formPlano, acoes: [...formPlano.acoes, newAct] });
  };

  const handleRemoveCapaAction = (index: number) => {
    if (formPlano.acoes.length <= 1) {
      setCapaFormFeedback('A Capa do Plano deve conter pelo menos uma ação 5W2H.');
      return;
    }
    setCapaFormFeedback(null);
    const newAcoes = formPlano.acoes.filter((_, idx) => idx !== index);
    setFormPlano({ ...formPlano, acoes: newAcoes });
  };

  // Salvar Capa (novo ou editado)
  const handleSubmitPlano = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlano.codigo || !formPlano.titulo || !formPlano.coordenador) {
      setCapaFormFeedback('Por favor, preencha o Código, Título da Capa e Coordenador Responsável (*).');
      return;
    }

    // Filtrar ações válidas
    const validActions = formPlano.acoes.filter(a => a.oQue.trim().length > 0);
    if (validActions.length === 0) {
      setCapaFormFeedback('Por favor, adicione pelo menos uma ação 5W2H com descrição no plano.');
      return;
    }
    setCapaFormFeedback(null);

    const firstAction = validActions[0];
    const totalCost = validActions.reduce((acc, a) => acc + (Number(a.quantoCusta) || 0), 0);
    const latestDeadline = [...validActions].map(a => a.quando).sort().reverse()[0] || formPlano.prazoGeral;
    const allCancelled = validActions.length > 0 && validActions.every(a => a.status === 'Cancelada');
    const allConcluded = validActions.length > 0 && validActions.every(a => a.status === 'Concluído' || a.status === 'Cancelada');
    const isUnderway = validActions.some(a => a.status === 'Em Andamento' || a.status === 'Concluído');
    const statusFinal = allCancelled ? 'Cancelada' : (allConcluded ? 'Concluído' : (isUnderway ? 'Em Andamento' : formPlano.status));

    if (editingPlano) {
      const updated: PlanoAcao = {
        ...editingPlano,
        codigo: formPlano.codigo.toUpperCase().trim(),
        titulo: formPlano.titulo.trim(),
        setor: formPlano.setor,
        status: statusFinal,
        dataCriacao: formPlano.dataCriacao || editingPlano.dataCriacao || getLocalDateISO(),
        coordenador: formPlano.coordenador.trim(),
        objetivo: formPlano.objetivo.trim(),
        prazoGeral: latestDeadline,
        acoes: validActions,
        // Sincronizar campos legados com a primeira ação
        oQue: firstAction.oQue,
        porQue: firstAction.porQue,
        onde: firstAction.onde,
        quando: latestDeadline,
        quem: formPlano.coordenador.trim(),
        como: firstAction.como,
        quantoCusta: totalCost,
        documentoId: formPlano.documentoId || undefined,
        auditoriaId: formPlano.auditoriaId || undefined,
        naoConformidadeId: formPlano.naoConformidadeId || undefined
      };
      onUpdatePlano(updated);
      onAddLog('Editou Plano de Ação', `O Plano Mestre ${updated.codigo} com ${validActions.length} ações foi atualizado com sucesso.`, updated.documentoId);
    } else {
      const novo: PlanoAcao = {
        id: `pa_${Date.now()}`,
        codigo: formPlano.codigo.toUpperCase().trim(),
        titulo: formPlano.titulo.trim(),
        setor: formPlano.setor,
        status: statusFinal,
        dataCriacao: formPlano.dataCriacao || getLocalDateISO(),
        coordenador: formPlano.coordenador.trim(),
        objetivo: formPlano.objetivo.trim(),
        prazoGeral: latestDeadline,
        acoes: validActions,
        oQue: firstAction.oQue,
        porQue: firstAction.porQue,
        onde: firstAction.onde,
        quando: latestDeadline,
        quem: formPlano.coordenador.trim(),
        como: firstAction.como,
        quantoCusta: totalCost,
        documentoId: formPlano.documentoId || undefined,
        auditoriaId: formPlano.auditoriaId || undefined,
        naoConformidadeId: formPlano.naoConformidadeId || undefined
      };
      onAddPlano(novo);
      onAddLog('Criou Plano de Ação', `Novo Plano Mestre ${novo.codigo} com ${validActions.length} ações registrado no SGQ.`, novo.documentoId);
    }

    setIsPlanoModalOpen(false);
    setEditingPlano(null);
  };

  // Alternar rapidamente o status de uma ação individual
  const handleToggleActionStatus = (planoId: string, actionId: string, newStatus: 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada') => {
    const plano = planos.find(p => p.id === planoId);
    if (!plano) return;
    const currentActions = getPlanActions(plano);
    const updatedActions = currentActions.map(a => a.id === actionId ? { 
      ...a, 
      status: newStatus,
      concluidoEm: newStatus === 'Concluído' ? new Date().toISOString().split('T')[0] : undefined
    } : a);

    const allCancelled = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Cancelada');
    const allConcluded = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Concluído' || a.status === 'Cancelada');
    const isUnderway = updatedActions.some(a => a.status === 'Em Andamento' || a.status === 'Concluído');
    const statusFinal = allCancelled ? 'Cancelada' : (allConcluded ? 'Concluído' : (isUnderway ? 'Em Andamento' : 'Planejado'));

    const updatedPlano: PlanoAcao = {
      ...plano,
      acoes: updatedActions,
      status: statusFinal
    };

    onUpdatePlano(updatedPlano);
    onAddLog('Atualizou Ação 5W2H', `Status da ação no plano ${plano.codigo} alterado para "${newStatus}".`, plano.documentoId);
  };

  // Iniciar fluxo de exclusão de ação 5W2H (com modal de confirmação)
  const handleDeleteActionClick = (plano: PlanoAcao, action: ItemAcao5W2H) => {
    const currentActions = getPlanActions(plano);
    const isOnlyAction = currentActions.length <= 1;
    setActionToDelete({
      plano,
      action,
      isOnlyAction
    });
  };

  // Confirmar exclusão da ação (ou do plano caso seja a única)
  const handleConfirmDeleteAction = () => {
    if (!actionToDelete) return;
    const { plano, action, isOnlyAction } = actionToDelete;

    if (isOnlyAction) {
      onDeletePlano(plano.id);
      onAddLog('Excluiu Plano de Ação', `Removeu o Plano de Ação ${plano.codigo} do SGQ após exclusão de sua única ação.`, plano.documentoId);
      setActionToDelete(null);
      return;
    }

    const currentActions = getPlanActions(plano);
    const updatedActions = currentActions.filter(a => a.id !== action.id);
    const firstAct = updatedActions[0];
    const totalCost = updatedActions.reduce((acc, a) => acc + (Number(a.quantoCusta) || 0), 0);
    const allCancelled = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Cancelada');
    const allConcluded = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Concluído' || a.status === 'Cancelada');
    const isUnderway = updatedActions.some(a => a.status === 'Em Andamento' || a.status === 'Concluído');
    const statusFinal = allCancelled ? 'Cancelada' : (allConcluded ? 'Concluído' : (isUnderway ? 'Em Andamento' : plano.status));

    const parseDateValue = (d?: string): number => {
      if (!d) return 0;
      const clean = d.includes('T') ? d.split('T')[0] : d;
      if (clean.includes('/')) {
        const parts = clean.split('/');
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
      }
      return new Date(clean).getTime() || 0;
    };
    const sortedDates = updatedActions
      .filter(a => a.quando)
      .sort((a, b) => parseDateValue(b.quando) - parseDateValue(a.quando));
    const latestActionDeadline = sortedDates.length > 0 ? sortedDates[0].quando : plano.prazoGeral;

    const updatedPlano: PlanoAcao = {
      ...plano,
      acoes: updatedActions,
      status: statusFinal,
      quantoCusta: totalCost,
      prazoGeral: latestActionDeadline || plano.prazoGeral,
      oQue: firstAct?.oQue || '',
      porQue: firstAct?.porQue || '',
      onde: firstAct?.onde || '',
      quando: latestActionDeadline || firstAct?.quando || '',
      quem: firstAct?.quem || plano.coordenador || '',
      como: firstAct?.como || ''
    };

    onUpdatePlano(updatedPlano);
    onAddLog('Removeu Ação 5W2H', `Uma ação foi removida do plano ${plano.codigo}.`, plano.documentoId);
    setActionToDelete(null);
  };

  // Abrir modal de inclusão rápida de ação
  const handleOpenAddActionModal = (planoId: string) => {
    const plano = planos.find(p => p.id === planoId);
    setActionItemTargetPlanoId(planoId);
    setEditingActionItem(null);
    setJustificativaPrazo('');
    setActionItemModalError(null);
    setActionItemForm({
      oQue: '',
      porQue: '',
      onde: plano?.onde || '',
      quando: getLocalDateISO(),
      quem: plano?.coordenador || user?.name || '',
      como: '',
      quantoCusta: 0,
      status: 'Planejado'
    });
    setIsActionItemModalOpen(true);
  };

  // Abrir modal para editar ação existente
  const handleOpenEditActionModal = (planoId: string, item: ItemAcao5W2H) => {
    setActionItemTargetPlanoId(planoId);
    setEditingActionItem(item);
    setJustificativaPrazo('');
    setActionItemModalError(null);
    setActionItemForm({
      oQue: item.oQue,
      porQue: item.porQue || '',
      onde: item.onde || '',
      quando: item.quando,
      quem: item.quem,
      como: item.como || '',
      quantoCusta: item.quantoCusta,
      status: item.status
    });
    setIsActionItemModalOpen(true);
  };

  // Salvar ação filha no modal rápido
  const handleSaveActionItemModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionItemTargetPlanoId) return;
    const plano = planos.find(p => p.id === actionItemTargetPlanoId);
    if (!plano) return;

    if (!actionItemForm.oQue || !actionItemForm.quem || !actionItemForm.quando) {
      setActionItemModalError('Preencha os campos obrigatórios da ação (O quê, Quem, Quando).');
      return;
    }

    const isPrazoAlterado = editingActionItem && editingActionItem.quando !== actionItemForm.quando;
    if (isPrazoAlterado && !justificativaPrazo.trim()) {
      setActionItemModalError('Ao alterar o prazo limite da ação, a justificativa técnica é obrigatória (Norma ISO 9001:2015).');
      return;
    }

    setActionItemModalError(null);

    const currentActions = getPlanActions(plano);
    let updatedActions: ItemAcao5W2H[];

    if (editingActionItem) {
      let historicoAtualizado = editingActionItem.historicoPrazos || [];
      if (isPrazoAlterado) {
        const novoRegistro: HistoricoPrazoAcao = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          prazoAnterior: editingActionItem.quando,
          novoPrazo: actionItemForm.quando,
          justificativa: justificativaPrazo.trim(),
          alteradoEm: new Date().toISOString(),
          alteradoPor: user?.name ? `${user.name} (${user.role || 'SGQ'})` : 'Gestão da Qualidade Vickytex'
        };
        historicoAtualizado = [...historicoAtualizado, novoRegistro];
      }

      updatedActions = currentActions.map(a => a.id === editingActionItem.id ? {
        ...a,
        oQue: actionItemForm.oQue.trim(),
        porQue: actionItemForm.porQue.trim(),
        onde: actionItemForm.onde.trim(),
        quando: actionItemForm.quando,
        quem: actionItemForm.quem.trim(),
        como: actionItemForm.como.trim(),
        quantoCusta: Number(actionItemForm.quantoCusta) || 0,
        status: actionItemForm.status,
        historicoPrazos: historicoAtualizado
      } : a);
    } else {
      const newAction: ItemAcao5W2H = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        itemNumero: currentActions.length + 1,
        oQue: actionItemForm.oQue.trim(),
        porQue: actionItemForm.porQue.trim(),
        onde: actionItemForm.onde.trim(),
        quando: actionItemForm.quando,
        quem: actionItemForm.quem.trim(),
        como: actionItemForm.como.trim(),
        quantoCusta: Number(actionItemForm.quantoCusta) || 0,
        status: actionItemForm.status
      };
      updatedActions = [...currentActions, newAction];
    }

    const totalCost = updatedActions.reduce((acc, a) => acc + (Number(a.quantoCusta) || 0), 0);
    const allCancelled = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Cancelada');
    const allConcluded = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Concluído' || a.status === 'Cancelada');
    const isUnderway = updatedActions.some(a => a.status === 'Em Andamento' || a.status === 'Concluído');
    const statusFinal = allCancelled ? 'Cancelada' : (allConcluded ? 'Concluído' : (isUnderway ? 'Em Andamento' : plano.status));

    const parseDateValue = (d?: string): number => {
      if (!d) return 0;
      const clean = d.includes('T') ? d.split('T')[0] : d;
      if (clean.includes('/')) {
        const parts = clean.split('/');
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
      }
      return new Date(clean).getTime() || 0;
    };
    const sortedDates = updatedActions
      .filter(a => a.quando)
      .sort((a, b) => parseDateValue(b.quando) - parseDateValue(a.quando));
    const latestActionDeadline = sortedDates.length > 0 ? sortedDates[0].quando : plano.prazoGeral;

    const updatedPlano: PlanoAcao = {
      ...plano,
      acoes: updatedActions,
      quantoCusta: totalCost,
      status: statusFinal,
      prazoGeral: latestActionDeadline || plano.prazoGeral,
      quando: latestActionDeadline || plano.quando
    };

    onUpdatePlano(updatedPlano);
    setIsActionItemModalOpen(false);
    
    if (isPrazoAlterado) {
      onAddLog(
        'Repactuação de Prazo 5W2H', 
        `Prazo da ação #${editingActionItem.itemNumero || ''} (${actionItemForm.oQue}) no plano ${plano.codigo} alterado de ${formatDateBR(editingActionItem.quando)} para ${formatDateBR(actionItemForm.quando)}. Motivo: ${justificativaPrazo.trim()}`,
        plano.documentoId
      );
    } else {
      onAddLog('Ação 5W2H Salva', `Ação ${editingActionItem ? 'atualizada' : 'adicionada'} no plano ${plano.codigo}.`, plano.documentoId);
    }
  };

  // Excluir plano de ação
  const handleDeletePlanoClick = (plano: PlanoAcao) => {
    setPlanoToDelete(plano);
  };

  // Filtros aplicados
  const filteredPlanos = planos.filter(plano => {
    const stats = getPlanStats(plano);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      plano.codigo.toLowerCase().includes(searchLower) ||
      plano.titulo.toLowerCase().includes(searchLower) ||
      (plano.coordenador && plano.coordenador.toLowerCase().includes(searchLower)) ||
      (plano.objetivo && plano.objetivo.toLowerCase().includes(searchLower)) ||
      stats.actions.some(a => 
        a.oQue.toLowerCase().includes(searchLower) ||
        a.quem.toLowerCase().includes(searchLower) ||
        (a.onde && a.onde.toLowerCase().includes(searchLower))
      );
    
    const matchesSector = selectedSector === 'Todos' || plano.setor === selectedSector;
    const isPlanoOverdue = isDateOverdue(stats.prazoFinal, stats.statusConsolidado);
    const matchesStatus = selectedStatus === 'Todos' 
      ? true 
      : selectedStatus === 'Atrasado' 
        ? isPlanoOverdue 
        : (stats.statusConsolidado === selectedStatus || plano.status === selectedStatus);

    return matchesSearch && matchesSector && matchesStatus;
  });

  // Métricas
  const totalInvestido = filteredPlanos.reduce((acc, p) => acc + getPlanStats(p).totalCost, 0);
  const totalAcoesCount = filteredPlanos.reduce((acc, p) => acc + getPlanStats(p).total, 0);
  const atrasados = filteredPlanos.filter(p => isDateOverdue(getPlanStats(p).prazoFinal, getPlanStats(p).statusConsolidado)).length;
  const planejados = filteredPlanos.filter(p => getPlanStats(p).statusConsolidado === 'Planejado' && !isDateOverdue(getPlanStats(p).prazoFinal, getPlanStats(p).statusConsolidado)).length;
  const emAndamento = filteredPlanos.filter(p => getPlanStats(p).statusConsolidado === 'Em Andamento' && !isDateOverdue(getPlanStats(p).prazoFinal, getPlanStats(p).statusConsolidado)).length;
  const concluidos = filteredPlanos.filter(p => getPlanStats(p).statusConsolidado === 'Concluído').length;

  // Renderizar badge de status com suporte a Atrasado
  const getStatusBadge = (status: string, isOverdue?: boolean) => {
    if (isOverdue && status !== 'Concluído' && status !== 'Cancelada') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
          <span>Atrasado</span>
        </span>
      );
    }
    switch (status) {
      case 'Planejado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">Planejado</span>;
      case 'Em Andamento':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">Em Andamento</span>;
      case 'Concluído':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">Concluído</span>;
      case 'Cancelada':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">Cancelado</span>;
      case 'Atrasado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
            <span>Atrasado</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Permissões granulares do módulo de Planos de Ação (ISO 10.2)
  const {
    canCreate,
    canEdit,
    canDelete,
    canModifyItem,
    canDeleteItem
  } = useModulePermission('planos');

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
          
          {canCreate && (
            <button
              onClick={handleOpenNewPlano}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Plano 5W2H
            </button>
          )}
        </div>
      </div>

      {/* KPI Dashboard Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total de Planos</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{filteredPlanos.length}</span>
            <span className="text-[10px] font-bold text-slate-400">cadastrados</span>
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
            <span className="text-[10px] font-bold text-amber-400">no prazo</span>
          </div>
        </div>
        <div className={`bg-white dark:bg-slate-900 border ${atrasados > 0 ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-4 shadow-xs`}>
          <p className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider flex items-center justify-between">
            <span>Atrasados</span>
            {atrasados > 0 && <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />}
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-black ${atrasados > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>{atrasados}</span>
            <span className="text-[10px] font-bold text-rose-400">atenção</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider">Concluídos</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{concluidos}</span>
            <span className="text-[10px] font-bold text-emerald-400">eficazes</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Investimento</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-slate-800 dark:text-white">R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
            <option value="Atrasado">⚠️ Atrasado</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelada">Cancelado</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('lista')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'lista'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Visualização em Lista / Tabela"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Visualização em Cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Sub-bar with count and actions */}
      {filteredPlanos.length > 0 && viewMode === 'lista' && (
        <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
          <span>
            Exibindo <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{filteredPlanos.length}</strong> {filteredPlanos.length === 1 ? 'plano de ação' : 'planos de ação'}
          </span>
          <button
            type="button"
            onClick={toggleExpandAll}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {filteredPlanos.every(p => expandedIds[p.id]) ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Recolher todos os 5W2H</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expandir todos os 5W2H</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main List / Table / Grid */}
      {filteredPlanos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Nenhum plano de ação encontrado</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Não encontramos planos de ação correspondentes aos seus termos de busca ou filtros selecionados.
          </p>
          {canCreate && (
            <button
              onClick={handleOpenNewPlano}
              className="mt-4 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Criar Primeiro Plano
            </button>
          )}
        </div>
      ) : viewMode === 'lista' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center"></th>
                  <th className="py-3.5 px-4 min-w-[280px]">Plano Mestre (Capa) & Escopo</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Setor</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Coordenador</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Ações & Progresso</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Prazo Limite</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Investimento Total</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Status Geral</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Rastreabilidade</th>
                  <th className="py-3.5 px-4 text-right min-w-[140px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredPlanos.map((plano) => {
                  const isExpanded = !!expandedIds[plano.id];
                  const stats = getPlanStats(plano);
                  const actions = stats.actions;
                  const relDoc = documents.find(d => d.id === plano.documentoId);
                  const relAudit = audits.find(a => a.id === plano.auditoriaId);
                  const relNC = ncs.find(n => n.id === plano.naoConformidadeId);
                  const isOverdue = isDateOverdue(stats.prazoFinal, stats.statusConsolidado);

                  return (
                    <React.Fragment key={plano.id}>
                      <tr 
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                        }`}
                        onClick={() => toggleExpand(plano.id)}
                      >
                        {/* Expand toggle */}
                        <td className="py-3.5 px-3 text-center" onClick={(e) => { e.stopPropagation(); toggleExpand(plano.id); }}>
                          <button
                            type="button"
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            title={isExpanded ? 'Recolher ações 5W2H' : 'Expandir ações 5W2H'}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                          </button>
                        </td>

                        {/* Código & Título & Escopo */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-extrabold bg-[#0B3A63] text-white px-2 py-0.5 rounded tracking-wider shrink-0 shadow-2xs">
                              {plano.codigo}
                            </span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                              {plano.titulo}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0" title={`${actions.length} ações vinculadas`}>
                              {actions.length} {actions.length === 1 ? 'ação' : 'ações'}
                            </span>
                          </div>
                          {plano.objetivo ? (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 pl-0.5 italic">
                              {plano.objetivo}
                            </p>
                          ) : plano.oQue ? (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 pl-0.5">
                              {plano.oQue}
                            </p>
                          ) : null}
                        </td>

                        {/* Setor */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                            {plano.setor}
                          </span>
                        </td>

                        {/* Coordenador */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[140px]" title={plano.coordenador || plano.quem}>
                              {plano.coordenador || plano.quem || 'Líder SGQ'}
                            </span>
                          </div>
                        </td>

                        {/* Ações & Progresso */}
                        <td className="py-3.5 px-4 min-w-[150px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {stats.concluidas}/{stats.acoesAtivas > 0 ? stats.acoesAtivas : stats.total} concluídas
                                {stats.canceladas > 0 && (
                                  <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                                    ({stats.canceladas} canc.)
                                  </span>
                                )}
                              </span>
                              <span className={`font-extrabold font-mono ${stats.percent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {stats.percent}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-150 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  stats.percent === 100 
                                    ? 'bg-emerald-500' 
                                    : stats.percent > 0 
                                      ? 'bg-blue-600' 
                                      : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                                style={{ width: `${stats.percent}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                              <span title="Planejadas" className="text-blue-600 dark:text-blue-400 font-semibold">{stats.planejadas} plan.</span>
                              <span>•</span>
                              <span title="Em Andamento" className="text-amber-600 dark:text-amber-400 font-semibold">{stats.emAndamento} and.</span>
                              <span>•</span>
                              <span title="Concluídas" className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.concluidas} conc.</span>
                            </div>
                          </div>
                        </td>

                        {/* Prazo Limite */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className={`font-mono text-xs font-bold ${
                              isOverdue 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {stats.prazoFinal ? formatDateBR(stats.prazoFinal) : '-'}
                            </span>
                          </div>
                          {isOverdue && (
                            <span className="inline-block text-[9px] font-extrabold text-rose-500 uppercase tracking-tight mt-0.5">
                              Atrasado
                            </span>
                          )}
                        </td>

                        {/* Investimento Total */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {stats.totalCost > 0 ? (
                            `R$ ${stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          ) : (
                            <span className="text-slate-400 font-normal">R$ 0,00</span>
                          )}
                        </td>

                        {/* Status Geral */}
                        <td className="py-3.5 px-4">
                          {getStatusBadge(stats.statusConsolidado, isOverdue)}
                        </td>

                        {/* Rastreabilidade */}
                        <td className="py-3.5 px-4">
                          {plano.documentoId || plano.auditoriaId || plano.naoConformidadeId ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {plano.documentoId && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900" title={`Documento: ${relDoc ? relDoc.codigo : plano.documentoId}`}>
                                  <FileText className="w-2.5 h-2.5" />
                                  <span>{relDoc?.codigo || 'Doc'}</span>
                                </span>
                              )}
                              {plano.auditoriaId && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900" title={`Auditoria: ${relAudit ? relAudit.codigo : plano.auditoriaId}`}>
                                  <CheckSquare className="w-2.5 h-2.5" />
                                  <span>{relAudit?.codigo || 'Aud'}</span>
                                </span>
                              )}
                              {plano.naoConformidadeId && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900" title={`RNC: ${relNC ? relNC.codigo : plano.naoConformidadeId}`}>
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  <span>{relNC?.codigo || 'RNC'}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {canCreate && (
                              <button
                                onClick={() => handleOpenAddActionModal(plano.id)}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Adicionar Nova Ação 5W2H nesta Capa"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">+ Ação</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedPrintPlano(plano);
                                setIsPrintModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                              title="Imprimir Folha Mestre 5W2H"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {canEdit && (!canModifyItem || canModifyItem(plano.onde)) && (
                              <button
                                onClick={() => handleOpenEditPlano(plano)}
                                className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                                title="Editar Plano Mestre (Capa)"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {canDelete && (!canDeleteItem || canDeleteItem(plano.onde)) && (
                              <button
                                onClick={() => handleDeletePlanoClick(plano)}
                                className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Excluir Plano de Ação"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Accordion 5W2H Details row (Capa com Tabela de Ações) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                          <td colSpan={10} className="p-5">
                            <div className="space-y-4 max-w-7xl mx-auto">
                              
                              {/* Cabeçalho do Escopo da Capa */}
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-800 pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-black bg-[#0B3A63] text-white px-2.5 py-1 rounded">
                                      {plano.codigo}
                                    </span>
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                      {plano.titulo}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span>Setor: <strong className="text-slate-800 dark:text-slate-200">{plano.setor}</strong></span>
                                    <span>•</span>
                                    <span>Coordenador: <strong className="text-slate-800 dark:text-slate-200">{plano.coordenador || plano.quem || 'Líder'}</strong></span>
                                    <span>•</span>
                                    <span>Registrado em: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatDateBR(plano.dataCriacao)}</strong></span>
                                  </div>
                                </div>

                                {plano.objetivo && (
                                  <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3 rounded-lg">
                                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                                        Objetivo Geral & Avaliação de Eficácia da Tratativa:
                                      </p>
                                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                                        {plano.objetivo}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                      Total: <strong className="text-slate-800 dark:text-slate-200 font-bold">{stats.total} ações</strong>
                                    </span>
                                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                      Planejado: <strong className="font-bold">{stats.planejadas}</strong>
                                    </span>
                                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                      Em Andamento: <strong className="font-bold">{stats.emAndamento}</strong>
                                    </span>
                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                      Concluídas: <strong className="font-bold">{stats.concluidas}</strong>
                                    </span>
                                    {stats.canceladas > 0 && (
                                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        Canceladas: <strong className="font-bold">{stats.canceladas}</strong>
                                      </span>
                                    )}
                                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
                                      Custo Consolidado: <strong className="font-bold">R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </span>
                                  </div>
                                  
                                  {canCreate && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAddActionModal(plano.id)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Adicionar Ação 5W2H</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Tabela de Ações Filhas */}
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                                <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-black text-[#0B3A63] dark:text-blue-400 uppercase tracking-widest">
                                    AÇÕES EXECUTIVAS 5W2H ({actions.length})
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Selecione o status para alteração rápida
                                  </span>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-[9px] uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                                      <tr>
                                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                                        <th className="py-2.5 px-3 min-w-[220px]">O quê (What) / Por quê (Why) / Como (How)</th>
                                        <th className="py-2.5 px-3 min-w-[110px]">Onde (Where)</th>
                                        <th className="py-2.5 px-3 min-w-[120px]">Quem (Who)</th>
                                        <th className="py-2.5 px-3 min-w-[95px] text-center">Quando (When)</th>
                                        <th className="py-2.5 px-3 min-w-[95px] text-right">Custo (R$)</th>
                                        <th className="py-2.5 px-3 min-w-[110px] text-center">Status</th>
                                        <th className="py-2.5 px-3 text-right min-w-[80px]">Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                                      {actions.map((act, idx) => {
                                        const isActOverdue = isDateOverdue(act.quando, act.status);
                                        return (
                                          <tr key={act.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500 text-[11px]">
                                              {act.itemNumero || idx + 1}
                                            </td>
                                            <td className="py-2.5 px-3">
                                              <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                                                {act.oQue}
                                              </p>
                                              {act.porQue && (
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                  <span className="font-semibold text-slate-600 dark:text-slate-300">Por quê:</span> {act.porQue}
                                                </p>
                                              )}
                                              {act.como && (
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                  <span className="font-semibold text-slate-600 dark:text-slate-300">Como:</span> {act.como}
                                                </p>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                              {act.onde || '—'}
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                                              {act.quem}
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                              <span className={`font-mono text-[11px] font-bold ${
                                                isActOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                                              }`}>
                                                {formatDateBR(act.quando)}
                                              </span>
                                              {isActOverdue && (
                                                <span className="block text-[8px] font-extrabold text-rose-500 uppercase">Atrasado</span>
                                              )}
                                              {act.historicoPrazos && act.historicoPrazos.length > 0 && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingHistoryAction(act);
                                                  }}
                                                  className="inline-flex items-center justify-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer mt-1"
                                                  title="Ver justificativas das repactuações de prazo"
                                                >
                                                  <History className="w-2.5 h-2.5" />
                                                  <span>Prorrogado ({act.historicoPrazos.length}x)</span>
                                                </button>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                                              R$ {(Number(act.quantoCusta) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                              <select
                                                value={act.status}
                                                onChange={(e) => handleToggleActionStatus(plano.id, act.id, e.target.value as any)}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-md border focus:outline-hidden cursor-pointer ${
                                                  act.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' :
                                                  act.status === 'Em Andamento' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' :
                                                  act.status === 'Cancelada' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' :
                                                  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                                                }`}
                                              >
                                                <option value="Planejado">Planejado</option>
                                                <option value="Em Andamento">Em Andamento</option>
                                                <option value="Concluído">Concluído</option>
                                                <option value="Cancelada">Cancelada</option>
                                              </select>
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                              <div className="flex items-center justify-end gap-1">
                                                {canEdit && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleOpenEditActionModal(plano.id, act);
                                                    }}
                                                    className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                                                    title="Editar esta ação 5W2H"
                                                  >
                                                    <Pencil className="w-3 h-3" />
                                                  </button>
                                                )}
                                                {canDelete && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteActionClick(plano, act);
                                                    }}
                                                    className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                                    title="Remover esta ação"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Integrations Badges Footer */}
                              {(plano.documentoId || plano.auditoriaId || plano.naoConformidadeId) && (
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">Rastreabilidade SGQ:</span>
                                  
                                  {plano.documentoId && (
                                    <div className="flex items-center bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 px-2 py-1 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 space-x-1">
                                      <FileText className="w-3 h-3" />
                                      <span>Doc: {relDoc ? `${relDoc.codigo} - ${relDoc.titulo.substring(0, 20)}...` : plano.documentoId}</span>
                                    </div>
                                  )}

                                  {plano.auditoriaId && (
                                    <div className="flex items-center bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 px-2 py-1 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 space-x-1">
                                      <CheckSquare className="w-3 h-3" />
                                      <span>Auditoria: {relAudit ? `${relAudit.codigo} - ${relAudit.titulo.substring(0, 20)}...` : plano.auditoriaId}</span>
                                    </div>
                                  )}

                                  {plano.naoConformidadeId && (
                                    <div className="flex items-center bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 px-2 py-1 rounded text-[10px] font-bold text-rose-600 dark:text-rose-400 space-x-1">
                                      <AlertCircle className="w-3 h-3" />
                                      <span>RNC: {relNC ? `${relNC.codigo} - ${relNC.titulo.substring(0, 20)}...` : plano.naoConformidadeId}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPlanos.map((plano) => {
            const stats = getPlanStats(plano);
            const actions = stats.actions;
            const relDoc = documents.find(d => d.id === plano.documentoId);
            const relAudit = audits.find(a => a.id === plano.auditoriaId);
            const relNC = ncs.find(n => n.id === plano.naoConformidadeId);
            const isOverdue = isDateOverdue(stats.prazoFinal, stats.statusConsolidado);

            return (
              <div 
                key={plano.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
              >
                {/* Header card info (Capa) */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-150 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-extrabold bg-[#0B3A63] text-white px-2.5 py-1 rounded-md tracking-wider">
                        {plano.codigo}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                        {plano.titulo}
                      </h4>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">
                        {plano.setor}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {actions.length} {actions.length === 1 ? 'Ação' : 'Ações'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Coord: <strong className="text-slate-800 dark:text-slate-200">{plano.coordenador || plano.quem || 'Líder SGQ'}</strong></span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Prazo Limite: <strong className={`font-mono ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {stats.prazoFinal ? formatDateBR(stats.prazoFinal) : '-'}
                        </strong></span>
                      </div>
                      {isOverdue && (
                        <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-tight ml-1 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                          Atrasado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    {getStatusBadge(stats.statusConsolidado, isOverdue)}
                    
                    {canCreate && (
                      <button
                        onClick={() => handleOpenAddActionModal(plano.id)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Adicionar Ação 5W2H nesta Capa"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Ação</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedPrintPlano(plano);
                        setIsPrintModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                      title="Imprimir Folha 5W2H"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {canEdit && (!canModifyItem || canModifyItem(plano.onde)) && (
                      <button
                        onClick={() => handleOpenEditPlano(plano)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                        title="Editar Capa do Plano"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {canDelete && (!canDeleteItem || canDeleteItem(plano.onde)) && (
                      <button
                        onClick={() => handleDeletePlanoClick(plano)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Excluir Plano de Ação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scope & Progress */}
                <div className="p-6 space-y-4">
                  {plano.objetivo && (
                    <div className="flex items-start gap-2 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3 rounded-xl">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-mono font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                          Objetivo Geral & Avaliação de Eficácia (ISO 9001 Cláusula 10.2):
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium leading-relaxed">
                          {plano.objetivo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metrics bar */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Progresso</span>
                        <div 
                          className="flex items-center gap-2" 
                          title={stats.canceladas > 0 
                            ? `${stats.percent}% de progresso: ${stats.concluidas} de ${stats.acoesAtivas} ação(ões) ativa(s) concluída(s) (${stats.canceladas} cancelada(s) descartada(s) do escopo)` 
                            : `${stats.percent}% de progresso: ${stats.concluidas} de ${stats.total} ação(ões) concluída(s)`}
                        >
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                stats.percent === 100 ? 'bg-emerald-500' : stats.percent > 0 ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                              style={{ width: `${stats.percent}%` }}
                            />
                          </div>
                          <span className={`font-mono font-black text-xs ${stats.percent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>{stats.percent}%</span>
                        </div>
                      </div>

                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          Total: <strong className="text-slate-900 dark:text-white font-bold">{stats.total}</strong>
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Planejado: <strong className="font-bold">{stats.planejadas}</strong>
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          Em Andamento: <strong className="font-bold">{stats.emAndamento}</strong>
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          Concluídas: <strong className="font-bold">{stats.concluidas}</strong>
                        </span>
                        {stats.canceladas > 0 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Canceladas: <strong className="font-bold">{stats.canceladas}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Custo Total Previsto</span>
                      <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Actions 5W2H List */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-[#0B3A63] dark:text-blue-400 uppercase tracking-widest">
                        AÇÕES EXECUTIVAS 5W2H ({actions.length})
                      </span>
                      {canCreate && (
                        <button
                          onClick={() => handleOpenAddActionModal(plano.id)}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar Ação</span>
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-150 dark:divide-slate-800">
                      {actions.map((act, idx) => {
                        const isActOverdue = isDateOverdue(act.quando, act.status);
                        return (
                          <div key={act.id || idx} className="p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span className="font-mono text-[11px] font-bold text-slate-400 shrink-0 mt-0.5">
                                  #{act.itemNumero || idx + 1}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {act.oQue}
                                  </p>
                                  {act.porQue && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      <span className="font-semibold text-slate-600 dark:text-slate-300">Por quê:</span> {act.porQue}
                                    </p>
                                  )}
                                  {act.como && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      <span className="font-semibold text-slate-600 dark:text-slate-300">Como:</span> {act.como}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <select
                                  value={act.status}
                                  onChange={(e) => handleToggleActionStatus(plano.id, act.id, e.target.value as any)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-md border focus:outline-hidden cursor-pointer ${
                                    act.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' :
                                    act.status === 'Em Andamento' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' :
                                    act.status === 'Cancelada' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' :
                                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                                  }`}
                                >
                                  <option value="Planejado">Planejado</option>
                                  <option value="Em Andamento">Em Andamento</option>
                                  <option value="Concluído">Concluído</option>
                                  <option value="Cancelada">Cancelada</option>
                                </select>

                                {canEdit && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditActionModal(plano.id, act);
                                    }}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                                    title="Editar ação"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                )}

                                {canDelete && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteActionClick(plano, act);
                                    }}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                    title="Remover ação"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Action Metadata Row */}
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                <User className="w-3 h-3 text-slate-400" />
                                {act.quem}
                              </span>
                              {act.onde && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {act.onde}
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`flex items-center gap-1 font-mono font-bold ${
                                  isActOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                  <Calendar className="w-3 h-3" />
                                  {formatDateBR(act.quando)}
                                  {isActOverdue && <span className="text-[8px] uppercase text-rose-500 font-extrabold ml-0.5">(Atrasado)</span>}
                                </span>
                                {act.historicoPrazos && act.historicoPrazos.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingHistoryAction(act);
                                    }}
                                    className="inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                                    title="Ver justificativas das repactuações de prazo"
                                  >
                                    <History className="w-2.5 h-2.5" />
                                    <span>Prorrogado ({act.historicoPrazos.length}x)</span>
                                  </button>
                                )}
                              </div>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
                                R$ {(Number(act.quantoCusta) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Integrations Badges Footer */}
                  {(plano.documentoId || plano.auditoriaId || plano.naoConformidadeId) && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">Rastreabilidade SGQ:</span>
                      
                      {plano.documentoId && (
                        <div className="flex items-center bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 px-2 py-1 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>Doc: {relDoc ? `${relDoc.codigo} - ${relDoc.titulo.substring(0, 20)}...` : plano.documentoId}</span>
                        </div>
                      )}

                      {plano.auditoriaId && (
                        <div className="flex items-center bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 px-2 py-1 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 space-x-1">
                          <CheckSquare className="w-3 h-3" />
                          <span>Auditoria: {relAudit ? `${relAudit.codigo} - ${relAudit.titulo.substring(0, 20)}...` : plano.auditoriaId}</span>
                        </div>
                      )}

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

      {/* MODAL: NOVO OU EDITAR PLANO DE AÇÃO (CAPA COM MÚLTIPLAS AÇÕES) */}
      {isPlanoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between sticky top-0 z-20 shadow-xs">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="text-sm font-extrabold leading-tight">
                    {editingPlano ? `Editar Capa do Plano: ${editingPlano.codigo}` : 'Novo Plano de Ação 5W2H (Capa com Ações)'}
                  </h3>
                  <p className="text-[10px] text-blue-200">
                    Definição da Capa Macro e detalhamento das Ações Executivas 5W2H (ISO 9001:2015 10.2)
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsPlanoModalOpen(false)} 
                className="text-white/70 hover:text-white font-mono text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitPlano} className="p-6 space-y-6">
              {capaFormFeedback && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold">{capaFormFeedback}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setCapaFormFeedback(null)} 
                    className="text-amber-500 hover:text-amber-700 dark:text-amber-400 font-bold ml-2 text-base leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              )}
              
              {/* SEÇÃO 1: DADOS GERAIS DA CAPA */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-[11px] font-mono font-black text-[#0B3A63] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    1. Dados da Capa do Plano (Nível Estrutural)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Informações consolidadas</span>
                </div>

                {/* Linha 1: Código, Título, Setor */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Código do Plano *</label>
                    <input
                      type="text"
                      required
                      value={formPlano.codigo}
                      onChange={(e) => setFormPlano({ ...formPlano, codigo: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono font-bold rounded-lg focus:outline-hidden dark:text-slate-100"
                      placeholder="PA-2026-001"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título da Capa / Tratativa *</label>
                    <input
                      type="text"
                      required
                      value={formPlano.titulo}
                      onChange={(e) => setFormPlano({ ...formPlano, titulo: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold rounded-lg focus:outline-hidden dark:text-slate-100"
                      placeholder="Ex: Tratativa para melhoria de processo ou contenção de desvio"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Setor do Processo *</label>
                    <select
                      value={formPlano.setor}
                      onChange={(e) => setFormPlano({ ...formPlano, setor: e.target.value as SectorType })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    >
                      {sectorsList.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Linha 2: Coordenador, Data de Registro, Prazo Geral, Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Coordenador Geral Responsável *</label>
                    <input
                      type="text"
                      required
                      value={formPlano.coordenador}
                      onChange={(e) => setFormPlano({ ...formPlano, coordenador: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                      placeholder="Nome do líder/coordenador do plano"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Registro</label>
                    <input
                      type="date"
                      value={formPlano.dataCriacao}
                      onChange={(e) => setFormPlano({ ...formPlano, dataCriacao: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prazo Geral Limite</label>
                    <input
                      type="date"
                      value={formPlano.prazoGeral}
                      onChange={(e) => setFormPlano({ ...formPlano, prazoGeral: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status Geral do Plano</label>
                    <select
                      value={formPlano.status}
                      onChange={(e) => setFormPlano({ ...formPlano, status: e.target.value as any })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    >
                      <option value="Planejado">Planejado</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelada">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Linha 3: Objetivo & Avaliação de Eficácia */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Objetivo Geral & Avaliação de Eficácia da Tratativa (Cláusula 10.2)
                  </label>
                  <textarea
                    rows={2}
                    value={formPlano.objetivo}
                    onChange={(e) => setFormPlano({ ...formPlano, objetivo: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100 leading-relaxed"
                    placeholder="Descreva o objetivo macro, critério de sucesso e eficácia esperada para eliminar a causa raiz..."
                  />
                </div>

                {/* Linha 4: Rastreabilidade */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Documento Vinculado</label>
                    <select
                      value={formPlano.documentoId}
                      onChange={(e) => setFormPlano({ ...formPlano, documentoId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    >
                      <option value="">-- Nenhum documento --</option>
                      {documents.map(d => (
                        <option key={d.id} value={d.id}>{d.codigo} - {d.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Auditoria Vinculada</label>
                    <select
                      value={formPlano.auditoriaId}
                      onChange={(e) => setFormPlano({ ...formPlano, auditoriaId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    >
                      <option value="">-- Nenhuma auditoria --</option>
                      {audits.map(a => (
                        <option key={a.id} value={a.id}>{a.codigo} - {a.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">RNC Vinculada</label>
                    <select
                      value={formPlano.naoConformidadeId}
                      onChange={(e) => setFormPlano({ ...formPlano, naoConformidadeId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    >
                      <option value="">-- Nenhuma RNC --</option>
                      {ncs.map(n => (
                        <option key={n.id} value={n.id}>{n.codigo} - {n.titulo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: AÇÕES 5W2H VINCULADAS À CAPA */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      2. Ações Executivas 5W2H Vinculadas ({formPlano.acoes.length})
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Cada ação detalha uma etapa executiva com responsável, prazo e método.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Total: R$ {formPlano.acoes.reduce((acc, a) => acc + (Number(a.quantoCusta) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddCapaAction}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Adicionar Ação 5W2H</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Ações no Formulário */}
                <div className="space-y-3">
                  {formPlano.acoes.map((action, idx) => (
                    <div 
                      key={action.id || idx}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3 relative"
                    >
                      {/* Sub-header da Ação */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0B3A63] text-white flex items-center justify-center font-mono font-black text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Ação 5W2H #{idx + 1}
                          </span>
                        </div>
                        {formPlano.acoes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCapaAction(idx)}
                            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                            title="Remover esta ação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        )}
                      </div>

                      {/* WHAT & WHY */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            WHAT (O que fazer?) *
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={action.oQue}
                            onChange={(e) => handleUpdateCapaAction(idx, 'oQue', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                            placeholder="Descrição da ação executiva..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            WHY (Por que fazer?)
                          </label>
                          <textarea
                            rows={2}
                            value={action.porQue || ''}
                            onChange={(e) => handleUpdateCapaAction(idx, 'porQue', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                            placeholder="Justificativa ou causa tratada..."
                          />
                        </div>
                      </div>

                      {/* WHERE, WHEN, WHO, STATUS */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            WHERE (Onde?)
                          </label>
                          <input
                            type="text"
                            value={action.onde || ''}
                            onChange={(e) => handleUpdateCapaAction(idx, 'onde', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                            placeholder="Local ou máquina"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            WHO (Quem fará?) *
                          </label>
                          <input
                            type="text"
                            required
                            value={action.quem}
                            onChange={(e) => handleUpdateCapaAction(idx, 'quem', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                            placeholder="Nome do executor"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            WHEN (Prazo)? *
                          </label>
                          <input
                            type="date"
                            required
                            value={action.quando}
                            onChange={(e) => handleUpdateCapaAction(idx, 'quando', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Status da Ação
                          </label>
                          <select
                            value={action.status}
                            onChange={(e) => handleUpdateCapaAction(idx, 'status', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-bold rounded-lg focus:outline-hidden dark:text-slate-100"
                          >
                            <option value="Planejado">Planejado</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelada">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      {/* HOW & HOW MUCH */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            HOW (Como fará / Método)?
                          </label>
                          <input
                            type="text"
                            value={action.como || ''}
                            onChange={(e) => handleUpdateCapaAction(idx, 'como', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                            placeholder="Passo a passo, POP utilizado ou instruções..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            HOW MUCH (Custo R$)?
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={action.quantoCusta}
                            onChange={(e) => handleUpdateCapaAction(idx, 'quantoCusta', Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono rounded-lg focus:outline-hidden dark:bg-slate-800"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleAddCapaAction}
                    className="px-4 py-2 border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Outra Ação 5W2H nesta Capa</span>
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-150 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formPlano.acoes.length} {formPlano.acoes.length === 1 ? 'ação vinculada' : 'ações vinculadas'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlanoModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    {editingPlano ? 'Salvar Alterações da Capa' : 'Registrar Plano Mestre (Capa)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR OU EDITAR AÇÃO 5W2H INDIVIDUAL */}
      {isActionItemModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4.5 h-4.5 text-blue-300" />
                <div>
                  <h3 className="text-sm font-extrabold">
                    {editingActionItem ? 'Editar Ação 5W2H' : 'Nova Ação 5W2H'}
                  </h3>
                  {actionItemTargetPlanoId && (
                    <p className="text-[10px] text-blue-200 font-mono">
                      Vinculada ao Plano: {planos.find(p => p.id === actionItemTargetPlanoId)?.codigo} - {planos.find(p => p.id === actionItemTargetPlanoId)?.titulo}
                    </p>
                  )}
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsActionItemModalOpen(false)} 
                className="text-white/60 hover:text-white font-mono text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveActionItemModal} className="p-6 space-y-4">
              {actionItemModalError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="font-semibold">{actionItemModalError}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setActionItemModalError(null)} 
                    className="text-rose-500 hover:text-rose-700 dark:text-rose-400 font-bold ml-2 text-base leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              )}
              {/* WHAT */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  WHAT - O que fazer? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={actionItemForm.oQue}
                  onChange={(e) => setActionItemForm({ ...actionItemForm, oQue: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  placeholder="Descrição da ação prática executiva..."
                />
              </div>

              {/* WHY */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  WHY - Por que fazer?
                </label>
                <textarea
                  rows={2}
                  value={actionItemForm.porQue}
                  onChange={(e) => setActionItemForm({ ...actionItemForm, porQue: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                  placeholder="Justificativa da ação ou desvio a mitigar..."
                />
              </div>

              {/* WHERE & WHO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHERE - Onde?
                  </label>
                  <input
                    type="text"
                    value={actionItemForm.onde}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, onde: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Local, máquina ou posto..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHO - Quem fará? *
                  </label>
                  <input
                    type="text"
                    required
                    value={actionItemForm.quem}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, quem: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Responsável direto"
                  />
                </div>
              </div>

              {/* WHEN & STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WHEN - Quando (Prazo limite)? *
                  </label>
                  <input
                    type="date"
                    required
                    value={actionItemForm.quando}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, quando: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Status da Ação
                  </label>
                  <select
                    value={actionItemForm.status}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold rounded-lg focus:outline-hidden dark:text-slate-100"
                  >
                    <option value="Planejado">Planejado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* ALERTA E JUSTIFICATIVA DE REPACTUAÇÃO DE PRAZO (ISO 9001) */}
              {editingActionItem && editingActionItem.quando !== actionItemForm.quando && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2.5 animate-scale-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Repactuação de Prazo Detectada (ISO 9001:2015)</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
                    Você está alterando o prazo limite desta ação de <strong className="font-mono text-slate-900 dark:text-white line-through">{formatDateBR(editingActionItem.quando)}</strong> para <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatDateBR(actionItemForm.quando)}</strong>. Registre abaixo o motivo formal para auditoria do SGQ.
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-1">
                      Justificativa Técnica da Alteração de Prazo *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={justificativaPrazo}
                      onChange={(e) => setJustificativaPrazo(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 p-2.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100 shadow-2xs"
                      placeholder="Ex: Atraso na entrega de peças pelo fornecedor homologado; aguardando liberação técnica da manutenção; etc."
                    />
                  </div>
                </div>
              )}

              {/* HISTÓRICO ANTERIOR DE REPACTUAÇÕES SE HOUVER */}
              {editingActionItem && editingActionItem.historicoPrazos && editingActionItem.historicoPrazos.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Histórico de Repactuações ({editingActionItem.historicoPrazos.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Rastreabilidade SGQ</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {editingActionItem.historicoPrazos.map((hist, hIdx) => (
                      <div key={hist.id || hIdx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-lg text-[10px] space-y-0.5">
                        <div className="flex items-center justify-between font-mono text-slate-500 dark:text-slate-400">
                          <span>{formatDateBR(hist.alteradoEm)} • {hist.alteradoPor}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {formatDateBR(hist.prazoAnterior)} ➔ {formatDateBR(hist.novoPrazo)}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 italic font-medium">
                          "{hist.justificativa}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOW & HOW MUCH */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    HOW - Como fará (Método)?
                  </label>
                  <input
                    type="text"
                    value={actionItemForm.como}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, como: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Instruções, ferramentas ou procedimentos..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    HOW MUCH - Custo (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actionItemForm.quantoCusta}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, quantoCusta: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono rounded-lg focus:outline-hidden dark:bg-slate-800"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsActionItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingActionItem ? 'Salvar Ação' : 'Adicionar Ação'}
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

      {/* MODAL: IMPRESSÃO DETALHADA DO MODELO 5W2H (CAPA COM AÇÕES) */}
      {isPrintModalOpen && selectedPrintPlano && (() => {
        const printStats = getPlanStats(selectedPrintPlano);
        const printActions = printStats.actions;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
              {/* Header */}
              <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-300" />
                  <div>
                    <h3 className="text-sm font-extrabold">
                      Folha de Plano de Ação 5W2H: {selectedPrintPlano.codigo}
                    </h3>
                    <p className="text-[10px] text-blue-200">
                      Visualização prévia formatada para impressão A4 institucional SGQ
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)} 
                  className="text-white/60 hover:text-white font-mono text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Printable View Container */}
              <div id="printable-5w2h-area" className="p-8 bg-white text-slate-900 font-sans space-y-6">
                
                {/* Printable Header */}
                <div className="border-2 border-slate-900 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded bg-[#0B3A63] flex items-center justify-center text-white font-black text-xl">
                      VI
                    </div>
                    <div>
                      <h1 className="text-base font-extrabold tracking-tight">VICKYTEX</h1>
                      <p className="text-[10px] font-bold text-slate-500 font-mono">SISTEMA DE GESTÃO DA QUALIDADE (SGQ)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xs font-black bg-slate-900 text-white px-2.5 py-1 inline-block">PLANO MESTRE 5W2H</h2>
                    <p className="text-[9px] font-bold text-slate-500 mt-1">Conformidade ISO 9001:2015 Cláusula 10.2</p>
                  </div>
                </div>

                {/* Capa Grid Identifiers */}
                <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-400 text-xs">
                  <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Código Mestre:</div>
                  <div className="p-2 border-r border-b border-slate-300 font-mono font-extrabold text-[#0B3A63]">{selectedPrintPlano.codigo}</div>
                  <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Data de Registro:</div>
                  <div className="p-2 border-b border-slate-300">{formatDateBR(selectedPrintPlano.dataCriacao)}</div>

                  <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Título da Capa:</div>
                  <div className="p-2 border-r border-b border-slate-300 font-extrabold col-span-3">{selectedPrintPlano.titulo}</div>

                  <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Setor:</div>
                  <div className="p-2 border-r border-b border-slate-300 font-semibold">{selectedPrintPlano.setor}</div>
                  <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Coordenador Geral:</div>
                  <div className="p-2 border-b border-slate-300 font-semibold">{selectedPrintPlano.coordenador || selectedPrintPlano.quem || 'Líder SGQ'}</div>

                  <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Status Geral:</div>
                  <div className="p-2 border-r border-b border-slate-300 font-bold">{printStats.statusConsolidado}</div>
                  <div className="p-2 border-r border-b border-slate-300 bg-slate-50 font-bold">Investimento Total:</div>
                  <div className="p-2 border-b border-slate-300 font-mono font-extrabold text-emerald-700">
                    R$ {printStats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {selectedPrintPlano.objetivo && (
                    <>
                      <div className="p-2 border-r border-slate-300 bg-slate-50 font-bold">Objetivo & Eficácia:</div>
                      <div className="p-2 border-slate-300 col-span-3 text-[11px] leading-relaxed italic">{selectedPrintPlano.objetivo}</div>
                    </>
                  )}
                </div>

                {/* 5W2H Actions Table */}
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                    Ações Executivas 5W2H ({printActions.length} {printActions.length === 1 ? 'Ação Vinculada' : 'Ações Vinculadas'})
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider">
                        <th className="p-2 border border-slate-400 w-8 text-center">#</th>
                        <th className="p-2 border border-slate-400 min-w-[200px]">WHAT (O quê?) / WHY (Por quê?) / HOW (Como?)</th>
                        <th className="p-2 border border-slate-400 min-w-[100px]">WHERE (Onde?)</th>
                        <th className="p-2 border border-slate-400 min-w-[110px]">WHO (Quem?)</th>
                        <th className="p-2 border border-slate-400 min-w-[90px] text-center">WHEN (Prazo)</th>
                        <th className="p-2 border border-slate-400 min-w-[90px] text-right">HOW MUCH</th>
                        <th className="p-2 border border-slate-400 min-w-[85px] text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {printActions.map((act, idx) => (
                        <tr key={act.id || idx} className="align-top">
                          <td className="p-2 border border-slate-300 font-mono font-bold text-center bg-slate-50">
                            {act.itemNumero || idx + 1}
                          </td>
                          <td className="p-2 border border-slate-300 space-y-1">
                            <strong className="block text-slate-900">{act.oQue}</strong>
                            {act.porQue && (
                              <p className="text-[10px] text-slate-600"><span className="font-semibold">Por quê:</span> {act.porQue}</p>
                            )}
                            {act.como && (
                              <p className="text-[10px] text-slate-600"><span className="font-semibold">Como:</span> {act.como}</p>
                            )}
                          </td>
                          <td className="p-2 border border-slate-300 text-slate-700">{act.onde || '—'}</td>
                          <td className="p-2 border border-slate-300 font-semibold">{act.quem}</td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                            {formatDateBR(act.quando)}
                            {act.historicoPrazos && act.historicoPrazos.length > 0 && (
                              <span className="block text-[8.5px] font-sans font-bold text-amber-700">
                                (Prorrogado {act.historicoPrazos.length}x)
                              </span>
                            )}
                          </td>
                          <td className="p-2 border border-slate-300 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                            R$ {(Number(act.quantoCusta) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border border-slate-300 text-center">
                            <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {act.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-900 text-[10px]">
                      <tr>
                        <td colSpan={4} className="p-2 border border-slate-300 text-right">Totais Consolidados:</td>
                        <td className="p-2 border border-slate-300 text-center">{printStats.total} ações</td>
                        <td className="p-2 border border-slate-300 text-right font-mono text-emerald-700 whitespace-nowrap">
                          R$ {printStats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 border border-slate-300 text-center text-emerald-700">
                          {printStats.concluidas}/{printStats.acoesAtivas > 0 ? printStats.acoesAtivas : printStats.total} ({printStats.percent}%)
                          {printStats.planejadas > 0 && <span className="block text-[9px] text-blue-600 font-normal">[{printStats.planejadas} plan.]</span>}
                          {printStats.canceladas > 0 && <span className="block text-[9px] text-slate-500 font-normal">[{printStats.canceladas} canc.]</span>}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Sign-off section */}
                <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
                  <div className="text-center space-y-6">
                    <div className="border-t border-slate-500 w-4/5 mx-auto"></div>
                    <div>
                      <p className="font-bold">{selectedPrintPlano.coordenador || selectedPrintPlano.quem || 'Coordenador do Plano'}</p>
                      <p className="text-[10px] text-slate-500">Coordenador / Responsável pela Execução</p>
                    </div>
                  </div>
                  <div className="text-center space-y-6">
                    <div className="border-t border-slate-500 w-4/5 mx-auto"></div>
                    <div>
                      <p className="font-bold">{user?.name ? `${user.name} (SGQ)` : 'Gestão da Qualidade Vickytex'}</p>
                      <p className="text-[10px] text-slate-500">Gestão da Qualidade Vickytex (ISO 9001:2015)</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Print trigger footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-2 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handlePrintPlano}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Documento Oficial</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE AÇÃO INDIVIDUAL 5W2H */}
      {actionToDelete && (
        <div id="delete-action-modal-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-150 dark:border-slate-800">
              <div className={`p-2.5 rounded-full shrink-0 ${actionToDelete.isOnlyAction ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                {actionToDelete.isOnlyAction ? <AlertCircle className="w-6 h-6 animate-pulse" /> : <Trash2 className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {actionToDelete.isOnlyAction ? 'Excluir Plano de Ação Completo?' : 'Confirmar Exclusão da Ação 5W2H'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {actionToDelete.plano.codigo} - {actionToDelete.plano.titulo}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              {actionToDelete.isOnlyAction ? (
                <div className="space-y-2">
                  <p className="leading-relaxed">
                    Esta é a <strong>única ação executiva</strong> vinculada a este plano. Pela metodologia SGQ ISO 9001 (Cláusula 10.2), um plano de tratativa não pode existir sem ações.
                  </p>
                  <p className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    Deseja excluir permanentemente o plano <strong>{actionToDelete.plano.codigo}</strong> por completo do sistema?
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="leading-relaxed">
                    Tem certeza de que deseja remover esta ação executiva do plano?
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-3 rounded-xl space-y-1.5 font-medium">
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                      #{actionToDelete.action.itemNumero || 1} - {actionToDelete.action.oQue}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Responsável: <strong className="text-slate-700 dark:text-slate-300">{actionToDelete.action.quem}</strong></span>
                      <span>•</span>
                      <span>Prazo: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatDateBR(actionToDelete.action.quando)}</strong></span>
                      {Number(actionToDelete.action.quantoCusta) > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 font-mono font-bold">R$ {Number(actionToDelete.action.quantoCusta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                    Esta remoção recalculará o custo consolidado e o progresso do plano.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-150 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActionToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAction}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  actionToDelete.isOnlyAction 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionToDelete.isOnlyAction ? 'Sim, Excluir Plano Completo' : 'Sim, Remover Ação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO DE REPACTUAÇÃO DE PRAZOS DA AÇÃO (ISO 9001) */}
      {viewingHistoryAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold">Histórico de Repactuação de Prazo</h3>
                  <p className="text-[10px] text-blue-200">ISO 9001:2015 — Cláusulas 6.3 & 7.5 (Rastreabilidade)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingHistoryAction(null)}
                className="text-white/60 hover:text-white font-mono text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Ação #{viewingHistoryAction.itemNumero || 1}: {viewingHistoryAction.oQue}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Responsável: <strong className="text-slate-700 dark:text-slate-300">{viewingHistoryAction.quem}</strong></span>
                  <span>•</span>
                  <span>Prazo Vigente: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatDateBR(viewingHistoryAction.quando)}</strong></span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Registro Auditável de Prorrogações ({viewingHistoryAction.historicoPrazos?.length || 0})
                </h4>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {viewingHistoryAction.historicoPrazos && viewingHistoryAction.historicoPrazos.length > 0 ? (
                    viewingHistoryAction.historicoPrazos.map((hist, idx) => (
                      <div key={hist.id || idx} className="relative space-y-1.5 text-xs">
                        <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900"></div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{hist.alteradoPor}</span>
                          <span className="font-mono text-[10px]">{new Date(hist.alteradoEm).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold">
                          <span className="text-slate-400 line-through">{formatDateBR(hist.prazoAnterior)}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{formatDateBR(hist.novoPrazo)}</span>
                        </div>
                        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-slate-700 dark:text-slate-300 text-xs">
                          <span className="text-[9px] font-bold text-amber-800 dark:text-amber-400 block uppercase">Motivo / Justificativa Técnica:</span>
                          <p className="mt-1 font-medium leading-relaxed">"{hist.justificativa}"</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhuma repactuação registrada nesta ação.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-150 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingHistoryAction(null)}
                className="px-4 py-2 bg-[#0B3A63] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
