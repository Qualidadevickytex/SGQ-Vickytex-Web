/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  History,
  MessageSquare,
  Paperclip,
  Upload,
  Download,
  ExternalLink,
  File,
  Image,
  Eye,
  Send
} from 'lucide-react';
import { 
  Documento, 
  Auditoria, 
  NaoConformidade, 
  SectorType, 
  PlanoAcao, 
  ItemAcao5W2H, 
  HistoricoPrazoAcao,
  ComentarioAcao,
  EvidenciaAcao
} from '../types';
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

export const formatDateTimeBR = (isoStr?: string): string => {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const normalizeToISO = (dateStr?: string): string => {
  if (!dateStr) return '';
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD -> YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
  }
  return clean;
};

export const isDateOverdue = (deadlineStr?: string, status?: string): boolean => {
  if (!deadlineStr) return false;
  if (status === 'Concluído' || status === 'Cancelada') return false;
  const todayISO = getLocalDateISO();
  const isoDeadline = normalizeToISO(deadlineStr);
  if (!isoDeadline) return false;
  return isoDeadline < todayISO;
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
  const [sortBy, setSortBy] = useState<'codigo_asc' | 'codigo_desc' | 'prazo_asc' | 'data_desc'>('codigo_asc');
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

  // Estados para Conclusão de Ação com Evidência & Comentários
  const [actionToConclude, setActionToConclude] = useState<{
    plano: PlanoAcao;
    action: ItemAcao5W2H;
  } | null>(null);
  const [conclusaoData, setConclusaoData] = useState(getLocalDateISO());
  const [conclusaoResponsavel, setConclusaoResponsavel] = useState('');
  const [conclusaoComentario, setConclusaoComentario] = useState('');
  const [conclusaoEvidencias, setConclusaoEvidencias] = useState<EvidenciaAcao[]>([]);
  const [isAddingLinkConclusao, setIsAddingLinkConclusao] = useState(false);
  const [linkConclusaoNome, setLinkConclusaoNome] = useState('');
  const [linkConclusaoUrl, setLinkConclusaoUrl] = useState('');

  // Estados para Comentários & Acompanhamento de Ação
  const [actionCommentsModal, setActionCommentsModal] = useState<{
    plano: PlanoAcao;
    action: ItemAcao5W2H;
  } | null>(null);
  const [commentsModalTab, setCommentsModalTab] = useState<'comentarios' | 'evidencias'>('comentarios');
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingLinkInComments, setIsAddingLinkInComments] = useState(false);
  const [linkCommentNome, setLinkCommentNome] = useState('');
  const [linkCommentUrl, setLinkCommentUrl] = useState('');
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null);

  // Visualizador de Evidência
  const [previewEvidence, setPreviewEvidence] = useState<EvidenciaAcao | null>(null);
  const [evidenceUploadError, setEvidenceUploadError] = useState<string | null>(null);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const [actionItemForm, setActionItemForm] = useState({
    oQue: '',
    porQue: '',
    onde: '',
    quando: getLocalDateISO(),
    quem: '',
    como: '',
    quantoCusta: 0,
    status: 'Planejado' as 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada',
    concluidoEm: '',
    concluidoPor: '',
    comentarioConclusao: '',
    evidencias: [] as EvidenciaAcao[]
  });

  // Processar upload de arquivo para Evidência com validação segura
  const handleProcessFileUpload = (
    file: File, 
    onSuccess: (newEv: EvidenciaAcao) => void
  ) => {
    setEvidenceUploadError(null);
    if (file.size > 5 * 1024 * 1024) {
      setEvidenceUploadError('O arquivo selecionado excede o limite máximo permitido de 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const isImage = file.type.startsWith('image/');
      const newEv: EvidenciaAcao = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        nome: file.name,
        url,
        tipo: isImage ? 'imagem' : 'documento',
        tamanho: file.size,
        adicionadoEm: new Date().toISOString(),
        adicionadoPor: user?.name ? `${user.name} (${user.role || 'SGQ'})` : 'Usuário Vickytex'
      };
      onSuccess(newEv);
    };
    reader.onerror = () => {
      setEvidenceUploadError('Não foi possível ler o arquivo. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  // Obter ações filhas da Capa (com garantia de ordenação e numeração sequencial 1, 2, 3...)
  const getPlanActions = (plano: PlanoAcao): ItemAcao5W2H[] => {
    if (Array.isArray(plano.acoes) && plano.acoes.length > 0) {
      const sorted = [...plano.acoes].sort((a, b) => {
        const numA = typeof a.itemNumero === 'number' && a.itemNumero > 0 ? a.itemNumero : 9999;
        const numB = typeof b.itemNumero === 'number' && b.itemNumero > 0 ? b.itemNumero : 9999;
        return numA - numB;
      });
      return sorted.map((act, idx) => ({
        ...act,
        itemNumero: idx + 1
      }));
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

    // Identificar ações ativas em atraso
    const acoesAtrasadas = actions.filter(a => isDateOverdue(a.quando, a.status)).length;
    const temAcoesAtrasadas = acoesAtrasadas > 0;

    // O plano é considerado em atraso se seu prazo estiver vencido OU contiver ações ativas em atraso
    const isPlanoVencido = (isDateOverdue(prazoFinal, statusConsolidado) || temAcoesAtrasadas) &&
      statusConsolidado !== 'Concluído' &&
      statusConsolidado !== 'Cancelada';

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
      statusConsolidado,
      acoesAtrasadas,
      temAcoesAtrasadas,
      isPlanoVencido
    };
  };

  const handlePrintPlano = () => {
    if (!selectedPrintPlano) return;
    
    // Remover iframe anterior se existir
    const existingIframe = document.getElementById('print-5w2h-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }
    
    const iframe = document.createElement('iframe');
    iframe.id = 'print-5w2h-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;
    
    const stats = getPlanStats(selectedPrintPlano);
    const actions = stats.actions;
    const relDoc = documents.find(d => d.id === selectedPrintPlano.documentoId);
    const relAudit = audits.find(a => a.id === selectedPrintPlano.auditoriaId);
    const relNC = ncs.find(n => n.id === selectedPrintPlano.naoConformidadeId);
    
    const coordName = selectedPrintPlano.coordenador || selectedPrintPlano.quem || 'Coordenador do Plano';
    const isCoordAlsoSGQ = user?.name && (user.name.toLowerCase().trim() === coordName.toLowerCase().trim());
    const sgqApproverName = isCoordAlsoSGQ ? 'Gestão da Qualidade Vickytex' : (user?.name ? `${user.name} (SGQ)` : 'Gestão da Qualidade Vickytex');

    const actionsHtml = actions.length > 0 ? actions.map((act, idx) => `
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: bold; background: #f8fafc; font-size: 11px;">${act.itemNumero || idx + 1}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
          <div style="font-weight: 700; color: #0f172a; font-size: 11.5px;">${act.oQue}</div>
          ${act.porQue ? `<div style="font-size: 10px; color: #475569; margin-top: 2px;"><strong>Por quê:</strong> ${act.porQue}</div>` : ''}
          ${act.como ? `<div style="font-size: 10px; color: #475569; margin-top: 2px;"><strong>Como:</strong> ${act.como}</div>` : ''}
        </td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px; color: #334155;">${act.onde || '—'}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 11px; color: #0f172a;">${act.quem}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; font-family: 'JetBrains Mono', monospace; white-space: nowrap;">
          ${formatDateBR(act.quando)}
          ${act.historicoPrazos && act.historicoPrazos.length > 0 ? `<div style="font-size: 8.5px; color: #b45309; font-weight: bold; margin-top: 2px; font-family: sans-serif;">(Prorrogado ${act.historicoPrazos.length}x)</div>` : ''}
        </td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: bold; font-size: 11px; color: #0f172a; white-space: nowrap;">
          R$ ${(Number(act.quantoCusta) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px; font-weight: bold;">
          <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; ${
            act.status === 'Concluído' ? 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;' :
            act.status === 'Em Andamento' ? 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;' :
            act.status === 'Cancelada' ? 'background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;' :
            'background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;'
          }">
            ${act.status}
          </span>
        </td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="7" style="padding: 16px; text-align: center; color: #64748b; font-style: italic; border: 1px solid #cbd5e1;">Nenhuma ação executiva cadastrada para este plano.</td>
      </tr>
    `;

    const content = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>Plano de Ação 5W2H - ${selectedPrintPlano.codigo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            @page {
              size: A4 landscape;
              margin: 8mm 10mm 8mm 10mm;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              padding: 0;
              margin: 0;
              font-size: 11px;
              line-height: 1.35;
            }

            .sheet {
              width: 100%;
              max-width: 100%;
            }

            .header-table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #0f172a;
              margin-bottom: 8px;
            }

            .header-table td {
              padding: 8px 12px;
              vertical-align: middle;
            }

            .logo-box {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .logo-badge {
              width: 36px;
              height: 36px;
              background-color: #0b3a63;
              color: #ffffff;
              font-weight: 900;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              border-radius: 4px;
              letter-spacing: -0.5px;
            }

            .company-name {
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.2px;
            }

            .company-sub {
              font-size: 8.5px;
              color: #475569;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.4px;
            }

            .title-box {
              text-align: center;
            }

            .doc-title {
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }

            .doc-sub {
              font-size: 9px;
              color: #64748b;
              font-weight: 600;
              margin-top: 1px;
            }

            .meta-box {
              text-align: right;
              font-size: 9.5px;
            }

            .meta-code {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              font-weight: 800;
              background-color: #0f172a;
              color: #ffffff;
              padding: 2px 7px;
              border-radius: 3px;
              display: inline-block;
            }

            .meta-norm {
              font-size: 8.5px;
              color: #475569;
              font-weight: 700;
              margin-top: 3px;
            }

            .grid-capa {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #94a3b8;
              margin-bottom: 8px;
              font-size: 10px;
            }

            .grid-capa td {
              border: 1px solid #cbd5e1;
              padding: 5px 8px;
            }

            .lbl {
              background-color: #f8fafc;
              font-weight: 700;
              color: #334155;
              width: 15%;
            }

            .val {
              color: #0f172a;
              width: 35%;
            }

            .val-bold {
              font-weight: 700;
              color: #0f172a;
            }

            .val-mono {
              font-family: 'JetBrains Mono', monospace;
              font-weight: 700;
            }

            .section-title {
              font-size: 10px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              margin: 8px 0 5px 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .table-5w2h {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #0f172a;
              margin-bottom: 10px;
            }

            .table-5w2h th {
              background-color: #0f172a;
              color: #ffffff;
              padding: 5px 7px;
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              border: 1px solid #334155;
            }

            .table-5w2h tfoot td {
              background-color: #f8fafc;
              font-weight: 700;
              border: 1px solid #cbd5e1;
              padding: 5px 7px;
              font-size: 9.5px;
            }

            .signatures-box {
              width: 100%;
              margin-top: 10px;
              page-break-inside: avoid;
            }

            .sign-table {
              width: 100%;
              border-collapse: collapse;
            }

            .sign-table td {
              width: 50%;
              padding: 0 30px;
              text-align: center;
              vertical-align: bottom;
            }

            .sign-line {
              border-top: 1px solid #475569;
              width: 80%;
              margin: 0 auto 5px auto;
            }

            .sign-title {
              font-size: 10.5px;
              font-weight: 800;
              color: #0f172a;
            }

            .sign-subtitle {
              font-size: 9px;
              color: #64748b;
              margin-top: 1px;
            }

            .footer-note {
              margin-top: 10px;
              padding: 5px 8px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 4px;
              font-size: 8px;
              color: #64748b;
              text-align: center;
              line-height: 1.3;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <!-- Header Table -->
            <table class="header-table">
              <tr>
                <td style="width: 33%;">
                  <div class="logo-box">
                    <div class="logo-badge">VI</div>
                    <div>
                      <div class="company-name">VICKYTEX INDÚSTRIA TÊXTIL</div>
                      <div class="company-sub">SISTEMA DE GESTÃO DA QUALIDADE</div>
                    </div>
                  </div>
                </td>
                <td style="width: 43%;">
                  <div class="title-box">
                    <div class="doc-title">PLANO DE AÇÃO 5W2H</div>
                    <div class="doc-sub">Tratativa de Não Conformidades, Riscos & Oportunidades</div>
                  </div>
                </td>
                <td style="width: 24%;">
                  <div class="meta-box">
                    <div class="meta-code">${selectedPrintPlano.codigo}</div>
                    <div class="meta-norm">ISO 9001:2015 — Cláusula 10.2</div>
                    <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">Emissão: ${formatDateBR(selectedPrintPlano.dataCriacao)}</div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Capa Grid Table -->
            <table class="grid-capa">
              <tr>
                <td class="lbl">Código Mestre:</td>
                <td class="val val-mono" style="color: #0b3a63;">${selectedPrintPlano.codigo}</td>
                <td class="lbl">Data de Registro:</td>
                <td class="val val-mono">${formatDateBR(selectedPrintPlano.dataCriacao)}</td>
              </tr>
              <tr>
                <td class="lbl">Título da Capa:</td>
                <td class="val val-bold" colspan="3">${selectedPrintPlano.titulo}</td>
              </tr>
              <tr>
                <td class="lbl">Setor Responsável:</td>
                <td class="val val-bold">${selectedPrintPlano.setor}</td>
                <td class="lbl">Coordenador Geral:</td>
                <td class="val val-bold">${coordName}</td>
              </tr>
              <tr>
                <td class="lbl">Prazo Limite:</td>
                <td class="val val-mono">${stats.prazoFinal ? formatDateBR(stats.prazoFinal) : '-'}</td>
                <td class="lbl">Investimento Total:</td>
                <td class="val val-mono" style="color: #15803d;">R$ ${stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td class="lbl">Status Consolidado:</td>
                <td class="val" colspan="3">
                  <span style="font-weight: 800; font-size: 9.5px; padding: 2px 7px; border-radius: 4px; ${
                    stats.statusConsolidado === 'Concluído' ? 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;' :
                    stats.statusConsolidado === 'Em Andamento' ? 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;' :
                    stats.statusConsolidado === 'Cancelada' ? 'background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;' :
                    'background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;'
                  }">
                    ${stats.statusConsolidado}
                  </span>
                </td>
              </tr>
              ${selectedPrintPlano.objetivo ? `
                <tr>
                  <td class="lbl">Objetivo & Eficácia:</td>
                  <td class="val" colspan="3" style="font-style: italic; color: #1e293b; background-color: #f8fafc; font-size: 9.5px; line-height: 1.35;">
                    ${selectedPrintPlano.objetivo}
                  </td>
                </tr>
              ` : ''}
              ${(relDoc || relAudit || relNC) ? `
                <tr>
                  <td class="lbl">Rastreabilidade:</td>
                  <td class="val" colspan="3" style="font-size: 9px;">
                    ${relDoc ? `<span style="margin-right: 12px;"><strong>📄 Documento:</strong> ${relDoc.codigo} - ${relDoc.titulo}</span>` : ''}
                    ${relAudit ? `<span style="margin-right: 12px;"><strong>🔍 Auditoria:</strong> ${relAudit.codigo} - ${relAudit.titulo}</span>` : ''}
                    ${relNC ? `<span><strong>⚠️ RNC:</strong> ${relNC.codigo} - ${relNC.titulo}</span>` : ''}
                  </td>
                </tr>
              ` : ''}
            </table>

            <!-- Section Title -->
            <div class="section-title">
              <span>Ações Executivas 5W2H (${actions.length} ${actions.length === 1 ? 'Ação Vinculada' : 'Ações Vinculadas'})</span>
              <span style="font-size: 8.5px; font-weight: 600; color: #64748b; text-transform: none;">Metodologia 5W2H — SGQ Vickytex</span>
            </div>

            <!-- Table 5W2H -->
            <table class="table-5w2h">
              <thead>
                <tr>
                  <th style="width: 28px; text-align: center;">#</th>
                  <th>O QUÊ / POR QUÊ / COMO (What / Why / How)</th>
                  <th style="width: 100px;">ONDE (Where)</th>
                  <th style="width: 110px;">QUEM (Who)</th>
                  <th style="width: 85px; text-align: center;">QUANDO (Prazo)</th>
                  <th style="width: 90px; text-align: right;">CUSTO (R$)</th>
                  <th style="width: 85px; text-align: center;">STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${actionsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right; padding-right: 10px; font-weight: 800;">Totais Consolidados:</td>
                  <td style="text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: bold;">${stats.total} ${stats.total === 1 ? 'ação' : 'ações'}</td>
                  <td style="text-align: right; font-family: 'JetBrains Mono', monospace; color: #15803d; font-weight: 800;">
                    R$ ${stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style="text-align: center; color: #166534; font-weight: 800;">
                    ${stats.concluidas}/${stats.acoesAtivas > 0 ? stats.acoesAtivas : stats.total} (${stats.percent}%)
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Signatures -->
            <div class="signatures-box">
              <table class="sign-table">
                <tr>
                  <td>
                    <div class="sign-line"></div>
                    <div class="sign-title">${coordName}</div>
                    <div class="sign-subtitle">Coordenador / Responsável pela Execução</div>
                  </td>
                  <td>
                    <div class="sign-line"></div>
                    <div class="sign-title">${sgqApproverName}</div>
                    <div class="sign-subtitle">Gestão da Qualidade Vickytex (ISO 9001:2015)</div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Footer note -->
            <div class="footer-note">
              Este documento é uma informação documentada oficial do SGQ Vickytex Indústria Têxtil Ltda., em conformidade com as cláusulas 6.1 e 10.2 da norma ABNT NBR ISO 9001:2015. 
              Impresso em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
            </div>
          </div>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(content);
    iframeDoc.close();
    
    // Aguardar renderização das fontes e disparar impressão isolada do iframe
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Erro ao acionar impressão:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 250);
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

  // Obter próximo código sequencial garantindo continuidade mesmo com exclusões (ex: PA-2026-001, 002, 003...)
  const getNextPlanoCode = (planosList: PlanoAcao[]): string => {
    const currentYear = new Date().getFullYear();
    let maxNum = 0;
    planosList.forEach(p => {
      if (!p.codigo) return;
      const match = p.codigo.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    return `PA-${currentYear}-${formattedNum}`;
  };

  // Limpar formulário para novo plano (Capa)
  const handleOpenNewPlano = () => {
    const autoCodigo = getNextPlanoCode(planos);
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
    const newAcoes = [...formPlano.acoes, newAct].map((a, idx) => ({
      ...a,
      itemNumero: idx + 1
    }));
    setFormPlano({ ...formPlano, acoes: newAcoes });
  };

  const handleRemoveCapaAction = (index: number) => {
    if (formPlano.acoes.length <= 1) {
      setCapaFormFeedback('A Capa do Plano deve conter pelo menos uma ação 5W2H.');
      return;
    }
    setCapaFormFeedback(null);
    const newAcoes = formPlano.acoes
      .filter((_, idx) => idx !== index)
      .map((a, idx) => ({ ...a, itemNumero: idx + 1 }));
    setFormPlano({ ...formPlano, acoes: newAcoes });
  };

  // Salvar Capa (novo ou editado)
  const handleSubmitPlano = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlano.codigo || !formPlano.titulo || !formPlano.coordenador) {
      setCapaFormFeedback('Por favor, preencha o Código, Título da Capa e Coordenador Responsável (*).');
      return;
    }

    // Filtrar ações válidas e reindexar sequencialmente (1, 2, 3...)
    const validActions = formPlano.acoes
      .filter(a => a.oQue.trim().length > 0)
      .map((a, idx) => ({ ...a, itemNumero: idx + 1 }));
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

  // Alternar o status de uma ação individual (intercepta Concluído para solicitar evidências)
  const handleToggleActionStatus = (planoId: string, actionId: string, newStatus: 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada') => {
    const plano = planos.find(p => p.id === planoId);
    if (!plano) return;
    const currentActions = getPlanActions(plano);
    const action = currentActions.find(a => a.id === actionId);
    if (!action) return;

    if (newStatus === 'Concluído') {
      // Abre modal de conclusão para registro de parecer, data e evidências
      setActionToConclude({ plano, action });
      setConclusaoData(getLocalDateISO());
      setConclusaoResponsavel(user?.name || action.quem || plano.coordenador || 'Responsável');
      setConclusaoComentario(action.comentarioConclusao || '');
      setConclusaoEvidencias(action.evidencias ? [...action.evidencias] : []);
      setIsAddingLinkConclusao(false);
      setLinkConclusaoNome('');
      setLinkConclusaoUrl('');
      return;
    }

    const updatedActions = currentActions.map(a => a.id === actionId ? { 
      ...a, 
      status: newStatus,
      concluidoEm: undefined
    } : a);

    applyUpdatedActionsToPlano(plano, updatedActions, `Status da ação #${action.itemNumero} no plano ${plano.codigo} alterado para "${newStatus}".`);
  };

  // Aplicar ações atualizadas ao Plano de Ação
  const applyUpdatedActionsToPlano = (plano: PlanoAcao, updatedActions: ItemAcao5W2H[], logMsg: string) => {
    const totalCost = updatedActions.reduce((acc, a) => acc + (Number(a.quantoCusta) || 0), 0);
    const allCancelled = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Cancelada');
    const allConcluded = updatedActions.length > 0 && updatedActions.every(a => a.status === 'Concluído' || a.status === 'Cancelada');
    const isUnderway = updatedActions.some(a => a.status === 'Em Andamento' || a.status === 'Concluído');
    const statusFinal = allCancelled ? 'Cancelada' : (allConcluded ? 'Concluído' : (isUnderway ? 'Em Andamento' : 'Planejado'));

    const reindexed = updatedActions.map((a, idx) => ({ ...a, itemNumero: idx + 1 }));

    const updatedPlano: PlanoAcao = {
      ...plano,
      acoes: reindexed,
      quantoCusta: totalCost,
      status: statusFinal
    };

    onUpdatePlano(updatedPlano);
    onAddLog('Atualizou Ação 5W2H', logMsg, plano.documentoId);
  };

  // Salvar conclusão da ação com parecer e evidências
  const handleConfirmConclusaoAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionToConclude) return;
    const { plano, action } = actionToConclude;

    const currentActions = getPlanActions(plano);
    
    // Se o usuário escreveu um comentário de conclusão, registra também no histórico de comentários
    let updatedComments = action.comentarios ? [...action.comentarios] : [];
    if (conclusaoComentario.trim()) {
      const commentEntry: ComentarioAcao = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        texto: `[Conclusão da Ação] ${conclusaoComentario.trim()}`,
        criadoEm: new Date().toISOString(),
        criadoPor: conclusaoResponsavel.trim() || user?.name || 'Responsável',
        cargoOuSetor: user?.role || user?.sector || 'SGQ'
      };
      updatedComments.push(commentEntry);
    }

    const updatedActions = currentActions.map(a => a.id === action.id ? {
      ...a,
      status: 'Concluído' as const,
      concluidoEm: conclusaoData,
      concluidoPor: conclusaoResponsavel.trim() || user?.name || action.quem,
      comentarioConclusao: conclusaoComentario.trim(),
      evidencias: conclusaoEvidencias,
      comentarios: updatedComments
    } : a);

    applyUpdatedActionsToPlano(
      plano, 
      updatedActions, 
      `Concluiu ação #${action.itemNumero} (${action.oQue}) com ${conclusaoEvidencias.length} evidência(s) anexada(s) no plano ${plano.codigo}.`
    );

    setActionToConclude(null);
  };

  // Adicionar Link Externo como Evidência no modal de conclusão
  const handleAddLinkInConclusao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkConclusaoUrl.trim()) return;
    const newEv: EvidenciaAcao = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nome: linkConclusaoNome.trim() || 'Link Externo / Documentação',
      url: linkConclusaoUrl.trim(),
      tipo: 'link',
      adicionadoEm: new Date().toISOString(),
      adicionadoPor: user?.name ? `${user.name} (${user.role || 'SGQ'})` : 'Usuário Vickytex'
    };
    setConclusaoEvidencias(prev => [...prev, newEv]);
    setLinkConclusaoNome('');
    setLinkConclusaoUrl('');
    setIsAddingLinkConclusao(false);
  };

  // Remover Evidência da lista no modal de conclusão
  const handleRemoveEvidenceFromConclusao = (evId: string) => {
    setConclusaoEvidencias(prev => prev.filter(e => e.id !== evId));
  };

  // Adicionar comentário livre em uma ação a qualquer momento
  const handleAddActionComment = () => {
    if (!actionCommentsModal || !newCommentText.trim()) return;
    const { plano, action } = actionCommentsModal;

    const currentActions = getPlanActions(plano);
    const newComment: ComentarioAcao = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      texto: newCommentText.trim(),
      criadoEm: new Date().toISOString(),
      criadoPor: user?.name ? `${user.name}` : 'Usuário SGQ',
      cargoOuSetor: user?.role || user?.sector || 'SGQ'
    };

    const targetAction = currentActions.find(a => a.id === action.id);
    const updatedComments = [...(targetAction?.comentarios || []), newComment];

    const updatedActions = currentActions.map(a => a.id === action.id ? {
      ...a,
      comentarios: updatedComments
    } : a);

    applyUpdatedActionsToPlano(
      plano,
      updatedActions,
      `Novo comentário na ação #${action.itemNumero} do plano ${plano.codigo}.`
    );

    const freshAction = updatedActions.find(a => a.id === action.id) || {
      ...action,
      comentarios: updatedComments
    };

    setActionCommentsModal({
      plano,
      action: freshAction
    });
    setNewCommentText('');
  };

  // Excluir comentário de uma ação
  const handleDeleteActionComment = (commentId: string) => {
    if (!actionCommentsModal) return;
    const { plano, action } = actionCommentsModal;

    const currentActions = getPlanActions(plano);
    const targetAction = currentActions.find(a => a.id === action.id);
    const commentToDelete = (targetAction?.comentarios || []).find(c => c.id === commentId);
    const updatedComments = (targetAction?.comentarios || []).filter(c => c.id !== commentId);

    // Se o comentário excluído for o mesmo do parecer de conclusão, limpa também o comentarioConclusao
    const isConclusionComment = Boolean(
      commentToDelete && 
      targetAction?.comentarioConclusao && 
      (commentToDelete.texto.includes(targetAction.comentarioConclusao) || 
       targetAction.comentarioConclusao.includes(commentToDelete.texto.replace(/^\[Conclusão da Ação\]\s*/, '')))
    );

    const updatedActions = currentActions.map(a => a.id === action.id ? {
      ...a,
      comentarios: updatedComments,
      comentarioConclusao: isConclusionComment ? '' : a.comentarioConclusao
    } : a);

    applyUpdatedActionsToPlano(
      plano,
      updatedActions,
      `Comentário excluído da ação #${action.itemNumero} do plano ${plano.codigo}.`
    );

    const freshAction = updatedActions.find(a => a.id === action.id) || {
      ...action,
      comentarios: updatedComments,
      comentarioConclusao: isConclusionComment ? '' : action.comentarioConclusao
    };

    setActionCommentsModal({
      plano: { ...plano, acoes: updatedActions },
      action: freshAction
    });
  };

  // Excluir comentário da ação enquanto está aberta no modal de edição
  const handleDeleteCommentFromEditingAction = (commentId: string) => {
    if (!editingActionItem || !actionItemTargetPlanoId) return;
    const plano = planos.find(p => p.id === actionItemTargetPlanoId);
    if (!plano) return;

    const currentActions = getPlanActions(plano);
    const updatedComments = (editingActionItem.comentarios || []).filter(c => c.id !== commentId);
    
    const updatedEditingAction: ItemAcao5W2H = {
      ...editingActionItem,
      comentarios: updatedComments
    };
    setEditingActionItem(updatedEditingAction);

    const updatedActions = currentActions.map(a => a.id === editingActionItem.id ? {
      ...a,
      comentarios: updatedComments
    } : a);

    applyUpdatedActionsToPlano(
      plano,
      updatedActions,
      `Comentário excluído da ação #${editingActionItem.itemNumero || 1} do plano ${plano.codigo}.`
    );
  };

  // Adicionar evidência avulsa pelo modal de comentários/acompanhamento
  const handleAddEvidenceInCommentsModal = (novaEvidencia: EvidenciaAcao) => {
    if (!actionCommentsModal) return;
    const { plano, action } = actionCommentsModal;

    const currentActions = getPlanActions(plano);
    const targetAction = currentActions.find(a => a.id === action.id);
    const updatedEvidencias = [...(targetAction?.evidencias || []), novaEvidencia];

    const updatedActions = currentActions.map(a => a.id === action.id ? {
      ...a,
      evidencias: updatedEvidencias
    } : a);

    applyUpdatedActionsToPlano(
      plano,
      updatedActions,
      `Nova evidência "${novaEvidencia.nome}" vinculada à ação #${action.itemNumero} do plano ${plano.codigo}.`
    );

    const freshAction = updatedActions.find(a => a.id === action.id) || {
      ...action,
      evidencias: updatedEvidencias
    };

    setActionCommentsModal({
      plano,
      action: freshAction
    });
  };

  // Adicionar Link Externo como Evidência pelo modal de comentários
  const handleAddLinkInComments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCommentUrl.trim()) return;
    const newEv: EvidenciaAcao = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nome: linkCommentNome.trim() || 'Link Externo / Documentação',
      url: linkCommentUrl.trim(),
      tipo: 'link',
      adicionadoEm: new Date().toISOString(),
      adicionadoPor: user?.name ? `${user.name} (${user.role || 'SGQ'})` : 'Usuário Vickytex'
    };
    handleAddEvidenceInCommentsModal(newEv);
    setLinkCommentNome('');
    setLinkCommentUrl('');
    setIsAddingLinkInComments(false);
  };

  // Remover evidência de uma ação
  const handleRemoveEvidenceFromAction = (evidenciaId: string) => {
    if (!actionCommentsModal) return;
    const { plano, action } = actionCommentsModal;

    const currentActions = getPlanActions(plano);
    const targetAction = currentActions.find(a => a.id === action.id);
    const updatedEvidencias = (targetAction?.evidencias || []).filter(e => e.id !== evidenciaId);

    const updatedActions = currentActions.map(a => a.id === action.id ? {
      ...a,
      evidencias: updatedEvidencias
    } : a);

    applyUpdatedActionsToPlano(
      plano,
      updatedActions,
      `Evidência removida da ação #${action.itemNumero} do plano ${plano.codigo}.`
    );

    const freshAction = updatedActions.find(a => a.id === action.id) || {
      ...action,
      evidencias: updatedEvidencias
    };

    setActionCommentsModal({
      plano,
      action: freshAction
    });
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
    const updatedActions = currentActions
      .filter(a => a.id !== action.id)
      .map((a, idx) => ({ ...a, itemNumero: idx + 1 }));
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
      status: 'Planejado',
      concluidoEm: '',
      concluidoPor: '',
      comentarioConclusao: '',
      evidencias: []
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
      status: item.status,
      concluidoEm: item.concluidoEm || '',
      concluidoPor: item.concluidoPor || '',
      comentarioConclusao: item.comentarioConclusao || '',
      evidencias: item.evidencias ? [...item.evidencias] : []
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
        concluidoEm: actionItemForm.status === 'Concluído' ? (actionItemForm.concluidoEm || getLocalDateISO()) : undefined,
        concluidoPor: actionItemForm.status === 'Concluído' ? (actionItemForm.concluidoPor || user?.name || editingActionItem.quem) : undefined,
        comentarioConclusao: actionItemForm.comentarioConclusao.trim(),
        evidencias: actionItemForm.evidencias || editingActionItem.evidencias || [],
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
        status: actionItemForm.status,
        concluidoEm: actionItemForm.status === 'Concluído' ? (actionItemForm.concluidoEm || getLocalDateISO()) : undefined,
        concluidoPor: actionItemForm.status === 'Concluído' ? (actionItemForm.concluidoPor || user?.name || '') : undefined,
        comentarioConclusao: actionItemForm.comentarioConclusao.trim(),
        evidencias: actionItemForm.evidencias || [],
        comentarios: []
      };
      updatedActions = [...currentActions, newAction];
    }

    // Garantir reindexação estrita sequencial das ações filhas (1, 2, 3...)
    updatedActions = updatedActions.map((a, idx) => ({
      ...a,
      itemNumero: idx + 1
    }));

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
    const isPlanoOverdue = stats.isPlanoVencido;
    const matchesStatus = selectedStatus === 'Todos' 
      ? true 
      : selectedStatus === 'Atrasado' 
        ? isPlanoOverdue 
        : (stats.statusConsolidado === selectedStatus || plano.status === selectedStatus);

    return matchesSearch && matchesSector && matchesStatus;
  });

  // Extrair número sequencial do código para ordenação natural (ex: PA-2026-001 -> 1, PA-NC-005 -> 5)
  const extractCodeNumber = (code?: string): number => {
    if (!code) return 0;
    const match = code.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Planos ordenados sequencialmente conforme preferência do usuário
  const sortedPlanos = useMemo(() => {
    return [...filteredPlanos].sort((a, b) => {
      if (sortBy === 'codigo_asc') {
        const numA = extractCodeNumber(a.codigo);
        const numB = extractCodeNumber(b.codigo);
        if (numA !== numB) return numA - numB;
        return (a.codigo || '').localeCompare(b.codigo || '');
      }
      if (sortBy === 'codigo_desc') {
        const numA = extractCodeNumber(a.codigo);
        const numB = extractCodeNumber(b.codigo);
        if (numA !== numB) return numB - numA;
        return (b.codigo || '').localeCompare(a.codigo || '');
      }
      if (sortBy === 'prazo_asc') {
        const statsA = getPlanStats(a);
        const statsB = getPlanStats(b);
        return (statsA.prazoFinal || '9999').localeCompare(statsB.prazoFinal || '9999');
      }
      if (sortBy === 'data_desc') {
        return (b.dataCriacao || '').localeCompare(a.dataCriacao || '');
      }
      return 0;
    });
  }, [filteredPlanos, sortBy]);

  // Métricas consolidadas
  const totalInvestido = filteredPlanos.reduce((acc, p) => acc + getPlanStats(p).totalCost, 0);
  const totalAcoesCount = filteredPlanos.reduce((acc, p) => acc + getPlanStats(p).total, 0);
  const totalAcoesAtrasadas = filteredPlanos.reduce((acc, p) => acc + getPlanStats(p).acoesAtrasadas, 0);
  const totalAcoesPlanejadas = filteredPlanos.reduce((acc, p) => acc + getPlanActions(p).filter(a => a.status === 'Planejado' && !isDateOverdue(a.quando, a.status)).length, 0);
  const totalAcoesEmAndamento = filteredPlanos.reduce((acc, p) => acc + getPlanActions(p).filter(a => a.status === 'Em Andamento' && !isDateOverdue(a.quando, a.status)).length, 0);
  const totalAcoesConcluidas = filteredPlanos.reduce((acc, p) => acc + getPlanActions(p).filter(a => a.status === 'Concluído').length, 0);
  const atrasados = filteredPlanos.filter(p => getPlanStats(p).isPlanoVencido).length;
  const concluidos = filteredPlanos.filter(p => getPlanStats(p).statusConsolidado === 'Concluído').length;
  const planejados = filteredPlanos.filter(p => getPlanStats(p).statusConsolidado === 'Planejado' && !getPlanStats(p).isPlanoVencido).length;
  const emAndamento = filteredPlanos.filter(p => getPlanStats(p).statusConsolidado === 'Em Andamento' && !getPlanStats(p).isPlanoVencido).length;

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
            <span className="text-[10px] font-bold text-slate-400">{totalAcoesCount} {totalAcoesCount === 1 ? 'ação' : 'ações'}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider">Planejados</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{planejados}</span>
            <span className="text-[10px] font-bold text-blue-400" title={`${totalAcoesPlanejadas} ação(ões) planejadas aguardando início`}>
              {totalAcoesPlanejadas > 0 ? `${totalAcoesPlanejadas} ${totalAcoesPlanejadas === 1 ? 'ação' : 'ações'}` : 'aguardando'}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">Em Andamento</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{emAndamento}</span>
            <span className="text-[10px] font-bold text-amber-400" title={`${totalAcoesEmAndamento} ação(ões) em execução`}>
              {totalAcoesEmAndamento > 0 ? `${totalAcoesEmAndamento} ${totalAcoesEmAndamento === 1 ? 'ação' : 'ações'}` : 'no prazo'}
            </span>
          </div>
        </div>
        <div className={`bg-white dark:bg-slate-900 border ${(atrasados > 0 || totalAcoesAtrasadas > 0) ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-4 shadow-xs`}>
          <p className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider flex items-center justify-between">
            <span>Atrasados</span>
            {(atrasados > 0 || totalAcoesAtrasadas > 0) && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-black ${(atrasados > 0 || totalAcoesAtrasadas > 0) ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
              {atrasados}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              totalAcoesAtrasadas > 0 
                ? 'text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                : 'text-slate-400'
            }`}>
              {totalAcoesAtrasadas > 0 
                ? `${totalAcoesAtrasadas} ${totalAcoesAtrasadas === 1 ? 'ação' : 'ações'}` 
                : 'em dia'}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider">Concluídos</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{concluidos}</span>
            <span className="text-[10px] font-bold text-emerald-400" title={`${totalAcoesConcluidas} ação(ões) concluídas`}>
              {totalAcoesConcluidas > 0 ? `${totalAcoesConcluidas} ${totalAcoesConcluidas === 1 ? 'ação' : 'ações'}` : 'eficazes'}
            </span>
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
            <option value="Atrasado">⚠️ Atrasado {atrasados > 0 ? `(${atrasados})` : ''}</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelada">Cancelado</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Ordem:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full md:w-44 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-hidden font-semibold dark:text-slate-200"
            title="Critério de ordenação da lista de Planos"
          >
            <option value="codigo_asc">🔢 Sequencial (001, 002...)</option>
            <option value="codigo_desc">🔽 Código Decrescente</option>
            <option value="data_desc">📅 Mais Recentes Primeiro</option>
            <option value="prazo_asc">⏱️ Prazo Mais Urgente</option>
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
                  <th 
                    className="py-3.5 px-4 min-w-[280px] cursor-pointer hover:text-blue-600 transition-colors select-none"
                    onClick={() => setSortBy(prev => prev === 'codigo_asc' ? 'codigo_desc' : 'codigo_asc')}
                    title="Clique para ordenar por Código Sequencial"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Plano Mestre (Capa) & Escopo</span>
                      {sortBy === 'codigo_asc' && <span className="text-[10px] text-blue-600 font-mono font-bold">▲ 001..</span>}
                      {sortBy === 'codigo_desc' && <span className="text-[10px] text-blue-600 font-mono font-bold">▼ 999..</span>}
                    </div>
                  </th>
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
                {sortedPlanos.map((plano) => {
                  const isExpanded = !!expandedIds[plano.id];
                  const stats = getPlanStats(plano);
                  const actions = stats.actions;
                  const relDoc = documents.find(d => d.id === plano.documentoId);
                  const relAudit = audits.find(a => a.id === plano.auditoriaId);
                  const relNC = ncs.find(n => n.id === plano.naoConformidadeId);
                  const isOverdue = stats.isPlanoVencido;

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
                              {stats.acoesAtrasadas > 0 
                                ? `Atrasado (${stats.acoesAtrasadas} ${stats.acoesAtrasadas === 1 ? 'ação' : 'ações'})` 
                                : 'Atrasado'}
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

                                              {/* Detalhes de Conclusão & Evidências */}
                                              {act.status === 'Concluído' && (
                                                <div className="mt-2 p-2 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-[10px] space-y-1">
                                                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                                    <span>Concluído {act.concluidoEm ? `em ${formatDateBR(act.concluidoEm)}` : ''} {act.concluidoPor ? `por ${act.concluidoPor}` : ''}</span>
                                                  </div>
                                                  {act.comentarioConclusao && (
                                                    <p className="text-slate-700 dark:text-slate-300 italic pl-4 border-l border-emerald-300 dark:border-emerald-800">
                                                      "{act.comentarioConclusao}"
                                                    </p>
                                                  )}
                                                  {act.evidencias && act.evidencias.length > 0 && (
                                                    <div className="flex items-center gap-1 flex-wrap pt-0.5 pl-4">
                                                      <span className="font-semibold text-emerald-800 dark:text-emerald-400 text-[9px]">Evidências:</span>
                                                      {act.evidencias.map((ev) => (
                                                        <button
                                                          key={ev.id}
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPreviewEvidence(ev);
                                                          }}
                                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors text-[9px] font-medium cursor-pointer"
                                                          title="Clique para visualizar ou baixar"
                                                        >
                                                          <Paperclip className="w-2.5 h-2.5" />
                                                          <span className="max-w-[120px] truncate">{ev.nome}</span>
                                                        </button>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
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
                                                {/* Botão de Comentários */}
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActionCommentsModal({ plano, action: act });
                                                    setNewCommentText('');
                                                    setIsAddingLinkInComments(false);
                                                  }}
                                                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                                                    (act.comentarios && act.comentarios.length > 0)
                                                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 font-bold border border-blue-200 dark:border-blue-900'
                                                      : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                  }`}
                                                  title={act.comentarios && act.comentarios.length > 0 ? `${act.comentarios.length} comentário(s)` : 'Comentar / Acompanhamento'}
                                                >
                                                  <MessageSquare className="w-3.5 h-3.5" />
                                                  {act.comentarios && act.comentarios.length > 0 && (
                                                    <span className="text-[10px]">{act.comentarios.length}</span>
                                                  )}
                                                </button>

                                                {/* Botão de Evidências */}
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActionCommentsModal({ plano, action: act });
                                                    setNewCommentText('');
                                                    setIsAddingLinkInComments(false);
                                                  }}
                                                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                                                    (act.evidencias && act.evidencias.length > 0)
                                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 font-bold border border-emerald-200 dark:border-emerald-900'
                                                      : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                  }`}
                                                  title={act.evidencias && act.evidencias.length > 0 ? `${act.evidencias.length} evidência(s)` : 'Evidências / Anexos'}
                                                >
                                                  <Paperclip className="w-3.5 h-3.5" />
                                                  {act.evidencias && act.evidencias.length > 0 && (
                                                    <span className="text-[10px]">{act.evidencias.length}</span>
                                                  )}
                                                </button>

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
          {sortedPlanos.map((plano) => {
            const stats = getPlanStats(plano);
            const actions = stats.actions;
            const relDoc = documents.find(d => d.id === plano.documentoId);
            const relAudit = audits.find(a => a.id === plano.auditoriaId);
            const relNC = ncs.find(n => n.id === plano.naoConformidadeId);
            const isOverdue = stats.isPlanoVencido;

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
                          {stats.acoesAtrasadas > 0 
                            ? `Atrasado (${stats.acoesAtrasadas} ${stats.acoesAtrasadas === 1 ? 'ação' : 'ações'})` 
                            : 'Atrasado'}
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

                                  {/* Conclusão & Evidências em Card */}
                                  {act.status === 'Concluído' && (
                                    <div className="mt-2 p-2 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-[10px] space-y-1">
                                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>Concluído {act.concluidoEm ? `em ${formatDateBR(act.concluidoEm)}` : ''} {act.concluidoPor ? `por ${act.concluidoPor}` : ''}</span>
                                      </div>
                                      {act.comentarioConclusao && (
                                        <p className="text-slate-700 dark:text-slate-300 italic pl-3 border-l border-emerald-300 dark:border-emerald-800">
                                          "{act.comentarioConclusao}"
                                        </p>
                                      )}
                                      {act.evidencias && act.evidencias.length > 0 && (
                                        <div className="flex items-center gap-1 flex-wrap pt-0.5 pl-3">
                                          <span className="font-semibold text-emerald-800 dark:text-emerald-400 text-[9px]">Evidências:</span>
                                          {act.evidencias.map((ev) => (
                                            <button
                                              key={ev.id}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewEvidence(ev);
                                              }}
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors text-[9px] font-medium cursor-pointer"
                                              title="Clique para visualizar ou baixar"
                                            >
                                              <Paperclip className="w-2.5 h-2.5" />
                                              <span className="max-w-[120px] truncate">{ev.nome}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
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

                                {/* Botão de Comentários */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionCommentsModal({ plano, action: act });
                                    setNewCommentText('');
                                    setIsAddingLinkInComments(false);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                                    (act.comentarios && act.comentarios.length > 0)
                                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 font-bold border border-blue-200 dark:border-blue-900'
                                      : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                  title={act.comentarios && act.comentarios.length > 0 ? `${act.comentarios.length} comentário(s)` : 'Comentários'}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {act.comentarios && act.comentarios.length > 0 && (
                                    <span className="text-[10px]">{act.comentarios.length}</span>
                                  )}
                                </button>

                                {/* Botão de Evidências */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionCommentsModal({ plano, action: act });
                                    setNewCommentText('');
                                    setIsAddingLinkInComments(false);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                                    (act.evidencias && act.evidencias.length > 0)
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 font-bold border border-emerald-200 dark:border-emerald-900'
                                      : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                  title={act.evidencias && act.evidencias.length > 0 ? `${act.evidencias.length} evidência(s)` : 'Evidências'}
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                  {act.evidencias && act.evidencias.length > 0 && (
                                    <span className="text-[10px]">{act.evidencias.length}</span>
                                  )}
                                </button>

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
                    {editingActionItem ? `Editar Ação 5W2H #${editingActionItem.itemNumero || 1}` : 'Nova Ação 5W2H'}
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

              {/* DADOS DE CONCLUSÃO & EVIDÊNCIAS NO MODAL DE AÇÃO */}
              {actionItemForm.status === 'Concluído' && (
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-3 animate-scale-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Dados de Conclusão & Evidências Comprobatórias (ISO 10.2)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider mb-1">
                        Data de Conclusão / Execução
                      </label>
                      <input
                        type="date"
                        value={actionItemForm.concluidoEm || getLocalDateISO()}
                        onChange={(e) => setActionItemForm({ ...actionItemForm, concluidoEm: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider mb-1">
                        Responsável pelo Fechamento
                      </label>
                      <input
                        type="text"
                        value={actionItemForm.concluidoPor || user?.name || actionItemForm.quem}
                        onChange={(e) => setActionItemForm({ ...actionItemForm, concluidoPor: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                        placeholder="Nome do homologador"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider mb-1">
                      Parecer Técnico / Comentário de Conclusão
                    </label>
                    <textarea
                      rows={2}
                      value={actionItemForm.comentarioConclusao}
                      onChange={(e) => setActionItemForm({ ...actionItemForm, comentarioConclusao: e.target.value })}
                      placeholder="Descreva a eficácia da ação, superação do desvio e parecer final..."
                      className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 p-2.5 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                    />
                  </div>

                  {/* Evidências anexadas */}
                  <div className="space-y-2 pt-1 border-t border-emerald-200 dark:border-emerald-900/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                        Evidências ({actionItemForm.evidencias?.length || 0})
                      </span>
                      <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs">
                        <Upload className="w-3 h-3" />
                        <span>Anexar Arquivo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleProcessFileUpload(file, (newEv) => {
                                setActionItemForm(prev => ({
                                  ...prev,
                                  evidencias: [...(prev.evidencias || []), newEv]
                                }));
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {actionItemForm.evidencias && actionItemForm.evidencias.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {actionItemForm.evidencias.map((ev) => (
                          <div
                            key={ev.id}
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800 text-[10px]"
                          >
                            <Paperclip className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="max-w-[120px] truncate">{ev.nome}</span>
                            <button
                              type="button"
                              onClick={() => setActionItemForm(prev => ({
                                ...prev,
                                evidencias: (prev.evidencias || []).filter(e => e.id !== ev.id)
                              }))}
                              className="text-slate-400 hover:text-rose-500 font-bold ml-1 cursor-pointer"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HISTÓRICO DE COMENTÁRIOS DA AÇÃO COM OPÇÃO DE EXCLUSÃO */}
              {editingActionItem && editingActionItem.comentarios && editingActionItem.comentarios.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Comentários Registrados ({editingActionItem.comentarios.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Exclusão e gerenciamento</span>
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {editingActionItem.comentarios.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-blue-500 shrink-0" />
                            {c.criadoPor}
                            {c.cargoOuSetor && <span className="font-normal text-slate-400">({c.cargoOuSetor})</span>}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[9px] text-slate-400">
                              {new Date(c.criadoEm).toLocaleString('pt-BR')}
                            </span>
                            {confirmDeleteCommentId === c.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900 text-[10px]">
                                <span className="font-bold text-rose-600 dark:text-rose-400 text-[9px]">Excluir?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteCommentFromEditingAction(c.id);
                                    setConfirmDeleteCommentId(null);
                                  }}
                                  className="font-extrabold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer text-[10px]"
                                  title="Confirmar exclusão deste comentário"
                                >
                                  Sim
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCommentId(null)}
                                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer font-medium text-[10px]"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteCommentId(c.id)}
                                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Excluir este comentário"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-2.5 border-l-2 border-blue-400 dark:border-blue-600 text-[11px] whitespace-pre-wrap">
                          {c.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:hidden">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in flex flex-col">
              {/* Header */}
              <div className="px-6 py-3.5 bg-[#0B3A63] text-white flex items-center justify-between sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Printer className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold tracking-tight">
                        Folha de Plano de Ação 5W2H: {selectedPrintPlano.codigo}
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded">
                        A4 Paisagem
                      </span>
                    </div>
                    <p className="text-[10.5px] text-blue-200">
                      Visualização prévia oficial formatada para impressão A4 institucional SGQ (ISO 9001:2015)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintPlano}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir A4 Paisagem</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsPrintModalOpen(false)} 
                    className="text-white/70 hover:text-white font-mono text-2xl leading-none cursor-pointer pl-1"
                    title="Fechar visualização"
                  >
                    &times;
                  </button>
                </div>
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
                            {act.status === 'Concluído' && (
                              <div className="mt-1 pt-1 border-t border-slate-200 text-[9px] text-slate-700 space-y-0.5">
                                <span className="font-bold text-emerald-800">
                                  ✓ Concluído {act.concluidoEm ? `em ${formatDateBR(act.concluidoEm)}` : ''} {act.concluidoPor ? `(${act.concluidoPor})` : ''}
                                </span>
                                {act.comentarioConclusao && (
                                  <p className="italic text-slate-600">"{act.comentarioConclusao}"</p>
                                )}
                                {act.evidencias && act.evidencias.length > 0 && (
                                  <p className="text-[8.5px] text-slate-500 font-medium">
                                    <strong className="text-slate-700">Evidências:</strong> {act.evidencias.map(e => e.nome).join(', ')}
                                  </p>
                                )}
                              </div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Documento Oficial (A4 Paisagem)</span>
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

      {/* MODAL: CONCLUIR AÇÃO 5W2H COM PARECER E EVIDÊNCIAS (ISO 10.2) */}
      {actionToConclude && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between sticky top-0 z-10 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="text-sm font-extrabold leading-tight">
                    Concluir Ação 5W2H #{actionToConclude.action.itemNumero || 1}
                  </h3>
                  <p className="text-[10px] text-emerald-100">
                    Registro de Parecer de Eficácia & Evidências Objetivas (ISO 9001:2015 10.2)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionToConclude(null)}
                className="text-white/70 hover:text-white font-mono text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmConclusaoAction} className="p-6 space-y-5">
              {/* Resumo da Ação */}
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Plano {actionToConclude.plano.codigo} • Ação #{actionToConclude.action.itemNumero || 1}
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Setor: {actionToConclude.plano.setor}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  {actionToConclude.action.oQue}
                </p>
                {actionToConclude.action.porQue && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Por quê:</span> {actionToConclude.action.porQue}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                  <span>Executor Responsável: <strong className="text-slate-700 dark:text-slate-300">{actionToConclude.action.quem}</strong></span>
                  <span>•</span>
                  <span>Prazo Previsto: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatDateBR(actionToConclude.action.quando)}</strong></span>
                </div>
              </div>

              {/* Data & Responsável pelo Fechamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Data de Conclusão / Execução *
                  </label>
                  <input
                    type="date"
                    required
                    value={conclusaoData}
                    onChange={(e) => setConclusaoData(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Responsável pelo Fechamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={conclusaoResponsavel}
                    onChange={(e) => setConclusaoResponsavel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-hidden dark:text-slate-100"
                    placeholder="Nome do responsável pela homologação"
                  />
                </div>
              </div>

              {/* Parecer Técnico de Conclusão / Comentário */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Parecer Técnico / Comentário de Conclusão
                </label>
                <textarea
                  rows={3}
                  value={conclusaoComentario}
                  onChange={(e) => setConclusaoComentario(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs font-medium rounded-lg focus:outline-hidden dark:text-slate-100"
                  placeholder="Descreva detalhadamente como a ação foi executada, resultados obtidos, mitigação do problema e evidências de conformidade..."
                />
                <span className="text-[10px] text-slate-400">
                  Este parecer será registrado no histórico auditável e na folha impressa de controle do SGQ.
                </span>
              </div>

              {/* Seção de Evidências Comprobatórias */}
              <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Evidências Objetivas Comprobatórias ({conclusaoEvidencias.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Anexar Arquivo</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleProcessFileUpload(file, (newEv) => {
                              setConclusaoEvidencias(prev => [...prev, newEv]);
                            });
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingLinkConclusao(!isAddingLinkConclusao)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Adicionar Link</span>
                    </button>
                  </div>
                </div>

                {evidenceUploadError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                    <span>{evidenceUploadError}</span>
                    <button type="button" onClick={() => setEvidenceUploadError(null)} className="text-rose-500 font-bold">&times;</button>
                  </div>
                )}

                {/* Formulário para Inserir Link */}
                {isAddingLinkConclusao && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5 animate-fadeIn">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Vincular Link Externo (Google Drive, Pasta Compartilhada, ERP ou Chamado)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={linkConclusaoNome}
                        onChange={(e) => setLinkConclusaoNome(e.target.value)}
                        placeholder="Nome descritivo (ex: Foto da máquina ajustada, Relatório PDF)"
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs rounded-lg dark:text-slate-100"
                      />
                      <input
                        type="url"
                        value={linkConclusaoUrl}
                        onChange={(e) => setLinkConclusaoUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs rounded-lg dark:text-slate-100"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingLinkConclusao(false)}
                        className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLinkInConclusao}
                        disabled={!linkConclusaoUrl.trim()}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Salvar Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Evidências Anexadas */}
                {conclusaoEvidencias.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {conclusaoEvidencias.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {ev.tipo === 'imagem' ? (
                            <Image className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : ev.tipo === 'link' ? (
                            <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={ev.nome}>
                              {ev.nome}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {ev.tamanho ? formatFileSize(ev.tamanho) : 'Link'} • {new Date(ev.adicionadoEm).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewEvidence(ev)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-emerald-600 cursor-pointer transition-colors"
                            title="Visualizar evidência"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEvidenceFromConclusao(ev.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                            title="Remover evidência"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                      Nenhuma evidência anexada ainda
                    </p>
                    <p className="text-[10px]">
                      Você pode anexar fotos de antes/depois, relatórios de medição, POPs revisados ou links de armazenamento.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionToConclude(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Concluir Ação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMENTÁRIOS E ACOMPANHAMENTO DA AÇÃO */}
      {actionCommentsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="text-sm font-extrabold leading-tight">
                    Acompanhamento • Ação #{actionCommentsModal.action.itemNumero || 1}
                  </h3>
                  <p className="text-[10px] text-blue-200">
                    Plano {actionCommentsModal.plano.codigo} — Registro contínuo de comentários e evidências
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionCommentsModal(null)}
                className="text-white/70 hover:text-white font-mono text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Sub-header com resumo da ação */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-150 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {actionCommentsModal.action.oQue}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Resp: <strong className="text-slate-700 dark:text-slate-300">{actionCommentsModal.action.quem}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Prazo: <strong>{formatDateBR(actionCommentsModal.action.quando)}</strong>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    actionCommentsModal.action.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    actionCommentsModal.action.status === 'Em Andamento' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    actionCommentsModal.action.status === 'Cancelada' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {actionCommentsModal.action.status}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCommentsModalTab('comentarios')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    commentsModalTab === 'comentarios'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comentários ({actionCommentsModal.action.comentarios?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCommentsModalTab('evidencias')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    commentsModalTab === 'evidencias'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Evidências ({actionCommentsModal.action.evidencias?.length || 0})</span>
                </button>
              </div>
            </div>

            {/* Conteúdo rolável */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {commentsModalTab === 'comentarios' ? (
                <div className="space-y-4">
                  {/* Lista de Comentários */}
                  {actionCommentsModal.action.comentarios && actionCommentsModal.action.comentarios.length > 0 ? (
                    <div className="space-y-3">
                      {actionCommentsModal.action.comentarios.map((c) => (
                        <div
                          key={c.id}
                          className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-750 rounded-xl space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                              <User className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{c.criadoPor}</span>
                              {c.cargoOuSetor && (
                                <span className="font-normal text-slate-400 text-[10px] shrink-0">({c.cargoOuSetor})</span>
                              )}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(c.criadoEm).toLocaleString('pt-BR')}
                              </span>
                              {confirmDeleteCommentId === c.id ? (
                                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900 animate-fadeIn">
                                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Excluir?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteActionComment(c.id);
                                      setConfirmDeleteCommentId(null);
                                    }}
                                    className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 hover:underline px-1 cursor-pointer"
                                    title="Confirmar exclusão deste comentário"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteCommentId(null)}
                                    className="text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 px-1 cursor-pointer font-medium"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCommentId(c.id)}
                                  className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Excluir este comentário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap pl-3 border-l-2 border-blue-400 dark:border-blue-600">
                            {c.texto}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Nenhum comentário registrado nesta ação
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Registre apontamentos de progresso, orientações técnicas ou validações do SGQ no campo abaixo.
                      </p>
                    </div>
                  )}

                  {/* Input de Novo Comentário */}
                  <div className="pt-2 border-t border-slate-150 dark:border-slate-850 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Adicionar Comentário / Nota de Acompanhamento
                    </label>
                    <textarea
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Escreva sua observação, retorno do executor ou nota de auditoria..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs font-medium rounded-xl focus:outline-hidden dark:text-slate-100"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddActionComment}
                        disabled={!newCommentText.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publicar Comentário</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Controles de upload e link */}
                  <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Adicionar Evidência</p>
                      <p className="text-[10px] text-slate-400">Fotos, relatórios PDF, planilhas ou links externos (máx. 5MB)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Arquivo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleProcessFileUpload(file, (newEv) => {
                                handleAddEvidenceInCommentsModal(newEv);
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingLinkInComments(!isAddingLinkInComments)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Link Externo</span>
                      </button>
                    </div>
                  </div>

                  {evidenceUploadError && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                      <span>{evidenceUploadError}</span>
                      <button type="button" onClick={() => setEvidenceUploadError(null)} className="text-rose-500 font-bold">&times;</button>
                    </div>
                  )}

                  {/* Formulário de Link no modal de comentários */}
                  {isAddingLinkInComments && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 animate-fadeIn">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Vincular Link de Armazenamento ou Documento
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={linkCommentNome}
                          onChange={(e) => setLinkCommentNome(e.target.value)}
                          placeholder="Nome descritivo da evidência"
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs rounded-lg dark:text-slate-100"
                        />
                        <input
                          type="url"
                          value={linkCommentUrl}
                          onChange={(e) => setLinkCommentUrl(e.target.value)}
                          placeholder="https://..."
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs rounded-lg dark:text-slate-100"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingLinkInComments(false)}
                          className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleAddLinkInComments}
                          disabled={!linkCommentUrl.trim()}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                        >
                          Salvar Link
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Evidências */}
                  {actionCommentsModal.action.evidencias && actionCommentsModal.action.evidencias.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {actionCommentsModal.action.evidencias.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {ev.tipo === 'imagem' ? (
                              <Image className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : ev.tipo === 'link' ? (
                              <ExternalLink className="w-5 h-5 text-blue-600 shrink-0" />
                            ) : (
                              <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={ev.nome}>
                                {ev.nome}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {ev.tamanho ? formatFileSize(ev.tamanho) : 'Link'} • {new Date(ev.adicionadoEm).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-[9px] text-slate-400 truncate">
                                Por: {ev.adicionadoPor}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewEvidence(ev)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
                              title="Visualizar evidência"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveEvidenceFromAction(ev.id)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                              title="Remover evidência"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-1">
                      <Paperclip className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Nenhuma evidência vinculada a esta ação
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Faça o upload de comprovantes ou anexe links usando os botões acima.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-150 dark:border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActionCommentsModal(null)}
                className="px-4 py-2 bg-[#0B3A63] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DE EVIDÊNCIA / ANEXO */}
      {previewEvidence && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B3A63] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-emerald-300" />
                <div className="min-w-0 max-w-[400px]">
                  <h3 className="text-sm font-extrabold truncate" title={previewEvidence.nome}>
                    {previewEvidence.nome}
                  </h3>
                  <p className="text-[10px] text-blue-200">
                    Adicionado por {previewEvidence.adicionadoPor} em {new Date(previewEvidence.adicionadoEm).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="text-white/70 hover:text-white font-mono text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50">
              {previewEvidence.tipo === 'imagem' || previewEvidence.url.startsWith('data:image/') ? (
                <div className="max-w-full max-h-[60vh] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                  <img
                    src={previewEvidence.url}
                    alt={previewEvidence.nome}
                    className="max-h-[60vh] w-auto object-contain mx-auto"
                  />
                </div>
              ) : previewEvidence.tipo === 'link' ? (
                <div className="p-8 text-center space-y-4 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <ExternalLink className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Link Externo Vinculado</h4>
                    <p className="text-xs text-slate-500 break-all font-mono">
                      {previewEvidence.url}
                    </p>
                  </div>
                  <a
                    href={previewEvidence.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Abrir Link em Nova Aba</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{previewEvidence.nome}</h4>
                    <p className="text-xs text-slate-500">
                      Arquivo anexado ({formatFileSize(previewEvidence.tamanho)})
                    </p>
                  </div>
                  <a
                    href={previewEvidence.url}
                    download={previewEvidence.nome}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Arquivo</span>
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-slate-400">
                {previewEvidence.tamanho ? formatFileSize(previewEvidence.tamanho) : 'Link Externo'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
