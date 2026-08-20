/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { motion } from 'motion/react';
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import { 
  Users, 
  Calendar, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  Flame, 
  Plus, 
  Trash2, 
  Pencil,
  X,
  Save, 
  Upload, 
  Award,
  Link as LinkIcon,
  Activity,
  Zap,
  Check,
  ChevronRight,
  Info,
  Clock,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { ProjetoCEO, FerramentasCEO, MembroEquipe, SipocData, VocItem, BrainstormingIdea, GutItem, SwotData, FiveWhysItem, ParetoCauseItem, IshikawaData, FluxoStep, CronogramaTask, EvidenciaFile, EtapaMetodologia, VsmStep, DmaicPhase } from '../../types/ceo';
import { SectorType } from '../../types/department';
import { NotificationRepository } from '../../services/database/repositories/notification.repository';
import { ActionPlanRepository } from '../../services/database/repositories/actionPlan.repository';
import { AuditRepository } from '../../services/database/repositories/audit.repository';
import { DocumentRepository } from '../../services/database/repositories/document.repository';
import { SystemSettingsRepository } from '../../services/database/repositories/systemSettings.repository';
import { AuditLogsRepository } from '../../services/firebase/repositories/auditLog.repository';

interface ProjetoViewCEOProps {
  project: ProjetoCEO;
  onUpdateProject: (id: string, updates: Partial<ProjetoCEO>) => Promise<boolean>;
  onDeleteProject?: (id: string) => Promise<boolean>;
  onClose: () => void;
  sectors: SectorType[];
}

type SubTabType = 
  | 'visao' 
  | 'equipe' 
  | 'sipoc' 
  | 'brainstorming' 
  | 'gut' 
  | 'swot' 
  | 'causa' 
  | 'fluxo' 
  | 'vsm' 
  | 'dmaic' 
  | 'evidencias';

export const ProjetoViewCEO: React.FC<ProjetoViewCEOProps> = ({
  project,
  onUpdateProject,
  onDeleteProject,
  onClose,
  sectors
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('visao');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Local state copy of ferramentas to edit and save
  const [tools, setTools] = useState<FerramentasCEO>(() => {
    const f = { ...project.ferramentas };
    
    // Initialize VSM if not present
    if (!f.vsm) {
      f.vsm = {
        etapas: [],
        tempoAgregaValor: 0,
        tempoNaoAgregaValor: 0,
        eficienciaCiclo: 0
      };
    }

    // Initialize DMAIC if not present
    if (!f.dmaic || !f.dmaic.fases || f.dmaic.fases.length === 0) {
      f.dmaic = {
        fases: [
          { 
            fase: 'Define', 
            descricao: 'Definir claramente o escopo do projeto de melhoria, formar a equipe Green/Black Belts, assinar o Termo de Abertura (Project Charter) e mapear a Voz do Cliente (VOC).', 
            concluida: true, 
            entregaveis: 'Project Charter assinado pelo Patrocinador (Sponsor), equipe definida, árvore de CTQ (Crítico para a Qualidade) elaborada.' 
          },
          { 
            fase: 'Measure', 
            descricao: 'Mapear detalhadamente o estado atual do processo com SIPOC, determinar a linha de base (baseline) e desenhar o VSM inicial com medição de lead times.', 
            concluida: false, 
            entregaveis: 'SIPOC preenchido com entradas/saídas, VSM de estado atual estruturado com identificação de gargalos de costura e corte.' 
          },
          { 
            fase: 'Analyze', 
            descricao: 'Analisar os desperdícios levantados, identificar as causas raiz do gargalo utilizando diagramas de Ishikawa, técnica dos 5 Porquês e Gráfico de Pareto.', 
            concluida: false, 
            entregaveis: 'Diagrama de Ishikawa preenchido para o problema de desvio de medidas, 5 Porquês concluídos isolando a falha de tensionamento.' 
          },
          { 
            fase: 'Improve', 
            descricao: 'Desenvolver propostas de solução sólidas usando planos de ação 5W2H, implantar melhorias piloto (Kaizen, 5S) e recalcular o lead time no VSM.', 
            concluida: false, 
            entregaveis: 'Planos de ação estruturados para adequar layout têxtil, checklist 5S implementado nas bancadas de facção.' 
          },
          { 
            fase: 'Control', 
            descricao: 'Criar novos Procedimentos Operacionais Padrão (SOPs), auditar o processo sistematicamente, comprovar a sustentabilidade dos ganhos e homologar o ROI.', 
            concluida: false, 
            entregaveis: 'SOP formalizado na central de documentos, auditoria de sustentabilidade programada, ROI final do projeto validado.' 
          }
        ]
      };
    }

    return f;
  });

  // Keep state synchronized with real-time updates from Firestore
  useEffect(() => {
    if (project.ferramentas) {
      setTools(prev => ({ ...prev, ...project.ferramentas }));
    }
    setCalcInvestimento(project.investimento);
    setCalcRetornoEsperado(project.retornoEsperado);
  }, [project.id, project.investimento, project.retornoEsperado, project.ferramentas]);

  const saveTools = async (updatedTools: FerramentasCEO) => {
    setIsSaving(true);
    setTools(updatedTools);
    await onUpdateProject(project.id, { ferramentas: updatedTools });
    setIsSaving(false);
  };

  // Cross-module integrations loaded from Firestore Repositories + LocalStorage fallback
  const [availableAudits, setAvailableAudits] = useState<any[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_audits');
    return saved ? JSON.parse(saved) : [];
  });

  const [availablePlans, setAvailablePlans] = useState<any[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_planos');
    return saved ? JSON.parse(saved) : [];
  });

  const [availableDocs, setAvailableDocs] = useState<any[]>(() => {
    const saved = localStorage.getItem('sgq_vickytex_documents');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    AuditRepository.findAll().then(res => {
      if (res.success && res.data.length > 0) setAvailableAudits(res.data);
    }).catch(() => {});

    ActionPlanRepository.findAll().then(res => {
      if (res.success && res.data.length > 0) setAvailablePlans(res.data);
    }).catch(() => {});

    DocumentRepository.findAll().then(res => {
      if (res.success && res.data.length > 0) setAvailableDocs(res.data);
    }).catch(() => {});
  }, []);

  // Calculations & parameters state
  const [calcInvestimento, setCalcInvestimento] = useState<number>(project.investimento);
  const [calcRetornoEsperado, setCalcRetornoEsperado] = useState<number>(project.retornoEsperado);
  const [calcLtBefore, setCalcLtBefore] = useState<number>(tools.leadTime?.before || (project.setor === 'Corte' ? 24 : project.setor === 'Costura' ? 48 : project.setor === 'Logística' ? 12 : 36));
  const [calcLtAfter, setCalcLtAfter] = useState<number>(tools.leadTime?.after || (project.status === 'Concluído' ? (project.setor === 'Corte' ? 8 : project.setor === 'Costura' ? 18 : project.setor === 'Logística' ? 4 : 14) : (project.setor === 'Corte' ? 16 : project.setor === 'Costura' ? 32 : project.setor === 'Logística' ? 8 : 24)));
  const [calcLtUnit, setCalcLtUnit] = useState<'horas' | 'dias' | 'minutos'>(tools.leadTime?.unit || 'horas');
  const [calcTrainingHours, setCalcTrainingHours] = useState<number>(tools.treinamentoHoras || 12);

  // Linked indices state
  const [linkedAuditId, setLinkedAuditId] = useState<string>(tools.auditoriaId || '');
  const [linkedPlanoId, setLinkedPlanoId] = useState<string>(tools.planoAcaoId || '');
  const [linkedDocId, setLinkedDocId] = useState<string>(tools.documentoSopId || '');
  const [loggedTrainingHours, setLoggedTrainingHours] = useState<number>(tools.treinamentoHoras || 0);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // ----------------------------------------------------
  // INTEGRATIONS & AUTOMATION HANDLERS
  // ----------------------------------------------------
  const handleSaveEfficiencyParams = async () => {
    const updatedLeadTime = {
      before: calcLtBefore,
      after: calcLtAfter,
      unit: calcLtUnit
    };

    const updatedTools: FerramentasCEO = {
      ...tools,
      leadTime: updatedLeadTime
    };

    setIsSaving(true);
    setTools(updatedTools);
    await onUpdateProject(project.id, {
      investimento: calcInvestimento,
      retornoEsperado: calcRetornoEsperado,
      ferramentas: updatedTools
    });
    setIsSaving(false);

    // Push Notification
    NotificationRepository.create({
      titulo: 'Parâmetros de Eficiência Atualizados',
      mensagem: `Novos ganhos financeiros e tempos de Lead Time calculados para o projeto ${project.codigo}.`,
      tipo: 'sucesso',
      destinatarioEmail: 'qualidade@vickytex.com.br'
    });

    // Save in ActivityLog
    const savedLogs = localStorage.getItem('sgq_vickytex_logs');
    const logsList = savedLogs ? JSON.parse(savedLogs) : [];
    logsList.unshift({
      id: `log-${Date.now()}`,
      usuarioEmail: 'qualidade@vickytex.com.br',
      usuarioNome: 'Gestor de Qualidade',
      usuarioRole: 'Qualidade',
      acao: 'Parâmetros CEO Atualizados',
      detalhes: `Código: ${project.codigo}. ROI: ${calcInvestimento > 0 ? Math.round(((calcRetornoEsperado - calcInvestimento) / calcInvestimento) * 100) : 0}%`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('sgq_vickytex_logs', JSON.stringify(logsList));
  };

  const handleSignOpening = async (role: 'sponsor' | 'quality') => {
    const approvals = tools.approvals || { opening: {}, closure: {} };
    const opening = approvals.opening || {};

    const updatedOpening = {
      ...opening,
      [role]: true,
      date: new Date().toISOString().split('T')[0],
      [role === 'sponsor' ? 'signedBySponsor' : 'signedByQuality']: role === 'sponsor' ? project.patrocinador : 'Gestão de Qualidade'
    };

    const isFullyApproved = (role === 'sponsor' ? true : !!opening.sponsor) && (role === 'quality' ? true : !!opening.quality);
    const newStatus = isFullyApproved ? 'Em Execução' : project.status;

    const updatedTools: FerramentasCEO = {
      ...tools,
      approvals: {
        ...approvals,
        opening: updatedOpening
      }
    };

    setIsSaving(true);
    setTools(updatedTools);
    await onUpdateProject(project.id, {
      status: newStatus as any,
      ferramentas: updatedTools
    });
    setIsSaving(false);

    NotificationRepository.create({
      titulo: isFullyApproved ? 'Projeto Liberado para Execução' : 'Assinatura Registrada',
      mensagem: isFullyApproved 
        ? `Portão de Abertura do projeto ${project.codigo} foi homologado com sucesso!`
        : `O portão de abertura do projeto ${project.codigo} foi assinado por ${role === 'sponsor' ? 'Sponsor' : 'Qualidade'}.`,
      tipo: 'info',
      destinatarioEmail: 'qualidade@vickytex.com.br'
    });
  };

  const handleSignClosure = async (role: 'sponsor' | 'quality') => {
    const approvals = tools.approvals || { opening: {}, closure: {} };
    const closure = approvals.closure || {};

    const updatedClosure = {
      ...closure,
      [role]: true,
      date: new Date().toISOString().split('T')[0],
      [role === 'sponsor' ? 'signedBySponsor' : 'signedByQuality']: role === 'sponsor' ? project.patrocinador : 'Gestão de Qualidade'
    };

    const updatedTools: FerramentasCEO = {
      ...tools,
      approvals: {
        ...approvals,
        closure: updatedClosure
      }
    };

    setIsSaving(true);
    setTools(updatedTools);
    await onUpdateProject(project.id, { ferramentas: updatedTools });
    setIsSaving(false);
  };

  const handleLinkIntegration = async (field: 'auditoriaId' | 'planoAcaoId' | 'documentoSopId', value: string) => {
    if (field === 'auditoriaId') setLinkedAuditId(value);
    if (field === 'planoAcaoId') setLinkedPlanoId(value);
    if (field === 'documentoSopId') setLinkedDocId(value);

    const updatedTools = {
      ...tools,
      [field]: value || undefined
    };

    setIsSaving(true);
    setTools(updatedTools);
    await onUpdateProject(project.id, { ferramentas: updatedTools });
    setIsSaving(false);
  };

  const handleAutoGenerate5W2H = async () => {
    const newPlan = {
      id: `pa-${Date.now()}`,
      codigo: `PA-CEO-${project.codigo}`,
      titulo: `Plano Kaizen - ${project.titulo}`,
      setor: project.setor,
      status: 'Em Andamento' as const,
      dataCriacao: new Date().toISOString().split('T')[0],
      oQue: `Implementar melhorias e ações mitigadoras do projeto de excelência operacional ${project.codigo}`,
      porQue: `Garantir as metas de produtividade da metodologia ${project.metodologia}`,
      onde: `Setor produtivo de ${project.setor}`,
      quando: project.dataFimPlanejada,
      quem: project.lider,
      como: `Executar o cronograma operacional, monitorar matrizes GUT/SWOT e formalizar anexo de evidências`,
      quantoCusta: project.investimento
    };

    const savedPlans = localStorage.getItem('sgq_vickytex_planos');
    const plansList = savedPlans ? JSON.parse(savedPlans) : [];
    plansList.unshift(newPlan);
    localStorage.setItem('sgq_vickytex_planos', JSON.stringify(plansList));
    setAvailablePlans(plansList);

    // Persist directly to Firestore database action_plans collection
    ActionPlanRepository.create(newPlan).catch(err => console.warn('[ProjetoViewCEO] Firestore ActionPlan create error:', err));

    setLinkedPlanoId(newPlan.id);
    const updatedTools = {
      ...tools,
      planoAcaoId: newPlan.id
    };

    setIsSaving(true);
    setTools(updatedTools);
    await onUpdateProject(project.id, { ferramentas: updatedTools });
    setIsSaving(false);

    NotificationRepository.create({
      titulo: 'Plano 5W2H Gerado',
      mensagem: `O plano de ação 5W2H ${newPlan.codigo} foi criado e associado ao projeto ${project.codigo}.`,
      tipo: 'sucesso',
      destinatarioEmail: 'qualidade@vickytex.com.br'
    });
  };

  const handleSaveTrainingHours = async () => {
    const updatedTools = {
      ...tools,
      treinamentoHoras: calcTrainingHours
    };

    setIsSaving(true);
    setTools(updatedTools);
    await onUpdateProject(project.id, { ferramentas: updatedTools });
    setLoggedTrainingHours(calcTrainingHours);
    setIsSaving(false);

    // Save points to training logs to automatically boost leaderboard
    const savedLogs = localStorage.getItem('sgq_vickytex_ceo_training_logs');
    const logsList = savedLogs ? JSON.parse(savedLogs) : [];
    const newTrainingLog = {
      id: `tlog-${Date.now()}`,
      nome: project.lider.split('@')[0],
      email: project.lider,
      horas: Number(calcTrainingHours),
      tema: `Treinamento Prático Lean - Projeto ${project.codigo}`,
      data: new Date().toISOString().split('T')[0]
    };
    logsList.unshift(newTrainingLog);
    localStorage.setItem('sgq_vickytex_ceo_training_logs', JSON.stringify(logsList));
    SystemSettingsRepository.create({ id: 'sgq_vickytex_ceo_training_logs', items: logsList }).catch(() => {});

    NotificationRepository.create({
      titulo: 'Horas Práticas de Belt Registradas',
      mensagem: `Registradas ${calcTrainingHours} horas técnicas práticas para a equipe do projeto ${project.codigo}.`,
      tipo: 'sucesso',
      destinatarioEmail: 'qualidade@vickytex.com.br'
    });
  };

  const handleSyncGoogleDrive = () => {
    setSyncStatus('Sincronizando pasta com o Google Drive...');
    setTimeout(() => {
      setSyncStatus('✓ Pasta "SGQ_CEO/' + project.codigo + '" sincronizada com o Google Drive corporativo!');
      
      NotificationRepository.create({
        titulo: 'Nuvem Google Drive Sincronizada',
        mensagem: `Sincronizada pasta de evidências e anexos para o projeto ${project.codigo}.`,
        tipo: 'sucesso',
        destinatarioEmail: 'qualidade@vickytex.com.br'
      });
    }, 1500);
  };

  const handleGenerateA3Doc = () => {
    setSyncStatus('Estruturando Relatório A3 Executivo...');
    setTimeout(() => {
      setSyncStatus('✓ Relatório A3 gerado com sucesso no Google Docs corporativo! (Formato ISO 9001:2015)');
      
      NotificationRepository.create({
        titulo: 'Relatório A3 Gerado',
        mensagem: `Documento Google Docs contendo o sumário A3 do projeto ${project.codigo} foi compilado.`,
        tipo: 'sucesso',
        destinatarioEmail: 'qualidade@vickytex.com.br'
      });
    }, 1500);
  };

  // ----------------------------------------------------
  // SUB-TAB 1: VISÃO GERAL & ETAPAS / ENCERRAMENTO
  // ----------------------------------------------------
  const toggleEtapa = (index: number) => {
    const newEtapas = [...tools.etapas];
    const current = newEtapas[index].status;
    let nextStatus: 'Pendente' | 'Em Andamento' | 'Concluido' = 'Pendente';
    
    if (current === 'Pendente') nextStatus = 'Em Andamento';
    else if (current === 'Em Andamento') nextStatus = 'Concluido';

    newEtapas[index] = {
      ...newEtapas[index],
      status: nextStatus,
      dataConclusao: nextStatus === 'Concluido' ? new Date().toISOString().split('T')[0] : undefined
    };

    saveTools({ ...tools, etapas: newEtapas });
  };

  // Encerramento state
  const [relatorioFinal, setRelatorioFinal] = useState(tools.encerramento?.relatorioFinal || '');
  const [licoesAprendidas, setLicoesAprendidas] = useState(tools.encerramento?.licoesAprendidas || '');
  const [roiValidado, setRoiValidado] = useState(tools.encerramento?.roiValidado || false);

  const handleEncerramentoSave = () => {
    const encerramento = {
      relatorioFinal,
      licoesAprendidas,
      roiValidado,
      dataFechamento: new Date().toISOString().split('T')[0]
    };

    const isAllCompleted = tools.etapas.every(e => e.status === 'Concluido');
    const newStatus = isAllCompleted && roiValidado ? 'Concluído' : project.status;

    onUpdateProject(project.id, { 
      status: newStatus,
      retornoReal: roiValidado ? project.retornoEsperado * 1.1 : project.retornoReal, // Simular retorno real
      dataFimReal: newStatus === 'Concluído' ? new Date().toISOString().split('T')[0] : undefined,
      ferramentas: {
        ...tools,
        encerramento
      }
    });

    setTools({ ...tools, encerramento });
  };

  // ----------------------------------------------------
  // SUB-TAB 2: EQUIPE & CRONOGRAMA
  // ----------------------------------------------------
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const addEquipeMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const newMember: MembroEquipe = {
      nome: newMemberName,
      email: newMemberEmail,
      funcao: newMemberRole || 'Colaborador'
    };
    const updated = { ...tools, equipe: [...tools.equipe, newMember] };
    saveTools(updated);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('');
  };

  const removeEquipeMember = (email: string) => {
    const updated = { ...tools, equipe: tools.equipe.filter(m => m.email !== email) };
    saveTools(updated);
  };

  // Cronograma
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskStage, setNewTaskStage] = useState(tools.etapas[0]?.nome || '');
  const [newTaskResp, setNewTaskResp] = useState(project.lider);
  const [newTaskStart, setNewTaskStart] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskEnd, setNewTaskEnd] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const addCronogramaTask = () => {
    if (!newTaskName.trim()) return;
    const newTask: CronogramaTask = {
      id: `task-${Date.now()}`,
      tarefa: newTaskName,
      etapa: newTaskStage,
      responsavel: newTaskResp,
      dataInicio: newTaskStart,
      dataFim: newTaskEnd,
      status: 'Pendente'
    };
    const updated = { ...tools, cronograma: [...tools.cronograma, newTask] };
    saveTools(updated);
    setNewTaskName('');
  };

  const toggleTaskStatus = (taskId: string) => {
    const updatedTasks = tools.cronograma.map(t => {
      if (t.id === taskId) {
        const next: Record<string, 'Pendente' | 'Em Andamento' | 'Concluido'> = {
          'Pendente': 'Em Andamento',
          'Em Andamento': 'Concluido',
          'Concluido': 'Pendente'
        };
        return { ...t, status: next[t.status] };
      }
      return t;
    });
    saveTools({ ...tools, cronograma: updatedTasks });
  };

  const removeCronogramaTask = (taskId: string) => {
    const updated = { ...tools, cronograma: tools.cronograma.filter(t => t.id !== taskId) };
    saveTools(updated);
  };

  // ----------------------------------------------------
  // SUB-TAB 3: SIPOC & VOC
  // ----------------------------------------------------
  const [sipocForn, setSipocForn] = useState(tools.sipoc.fornecedores || '');
  const [sipocEnt, setSipocEnt] = useState(tools.sipoc.entradas || '');
  const [sipocPassos, setSipocPassos] = useState(tools.sipoc.processo?.join('\n') || '');
  const [sipocSaid, setSipocSaid] = useState(tools.sipoc.saidas || '');
  const [sipocCli, setSipocCli] = useState(tools.sipoc.clientes || '');

  const saveSipoc = () => {
    const updated: SipocData = {
      fornecedores: sipocForn,
      entradas: sipocEnt,
      processo: sipocPassos.split('\n').filter(p => p.trim() !== ''),
      saidas: sipocSaid,
      clientes: sipocCli
    };
    saveTools({ ...tools, sipoc: updated });
  };

  // VOC Items
  const [newVocClient, setNewVocClient] = useState('');
  const [newVocFeedback, setNewVocFeedback] = useState('');
  const [newVocNeed, setNewVocNeed] = useState('');
  const [newVocPriority, setNewVocPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');

  const addVocItem = () => {
    if (!newVocClient.trim() || !newVocNeed.trim()) return;
    const newItem: VocItem = {
      id: `voc-${Date.now()}`,
      cliente: newVocClient,
      feedback: newVocFeedback,
      necessidade: newVocNeed,
      prioridade: newVocPriority
    };
    saveTools({ ...tools, voc: [...tools.voc, newItem] });
    setNewVocClient('');
    setNewVocFeedback('');
    setNewVocNeed('');
  };

  const removeVocItem = (id: string) => {
    saveTools({ ...tools, voc: tools.voc.filter(v => v.id !== id) });
  };

  // ----------------------------------------------------
  // SUB-TAB 4: BRAINSTORMING, PICK MATRIX & PARETO
  // ----------------------------------------------------
  const [newIdeaText, setNewIdeaText] = useState('');
  const [newIdeaCat, setNewIdeaCat] = useState('');
  const [newIdeaImpact, setNewIdeaImpact] = useState(3);
  const [newIdeaEffort, setNewIdeaEffort] = useState(3);

  const addBrainstormingIdea = () => {
    if (!newIdeaText.trim()) return;
    
    // Auto-calculate PICK quadrant
    let quadrant: 'Possible' | 'Implement' | 'Challenge' | 'Kill' = 'Possible';
    if (newIdeaImpact >= 4 && newIdeaEffort <= 2) quadrant = 'Implement';
    else if (newIdeaImpact >= 4 && newIdeaEffort >= 3) quadrant = 'Challenge';
    else if (newIdeaImpact <= 3 && newIdeaEffort >= 3) quadrant = 'Kill';

    const newItem: BrainstormingIdea = {
      id: `idea-${Date.now()}`,
      ideia: newIdeaText,
      categoria: newIdeaCat || 'Geral',
      impacto: newIdeaImpact,
      esforco: newIdeaEffort,
      pick: quadrant,
      status: 'Nova'
    };

    saveTools({ ...tools, brainstorming: [...tools.brainstorming, newItem] });
    setNewIdeaText('');
    setNewIdeaCat('');
  };

  const removeBrainstormingIdea = (id: string) => {
    saveTools({ ...tools, brainstorming: tools.brainstorming.filter(i => i.id !== id) });
  };

  // Pareto Chart Data - Dynamic in tools.pareto
  const paretoCauses = tools.pareto || [];
  const sortedParetoCauses = [...paretoCauses].sort((a, b) => b.ocorrencias - a.ocorrencias);

  const totalLosses = sortedParetoCauses.reduce((sum, item) => sum + item.ocorrencias, 0);
  let accumulatedCount = 0;
  const paretoChartData = sortedParetoCauses.map(item => {
    accumulatedCount += item.ocorrencias;
    const pct = totalLosses > 0 ? Math.round((accumulatedCount / totalLosses) * 100) : 0;
    return {
      id: item.id,
      causa: item.causa,
      'Frequência': item.ocorrencias,
      'Acumulado (%)': pct
    };
  });

  const [newParetoCause, setNewParetoCause] = useState('');
  const [newParetoCount, setNewParetoCount] = useState<number>(10);
  const [editingParetoId, setEditingParetoId] = useState<string | null>(null);
  const [editParetoCause, setEditParetoCause] = useState('');
  const [editParetoCount, setEditParetoCount] = useState<number>(0);

  const addParetoItem = () => {
    if (!newParetoCause.trim()) return;
    const newItem: ParetoCauseItem = {
      id: `pareto-${Date.now()}`,
      causa: newParetoCause.trim(),
      ocorrencias: Number(newParetoCount) || 1
    };
    const updated = [...sortedParetoCauses, newItem];
    saveTools({ ...tools, pareto: updated });
    setNewParetoCause('');
    setNewParetoCount(10);
  };

  const removeParetoItem = (id: string) => {
    const updated = sortedParetoCauses.filter(p => p.id !== id);
    saveTools({ ...tools, pareto: updated });
  };

  const startEditPareto = (item: ParetoCauseItem) => {
    setEditingParetoId(item.id);
    setEditParetoCause(item.causa);
    setEditParetoCount(item.ocorrencias);
  };

  const saveEditPareto = () => {
    if (!editingParetoId || !editParetoCause.trim()) return;
    const updated = sortedParetoCauses.map(p => p.id === editingParetoId ? { ...p, causa: editParetoCause.trim(), ocorrencias: Number(editParetoCount) || 1 } : p);
    saveTools({ ...tools, pareto: updated });
    setEditingParetoId(null);
  };

  // ----------------------------------------------------
  // SUB-TAB 5: MATRIZ GUT
  // ----------------------------------------------------
  const [newGutProblem, setNewGutProblem] = useState('');
  const [newGutG, setNewGutG] = useState(3);
  const [newGutU, setNewGutU] = useState(3);
  const [newGutT, setNewGutT] = useState(3);
  const [newGutAction, setNewGutAction] = useState('');

  const addGutItem = () => {
    if (!newGutProblem.trim()) return;
    const newItem: GutItem = {
      id: `gut-${Date.now()}`,
      problema: newGutProblem,
      G: newGutG,
      U: newGutU,
      T: newGutT,
      total: newGutG * newGutU * newGutT,
      acao: newGutAction
    };
    saveTools({ ...tools, gut: [...tools.gut, newItem].sort((a,b) => b.total - a.total) });
    setNewGutProblem('');
    setNewGutAction('');
  };

  const removeGutItem = (id: string) => {
    saveTools({ ...tools, gut: tools.gut.filter(g => g.id !== id) });
  };

  // ----------------------------------------------------
  // SUB-TAB 6: MATRIZ SWOT
  // ----------------------------------------------------
  const [newSwotText, setNewSwotText] = useState('');
  const [swotQuad, setSwotQuad] = useState<'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas'>('forcas');

  const addSwotItem = () => {
    if (!newSwotText.trim()) return;
    const currentQuad = tools.swot[swotQuad] || [];
    const updatedSwot = {
      ...tools.swot,
      [swotQuad]: [...currentQuad, newSwotText]
    };
    saveTools({ ...tools, swot: updatedSwot });
    setNewSwotText('');
  };

  const removeSwotItem = (quad: 'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas', index: number) => {
    const currentQuad = tools.swot[quad] || [];
    const updatedSwot = {
      ...tools.swot,
      [quad]: currentQuad.filter((_, idx) => idx !== index)
    };
    saveTools({ ...tools, swot: updatedSwot });
  };

  // ----------------------------------------------------
  // SUB-TAB 7: CAUSA RAIZ (5 PORQUÊS & ISHIKAWA FISHBONE)
  // ----------------------------------------------------
  const [fiveWhysProb, setFiveWhysProb] = useState(tools.fiveWhys[0]?.problema || '');
  const [whys, setWhys] = useState<string[]>([
    tools.fiveWhys[0]?.porques?.[0] || '',
    tools.fiveWhys[0]?.porques?.[1] || '',
    tools.fiveWhys[0]?.porques?.[2] || '',
    tools.fiveWhys[0]?.porques?.[3] || '',
    tools.fiveWhys[0]?.porques?.[4] || ''
  ]);
  const [fiveWhysRoot, setFiveWhysRoot] = useState(tools.fiveWhys[0]?.causaRaiz || '');
  const [fiveWhysAct, setFiveWhysAct] = useState(tools.fiveWhys[0]?.acaoProposta || '');

  const saveFiveWhys = () => {
    const newItem: FiveWhysItem = {
      id: 'fw-1',
      problema: fiveWhysProb,
      porques: whys,
      causaRaiz: fiveWhysRoot,
      acaoProposta: fiveWhysAct
    };
    saveTools({ ...tools, fiveWhys: [newItem] });
  };

  // Ishikawa
  const [ishikawaEfeito, setIshikawaEfeito] = useState(tools.ishikawa?.efeito || '');
  const [ishikawaM1, setIshikawaM1] = useState(tools.ishikawa?.metodo?.join(', ') || '');
  const [ishikawaM2, setIshikawaM2] = useState(tools.ishikawa?.materiaPrima?.join(', ') || '');
  const [ishikawaM3, setIshikawaM3] = useState(tools.ishikawa?.maoDeObra?.join(', ') || '');
  const [ishikawaM4, setIshikawaM4] = useState(tools.ishikawa?.maquina?.join(', ') || '');
  const [ishikawaM5, setIshikawaM5] = useState(tools.ishikawa?.medicao?.join(', ') || '');
  const [ishikawaM6, setIshikawaM6] = useState(tools.ishikawa?.meioAmbiente?.join(', ') || '');

  const saveIshikawa = () => {
    const updated: IshikawaData = {
      efeito: ishikawaEfeito,
      metodo: ishikawaM1.split(',').map(s => s.trim()).filter(Boolean),
      materiaPrima: ishikawaM2.split(',').map(s => s.trim()).filter(Boolean),
      maoDeObra: ishikawaM3.split(',').map(s => s.trim()).filter(Boolean),
      maquina: ishikawaM4.split(',').map(s => s.trim()).filter(Boolean),
      medicao: ishikawaM5.split(',').map(s => s.trim()).filter(Boolean),
      meioAmbiente: ishikawaM6.split(',').map(s => s.trim()).filter(Boolean)
    };
    saveTools({ ...tools, ishikawa: updated });
  };

  // ----------------------------------------------------
  // SUB-TAB 8: FLUXOGRAMA
  // ----------------------------------------------------
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepType, setNewStepType] = useState<'Inicio' | 'Processo' | 'Decisao' | 'Fim'>('Processo');
  const [newStepResp, setNewStepResp] = useState('');

  const addFluxoStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: FluxoStep = {
      id: `step-${Date.now()}`,
      titulo: newStepTitle,
      tipo: newStepType,
      responsavel: newStepResp || undefined
    };

    // link previous node automatically
    const currentSteps = [...tools.fluxograma];
    if (currentSteps.length > 0) {
      currentSteps[currentSteps.length - 1].nextId = newStep.id;
    }

    currentSteps.push(newStep);
    saveTools({ ...tools, fluxograma: currentSteps });
    setNewStepTitle('');
    setNewStepResp('');
  };

  const removeFluxoStep = (id: string) => {
    let currentSteps = tools.fluxograma.filter(s => s.id !== id);
    // rebuild standard sequence links while cleaning up references to deleted step
    currentSteps = currentSteps.map((s, idx) => {
      let nextId = s.nextId === id ? undefined : s.nextId;
      let nextIdNo = s.nextIdNo === id ? undefined : s.nextIdNo;
      
      // if nextId was referencing the deleted step, default to the next step in list
      if (!nextId && idx < currentSteps.length - 1) {
        nextId = currentSteps[idx + 1].id;
      }
      return { ...s, nextId, nextIdNo };
    });
    saveTools({ ...tools, fluxograma: currentSteps });
  };

  const updateFluxoStepConnection = (stepId: string, nextId: string | undefined, isAlternative: boolean = false) => {
    const updated = tools.fluxograma.map(s => {
      if (s.id === stepId) {
        if (isAlternative) {
          return { ...s, nextIdNo: nextId || undefined };
        } else {
          return { ...s, nextId: nextId || undefined };
        }
      }
      return s;
    });
    saveTools({ ...tools, fluxograma: updated });
  };

  // ----------------------------------------------------
  // SUB-TAB: VSM (Value Stream Mapping)
  // ----------------------------------------------------
  const [vsmEtapa, setVsmEtapa] = useState('');
  const [vsmTempoCiclo, setVsmTempoCiclo] = useState<number>(10);
  const [vsmTempoPreparacao, setVsmTempoPreparacao] = useState<number>(5);
  const [vsmDisponibilidade, setVsmDisponibilidade] = useState<number>(95);
  const [vsmEstoque, setVsmEstoque] = useState<number>(100);
  const [vsmTempoFila, setVsmTempoFila] = useState<number>(30);
  const [vsmAgregaValor, setVsmAgregaValor] = useState<boolean>(true);

  const recalculateVsm = (steps: VsmStep[]) => {
    const tempoAgregaValor = steps.filter(s => s.agregaValor).reduce((acc, curr) => acc + curr.tempoCiclo, 0);
    const tempoNaoAgregaValor = steps.reduce((acc, curr) => {
      const stepNva = curr.tempoFila + (!curr.agregaValor ? curr.tempoCiclo : 0);
      return acc + stepNva;
    }, 0);
    const totalLeadTime = tempoAgregaValor + tempoNaoAgregaValor;
    const eficienciaCiclo = totalLeadTime > 0 ? Number(((tempoAgregaValor / totalLeadTime) * 100).toFixed(1)) : 0;

    return {
      etapas: steps,
      tempoAgregaValor,
      tempoNaoAgregaValor,
      eficienciaCiclo
    };
  };

  const addVsmStep = () => {
    if (!vsmEtapa.trim()) return;
    const newStep: VsmStep = {
      id: `vsm-${Date.now()}`,
      etapa: vsmEtapa,
      tempoCiclo: vsmTempoCiclo,
      tempoPreparacao: vsmTempoPreparacao,
      disponibilidade: vsmDisponibilidade,
      estoqueFila: vsmEstoque,
      tempoFila: vsmTempoFila,
      agregaValor: vsmAgregaValor
    };

    const currentEtapas = tools.vsm?.etapas ? [...tools.vsm.etapas] : [];
    currentEtapas.push(newStep);

    const calculatedVsm = recalculateVsm(currentEtapas);
    saveTools({ ...tools, vsm: calculatedVsm });

    // Reset form
    setVsmEtapa('');
    setVsmTempoCiclo(10);
    setVsmTempoPreparacao(5);
    setVsmDisponibilidade(95);
    setVsmEstoque(100);
    setVsmTempoFila(30);
    setVsmAgregaValor(true);
  };

  const removeVsmStep = (id: string) => {
    const currentEtapas = tools.vsm?.etapas ? tools.vsm.etapas.filter(s => s.id !== id) : [];
    const calculatedVsm = recalculateVsm(currentEtapas);
    saveTools({ ...tools, vsm: calculatedVsm });
  };

  // ----------------------------------------------------
  // SUB-TAB: DMAIC
  // ----------------------------------------------------
  const handleUpdateDmaicPhase = (faseIndex: number, concluida: boolean, entregaveis: string, metasMetricas?: string) => {
    if (!tools.dmaic?.fases) return;
    const updatedFases = [...tools.dmaic.fases];
    updatedFases[faseIndex] = {
      ...updatedFases[faseIndex],
      concluida,
      entregaveis,
      metasMetricas
    };
    saveTools({
      ...tools,
      dmaic: {
        fases: updatedFases
      }
    });
  };

  // Helper to trace active flow diagram paths
  const tracePath = (startStepId: string | undefined, isAlternative: boolean = false): string[] => {
    if (!startStepId || tools.fluxograma.length === 0) return [];
    const visited = new Set<string>();
    const path: string[] = [];
    let currentId: string | undefined = startStepId;

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const step = tools.fluxograma.find(s => s.id === currentId);
      if (!step) break;
      path.push(step.titulo);
      
      if (step.tipo === 'Decisao' && isAlternative && step.nextIdNo) {
        currentId = step.nextIdNo;
      } else {
        currentId = step.nextId;
      }
    }
    return path;
  };

  // ----------------------------------------------------
  // SUB-TAB 11: DOCUMENTOS, INDICADORES & EVIDÊNCIAS
  // ----------------------------------------------------
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evidenceName, setEvidenceName] = useState('');

  const handleEvidenceUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceName.trim()) return;

    const newEv: EvidenciaFile = {
      id: `ev-${Date.now()}`,
      nome: evidenceName,
      url: '#', // link simulado
      dataUpload: new Date().toISOString().split('T')[0],
      enviadoPor: project.lider
    };

    saveTools({ ...tools, evidencias: [...tools.evidencias, newEv] });
    setEvidenceName('');
    setSelectedFile(null);
  };

  return (
    <div id="project-detail-panel" className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
              {project.codigo}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {project.metodologia}
            </span>
          </div>
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100">{project.titulo}</h2>
          <p className="text-[11px] text-slate-500 max-w-xl">{project.descricao}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">
            Status: <b className="text-slate-800 dark:text-slate-100">{project.status}</b>
          </span>
          {onDeleteProject && (
            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
              title="Excluir Projeto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Projeto</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Voltar à Lista
          </button>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800/60 pb-1.5 scrollbar-thin scrollbar-thumb-slate-300">
        {[
          { id: 'visao', label: 'Evolução & Encerramento', icon: CheckCircle },
          { id: 'equipe', label: 'Equipe & Cronograma', icon: Users },
          { id: 'sipoc', label: 'SIPOC & VOC', icon: FileText },
          { id: 'brainstorming', label: 'PICK & Pareto', icon: Zap },
          { id: 'gut', label: 'Matriz GUT', icon: Flame },
          { id: 'swot', label: 'SWOT', icon: TrendingUp },
          { id: 'causa', label: 'Causa Raiz (Fishbone)', icon: Info },
          { id: 'fluxo', label: 'Fluxograma', icon: ArrowRight },
          { id: 'vsm', label: 'Mapeamento VSM', icon: Activity },
          { id: 'dmaic', label: 'DMAIC Dashboard', icon: BookOpen },
          { id: 'evidencias', label: 'Evidências & KPIs', icon: LinkIcon }
        ].map(tb => {
          const Icon = tb.icon;
          const isActive = activeSubTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setActiveSubTab(tb.id as SubTabType)}
              className={`flex items-center space-x-1 px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TABS CONTENTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs min-h-[360px]">
        
        {/* TAB 1: VISÃO GERAL & ETAPAS / ENCERRAMENTO */}
        {activeSubTab === 'visao' && (
          <div className="space-y-6">
            
            {/* 1. SECTOR GAINS & INTERACTIVE CALCULATOR (ROI, Payback, Lead Time, Savings) */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 dark:border-slate-850 pb-2">
                <h4 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Calculadora de Ganhos e Eficiência do Processo (ROI, Payback & Lead Time)</span>
                </h4>
                <button
                  onClick={handleSaveEfficiencyParams}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95"
                >
                  Gravar Parâmetros de Eficiência
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* CAPEX */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">CAPEX Investido</span>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500">R$</span>
                    <input 
                      type="number"
                      value={calcInvestimento}
                      onChange={(e) => setCalcInvestimento(Number(e.target.value))}
                      className="w-full text-xs font-black bg-slate-50 dark:bg-slate-950 p-1 rounded"
                    />
                  </div>
                </div>

                {/* Retorno Estimado */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Retorno Esperado (Anual)</span>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500">R$</span>
                    <input 
                      type="number"
                      value={calcRetornoEsperado}
                      onChange={(e) => setCalcRetornoEsperado(Number(e.target.value))}
                      className="w-full text-xs font-black bg-slate-50 dark:bg-slate-950 p-1 rounded"
                    />
                  </div>
                </div>

                {/* Economia Líquida & ROI */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">ROI & Saving Esperado</span>
                  <div className="mt-1.5">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                      ROI: {calcInvestimento > 0 ? Math.round(((calcRetornoEsperado - calcInvestimento) / calcInvestimento) * 100) : 0}%
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 block">
                      Líquido: R$ {Math.max(0, calcRetornoEsperado - calcInvestimento).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Lead Time Before */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Lead Time Inicial</span>
                  <div className="mt-1.5 flex items-center gap-1">
                    <input 
                      type="number"
                      value={calcLtBefore}
                      onChange={(e) => setCalcLtBefore(Number(e.target.value))}
                      className="w-full text-xs font-black bg-slate-50 dark:bg-slate-950 p-1 rounded text-center"
                    />
                    <select 
                      value={calcLtUnit}
                      onChange={(e) => setCalcLtUnit(e.target.value as any)}
                      className="text-[9px] font-bold bg-slate-50 dark:bg-slate-950 p-1 rounded border border-slate-150"
                    >
                      <option value="horas">h</option>
                      <option value="dias">dias</option>
                      <option value="minutos">min</option>
                    </select>
                  </div>
                </div>

                {/* Lead Time After */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Lead Time Otimizado</span>
                  <div className="mt-1.5 flex items-center gap-1">
                    <input 
                      type="number"
                      value={calcLtAfter}
                      onChange={(e) => setCalcLtAfter(Number(e.target.value))}
                      className="w-full text-xs font-black bg-slate-50 dark:bg-slate-950 p-1 rounded text-center"
                    />
                    <span className="text-[9px] font-black text-rose-500 shrink-0">
                      -{calcLtBefore > 0 ? Math.round(((calcLtBefore - calcLtAfter) / calcLtBefore) * 100) : 0}%
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. THREE SECTION ROW FOR STEPS, TOLLGATES & ELECTRONIC APPROVALS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Stages/Etapas */}
              <div className="space-y-4 lg:col-span-1">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Passos de Execução ({project.metodologia})</span>
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">Pressione cada etapa para atualizar o andamento.</p>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {tools.etapas?.map((et, idx) => {
                    const statusColors = {
                      'Pendente': 'bg-slate-50 border-slate-150 text-slate-400 dark:bg-slate-950 dark:border-slate-800',
                      'Em Andamento': 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400',
                      'Concluido': 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                    };

                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleEtapa(idx)}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-blue-500 transition-all ${statusColors[et.status]}`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-xs font-mono">{idx + 1}.</span>
                          <span className="font-black text-[11px]">{et.nome}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[9px] shrink-0">
                          <span className="font-bold px-1.5 py-0.5 rounded-md border border-current text-[8px] uppercase tracking-wider">
                            {et.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Middle Column: Gate checkpoints & approvals (Sponsor/Quality) */}
              <div className="space-y-4 lg:col-span-1">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Controle de Portões de Governança (Gates)</span>
                </h3>

                {/* Opening Approvals (Portão de Abertura) */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-850 dark:text-slate-100">1. Portão de Abertura</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      project.status !== 'Planejado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {project.status !== 'Planejado' ? 'Liberado' : 'Aguardando'}
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    O projeto requer o sign-off digital do Sponsor e Gestor de Qualidade para ser liberado para execução.
                  </p>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleSignOpening('sponsor')}
                      disabled={project.status !== 'Planejado' || (tools.approvals?.opening?.sponsor)}
                      className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center space-x-1 border ${
                        tools.approvals?.opening?.sponsor 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold'
                          : project.status === 'Planejado'
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sponsor: {tools.approvals?.opening?.signedBySponsor || 'Assinar Abertura'}</span>
                    </button>

                    <button
                      onClick={() => handleSignOpening('quality')}
                      disabled={project.status !== 'Planejado' || (tools.approvals?.opening?.quality)}
                      className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center space-x-1 border ${
                        tools.approvals?.opening?.quality 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold'
                          : project.status === 'Planejado'
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Qualidade: {tools.approvals?.opening?.signedByQuality || 'Assinar Abertura'}</span>
                    </button>
                  </div>
                </div>

                {/* Checklist Compliance */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-2 text-[10px] text-slate-600 dark:text-slate-400">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Checklist de Conformidade ISO 9001:2015</span>
                  
                  <div className="flex items-center space-x-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${tools.swot.forcas?.length > 0 || tools.gut?.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Matriz de Riscos ou GUT/SWOT preenchido</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${tools.sipoc.fornecedores || tools.voc?.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>SIPOC ou Voz do Cliente (VOC) definidos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${tools.ishikawa.efeito || tools.fiveWhys?.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Análise de Causa Raiz preenchida</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${tools.cronograma?.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Entregas de cronograma cadastradas</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Encerramento Formal & Closing approvals */}
              <div className="space-y-4 lg:col-span-1">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Encerramento Formal & Portão 2</span>
                </h3>

                {tools.etapas.every(e => e.status === 'Concluido') ? (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 block">Assinaturas de Fechamento</span>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase block">Relatório Final de Resultados</label>
                      <textarea
                        value={relatorioFinal}
                        onChange={(e) => setRelatorioFinal(e.target.value)}
                        placeholder="Quais foram os resultados físicos alcançados?"
                        rows={2}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase block">Lições Aprendidas</label>
                      <textarea
                        value={licoesAprendidas}
                        onChange={(e) => setLicoesAprendidas(e.target.value)}
                        placeholder="O que aprendemos com este projeto?"
                        rows={2}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-200/50 mt-2">
                      <button
                        onClick={() => handleSignClosure('sponsor')}
                        disabled={project.status === 'Concluído' || (tools.approvals?.closure?.sponsor)}
                        className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center space-x-1 border ${
                          tools.approvals?.closure?.sponsor 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sponsor: {tools.approvals?.closure?.signedBySponsor || 'Sign off Fechamento'}</span>
                      </button>

                      <button
                        onClick={() => handleSignClosure('quality')}
                        disabled={project.status === 'Concluído' || (tools.approvals?.closure?.quality)}
                        className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center space-x-1 border ${
                          tools.approvals?.closure?.quality 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Qualidade: {tools.approvals?.closure?.signedByQuality || 'Sign off Fechamento'}</span>
                      </button>
                    </div>

                    <label className="flex items-center space-x-2 cursor-pointer pt-1">
                      <input 
                        type="checkbox" 
                        checked={roiValidado} 
                        onChange={(e) => setRoiValidado(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Retorno Financeiro Validado</span>
                    </label>

                    <button
                      onClick={handleEncerramentoSave}
                      disabled={!(tools.approvals?.closure?.sponsor && tools.approvals?.closure?.quality)}
                      className={`w-full py-2 font-bold rounded-xl text-[10px] transition-colors uppercase tracking-wider ${
                        (tools.approvals?.closure?.sponsor && tools.approvals?.closure?.quality)
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Formalizar Encerramento
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 p-4 rounded-xl text-center text-slate-400 py-10">
                    <Clock className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Portão Bloqueado</span>
                    <p className="text-[9px] mt-1 text-slate-400 max-w-[150px] mx-auto">
                      Conclua todos os passos de execução do projeto para habilitar o painel de encerramento formal.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* 3. HARD CROSS-MODULE INTEGRATION CARD (AUDITS, 5W2H ACTION PLANS, SOPS, PRACTICAL TRAINING) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
              
              {/* Integrations Selectors */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Sincronização e Integrações de Módulos (VickyTex SGQ)</span>
                </h4>

                {/* Audit Linking */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Auditoria Interna Origem (Oportunidade)</label>
                  <select
                    value={linkedAuditId}
                    onChange={(e) => handleLinkIntegration('auditoriaId', e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white dark:bg-slate-900"
                  >
                    <option value="">-- Não vinculada (Iniciativa Direta) --</option>
                    {availableAudits.map(aud => (
                      <option key={aud.id} value={aud.id}>{aud.codigo} — {aud.titulo} ({aud.setor})</option>
                    ))}
                  </select>
                </div>

                {/* Action Plan Linking */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Plano de Ação 5W2H Vinculado</label>
                  <div className="flex gap-2">
                    <select
                      value={linkedPlanoId}
                      onChange={(e) => handleLinkIntegration('planoAcaoId', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white dark:bg-slate-900 flex-1"
                    >
                      <option value="">-- Sem Plano de Ação Vinculado --</option>
                      {availablePlans.map(pl => (
                        <option key={pl.id} value={pl.id}>{pl.codigo} — {pl.titulo} ({pl.status})</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAutoGenerate5W2H}
                      className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold whitespace-nowrap active:scale-95"
                    >
                      Gerar 5W2H Novo
                    </button>
                  </div>
                </div>

                {/* Standard SOP Document Linking */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Documento de Trabalho Padronizado (POP / Instrução)</label>
                  <select
                    value={linkedDocId}
                    onChange={(e) => handleLinkIntegration('documentoSopId', e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white dark:bg-slate-900"
                  >
                    <option value="">-- Sem POP Vinculado (Não padronizado) --</option>
                    {availableDocs.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.codigo} — {doc.titulo} (v{doc.versao})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Training and Workspace Integration Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Log de Horas Práticas (Cinto Belt) & Google Workspace</span>
                </h4>

                {/* Belt training hours logging */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Horas Técnicas Práticas Acumuladas</span>
                    <span className="text-xs font-black text-indigo-600 font-mono">{loggedTrainingHours} h</span>
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Registre as horas gastas pela equipe na condução destas ferramentas para somar pontos de Belt no Leaderboard.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="number"
                      value={calcTrainingHours}
                      onChange={(e) => setCalcTrainingHours(Number(e.target.value))}
                      className="w-20 p-1 text-center font-bold text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-lg"
                    />
                    <button
                      onClick={handleSaveTrainingHours}
                      className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold"
                    >
                      Gravar Horas Técnicas
                    </button>
                  </div>
                </div>

                {/* Google Workspace Simulations */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Integração Google Workspace Corporativo</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSyncGoogleDrive}
                      className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg text-[10px] text-center"
                    >
                      Pasta Evidências no Drive
                    </button>
                    <button
                      onClick={handleGenerateA3Doc}
                      className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-lg text-[10px] text-center"
                    >
                      Exportar Relatório A3
                    </button>
                  </div>
                  {syncStatus && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold rounded-lg animate-pulse">
                      {syncStatus}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: EQUIPE & CRONOGRAMA */}
        {activeSubTab === 'equipe' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Membros da Equipe</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tools.equipe?.map((mem, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">{mem.nome}</span>
                      <span className="text-[10px] text-slate-400">{mem.funcao} • {mem.email?.split('@')[0] || ''}</span>
                    </div>
                    <button 
                      onClick={() => removeEquipeMember(mem.email)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Member form */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <input 
                  type="text" 
                  placeholder="Nome do colaborador"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <input 
                  type="email" 
                  placeholder="Email institucional"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <input 
                  type="text" 
                  placeholder="Função (Ex: Líder, Operador...)"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <button
                  onClick={addEquipeMember}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-colors"
                >
                  Adicionar Membro
                </button>
              </div>
            </div>

            {/* Cronograma Tasks */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Cronograma & Entregas de Projeto (WBS/Gantt)</span>
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {tools.cronograma?.map((t) => {
                  const statusColors = {
                    'Pendente': 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800',
                    'Em Andamento': 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400',
                    'Concluido': 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                  };

                  return (
                    <div key={t.id} className={`p-3 border rounded-xl flex items-center justify-between gap-3 text-xs ${statusColors[t.status]}`}>
                      <div>
                        <span className="font-bold block">{t.tarefa}</span>
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                          <span>Fase: <b className="text-slate-500">{t.etapa}</b></span>
                          <span>Responsável: <b className="text-slate-500">{t.responsavel?.split('@')[0] || 'Sem Responsável'}</b></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-[10px] shrink-0">
                        <span className="font-mono text-slate-400">{t.dataInicio} ~ {t.dataFim}</span>
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className="px-2 py-0.5 rounded border border-current font-bold uppercase hover:bg-white dark:hover:bg-slate-950 text-[9px]"
                        >
                          {t.status}
                        </button>
                        <button 
                          onClick={() => removeCronogramaTask(t.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add WBS task */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <input 
                  type="text" 
                  placeholder="Nome da entrega/tarefa..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <select
                  value={newTaskStage}
                  onChange={(e) => setNewTaskStage(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-700"
                >
                  {tools.etapas?.map(e => (
                    <option key={e.nome} value={e.nome}>{e.nome}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-1.5 sm:col-span-2">
                  <input 
                    type="date" 
                    value={newTaskStart}
                    onChange={(e) => setNewTaskStart(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px]"
                  />
                  <input 
                    type="date" 
                    value={newTaskEnd}
                    onChange={(e) => setNewTaskEnd(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px]"
                  />
                </div>
                <button
                  onClick={addCronogramaTask}
                  className="sm:col-span-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] transition-colors"
                >
                  Adicionar Tarefa
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: SIPOC & VOC */}
        {activeSubTab === 'sipoc' && (
          <div className="space-y-6">
            
            {/* SIPOC Interactive Areas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Definição de Fronteiras do Processo (SIPOC)</span>
                </h3>
                <button
                  onClick={saveSipoc}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                >
                  <Save className="w-3 h-3" />
                  <span>Salvar SIPOC</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">S — Suppliers</span>
                  <textarea 
                    value={sipocForn} 
                    onChange={(e) => setSipocForn(e.target.value)}
                    rows={4}
                    placeholder="Quem fornece as matérias primas..."
                    className="w-full text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">I — Inputs</span>
                  <textarea 
                    value={sipocEnt} 
                    onChange={(e) => setSipocEnt(e.target.value)}
                    rows={4}
                    placeholder="Quais as matérias primas / dados..."
                    className="w-full text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 sm:col-span-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">P — Process (Passos)</span>
                  <textarea 
                    value={sipocPassos} 
                    onChange={(e) => setSipocPassos(e.target.value)}
                    rows={4}
                    placeholder="Insira os macro-passos (um por linha)..."
                    className="w-full text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">O — Outputs</span>
                  <textarea 
                    value={sipocSaid} 
                    onChange={(e) => setSipocSaid(e.target.value)}
                    rows={4}
                    placeholder="O que é entregue no final do processo..."
                    className="w-full text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">C — Customers</span>
                  <textarea 
                    value={sipocCli} 
                    onChange={(e) => setSipocCli(e.target.value)}
                    rows={4}
                    placeholder="Quem é o cliente imediato destas saídas..."
                    className="w-full text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Voice of Customer (VOC) */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Voz do Cliente (VOC) — Mapeamento de Necessidades</span>
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* List of VOC requirements */}
                <div className="lg:col-span-2 space-y-2 max-h-48 overflow-y-auto">
                  {tools.voc?.length > 0 ? (
                    tools.voc.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">Cliente: {item.cliente}</span>
                          <p className="text-slate-500 mt-1">Voz: "{item.feedback}"</p>
                          <p className="text-blue-600 dark:text-blue-400 mt-0.5 font-bold">Necessidade (CTQ): {item.necessidade}</p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            item.prioridade === 'Alta' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-500'
                          }`}>
                            {item.prioridade}
                          </span>
                          <button 
                            onClick={() => removeVocItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                      Nenhum requisito de voz do cliente inserido.
                    </div>
                  )}
                </div>

                {/* Add VOC Form */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2 text-xs">
                  <input 
                    type="text" 
                    placeholder="Segmento de Cliente" 
                    value={newVocClient} 
                    onChange={(e) => setNewVocClient(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                  />
                  <input 
                    type="text" 
                    placeholder="Voz do Cliente (Feedback literal)" 
                    value={newVocFeedback} 
                    onChange={(e) => setNewVocFeedback(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                  />
                  <input 
                    type="text" 
                    placeholder="Necessidade Crítica (CTQ)" 
                    value={newVocNeed} 
                    onChange={(e) => setNewVocNeed(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                  />
                  <select
                    value={newVocPriority}
                    onChange={(e) => setNewVocPriority(e.target.value as 'Alta' | 'Média' | 'Baixa')}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700"
                  >
                    <option value="Alta">Alta Prioridade</option>
                    <option value="Média">Média Prioridade</option>
                    <option value="Baixa">Baixa Prioridade</option>
                  </select>
                  <button
                    onClick={addVocItem}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] transition-colors"
                  >
                    Mapear Requisito VOC
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 4: BRAINSTORMING, PICK MATRIX & PARETO */}
        {activeSubTab === 'brainstorming' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Brainstorming list */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Ideação & Brainstorming</span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tools.brainstorming?.map(item => (
                    <div key={item.id} className="p-2 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between text-[11px] bg-slate-50/50 dark:bg-slate-950/20">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{item.ideia}</span>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          Cat: {item.categoria} • Imp: {item.impacto} • Esf: {item.esforco}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeBrainstormingIdea(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <input 
                    type="text" 
                    placeholder="Insira uma ideia inovadora..."
                    value={newIdeaText}
                    onChange={(e) => setNewIdeaText(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                  <input 
                    type="text" 
                    placeholder="Categoria (Ex: Operação, Sistema)"
                    value={newIdeaCat}
                    onChange={(e) => setNewIdeaCat(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold block">Impacto (1-5)</span>
                      <input 
                        type="number" 
                        min={1} 
                        max={5} 
                        value={newIdeaImpact} 
                        onChange={(e) => setNewIdeaImpact(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold block">Esforço (1-5)</span>
                      <input 
                        type="number" 
                        min={1} 
                        max={5} 
                        value={newIdeaEffort} 
                        onChange={(e) => setNewIdeaEffort(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addBrainstormingIdea}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px]"
                  >
                    Injetar Ideia
                  </button>
                </div>
              </div>

              {/* PICK Matrix 2x2 Quadrants */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Matriz PICK (Esforço x Impacto)</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 h-48 text-[9px] font-bold">
                  
                  {/* Quadrant IMPLEMENT (Possible Gain / Quick Wins) */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-emerald-700 block">IMPLEMENT (Alto Impacto / Baixo Esforço)</span>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {tools.brainstorming?.filter(i => i.impacto >= 4 && i.esforco <= 2).map(i => (
                        <span key={i.id} className="bg-white/80 px-1 py-0.5 rounded text-[8px] border border-emerald-300 block truncate">{i.ideia}</span>
                      ))}
                    </div>
                  </div>

                  {/* Quadrant CHALLENGE (Strategic Projects) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-blue-700 block">CHALLENGE (Alto Impacto / Alto Esforço)</span>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {tools.brainstorming?.filter(i => i.impacto >= 4 && i.esforco >= 3).map(i => (
                        <span key={i.id} className="bg-white/80 px-1 py-0.5 rounded text-[8px] border border-blue-300 block truncate">{i.ideia}</span>
                      ))}
                    </div>
                  </div>

                  {/* Quadrant POSSIBLE (Secondary Initiatives) */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-amber-700 block">POSSIBLE (Baixo Impacto / Baixo Esforço)</span>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {tools.brainstorming?.filter(i => i.impacto <= 3 && i.esforco <= 2).map(i => (
                        <span key={i.id} className="bg-white/80 px-1 py-0.5 rounded text-[8px] border border-amber-300 block truncate">{i.ideia}</span>
                      ))}
                    </div>
                  </div>

                  {/* Quadrant KILL (Descartável) */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-red-700 block">KILL (Baixo Impacto / Alto Esforço)</span>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {tools.brainstorming?.filter(i => i.impacto <= 3 && i.esforco >= 3).map(i => (
                        <span key={i.id} className="bg-white/80 px-1 py-0.5 rounded text-[8px] border border-red-300 block truncate">{i.ideia}</span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Pareto chart of Causes / Losses */}
              <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Análise de Pareto (Perdas Operacionais 80/20)</span>
                </h3>

                {sortedParetoCauses.length > 0 ? (
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={paretoChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-850" />
                        <XAxis dataKey="causa" stroke="#94a3b8" fontSize={8} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#94a3b8" fontSize={8} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={8} domain={[0, 100]} />
                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                        <Bar yAxisId="left" dataKey="Frequência" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        <Line yAxisId="right" dataKey="Acumulado (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <Activity className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1" />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Nenhuma causa cadastrada</span>
                    <span className="text-[9px] text-slate-400">Adicione causas e ocorrências abaixo para gerar a análise 80/20.</span>
                  </div>
                )}

                {/* Pareto Data Table with Edit/Delete/Add */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Causas & Ocorrências ({sortedParetoCauses.length})</span>
                    <span>Total Perdas: {totalLosses}</span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {sortedParetoCauses.length > 0 ? (
                      sortedParetoCauses.map((p, idx) => (
                        <div key={p.id} className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          {editingParetoId === p.id ? (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={editParetoCause}
                                onChange={(e) => setEditParetoCause(e.target.value)}
                                className="flex-1 p-1 bg-white dark:bg-slate-900 border rounded text-xs font-bold"
                              />
                              <input
                                type="number"
                                value={editParetoCount}
                                onChange={(e) => setEditParetoCount(Number(e.target.value))}
                                className="w-16 p-1 bg-white dark:bg-slate-900 border rounded text-xs font-bold text-center"
                              />
                              <button onClick={saveEditPareto} className="p-1 text-emerald-600 hover:text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingParetoId(null)} className="p-1 text-slate-400">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 rounded">
                                  #{idx + 1}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{p.causa}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-black text-slate-700 dark:text-slate-300">{p.ocorrencias} ocor.</span>
                                <div className="flex space-x-1">
                                  <button onClick={() => startEditPareto(p)} className="p-1 text-slate-400 hover:text-blue-600">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => removeParetoItem(p.id)} className="p-1 text-slate-400 hover:text-rose-600">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-[10px] text-slate-400 italic">
                        Nenhuma ocorrência registrada ainda.
                      </div>
                    )}
                  </div>

                  {/* Add New Pareto Cause */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nova Causa de Perda..."
                      value={newParetoCause}
                      onChange={(e) => setNewParetoCause(e.target.value)}
                      className="flex-1 p-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                    <input
                      type="number"
                      value={newParetoCount}
                      onChange={(e) => setNewParetoCount(Number(e.target.value))}
                      className="w-16 p-1.5 text-xs text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold"
                      min={1}
                    />
                    <button
                      onClick={addParetoItem}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Incluir</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: MATRIZ GUT */}
        {activeSubTab === 'gut' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Matriz GUT — Priorização de Riscos e Análise de Falhas</span>
              </h3>
              <p className="text-[10px] text-slate-400">Classificação de perdas por Gravidade, Urgência e Tendência. Os riscos são ordenados de forma decrescente.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Risks list with scores */}
              <div className="lg:col-span-2 space-y-3 max-h-60 overflow-y-auto">
                {tools.gut?.length > 0 ? (
                  tools.gut.map((g, idx) => (
                    <div key={g.id} className="p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/20 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-1.5 rounded">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{g.problema}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Plano de Contenção: <span className="font-semibold text-slate-500">{g.acao || 'Nenhum plano associado'}</span></p>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="flex space-x-2 text-[10px] text-slate-400 font-bold">
                          <span>G: <b className="text-slate-700 dark:text-slate-300">{g.G}</b></span>
                          <span>U: <b className="text-slate-700 dark:text-slate-300">{g.U}</b></span>
                          <span>T: <b className="text-slate-700 dark:text-slate-300">{g.T}</b></span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block">Score</span>
                          <span className="text-xs font-black text-red-600 dark:text-red-400">{g.total}</span>
                        </div>
                        <button 
                          onClick={() => removeGutItem(g.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-10 border border-dashed border-slate-150 dark:border-slate-800 rounded-xl">
                    Nenhum risco registrado na Matriz GUT.
                  </div>
                )}
              </div>

              {/* Add Gut Risk Form */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Problema / Desvio Identificado</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Aquecimento excessivo na mesa PV..." 
                    value={newGutProblem}
                    onChange={(e) => setNewGutProblem(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Gravidade</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={5} 
                      value={newGutG}
                      onChange={(e) => setNewGutG(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Urgência</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={5} 
                      value={newGutU}
                      onChange={(e) => setNewGutU(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Tendência</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={5} 
                      value={newGutT}
                      onChange={(e) => setNewGutT(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Plano de Contenção (Ação Proposta)</label>
                  <input 
                    type="text" 
                    placeholder="O que faremos para conter o problema?" 
                    value={newGutAction}
                    onChange={(e) => setNewGutAction(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                  />
                </div>

                <button
                  onClick={addGutItem}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px]"
                >
                  Registrar GUT
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: MATRIZ SWOT */}
        {activeSubTab === 'swot' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Matriz SWOT — Forças, Fraquezas, Oportunidades & Ameaças</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 2x2 SWOT grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* STRENGTHS */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                  <span className="text-emerald-700 font-black text-xs block">S — Forças (Interno / Positivo)</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {tools.swot?.forcas?.map((tag, idx) => (
                      <div key={idx} className="bg-white/80 border border-emerald-200 rounded-lg px-2 py-1 flex justify-between items-center text-[10px] text-slate-700">
                        <span>{tag}</span>
                        <button onClick={() => removeSwotItem('forcas', idx)} className="text-red-500 hover:text-red-700 p-0.5">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WEAKNESSES */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
                  <span className="text-red-700 font-black text-xs block">W — Fraquezas (Interno / Negativo)</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {tools.swot?.fraquezas?.map((tag, idx) => (
                      <div key={idx} className="bg-white/80 border border-red-200 rounded-lg px-2 py-1 flex justify-between items-center text-[10px] text-slate-700">
                        <span>{tag}</span>
                        <button onClick={() => removeSwotItem('fraquezas', idx)} className="text-red-500 hover:text-red-700 p-0.5">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OPPORTUNITIES */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                  <span className="text-blue-700 font-black text-xs block">O — Oportunidades (Externo / Positivo)</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {tools.swot?.oportunidades?.map((tag, idx) => (
                      <div key={idx} className="bg-white/80 border border-blue-200 rounded-lg px-2 py-1 flex justify-between items-center text-[10px] text-slate-700">
                        <span>{tag}</span>
                        <button onClick={() => removeSwotItem('oportunidades', idx)} className="text-red-500 hover:text-red-700 p-0.5">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* THREATS */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                  <span className="text-amber-700 font-black text-xs block">T — Ameaças (Externo / Negativo)</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {tools.swot?.ameacas?.map((tag, idx) => (
                      <div key={idx} className="bg-white/80 border border-amber-200 rounded-lg px-2 py-1 flex justify-between items-center text-[10px] text-slate-700">
                        <span>{tag}</span>
                        <button onClick={() => removeSwotItem('ameacas', idx)} className="text-red-500 hover:text-red-700 p-0.5">×</button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Add SWOT Tag form */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Novo Elemento SWOT</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Alta rotatividade operacional..." 
                    value={newSwotText}
                    onChange={(e) => setNewSwotText(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Quadrante</label>
                  <select
                    value={swotQuad}
                    onChange={(e) => setSwotQuad(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700"
                  >
                    <option value="forcas">S — Força (Strengths)</option>
                    <option value="fraquezas">W — Fraqueza (Weaknesses)</option>
                    <option value="oportunidades">O — Oportunidade (Opportunities)</option>
                    <option value="ameacas">T — Ameaça (Threats)</option>
                  </select>
                </div>

                <button
                  onClick={addSwotItem}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px]"
                >
                  Registrar Fator SWOT
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: CAUSA RAIZ (5 PORQUÊS & ISHIKAWA) */}
        {activeSubTab === 'causa' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 5 Whys Chain */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Análise de Porquês (Ilimitado)</span>
                  </span>
                  <button onClick={saveFiveWhys} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] shadow-xs">Salvar Análise</button>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-red-500 uppercase block">Problema Principal Observado</label>
                    <input 
                      type="text" 
                      value={fiveWhysProb} 
                      onChange={(e) => setFiveWhysProb(e.target.value)}
                      placeholder="Ex: Parada na esteira de corte PV..."
                      className="w-full p-2 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {whys.map((why, index) => (
                      <div key={index} className="space-y-1 flex items-center gap-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 w-20 text-[10px]">
                          {index + 1}º Porquê:
                        </span>
                        <input 
                          type="text" 
                          value={why} 
                          onChange={(e) => {
                            const newWhys = [...whys];
                            newWhys[index] = e.target.value;
                            setWhys(newWhys);
                          }}
                          placeholder={`Por que ocorreu o ${index === 0 ? 'problema principal' : `${index}º porquê`}?`}
                          className="w-full p-2 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900 text-xs"
                        />
                        {whys.length > 1 && (
                          <button
                            onClick={() => setWhys(whys.filter((_, i) => i !== index))}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg shrink-0"
                            title="Remover este porquê"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setWhys([...whys, ''])}
                    className="w-full py-1.5 border border-dashed border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-[10px] hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Outro Porquê</span>
                  </button>

                  <div className="space-y-1 border-t border-slate-200 dark:border-slate-800 pt-3">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Causa Raiz Identificada</label>
                    <input 
                      type="text" 
                      value={fiveWhysRoot} 
                      onChange={(e) => setFiveWhysRoot(e.target.value)}
                      placeholder="Insira o fator originador..."
                      className="w-full p-2 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900 font-bold text-blue-600 dark:text-blue-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Ação Proposta (Plano de Contramedidas)</label>
                    <input 
                      type="text" 
                      value={fiveWhysAct} 
                      onChange={(e) => setFiveWhysAct(e.target.value)}
                      placeholder="O que faremos para eliminar a causa?"
                      className="w-full p-2 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Ishikawa Fishbone Diagram */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>Diagrama de Causa e Efeito (Ishikawa / 6M)</span>
                  </span>
                  <button onClick={saveIshikawa} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] shadow-xs">Salvar 6M</button>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-red-500 uppercase block">Efeito / Problema Desejado a Analisar</label>
                    <input 
                      type="text" 
                      value={ishikawaEfeito} 
                      onChange={(e) => setIshikawaEfeito(e.target.value)}
                      placeholder="Ex: Tempo de setup alto (45 minutos)..."
                      className="w-full p-2 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  {/* 6M Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Método */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase block">1. Método</span>
                      <input 
                        type="text" 
                        placeholder="Insira causas separadas por vírgula..." 
                        value={ishikawaM1} 
                        onChange={(e) => setIshikawaM1(e.target.value)} 
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs" 
                      />
                    </div>

                    {/* Matéria-Prima */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase block">2. Matéria-Prima</span>
                      <input 
                        type="text" 
                        placeholder="Insira causas separadas por vírgula..." 
                        value={ishikawaM2} 
                        onChange={(e) => setIshikawaM2(e.target.value)} 
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs" 
                      />
                    </div>

                    {/* Mão de Obra */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase block">3. Mão de Obra</span>
                      <input 
                        type="text" 
                        placeholder="Insira causas separadas por vírgula..." 
                        value={ishikawaM3} 
                        onChange={(e) => setIshikawaM3(e.target.value)} 
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs" 
                      />
                    </div>

                    {/* Máquina */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase block">4. Máquina</span>
                      <input 
                        type="text" 
                        placeholder="Insira causas separadas por vírgula..." 
                        value={ishikawaM4} 
                        onChange={(e) => setIshikawaM4(e.target.value)} 
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs" 
                      />
                    </div>

                    {/* Medição */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase block">5. Medição</span>
                      <input 
                        type="text" 
                        placeholder="Insira causas separadas por vírgula..." 
                        value={ishikawaM5} 
                        onChange={(e) => setIshikawaM5(e.target.value)} 
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs" 
                      />
                    </div>

                    {/* Meio Ambiente */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase block">6. Meio Ambiente</span>
                      <input 
                        type="text" 
                        placeholder="Insira causas separadas por vírgula..." 
                        value={ishikawaM6} 
                        onChange={(e) => setIshikawaM6(e.target.value)} 
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs" 
                      />
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 8: FLUXOGRAMA */}
        {activeSubTab === 'fluxo' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <span>Fluxograma de Processo Avançado (Multi-Caminho)</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Defina desvios de decisão (Losango) com múltiplos caminhos direcionais (Sim/Não)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Middle: Interactive Flow Diagram Map & Steps */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Simulated Path Trace Visualizer */}
                {tools.fluxograma?.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Rastreamento Ativo de Caminhos do Processo</span>
                    
                    <div className="space-y-2 text-xs">
                      {/* Standard Path */}
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-600 uppercase mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Caminho Principal (Fluxo de Sucesso / SIM)</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {tracePath(tools.fluxograma[0]?.id, false).map((stepTitle, i) => (
                            <React.Fragment key={i}>
                              <span className="bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/40">{stepTitle}</span>
                              {i < tracePath(tools.fluxograma[0]?.id, false).length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Deviation Path */}
                      {tools.fluxograma.some(s => s.tipo === 'Decisao') && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-rose-500 uppercase mb-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Caminho Alternativo (Desvio de Decisão / NÃO)</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {tracePath(tools.fluxograma[0]?.id, true).map((stepTitle, i) => (
                              <React.Fragment key={i}>
                                <span className="bg-rose-50/50 dark:bg-rose-950/20 px-2.5 py-1 rounded-md border border-rose-100 dark:border-rose-900/40">{stepTitle}</span>
                                {i < tracePath(tools.fluxograma[0]?.id, true).length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Steps Cards with Connection Options */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Nós do Processo & Configurações de Conexão</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tools.fluxograma?.length > 0 ? (
                      tools.fluxograma.map((s, idx) => {
                        const isDecisao = s.tipo === 'Decisao';
                        const isInicio = s.tipo === 'Inicio';
                        const isFim = s.tipo === 'Fim';

                        // Candidates to connect to (exclude self)
                        const connectionCandidates = tools.fluxograma.filter(cand => cand.id !== s.id);

                        return (
                          <div 
                            key={s.id} 
                            className={`p-4 rounded-xl border-2 transition-all hover:shadow-xs relative flex flex-col justify-between ${
                              isInicio 
                                ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40' 
                                : isFim 
                                  ? 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-300 dark:border-slate-800' 
                                  : isDecisao 
                                    ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-300 dark:border-amber-900/40' 
                                    : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80'
                            }`}
                          >
                            <button 
                              onClick={() => removeFluxoStep(s.id)}
                              className="absolute top-2.5 right-2.5 bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:hover:bg-red-950 text-slate-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center transition-all"
                              title="Remover etapa"
                            >
                              ×
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono ${
                                  isInicio 
                                    ? 'bg-blue-500 text-white' 
                                    : isFim 
                                      ? 'bg-slate-700 text-white' 
                                      : isDecisao 
                                        ? 'bg-amber-500 text-white' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {s.tipo}
                                </span>
                                {s.responsavel && (
                                  <span className="text-[9px] font-bold text-slate-400 font-mono">[{s.responsavel}]</span>
                                )}
                              </div>

                              <h4 className="text-xs font-black text-slate-850 dark:text-slate-100">{s.titulo}</h4>
                            </div>

                            {/* Connections form */}
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 space-y-2 text-[10px]">
                              {!isFim && (
                                <>
                                  {isDecisao ? (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="font-bold text-emerald-600 block">🟢 SE SIM (Padrão):</label>
                                        <select
                                          value={s.nextId || ''}
                                          onChange={(e) => updateFluxoStepConnection(s.id, e.target.value || undefined, false)}
                                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-1.5 rounded-md font-bold text-slate-700 dark:text-slate-300"
                                        >
                                          <option value="">-- Fim de Fluxo --</option>
                                          {connectionCandidates.map(cand => (
                                            <option key={cand.id} value={cand.id}>{cand.titulo}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-rose-500 block">🔴 SE NÃO (Desvio):</label>
                                        <select
                                          value={s.nextIdNo || ''}
                                          onChange={(e) => updateFluxoStepConnection(s.id, e.target.value || undefined, true)}
                                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-1.5 rounded-md font-bold text-slate-700 dark:text-slate-300"
                                        >
                                          <option value="">-- Fim de Fluxo --</option>
                                          {connectionCandidates.map(cand => (
                                            <option key={cand.id} value={cand.id}>{cand.titulo}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <label className="font-bold text-slate-500 block">➔ Próxima Etapa do Processo:</label>
                                      <select
                                        value={s.nextId || ''}
                                        onChange={(e) => updateFluxoStepConnection(s.id, e.target.value || undefined, false)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-1.5 rounded-md font-bold text-slate-700 dark:text-slate-300"
                                      >
                                        <option value="">-- Fim de Fluxo --</option>
                                        {connectionCandidates.map(cand => (
                                          <option key={cand.id} value={cand.id}>{cand.titulo}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </>
                              )}

                              {isFim && (
                                <span className="text-slate-400 font-bold block py-1 font-mono text-center bg-slate-50 dark:bg-slate-950 rounded border border-dashed border-slate-200 dark:border-slate-800">
                                  🏁 Terminal de Finalização do Fluxo
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-xs text-slate-400 text-center py-10">Adicione etapas de fluxo usando o formulário ao lado.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right panel: Add Step Form */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3 text-xs h-fit">
                <span className="text-[10px] font-black uppercase text-slate-850 dark:text-slate-100 block border-b border-slate-100 dark:border-slate-800 pb-1.5">Injetar Etapa de Fluxo</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Título da Etapa</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Inspeção Visual de Costura..." 
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Tipo de Bloco</label>
                  <select
                    value={newStepType}
                    onChange={(e) => setNewStepType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <option value="Inicio">Início do Processo (Elipse)</option>
                    <option value="Processo">Atividade / Operação (Retângulo)</option>
                    <option value="Decisao">Desvio de Decisão (Losango - 2 Caminhos)</option>
                    <option value="Fim">Fim de Processo (Elipse)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Responsável</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Qualidade, Operador, Mecânico..." 
                    value={newStepResp}
                    onChange={(e) => setNewStepResp(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <button
                  onClick={addFluxoStep}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all"
                >
                  Adicionar Nó ao Fluxograma
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: MAPEAMENTO VSM */}
        {activeSubTab === 'vsm' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Value Stream Mapping (VSM) — Mapeamento do Fluxo de Valor</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Analise gargalos na cadeia produtiva têxtil medindo o Lead Time vs Tempo que Agrega Valor</p>
              </div>
            </div>

            {/* VSM Key Metrics / KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl text-center space-y-0.5 animate-fade-in">
                <span className="text-[9px] font-bold text-rose-500 uppercase">Tempo de Ciclo Ativo (VA)</span>
                <p className="text-base font-black text-rose-600 dark:text-rose-400">{tools.vsm?.tempoAgregaValor || 0} min</p>
                <span className="text-[8px] text-slate-400 block font-medium">Tempo de processamento ativo</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-center space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Tempo de Espera (NVA)</span>
                <p className="text-base font-black text-slate-700 dark:text-slate-350">{tools.vsm?.tempoNaoAgregaValor || 0} min</p>
                <span className="text-[8px] text-slate-400 block font-medium">Inventário, transporte e filas</span>
              </div>
              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-center space-y-0.5">
                <span className="text-[9px] font-bold text-blue-500 uppercase">Total Lead Time (LT)</span>
                <p className="text-base font-black text-blue-600 dark:text-blue-400">{(tools.vsm?.tempoAgregaValor || 0) + (tools.vsm?.tempoNaoAgregaValor || 0)} min</p>
                <span className="text-[8px] text-slate-400 block font-medium">Prazo de entrega de ponta a ponta</span>
              </div>
              <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center space-y-0.5">
                <span className="text-[9px] font-bold text-emerald-600 uppercase">Eficiência de Ciclo (PCE)</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{tools.vsm?.eficienciaCiclo || 0}%</p>
                <span className="text-[8px] text-slate-400 block font-medium">Alvo Lean ideal: &gt; 20%</span>
              </div>
            </div>

            {/* VSM Time Ladder Visual representation */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3 overflow-x-auto">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Diagrama de Escada de Tempo do VSM (Lead Time Ladder)</span>
              
              {tools.vsm?.etapas && tools.vsm.etapas.length > 0 ? (
                <div className="min-w-[800px] flex items-stretch py-4">
                  {tools.vsm.etapas.map((s, idx) => {
                    return (
                      <div key={s.id} className="flex-1 flex flex-col justify-between border-r last:border-0 border-slate-200 dark:border-slate-800 px-2 relative">
                        {/* Process Box */}
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center space-y-1 z-10">
                          <span className="font-mono text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">Etapa {idx+1}</span>
                          <h4 className="text-[10px] font-black truncate text-slate-800 dark:text-slate-100" title={s.etapa}>{s.etapa}</h4>
                          <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-slate-500 font-bold">
                            <div>C/T: {s.tempoCiclo}m</div>
                            <div>C/O: {s.tempoPreparacao}m</div>
                            <div className="col-span-2">Disp: {s.disponibilidade}%</div>
                          </div>
                        </div>

                        {/* Stock Inventory */}
                        <div className="my-3 flex flex-col items-center justify-center space-y-1">
                          <span className="text-[12px]">⚠️</span>
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1 rounded">Fila: {s.estoqueFila} un</span>
                        </div>

                        {/* Timeline Ladder Section */}
                        <div className="h-16 flex flex-col justify-end font-mono text-[9px] relative mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          {/* Wait line (Top shelf) */}
                          <div className="h-6 flex items-center justify-center border-b border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/10 text-rose-500 font-bold" title="Tempo sem agregação de valor">
                            Espera: {s.tempoFila}m
                          </div>
                          {/* Process line (Bottom shelf) */}
                          <div className={`h-6 flex items-center justify-center ${s.agregaValor ? 'bg-emerald-500/10 text-emerald-600 border-l border-r border-emerald-200 dark:border-emerald-800' : 'bg-rose-500/10 text-rose-500 border-l border-r border-rose-200 dark:border-rose-800'} font-bold`}>
                            Proc: {s.tempoCiclo}m ({s.agregaValor ? 'VA' : 'NVA'})
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Activity className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                  <span className="text-xs font-bold block text-slate-600 dark:text-slate-300">Nenhuma etapa cadastrada no VSM</span>
                  <span className="text-[10px] text-slate-400">Cadastre as etapas do processo produtivo ao lado para desenhar a escada de valor.</span>
                </div>
              )}
            </div>

            {/* VSM Steps Table and Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Steps Table (Left/Middle) */}
              <div className="lg:col-span-2 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Detalhamento dos Tempos & Estoques do Fluxo</span>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Etapa</th>
                        <th className="p-3">C/T (Ciclo)</th>
                        <th className="p-3">C/O (Preparação)</th>
                        <th className="p-3">Estoque</th>
                        <th className="p-3">Espera (Fila)</th>
                        <th className="p-3 text-center">Agrega Valor</th>
                        <th className="p-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {tools.vsm?.etapas && tools.vsm.etapas.length > 0 ? (
                        tools.vsm.etapas.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                            <td className="p-3 font-extrabold text-slate-800 dark:text-slate-200">
                              {idx + 1}. {s.etapa}
                            </td>
                            <td className="p-3 font-mono font-bold">{s.tempoCiclo}m</td>
                            <td className="p-3 font-mono text-slate-500">{s.tempoPreparacao}m</td>
                            <td className="p-3 font-mono text-amber-600 font-bold">{s.estoqueFila} un</td>
                            <td className="p-3 font-mono text-slate-600 dark:text-slate-400 font-bold">{s.tempoFila}m</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                s.agregaValor 
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                              }`}>
                                {s.agregaValor ? 'VA (Sim)' : 'NVA (Não)'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => removeVsmStep(s.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                                title="Remover etapa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-xs text-slate-400">
                            Nenhuma etapa inserida no mapeamento de fluxo de valor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form to Append VSM Step (Right) */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3 text-xs h-fit">
                <span className="text-[10px] font-black uppercase text-slate-850 dark:text-slate-100 block border-b border-slate-100 dark:border-slate-800 pb-1.5">Anexar Etapa de Valor</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Nome da Etapa</label>
                  <input
                    type="text"
                    placeholder="Ex: Embalagem Secundária..."
                    value={vsmEtapa}
                    onChange={(e) => setVsmEtapa(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">C/T (Ciclo - min)</label>
                    <input
                      type="number"
                      value={vsmTempoCiclo}
                      onChange={(e) => setVsmTempoCiclo(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">C/O (Prep - min)</label>
                    <input
                      type="number"
                      value={vsmTempoPreparacao}
                      onChange={(e) => setVsmTempoPreparacao(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Disponibilidade (%)</label>
                    <input
                      type="number"
                      value={vsmDisponibilidade}
                      onChange={(e) => setVsmDisponibilidade(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Estoque em Fila (un)</label>
                    <input
                      type="number"
                      value={vsmEstoque}
                      onChange={(e) => setVsmEstoque(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Espera (Fila - min)</label>
                    <input
                      type="number"
                      value={vsmTempoFila}
                      onChange={(e) => setVsmTempoFila(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Agrega Valor (VA)</label>
                    <select
                      value={vsmAgregaValor ? 'true' : 'false'}
                      onChange={(e) => setVsmAgregaValor(e.target.value === 'true')}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      <option value="true">Sim (VA - Processo Direto)</option>
                      <option value="false">Não (NVA - Desperdício/Fila)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={addVsmStep}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all"
                >
                  Acrescentar ao VSM
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: DMAIC DASHBOARD */}
        {activeSubTab === 'dmaic' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>DMAIC Project Phase Tracker — Seis Sigma</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Acompanhe sistematicamente os marcos de cada fase para obter melhoria operacional comprovada</p>
              </div>
            </div>

            {/* Overall Progress Tracker */}
            {tools.dmaic?.fases && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Sustentabilidade do Ciclo Seis Sigma</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">
                    {Math.round((tools.dmaic.fases.filter(f => f.concluida).length / 5) * 100)}% Concluído
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(tools.dmaic.fases.filter(f => f.concluida).length / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* 5 Phases Detailed Cards */}
            <div className="space-y-4">
              {tools.dmaic?.fases?.map((f, index) => {
                const phaseColors = {
                  'Define': { bg: 'border-l-blue-500', text: 'text-blue-600', lightBg: 'bg-blue-50/20 dark:bg-blue-950/10' },
                  'Measure': { bg: 'border-l-indigo-500', text: 'text-indigo-600', lightBg: 'bg-indigo-50/20 dark:bg-indigo-950/10' },
                  'Analyze': { bg: 'border-l-purple-500', text: 'text-purple-600', lightBg: 'bg-purple-50/20 dark:bg-purple-950/10' },
                  'Improve': { bg: 'border-l-pink-500', text: 'text-pink-600', lightBg: 'bg-pink-50/20 dark:bg-pink-950/10' },
                  'Control': { bg: 'border-l-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50/20 dark:bg-emerald-950/10' }
                };

                const currentColors = phaseColors[f.fase] || phaseColors['Define'];

                return (
                  <div 
                    key={f.fase} 
                    className={`border-l-4 ${currentColors.bg} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-r-xl p-5 space-y-4 shadow-2xs`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${currentColors.text}`}>
                          {f.fase} ({index + 1}ª Fase)
                        </span>
                        <p className="text-[11px] text-slate-500 max-w-2xl">{f.descricao}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase cursor-pointer select-none">Fase Concluída</label>
                        <input
                          type="checkbox"
                          checked={f.concluida}
                          onChange={(e) => handleUpdateDmaicPhase(index, e.target.checked, f.entregaveis, f.metasMetricas)}
                          className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-500 block">Deliverables / Entregáveis da Fase:</label>
                        <textarea
                          rows={2}
                          value={f.entregaveis}
                          onChange={(e) => handleUpdateDmaicPhase(index, f.concluida, e.target.value, f.metasMetricas)}
                          placeholder="Quais relatórios, metas ou documentos foram consolidados nesta fase?"
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-slate-950/20 text-slate-850 dark:text-slate-100 font-medium"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-500 block">Metas & Métricas Críticas (CTQs):</label>
                        <textarea
                          rows={2}
                          value={f.metasMetricas || ''}
                          onChange={(e) => handleUpdateDmaicPhase(index, f.concluida, f.entregaveis, e.target.value)}
                          placeholder="Ex: Tempo limite de ciclo < 40s, taxa de refugo < 1.5%..."
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-slate-950/20 text-slate-850 dark:text-slate-100 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 9: EVIDÊNCIAS & KPIs */}
        {activeSubTab === 'evidencias' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Evidence upload list */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Evidências Físicas & Registros Fotográficos</span>
                </h3>

                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {tools.evidencias?.length > 0 ? (
                    tools.evidencias.map(ev => (
                      <div key={ev.id} className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold block text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{ev.nome}</span>
                          <span className="text-[9px] text-slate-400">Enviado por: {ev.enviadoPor} • {ev.dataUpload}</span>
                        </div>
                        <button 
                          onClick={() => saveTools({ ...tools, evidencias: tools.evidencias.filter(e => e.id !== ev.id) })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
                      Nenhuma foto de evidência ou documento anexado.
                    </div>
                  )}
                </div>

                {/* Simulated file upload area */}
                <form onSubmit={handleEvidenceUpload} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Simular Envio de Documento / Foto</span>
                  <input 
                    type="text" 
                    placeholder="Nome do arquivo (Ex: Setup_Antes.jpg)" 
                    value={evidenceName}
                    onChange={(e) => setEvidenceName(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900"
                  />
                  <div className="border border-dashed border-slate-300 dark:border-slate-850 p-4 rounded-lg text-center bg-white dark:bg-slate-900 text-slate-400 cursor-pointer">
                    <Upload className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider block">Solte o arquivo ou clique aqui</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px]"
                  >
                    Registrar Anexo
                  </button>
                </form>
              </div>

              {/* Linked indicators list */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Integração de KPIs de Qualidade (Impacto Direto)</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Este projeto de excelência operacional afeta diretamente os seguintes indicadores corporativos cadastrados no painel do SGQ:
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {project.indicadoresImpactados?.length > 0 ? (
                    project.indicadoresImpactados.map(indCod => (
                      <div key={indCod} className="p-3 border border-emerald-100 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{indCod}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Verificado em Auditorias</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                      Nenhum indicador do SGQ foi vinculado a este projeto.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Confirm Delete Modal */}
      {onDeleteProject && (
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          title="Excluir Projeto"
          message={`Tem certeza que deseja excluir permanentemente o projeto "${project.codigo} — ${project.titulo}"? Esta ação removerá todas as ferramentas, cronogramas e dados vinculados.`}
          confirmLabel="Excluir Projeto"
          onConfirm={async () => {
            await onDeleteProject(project.id);
            setIsConfirmDeleteOpen(false);
          }}
          onClose={() => setIsConfirmDeleteOpen(false)}
        />
      )}

    </div>
  );
};
export default ProjetoViewCEO;
