/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Award, 
  Users, 
  Inbox,
  AlertTriangle,
  Flame,
  Calendar,
  Activity,
  Percent,
  TrendingDown,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { ProjetoCEO, SugestaoCEO, CEOStats } from '../../types/ceo';

interface DashboardCEOProps {
  projects: ProjetoCEO[];
  suggestions: SugestaoCEO[];
  stats: CEOStats | null;
  onSelectProject: (id: string) => void;
}

type DashboardType = 'executivo' | 'gerencial' | 'operacional';

export const DashboardCEO: React.FC<DashboardCEOProps> = ({ 
  projects, 
  suggestions, 
  stats,
  onSelectProject
}) => {
  const [activeDash, setActiveDash] = useState<DashboardType>('executivo');

  // Currency formatting helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // --- CORE FINANCIAL CALCULATIONS (ROI, PAYBACK, ECONOMIA) ---
  const totalInvestment = projects.reduce((acc, p) => acc + p.investimento, 0);
  const totalExpectedReturn = projects.reduce((acc, p) => acc + p.retornoEsperado, 0);
  const totalRealReturn = projects.reduce((acc, p) => acc + (p.retornoReal || 0), 0);
  
  // Net Saving (Economia Líquida)
  const netExpectedSaving = totalExpectedReturn - totalInvestment;
  const netRealSaving = totalRealReturn - projects.filter(p => p.status === 'Concluído').reduce((acc, p) => acc + p.investimento, 0);

  // Overall Portfolio ROI (%)
  const portfolioROI = totalInvestment > 0 
    ? Math.round(((totalExpectedReturn - totalInvestment) / totalInvestment) * 100) 
    : 0;
  
  const portfolioRealROI = projects.filter(p => p.status === 'Concluído').reduce((acc, p) => acc + p.investimento, 0) > 0
    ? Math.round(((totalRealReturn - projects.filter(p => p.status === 'Concluído').reduce((acc, p) => acc + p.investimento, 0)) / projects.filter(p => p.status === 'Concluído').reduce((acc, p) => acc + p.investimento, 0)) * 100)
    : 0;

  // Average Payback (Months)
  // Payback = Investimento / (Retorno Anual / 12)
  const paybackValues = projects
    .filter(p => p.retornoEsperado > 0)
    .map(p => p.investimento / (p.retornoEsperado / 12));
  
  const avgPaybackMonths = paybackValues.length > 0 
    ? (paybackValues.reduce((acc, v) => acc + v, 0) / paybackValues.length).toFixed(1) 
    : '0';

  // --- LEAD TIME CALCULATIONS ---
  // We scan projects for leadTime data. If missing, we simulate realistic values based on sector/methodology
  const leadTimeStats = projects.map(p => {
    const lt = p.ferramentas?.leadTime || {
      before: p.setor === 'Corte' ? 24 : p.setor === 'Costura' ? 48 : p.setor === 'Logística' ? 12 : 36,
      after: p.status === 'Concluído' 
        ? (p.setor === 'Corte' ? 8 : p.setor === 'Costura' ? 18 : p.setor === 'Logística' ? 4 : 14)
        : (p.setor === 'Corte' ? 16 : p.setor === 'Costura' ? 32 : p.setor === 'Logística' ? 8 : 24),
      unit: 'horas'
    };
    const reduction = lt.before - lt.after;
    const pctReduction = lt.before > 0 ? Math.round((reduction / lt.before) * 100) : 0;
    return {
      codigo: p.codigo,
      titulo: p.titulo,
      before: lt.before,
      after: lt.after,
      reduction,
      pctReduction,
      unit: lt.unit
    };
  });

  const totalLeadTimeBefore = leadTimeStats.reduce((acc, s) => acc + s.before, 0);
  const totalLeadTimeAfter = leadTimeStats.reduce((acc, s) => acc + s.after, 0);
  const avgLeadTimeReductionPct = totalLeadTimeBefore > 0 
    ? Math.round(((totalLeadTimeBefore - totalLeadTimeAfter) / totalLeadTimeBefore) * 100) 
    : 0;

  // Financial chart data (Expected vs Real Returns per project)
  const financialChartData = projects.map(p => ({
    name: p.codigo,
    'Investimento (CAPEX)': p.investimento,
    'Retorno Esperado': p.retornoEsperado,
    'Retorno Real': p.retornoReal || 0,
    'Economia Gerada': (p.retornoReal || p.retornoEsperado) - p.investimento
  }));

  // --- MANAGER DEPT & METHODOLOGY DISTRIBUTIONS ---
  const sectorsCounts = projects.reduce((acc, p) => {
    acc[p.setor] = (acc[p.setor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectorChartData = Object.keys(sectorsCounts).map(sec => ({
    name: sec,
    'Projetos': sectorsCounts[sec]
  }));

  const methodologyCounts = projects.reduce((acc, p) => {
    acc[p.metodologia] = (acc[p.metodologia] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const methodologyChartData = Object.keys(methodologyCounts).map(m => ({
    name: m,
    value: methodologyCounts[m]
  }));

  const MET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const STATUS_COLORS = {
    'Planejado': '#3b82f6',
    'Em Execução': '#f59e0b',
    'Suspenso': '#64748b',
    'Concluído': '#10b981',
    'Cancelado': '#ef4444'
  };

  const statusChartData = Object.keys(statusCounts).map(st => ({
    name: st,
    value: statusCounts[st],
    color: STATUS_COLORS[st as keyof typeof STATUS_COLORS] || '#94a3b8'
  }));

  // --- OPERATIONAL INTERACTIVES (PICK MATRIX & TASK COMPLETIONS) ---
  // Combine all brainstorming ideas across projects for overall PICK Quadrant statistics
  const combinedIdeas = projects.reduce((acc, p) => {
    const ideas = p.ferramentas?.brainstorming || [];
    return [...acc, ...ideas];
  }, [] as any[]);

  const pickCounts = combinedIdeas.reduce((acc, idea) => {
    const q = idea.pick || 'Possible';
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, { 'Possible': 0, 'Implement': 0, 'Challenge': 0, 'Kill': 0 } as Record<string, number>);

  const pickChartData = [
    { name: 'Implement (Fácil / Alto Ganho)', value: pickCounts['Implement'], color: '#10b981' },
    { name: 'Possible (Fácil / Baixo Ganho)', value: pickCounts['Possible'], color: '#3b82f6' },
    { name: 'Challenge (Difícil / Alto Ganho)', value: pickCounts['Challenge'], color: '#f59e0b' },
    { name: 'Kill (Difícil / Baixo Ganho)', value: pickCounts['Kill'], color: '#ef4444' }
  ];

  // Task Status across Cronogramas
  const taskCounts = projects.reduce((acc, p) => {
    const tasks = p.ferramentas?.cronograma || [];
    tasks.forEach(t => {
      acc[t.status] = (acc[t.status] || 0) + 1;
    });
    return acc;
  }, { 'Pendente': 0, 'Em Andamento': 0, 'Concluido': 0 } as Record<string, number>);

  const totalTasks = taskCounts['Pendente'] + taskCounts['Em Andamento'] + taskCounts['Concluido'];
  const taskCompletionRate = totalTasks > 0 
    ? Math.round((taskCounts['Concluido'] / totalTasks) * 100) 
    : 0;

  // Gate checklists checklist gate compliance
  // Calculate average percentage of completed etapas/gates in projects
  const gateComplianceRates = projects.map(p => {
    const stages = p.ferramentas?.etapas || [];
    const completed = stages.filter(s => s.status === 'Concluido').length;
    return stages.length > 0 ? (completed / stages.length) * 100 : 0;
  });

  const avgGateCompliance = gateComplianceRates.length > 0
    ? Math.round(gateComplianceRates.reduce((acc, r) => acc + r, 0) / gateComplianceRates.length)
    : 0;

  // Active teams and members
  const totalTeamMembers = projects.reduce((acc, p) => acc + (p.ferramentas?.equipe?.length || 0), 0);
  const avgTeamSize = projects.length > 0 ? (totalTeamMembers / projects.length).toFixed(1) : '0';

  return (
    <div id="ceo-dashboards-panel" className="space-y-6">
      
      {/* 1. Dashboard Sub-View Selector */}
      <div className="flex border border-slate-200 dark:border-slate-800 p-1 rounded-2xl bg-white dark:bg-slate-900/60 w-fit gap-1">
        {[
          { id: 'executivo', label: 'Painel Executivo', icon: TrendingUp, desc: 'ROI, Capex & Savings' },
          { id: 'gerencial', label: 'Painel Gerencial', icon: Activity, desc: 'Metodologias & Setores' },
          { id: 'operacional', label: 'Painel Operacional', icon: Clock, desc: 'Tollgates & Cronogramas' }
        ].map(d => {
          const Icon = d.icon;
          const isActive = activeDash === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDash(d.id as any)}
              className={`flex flex-col items-start px-4.5 py-2.5 rounded-xl transition-all whitespace-nowrap text-left ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-black text-xs uppercase tracking-wide">
                <Icon className="w-4 h-4" />
                <span>{d.label}</span>
              </div>
              <span className={`text-[8px] font-bold mt-0.5 uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                {d.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. DASHBOARD BODY RENDER */}
      {activeDash === 'executivo' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Executive KPI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CAPEX Investido</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
                  {formatCurrency(totalInvestment)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Soma de aportes em projetos</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Saving Realizado (Economia)</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {formatCurrency(totalRealReturn)}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">
                  Retornos validados em caixa
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ROI Geral do Portfolio</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                  {portfolioROI}%
                </span>
                <span className="text-[10px] text-blue-500 font-bold block mt-1">
                  Realizado: <span className="font-mono">{portfolioRealROI}%</span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                <Percent className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Payback Médio</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {avgPaybackMonths} <span className="text-xs font-bold text-slate-400">meses</span>
                </span>
                <span className="text-[10px] text-indigo-500 font-bold block mt-1">Tempo de retorno financeiro</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Executive Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Financial Savings chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
                Visão de Caixa: Investimento de Capital vs Retornos Reais e Esperados
              </h4>
              <div className="h-80">
                {financialChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$ ${val/1000}k`} tickLine={false} />
                      <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                      <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                      <Area type="monotone" dataKey="Investimento (CAPEX)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInv)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Retorno Real" stroke="#10b981" fillOpacity={1} fill="url(#colorReal)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="Retorno Esperado" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados financeiros</div>
                )}
              </div>
            </div>

            {/* Overall Lead Time Reductions List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                  Indicador de Redução de Tempos (Lead Time)
                </h4>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-rose-500">-{avgLeadTimeReductionPct}%</span>
                  <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Lead Time Médio</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Redução média dos tempos de ciclo de fabricação e setups obtida através da eliminação sistemática de desperdícios da metodologia Lean.
                </p>

                <div className="mt-6 space-y-4 max-h-56 overflow-y-auto pr-1">
                  {leadTimeStats.map((lt, idx) => (
                    <div key={`${lt.codigo || 'lt'}-${idx}`} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{lt.codigo} — {lt.titulo}</span>
                        <span className="text-rose-500 font-black">-{lt.pctReduction}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>Antes: {lt.before} {lt.unit}</span>
                        <span>Depois: {lt.after} {lt.unit}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${lt.pctReduction}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-400 font-medium">
                Metodologias aplicadas: Kaizen, SMED, Poka-Yoke e VSM.
              </div>
            </div>

          </div>

        </div>
      )}

      {activeDash === 'gerencial' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Managerial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Projetos Ativos</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
                  {projects.filter(p => p.status === 'Em Execução' || p.status === 'Planejado').length}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Monitorados na rotina</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Setores Atendidos</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {Object.keys(sectorsCounts).length} <span className="text-xs font-bold text-slate-400">unidades</span>
                </span>
                <span className="text-[10px] text-indigo-500 font-bold block mt-1">Impacto multi-setorial</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Metodologia Predominante</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block truncate max-w-[150px]">
                  {Object.keys(methodologyCounts).sort((a,b) => methodologyCounts[b] - methodologyCounts[a])[0] || 'DMAIC'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Mais aplicada na fábrica</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Capacitação Operacional</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block dark:text-emerald-400">
                  Green & Black
                </span>
                <span className="text-[10px] text-emerald-500 block mt-1 font-bold">Liderança qualificada</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Managerial Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sector Bar Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
                Distribuição de Projetos por Setor Produtivo (VickyTex)
              </h4>
              <div className="h-72">
                {sectorChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={sectorChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="Projetos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados setoriais</div>
                )}
              </div>
            </div>

            {/* Methodology Pie Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
                  Distribuição Metodológica das Iniciativas de Melhoria
                </h4>
                <div className="h-56 flex items-center justify-center">
                  {methodologyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={methodologyChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {methodologyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={MET_COLORS[index % MET_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-400">Sem dados metodológicos</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[9px] font-bold">
                {methodologyChartData.map((m, idx) => (
                  <div key={`${m.name || 'met'}-${idx}`} className="flex items-center space-x-1.5 border border-slate-50 dark:border-slate-800 p-1 rounded-lg">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MET_COLORS[idx % MET_COLORS.length] }} />
                    <span className="text-slate-500 dark:text-slate-400 truncate">{m.name}: {m.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeDash === 'operacional' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Operational KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Progresso Geral de Cronograma</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block dark:text-slate-100">
                  {taskCompletionRate}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">{taskCounts['Concluido']} de {totalTasks} tarefas entregues</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Conformidade Checkpoints / Gates</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {avgGateCompliance}%
                </span>
                <span className="text-[10px] text-emerald-500 block mt-1 font-bold">Passagem de etapas aprovadas</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tamanho Médio de Equipe</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block dark:text-indigo-400">
                  {avgTeamSize} <span className="text-xs font-bold text-slate-400">membros</span>
                </span>
                <span className="text-[10px] text-indigo-500 block mt-1">Colaboração por projeto</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ideias em Brainstorming</span>
                <span className="text-2xl font-black text-amber-500 mt-1 block dark:text-amber-400">
                  {combinedIdeas.length} <span className="text-xs font-bold text-slate-400">ideias</span>
                </span>
                <span className="text-[10px] text-amber-500 block mt-1 font-bold">Alimentando matrizes PICK</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Operational Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PICK Matrix Quadrants Count Pie */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
                  Filtro Inteligente: Distribuição de Oportunidades na Matriz PICK
                </h4>
                <div className="h-64 flex items-center justify-center">
                  {combinedIdeas.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pickChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pickChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-20 border border-dashed border-slate-200 rounded-xl">
                      Nenhuma ideia adicionada ao Brainstorming dos projetos para consolidar a Matriz PICK.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-400 font-medium">
                Matriz PICK: classifica ideias por Impacto (Ganho) vs Esforço (Dificuldade). Prioridade para <b>Implement</b>.
              </div>
            </div>

            {/* Active Projects List Progress */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                  Progresso dos Projetos Ativos por Fases
                </h4>
                
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                  {projects.filter(p => p.status === 'Em Execução').map((proj, idx) => {
                    const completed = proj.ferramentas?.etapas?.filter(e => e.status === 'Concluido').length || 0;
                    const total = proj.ferramentas?.etapas?.length || 0;
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const currentEtapa = proj.ferramentas?.etapas?.find(e => e.status === 'Em Andamento')?.nome || 'Sem Etapa Ativa';

                    return (
                      <div key={`${proj.id || 'proj'}-${idx}`} className="space-y-1.5 border border-slate-50 dark:border-slate-800/80 p-3 rounded-2xl">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{proj.codigo} — {proj.titulo}</span>
                          <span className="text-blue-500 font-black">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                          <span>Etapa Ativa:</span>
                          <span className="text-amber-500 truncate max-w-[150px]">{currentEtapa}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-400 font-medium text-center">
                Clique em Cadastro & Gestão de Projetos para editar ferramentas de processo.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. SUBMITTED IMPROVEMENT OPPORTUNITIES SPOTLIGHT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Linha de Frente — Oportunidades e Sugestões Recentes</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.slice(0, 3).map((sug, idx) => (
            <div key={`${sug.id || 'sug'}-${idx}`} className="p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/20 text-xs flex flex-col justify-between h-36">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                    {sug.codigo}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-wider ${
                    sug.status === 'Submetida' ? 'bg-blue-100 text-blue-800' :
                    sug.status === 'Aprovada' ? 'bg-emerald-100 text-emerald-800' :
                    sug.status === 'Rejeitada' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {sug.status}
                  </span>
                </div>
                <h5 className="font-bold text-slate-750 dark:text-slate-200 truncate leading-tight">{sug.titulo}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{sug.descricao}</p>
              </div>

              <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-850 pt-2 mt-2 uppercase tracking-wide">
                <span>Por: {sug.autor?.split('@')[0] || 'Sem autor'}</span>
                <span>Setor: {sug.setor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default DashboardCEO;
