/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ArrowUpRight,
  ShieldAlert,
  GraduationCap,
  Wrench,
  ClipboardList,
  CheckCircle2,
  Sparkles,
  FolderLock,
  Truck
} from 'lucide-react';
import { Documento, ActivityLog, Auditoria, NaoConformidade, PlanoAcao, RiscoOportunidade, Auditoria5S, Equipamento, ColaboradorCompetencia } from '../types';
import { PersonalizacaoGeral } from '../utils/mockData';

const CustomTooltip5S = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl border border-slate-700/50 shadow-xl text-left backdrop-blur-md">
        <p className="text-xs font-extrabold text-slate-300 font-mono mb-1">{data.code || 'AUD5S'}</p>
        <p className="text-[11px] font-bold text-slate-100">{data.setor} — {data.date}</p>
        <div className="h-px bg-slate-800 my-1.5" />
        <p className="text-xs font-extrabold flex items-center text-sky-400">
          Média Geral: <span className="font-mono ml-1.5 text-sm">{typeof data.media === 'number' ? data.media.toFixed(0) : data.media}%</span>
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-1 font-mono">
          <span>Seiri: {data.seiri || 0}%</span>
          <span>Seiton: {data.seiton || 0}%</span>
          <span>Seiso: {data.seiso || 0}%</span>
          <span>Seiketsu: {data.seiketsu || 0}%</span>
          <span>Shitsuke: {data.shitsuke || 0}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltipPlans = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl border border-slate-700/50 shadow-xl text-left backdrop-blur-md font-sans">
        <p className="text-xs font-extrabold text-slate-300 mb-1">Mês: {label}</p>
        <div className="h-px bg-slate-800 my-1" />
        <div className="space-y-1 text-[11px]">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between space-x-4">
              <span className="flex items-center text-slate-400">
                <span className="w-2.5 h-2.5 rounded-xs mr-2" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-100">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  documents: Documento[];
  logs: ActivityLog[];
  audits: Auditoria[];
  ncs: NaoConformidade[];
  planos?: PlanoAcao[];
  riscos?: RiscoOportunidade[];
  auditorias5s?: Auditoria5S[];
  equipamentos?: Equipamento[];
  colaboradores?: ColaboradorCompetencia[];
  registros?: any[];
  onNavigateToDocs: () => void;
  onSelectDocument: (docId: string) => void;
  onNavigateToSection?: (section: any) => void;
  personalizacao?: PersonalizacaoGeral;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  documents, 
  logs, 
  audits, 
  ncs,
  planos,
  riscos,
  auditorias5s,
  equipamentos,
  colaboradores,
  registros,
  onNavigateToDocs,
  onSelectDocument,
  onNavigateToSection,
  personalizacao
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Julho 2026');

  // Cálculos rápidos dos indicadores do SGQ
  const totalDocs = documents.length;
  const docsEmRevisao = documents.filter(d => d.status === 'Em Revisão' || d.status === 'Em Aprovação').length;
  
  // Um documento está vencido se a data de próxima revisão for menor que a data de hoje (2026-07-09)
  const hoje = '2026-07-09';
  const docsVencidos = documents.filter(d => d.proximaRevisao < hoje && d.status !== 'Obsoleto').length;
  
  const totalAuditorias = audits.length;
  const ncsAbertas = ncs.filter(n => n.status === 'Aberta' || n.status === 'Em Execução').length;

  // Reactivamente usa os equipamentos passados por props ou fallback para localStorage / mock data
  const listEquipamentos = equipamentos || (() => {
    const savedEquips = localStorage.getItem('sgq_vickytex_equipamentos');
    return savedEquips ? JSON.parse(savedEquips) : [];
  })();
  const totalEquips = listEquipamentos.length;
  const calibrados = listEquipamentos.filter((e: any) => e.status === 'Calibrado').length;
  const calibrationConformity = totalEquips > 0 ? Math.round((calibrados / totalEquips) * 100) : 0;

  // Reactivamente usa os colaboradores passados por props ou fallback para localStorage / mock data
  const listColabs = colaboradores || (() => {
    const savedColabs = localStorage.getItem('sgq_vickytex_colaboradores');
    return savedColabs ? JSON.parse(savedColabs) : [];
  })();
  const totalColabs = listColabs.length;
  const aptos = listColabs.filter((c: any) => c.status === 'Apto').length;
  const competenceIndex = totalColabs > 0 ? Math.round((aptos / totalColabs) * 100) : 0;

  const actualPlanos = planos || [];
  const totalPlans = actualPlanos.length;
  const activePlans = actualPlanos.filter((p: any) => p.status === 'Em Andamento' || p.status === 'Planejado').length;
  const completedPlans = actualPlanos.filter((p: any) => p.status === 'Concluído').length;
  const plansEfficacy = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  // Cálculos dinâmicos de riscos
  const listRiscos = riscos || [];
  const totalRiscos = listRiscos.length;
  const riscosControlados = listRiscos.filter(r => r.status === 'Controlado' || r.status === 'Inativo').length;
  const riskTreatmentRate = totalRiscos > 0 ? Math.round((riscosControlados / totalRiscos) * 100) : 0;

  // Cálculos dinâmicos de Auditorias 5S
  const list5s = auditorias5s || [];
  const finished5s = list5s.filter(a => a.status === 'Finalizada');
  const compliance5sPercentage = finished5s.length > 0 
    ? Math.round(finished5s.reduce((acc, a) => {
        const value = a.mediaGeral <= 5 ? a.mediaGeral * 20 : a.mediaGeral;
        return acc + value;
      }, 0) / finished5s.length) 
    : 0;
  const average5s = Number(((compliance5sPercentage / 100) * 5).toFixed(1));

  // Cálculos dinâmicos de Controle de Registros (ISO 7.5.3)
  const listRegistros = registros && registros.length > 0 ? registros : (() => {
    const savedRegistros = localStorage.getItem('sgq_vickytex_registros');
    if (savedRegistros) {
      try {
        return JSON.parse(savedRegistros);
      } catch (e) {
        console.error('Erro ao ler registros no dashboard', e);
      }
    }
    return [];
  })();
  const totalRegistros = listRegistros.length;
  const registrosAtivos = listRegistros.filter((r: any) => r.statusControle === 'Ativo').length;
  const registrosDigitais = listRegistros.filter((r: any) => r.tipoMidia === 'Digital' || r.tipoMidia === 'Misto').length;
  const digitalPercentage = totalRegistros > 0 ? Math.round((registrosDigitais / totalRegistros) * 100) : 0;

  // Cálculos dinâmicos de Avaliação de Fornecedores (ISO 8.4)
  const listFornecedores = (() => {
    const savedFornecedores = localStorage.getItem('sgq_vickytex_fornecedores');
    if (savedFornecedores) {
      try {
        return JSON.parse(savedFornecedores);
      } catch (e) {
        console.error('Erro ao ler fornecedores no dashboard', e);
      }
    }
    return [];
  })();
  const totalFornecedores = listFornecedores.length;
  const fornecedoresQualificados = listFornecedores.filter((f: any) => f.statusQualificacao === 'Qualificado' || f.statusQualificacao === 'Qualificado com Restrições').length;
  const fornecedoresTaxaHomologados = totalFornecedores > 0 ? Math.round((fornecedoresQualificados / totalFornecedores) * 100) : 0;

  // Distribuição por Setor
  const sectorCount = documents.reduce((acc, d) => {
    acc[d.setor] = (acc[d.setor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectors = Object.keys(sectorCount);
  const maxCount = Math.max(...(Object.values(sectorCount) as number[]), 1);

  // Agenda / Calendário interativo de Julho 2026
  const CALENDAR_EVENTS = [
    { dia: 1, tipo: 'auditoria', titulo: 'AUD-2026-003: Calibração Serigrafia (Realizada)' },
    { dia: 5, tipo: 'treinamento', titulo: 'Treinamento POP-ACA-002: Passadoria Brim' },
    { dia: 15, tipo: 'auditoria', titulo: 'AUD-2026-001: Processo no Corte' },
    { dia: 22, tipo: 'auditoria', titulo: 'AUD-2026-002: Cláusula 8.5 Costura' },
    { dia: 28, tipo: 'treinamento', titulo: 'Treinamento Geral: Gestão de Registros da Qualidade' }
  ];

  // 1. Evolução das Notas das Auditorias 5S (Recharts Line/Area Chart)
  const sorted5s = [...finished5s].sort((a, b) => a.dataAuditoria.localeCompare(b.dataAuditoria));

  const data5s = sorted5s.length > 0 
    ? sorted5s.map(audit => {
        const d = new Date(audit.dataAuditoria + 'T12:00:00');
        const formattedDate = !isNaN(d.getTime()) 
          ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : audit.dataAuditoria;
        return {
          name: formattedDate,
          fullLabel: `${formattedDate} (${audit.setor})`,
          date: formattedDate,
          setor: audit.setor,
          code: audit.codigo,
          media: audit.mediaGeral <= 5 ? Math.round(audit.mediaGeral * 20) : audit.mediaGeral,
          seiri: audit.seiri <= 5 ? Math.round(audit.seiri * 20) : audit.seiri,
          seiton: audit.seiton <= 5 ? Math.round(audit.seiton * 20) : audit.seiton,
          seiso: audit.seiso <= 5 ? Math.round(audit.seiso * 20) : audit.seiso,
          seiketsu: audit.seiketsu <= 5 ? Math.round(audit.seiketsu * 20) : audit.seiketsu,
          shitsuke: audit.shitsuke <= 5 ? Math.round(audit.shitsuke * 20) : audit.shitsuke,
        };
      })
    : [];

  // 2. Status dos Planos de Ação ao Longo do Tempo (Recharts Stacked Bar Chart)
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const rawPlanos = (planos && planos.length > 0) ? planos : [];

  const plansByMonth: Record<string, { Planejado: number; 'Em Andamento': number; Concluído: number; Cancelada: number }> = {};
  const activeMonths = ['Mai', 'Jun', 'Jul'];
  activeMonths.forEach(m => {
    plansByMonth[m] = { Planejado: 0, 'Em Andamento': 0, Concluído: 0, Cancelada: 0 };
  });

  rawPlanos.forEach(plano => {
    if (!plano.dataCriacao) return;
    const d = new Date(plano.dataCriacao + 'T12:00:00');
    if (isNaN(d.getTime())) return;
    const monthLabel = monthNames[d.getMonth()];
    if (monthLabel) {
      if (!plansByMonth[monthLabel]) {
        plansByMonth[monthLabel] = { Planejado: 0, 'Em Andamento': 0, Concluído: 0, Cancelada: 0 };
      }
      const status = plano.status as 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada';
      if (plansByMonth[monthLabel][status] !== undefined) {
        plansByMonth[monthLabel][status]++;
      }
    }
  });

  const dataPlanos = Object.entries(plansByMonth)
    .map(([month, stats]) => ({
      name: month,
      'Planejado': stats.Planejado,
      'Em Andamento': stats['Em Andamento'],
      'Concluído': stats.Concluído,
      'Cancelada': stats.Cancelada
    }))
    .sort((a, b) => {
      const idxA = monthNames.indexOf(a.name);
      const idxB = monthNames.indexOf(b.name);
      return idxA - idxB;
    });

  return (
    <div id="dashboard-container" className="space-y-6">
      
      {/* Banner de Boas-Vindas Personalizado */}
      <div id="dashboard-welcome-banner" className="bg-[#0B3A63] dark:bg-slate-900 rounded-2xl border border-slate-200/10 dark:border-slate-800 p-6 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {personalizacao?.sloganHome || 'Painel Geral do Sistema de Gestão da Qualidade'}
          </h2>
          <p className="text-xs text-blue-100 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {personalizacao?.descricaoHome || 'Acompanhe os principais indicadores de conformidade e as atividades em tempo real.'}
          </p>
        </div>
      </div>

      {/* 1. Bento Grid - Indicadores Principais */}
      <div id="dashboard-bento-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Documentos */}
        <div id="stat-total-docs" className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToDocs}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lista Mestra (Ativos)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {totalDocs.toString().padStart(2, '0')}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              ISO 9001:2015 Ativos
            </p>
          </div>
        </div>

        {/* Documentos Vencidos */}
        <div id="stat-docs-vencidos" className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Revisões Vencidas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {docsVencidos.toString().padStart(2, '0')}
            </h3>
            <p className="text-[10px] text-rose-500 mt-1">
              Ação imediata requerida
            </p>
          </div>
        </div>

        {/* Documentos em Revisão */}
        <div id="stat-docs-revisao" className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Em Revisão / Fluxo</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {docsEmRevisao.toString().padStart(2, '0')}
            </h3>
            <p className="text-[10px] text-amber-500 mt-1">
              Aguardando aprovação
            </p>
          </div>
        </div>

        {/* Auditorias Internas */}
        <div id="stat-auditorias" className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Auditorias Programadas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {totalAuditorias.toString().padStart(2, '0')}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Sprints de auditoria 2026
            </p>
          </div>
        </div>

        {/* Não Conformidades */}
        <div id="stat-nc" className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Não Conformidades (NC)</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {ncsAbertas.toString().padStart(2, '0')}
            </h3>
            <p className="text-[10px] text-rose-500 mt-1">
              Planos de ação iniciados
            </p>
          </div>
        </div>

      </div>

      {/* 1.5. Indicadores de Processo e Conformidade (ISO 9001:2015) */}
      <div id="dashboard-compliance-meters" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        
        {/* Metrologia e Calibração */}
        <div 
          onClick={() => onNavigateToSection?.('calibracao')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-900/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider">ISO 7.1.5 — METROLOGIA</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors">Aferição de Instrumentos</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Rastreabilidade RBC</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{calibrationConformity}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-blue-600"
                style={{ width: `${calibrationConformity}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              {calibrados} de {totalEquips} balanças e sensores calibrados vigentes
            </p>
          </div>
        </div>

        {/* Competência e Treinamento */}
        <div 
          onClick={() => onNavigateToSection?.('treinamentos')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-900/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider">ISO 7.2 — RECURSOS HUMANOS</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">Competência & Treinamento</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Colaboradores Aptos</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{competenceIndex}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-emerald-600"
                style={{ width: `${competenceIndex}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              {aptos} de {totalColabs} operadores certificados no chão de fábrica
            </p>
          </div>
        </div>

        {/* Planos de Ação 5W2H */}
        <div 
          onClick={() => onNavigateToSection?.('planos')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-900/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-500 uppercase tracking-wider">ISO 10.2 — MELHORIA</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-purple-500 transition-colors">Planos de Ação 5W2H</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Eficácia / Execução</span>
              <span className="font-mono text-purple-600 dark:text-purple-400">{plansEfficacy}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-purple-600"
                style={{ width: `${plansEfficacy}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              {activePlans} planos ativos em mitigação de não conformidades
            </p>
          </div>
        </div>

        {/* Gestão de Riscos (ISO 6.1) */}
        <div 
          onClick={() => onNavigateToSection?.('riscos')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-900/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">ISO 6.1 — PLANEJAMENTO</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">Riscos & Oportunidades</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Tratamento Proativo</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">{riskTreatmentRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-amber-500"
                style={{ width: `${riskTreatmentRate}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              {totalRiscos} riscos e oportunidades mapeados no SGQ
            </p>
          </div>
        </div>

        {/* Programa 5S (Lean Manufacturing) */}
        <div 
          onClick={() => onNavigateToSection?.('5s')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-sky-300 dark:hover:border-sky-900/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-wider">LEAN — CHÃO DE FÁBRICA</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 transition-colors">Programa 5S & Sensos</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Média 5S Global</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">{compliance5sPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-sky-500"
                style={{ width: `${compliance5sPercentage}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              Baseado em {finished5s.length} auditorias de sensos finalizadas
            </p>
          </div>
        </div>

        {/* Controle de Registros (ISO 7.5.3) */}
        <div 
          onClick={() => onNavigateToSection?.('registros')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-wider">ISO 7.5.3 — CONSERVAÇÃO</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">Controle de Registros</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Taxa de Digitalização</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{digitalPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-indigo-500"
                style={{ width: `${digitalPercentage}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              {registrosAtivos} ativos de {totalRegistros} total de registros auditados
            </p>
          </div>
        </div>

        {/* Avaliação de Fornecedores (ISO 8.4) */}
        <div 
          onClick={() => onNavigateToSection?.('fornecedores')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-900/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider">ISO 8.4 — AQUISIÇÃO</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-rose-500 transition-colors">Qualidade de Fornecedores</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Taxa de Homologação</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">{fornecedoresTaxaHomologados}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-rose-500"
                style={{ width: `${fornecedoresTaxaHomologados}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              {fornecedoresQualificados} qualificados de {totalFornecedores} fornecedores cadastrados
            </p>
          </div>
        </div>

      </div>

      {/* 2. Seção de Gráficos e Agendas (Bento Grid Grande) */}
      <div id="dashboard-charts-agenda" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Documentos por Setor (Custom SVG de Altíssima Definição) */}
        <div id="chart-setores-card" className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Distribuição de Processos por Setor Têxtil
              </h4>
              <p className="text-xs text-slate-400">Mapeamento {personalizacao?.normaISO || 'ISO 9001:2015'} na {personalizacao?.nomeEmpresa || 'Vickytex'}</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
              Lista Mestra Ativa
            </span>
          </div>

          <div className="space-y-4">
            {sectors.map((sector) => {
              const count = sectorCount[sector];
              const percentage = (count / totalDocs) * 100;
              return (
                <div key={sector} id={`sector-row-${sector}`} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{sector}</span>
                    <span className="font-mono text-slate-500">{count} {count === 1 ? 'documento' : 'documentos'} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-linear-to-r from-blue-600 to-sky-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda Corporativa & Calendário de Auditorias / Treinamentos */}
        <div id="dashboard-calendar-card" className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                Calendário SGQ
              </h4>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {selectedMonth}
              </span>
            </div>

            {/* Grid do Calendário Compacto */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 mb-4 font-mono">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
              {Array.from({ length: 31 }).map((_, idx) => {
                const dia = idx + 1;
                // Deixa o dia 9 (hoje) destacado
                const isHoje = dia === 9;
                const ev = CALENDAR_EVENTS.find(e => e.dia === dia);
                
                return (
                  <div 
                    key={idx} 
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg relative cursor-pointer ${
                      isHoje ? 'bg-blue-600 text-white font-black shadow-xs' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{dia}</span>
                    {ev && !isHoje && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                        ev.tipo === 'auditoria' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lista Mapeada de Eventos Próximos */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {CALENDAR_EVENTS.filter(e => e.dia >= 9).map((ev, idx) => (
                <div key={idx} className="flex items-start space-x-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors text-left">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    ev.tipo === 'auditoria' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {ev.titulo}
                    </p>
                    <p className="text-[9px] text-slate-400">Dia {ev.dia} de Julho, 2026</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full text-center py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors border border-blue-100 dark:border-blue-900 mt-4">
            Ver Cronograma Google Calendar
          </button>
        </div>

      </div>

      {/* 2.5. Seção de Gráficos de Desempenho (Recharts) */}
      <div id="dashboard-performance-recharts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 5S */}
        <div id="chart-5s-card" className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Evolução Histórica do Programa 5S
                </h4>
                <p className="text-xs text-slate-400">Pontuação média dos 5 sensos auditados no chão de fábrica</p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg">
                Meta Mínima: {personalizacao?.auditorias5sMetaGrafico ?? 75}%
              </span>
            </div>
            
            <div className="h-64 w-full relative flex items-center justify-center">
              {data5s.length === 0 ? (
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-400 font-bold">Nenhum dado de auditoria 5S cadastrado.</p>
                  <p className="text-[10px] text-slate-500">Adicione e finalize auditorias para ver este gráfico.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data5s} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tickFormatter={(val) => `${val}%`}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip5S />} />
                    <ReferenceLine 
                      y={personalizacao?.auditorias5sMetaGrafico ?? 75} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3" 
                      label={{ 
                        value: `Meta: ${personalizacao?.auditorias5sMetaGrafico ?? 75}%`, 
                        position: 'insideBottomRight', 
                        fill: '#ef4444', 
                        fontSize: 10, 
                        fontWeight: 'bold' 
                      }} 
                    />
                    <Area type="monotone" dataKey="media" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMedia)" name="Média Geral" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Nota 0% (Inaceitável)</span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Média Geral Obtida (%)</span>
            </div>
            <span>Nota 100% (Excelência)</span>
          </div>
        </div>

        {/* Gráfico Status dos Planos de Ação */}
        <div id="chart-planos-card" className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Status dos Planos de Ação 5W2H
                </h4>
                <p className="text-xs text-slate-400">Distribuição mensal de tratativas por estado de execução</p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                Melhoria Contínua
              </span>
            </div>

            <div className="h-64 w-full relative flex items-center justify-center">
              {dataPlanos.length === 0 ? (
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-400 font-bold">Nenhum plano de ação cadastrado.</p>
                  <p className="text-[10px] text-slate-500">Adicione planos de ação para ver este gráfico.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataPlanos} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltipPlans />} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                    <Bar dataKey="Concluído" stackId="statusPlans" fill="#10b981" radius={[0, 0, 0, 0]} name="Concluído" />
                    <Bar dataKey="Em Andamento" stackId="statusPlans" fill="#6366f1" radius={[0, 0, 0, 0]} name="Em Andamento" />
                    <Bar dataKey="Planejado" stackId="statusPlans" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Planejado" />
                    <Bar dataKey="Cancelada" stackId="statusPlans" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Cancelado" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-4 text-center font-mono border-t border-slate-100 dark:border-slate-800 pt-3">
            Evolução mensal do volume de ações corretivas e preventivas
          </div>
        </div>

      </div>

      {/* 3. Rodapé com Últimas Atividades e Documentos Vencidos */}
      <div id="dashboard-bottom-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Atividades Recentes (Audit Log) */}
        <div id="activities-timeline" className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Histórico Recente e Rastreabilidade (ISO 9001 - Cláusula 7.5.3)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">LOG DE AUDITORIA</span>
          </div>

          <div className="space-y-4">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} id={`log-item-${log.id}`} className="flex items-start space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                  {log.usuarioNome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{log.usuarioNome}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">{log.detalhes}</p>
                  {log.documentoId && (
                    <button 
                      onClick={() => onSelectDocument(log.documentoId!)}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1 block"
                    >
                      Ver documento {log.documentoId}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fila de Prioridades e Alertas de Revisão */}
        <div id="priority-queue-card" className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <ShieldAlert className="w-4.5 h-4.5 mr-1.5 text-rose-500" />
              Prioridades de Revisão
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Processos vencidos ou que expiram nos próximos 30 dias:
            </p>

            <div className="space-y-3">
              {documents.filter(d => d.proximaRevisao < hoje && d.status !== 'Obsoleto').map((doc) => (
                <div 
                  key={doc.id} 
                  id={`priority-item-${doc.id}`}
                  onClick={() => onSelectDocument(doc.id)}
                  className="p-2.5 rounded-lg border border-rose-100 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/10 cursor-pointer hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all flex justify-between items-center group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400 font-mono group-hover:underline">
                      {doc.codigo}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                      {doc.titulo}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onNavigateToDocs}
            className="w-full text-center py-2 mt-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            Acessar Lista Mestra
          </button>
        </div>

      </div>

    </div>
  );
};
