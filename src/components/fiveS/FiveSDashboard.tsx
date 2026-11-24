import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Trophy, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Award,
  ShieldAlert,
  Clock,
  Layers,
  ArrowRight,
  UserX,
  ClipboardList,
  CalendarOff
} from 'lucide-react';
import { 
  Setor5S, 
  Requisito5S, 
  ItemAuditado, 
  Configuracao5S, 
  Auditoria5S,
  Senso5S,
  Classificacao5S,
  CicloAuditoria,
  PlanoAcao5S
} from '../../types/fiveS';
import { getClassificationForIndex } from '../../utils/fiveSStore';
import { PersonalizacaoGeral } from '../../utils/mockData';

const ACTION_PLAN_COLORS = {
  concluido: '#10B981',
  emAndamento: '#3B82F6',
  pendente: '#F59E0B',
  atrasado: '#EF4444'
};

const CustomActionPlanTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload || {};
  const total = (row.Concluído || 0) + (row['Em Andamento'] || 0) + (row.Pendente || 0) + (row['Prazo Vencido'] || 0);
  const completionRate = total > 0 ? Math.round(((row.Concluído || 0) / total) * 100) : 0;

  return (
    <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl border border-slate-700/60 shadow-xl text-left text-xs backdrop-blur-md min-w-[190px]">
      <p className="font-bold text-slate-100 mb-0.5">{row.fullLabel || label}</p>
      <p className="text-[11px] text-slate-400 font-mono tabular-nums">
        {total} {total === 1 ? 'plano' : 'planos'} · {completionRate}% concluído
      </p>
      <div className="h-px bg-slate-800 my-1.5" />
      <div className="space-y-1 text-[11px]">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-mono font-bold tabular-nums text-white">{entry.value}</span>
          </div>
        ))}
      </div>
      {typeof row.semResponsavel === 'number' && row.semResponsavel > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 font-mono tabular-nums">
          Sem responsável definido: {row.semResponsavel}
        </div>
      )}
    </div>
  );
};

interface FiveSDashboardProps {
  auditorias: Auditoria5S[];
  setores: Setor5S[];
  sensos: Senso5S[];
  requisitos: Requisito5S[];
  classificacoes: Classificacao5S[];
  config: Configuracao5S;
  ciclos?: CicloAuditoria[];
  itens: ItemAuditado[];
  planos?: PlanoAcao5S[];
  personalizacao?: PersonalizacaoGeral;
  onNavigateToPlanos?: () => void;
}

export const FiveSDashboard: React.FC<FiveSDashboardProps> = ({
  auditorias,
  setores,
  sensos,
  requisitos,
  classificacoes,
  config,
  ciclos = [],
  itens,
  planos = [],
  personalizacao,
  onNavigateToPlanos
}) => {
  const normalizedAudits = auditorias.map(a => {
    // 1. Resolve sector ID dynamically if missing
    let setorId = a.setorId;
    if (!setorId && a.setor) {
      const sectorMatched = setores.find(s => s.nome.toLowerCase() === a.setor.toLowerCase());
      if (sectorMatched) setorId = sectorMatched.id;
    }
    
    // 2. Resolve cycle ID dynamically if missing
    const cicloId = a.cicloId || 'ciclo-1';

    return {
      ...a,
      setorId,
      cicloId,
      seiri: a.seiri <= 5 ? Math.round(a.seiri * 20) : a.seiri,
      seiton: a.seiton <= 5 ? Math.round(a.seiton * 20) : a.seiton,
      seiso: a.seiso <= 5 ? Math.round(a.seiso * 20) : a.seiso,
      seiketsu: a.seiketsu <= 5 ? Math.round(a.seiketsu * 20) : a.seiketsu,
      shitsuke: a.shitsuke <= 5 ? Math.round(a.shitsuke * 20) : a.shitsuke,
      mediaGeral: a.mediaGeral <= 5 ? Math.round(a.mediaGeral * 20) : a.mediaGeral,
      indiceConformidade: a.indiceConformidade !== undefined 
        ? (a.indiceConformidade <= 5 ? Math.round(a.indiceConformidade * 20) : a.indiceConformidade)
        : (a.mediaGeral <= 5 ? Math.round(a.mediaGeral * 20) : a.mediaGeral)
    };
  });

  const finalizedAudits = normalizedAudits.filter(a => a.status === 'Finalizada');

  // --- 1. KPI COMPUTATIONS ---
  const totalAuditsCount = finalizedAudits.length;
  
  const avgConformity = totalAuditsCount > 0 
    ? Number((finalizedAudits.reduce((sum, a) => sum + a.mediaGeral, 0) / totalAuditsCount).toFixed(1))
    : 0;

  const totalNCsCount = itens.filter(it => {
    const audit = auditorias.find(a => a.id === it.auditoriaId);
    return audit?.status === 'Finalizada' && (it.avaliacao === 'Não Atende' || it.avaliacao === 'Atende Parcialmente');
  }).length;

  const totalReincidenciasCount = itens.reduce((sum, it) => {
    const audit = auditorias.find(a => a.id === it.auditoriaId);
    if (audit?.status === 'Finalizada') {
      return sum + (it.reincidenciaCount || 0);
    }
    return sum;
  }, 0);

  // --- 2. SENSES RADAR DATA ---
  const avgSenses = sensos.map(s => {
    const key = s.codigo === 'S1' ? 'seiri' :
                s.codigo === 'S2' ? 'seiton' :
                s.codigo === 'S3' ? 'seiso' :
                s.codigo === 'S4' ? 'seiketsu' : 'shitsuke';

    const sum = finalizedAudits.reduce((acc, a) => acc + ((a as any)[key] || 0), 0);
    const avg = totalAuditsCount > 0 ? Number((sum / totalAuditsCount).toFixed(1)) : 0;
    
    return {
      senso: s.nome.split(' ')[0], // 'Utilização'
      Valor: avg,
      fullMark: 100
    };
  });

  // --- 3. SECTOR RANKING ---
  // Get latest finalized audit for each sector (apenas setores ativos e elegíveis para o ranking)
  const sectorRanking = useMemo(() => {
    return setores
      .filter(s => s.ativo && s.participaRanking !== false)
      .map(sector => {
        // Verifica se este setor consolida subsetores de apoio (ex: Administrativo consolida RH, Compras, PPCP, Comercial, etc.)
        const isConsolidatedParent = sector.nome.toLowerCase().includes('administrativ') || 
          setores.some(sub => sub.consolidaNoSetorId === sector.id);

        if (isConsolidatedParent) {
          // Achar todos os subsetores vinculados a este setor pai
          const linkedSubsectors = setores.filter(s => 
            s.id !== sector.id && (
              s.consolidaNoSetorId === sector.id || 
              (sector.nome.toLowerCase().includes('administrativ') && s.participaRanking === false)
            )
          );
          
          const targetSectorIds = [sector.id, ...linkedSubsectors.map(s => s.id)];
          const subSectorScores: { sectorName: string; score: number; date: string }[] = [];

          targetSectorIds.forEach(secId => {
            const secAudits = finalizedAudits.filter(a => 
              a.setorId === secId || 
              (setores.find(s => s.id === secId)?.nome.toLowerCase() === (a.setor || '').toLowerCase())
            );
            if (secAudits.length > 0) {
              const sorted = [...secAudits].sort((a,b) => b.dataAuditoria.localeCompare(a.dataAuditoria));
              const secName = setores.find(s => s.id === secId)?.nome || sorted[0].setor;
              subSectorScores.push({
                sectorName: secName,
                score: sorted[0].mediaGeral,
                date: sorted[0].dataAuditoria
              });
            }
          });

          if (subSectorScores.length > 0) {
            const avgScore = Number((subSectorScores.reduce((acc, curr) => acc + curr.score, 0) / subSectorScores.length).toFixed(1));
            const latestDate = [...subSectorScores].sort((a,b) => b.date.localeCompare(a.date))[0].date;
            return {
              id: sector.id,
              nome: sector.nome,
              hasAudit: true,
              score: avgScore,
              date: latestDate,
              isConsolidated: true,
              subSectorsCount: subSectorScores.length,
              subSectorsDetails: subSectorScores
            };
          }
        }

        const sectorAudits = finalizedAudits.filter(a => a.setorId === sector.id || (sector.nome.toLowerCase() === (a.setor || '').toLowerCase()));
        const hasAudit = sectorAudits.length > 0;
        let score = 0;
        let date = 'N/A';
        
        if (hasAudit) {
          // Find newest
          const sorted = [...sectorAudits].sort((a,b) => b.dataAuditoria.localeCompare(a.dataAuditoria));
          score = sorted[0].mediaGeral;
          date = sorted[0].dataAuditoria;
        }

        return {
          id: sector.id,
          nome: sector.nome,
          hasAudit,
          score,
          date,
          isConsolidated: false,
          subSectorsCount: 0,
          subSectorsDetails: []
        };
      })
      .sort((a, b) => {
        if (a.hasAudit && !b.hasAudit) return -1;
        if (!a.hasAudit && b.hasAudit) return 1;
        return b.score - a.score;
      });
  }, [setores, finalizedAudits]);

  const excludedRankingCount = useMemo(() => {
    return setores.filter(s => s.ativo && s.participaRanking === false).length;
  }, [setores]);

  // --- 4. EVOLUTION OVER TIME & SECTOR FILTERING ---
  const [evolutionMode, setEvolutionMode] = useState<'geral' | 'setor' | 'comparativo'>('geral');
  const [selectedSectorEvolution, setSelectedSectorEvolution] = useState<string>('todos');

  // Dynamic professional color palette for comparing sectors
  const sectorColors = [
    '#0B3A63', // Deep Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#14B8A6'  // Teal
  ];

  // Helper to format YYYY-MM into AbbreviatedMonth/YYYY (e.g. Jul/2026)
  const formatMonth = (ym: string) => {
    if (!ym || ym === 'Sem dados') return 'N/A';
    const parts = ym.split('-');
    if (parts.length < 2) return ym;
    const year = parts[0];
    const month = parts[1];
    const monthNames: Record<string, string> = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };
    return `${monthNames[month] || month}/${year}`;
  };

  // Get all unique months sorted
  const sortedMonths = useMemo(() => {
    const months = new Set<string>();
    finalizedAudits.forEach(a => {
      if (a.dataAuditoria) {
        months.add(a.dataAuditoria.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(months).sort();
  }, [finalizedAudits]);

  // Build the dataset for the LineChart containing general average and individual sector averages
  const chartData = useMemo(() => {
    return sortedMonths.map(month => {
      const dataPoint: Record<string, any> = { date: month };
      
      // A. Consolidated Average (Média Geral)
      const monthlyAudits = finalizedAudits.filter(a => a.dataAuditoria.startsWith(month));
      if (monthlyAudits.length > 0) {
        const sum = monthlyAudits.reduce((acc, a) => acc + a.mediaGeral, 0);
        dataPoint['Média Geral'] = Number((sum / monthlyAudits.length).toFixed(1));
      } else {
        dataPoint['Média Geral'] = null;
      }

      // B. Individual Active Sectors Averages (apenas setores no ranking)
      setores.filter(s => s.ativo && s.participaRanking !== false).forEach(sector => {
        const isConsolidated = sector.nome.toLowerCase().includes('administrativ') || 
                               setores.some(sub => sub.consolidaNoSetorId === sector.id);

        let sectorMonthly: typeof monthlyAudits;
        if (isConsolidated) {
          const targetIds = [
            sector.id, 
            ...setores.filter(s => s.consolidaNoSetorId === sector.id || (sector.nome.toLowerCase().includes('administrativ') && s.participaRanking === false)).map(s => s.id)
          ];
          sectorMonthly = monthlyAudits.filter(a => targetIds.includes(a.setorId) || targetIds.some(tId => setores.find(s => s.id === tId)?.nome.toLowerCase() === (a.setor || '').toLowerCase()));
        } else {
          sectorMonthly = monthlyAudits.filter(a => a.setorId === sector.id || sector.nome.toLowerCase() === (a.setor || '').toLowerCase());
        }

        if (sectorMonthly.length > 0) {
          const sum = sectorMonthly.reduce((acc, a) => acc + a.mediaGeral, 0);
          dataPoint[sector.nome] = Number((sum / sectorMonthly.length).toFixed(1));
        } else {
          dataPoint[sector.nome] = null;
        }
      });

      return dataPoint;
    });
  }, [sortedMonths, finalizedAudits, setores]);

  // --- 5. HEATMAP DATAFRAME (Setor x Sensos, Mês) ---
  const [selectedHeatmapMonth, setSelectedHeatmapMonth] = useState<string>('todos');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    finalizedAudits.forEach(a => {
      if (a.dataAuditoria) {
        months.add(a.dataAuditoria.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [finalizedAudits]);

  const heatmapData = useMemo(() => {
    const rows: {
      id: string;
      sectorId: string;
      sectorName: string;
      month: string;
      S1: number;
      S2: number;
      S3: number;
      S4: number;
      S5: number;
    }[] = [];

    // Grouping sectors and months (apenas setores no ranking)
    setores.filter(s => s.ativo && s.participaRanking !== false).forEach(sector => {
      const isConsolidated = sector.nome.toLowerCase().includes('administrativ') || 
                             setores.some(sub => sub.consolidaNoSetorId === sector.id);

      let sectorAudits: typeof finalizedAudits;
      if (isConsolidated) {
        const targetIds = [
          sector.id, 
          ...setores.filter(s => s.consolidaNoSetorId === sector.id || (sector.nome.toLowerCase().includes('administrativ') && s.participaRanking === false)).map(s => s.id)
        ];
        sectorAudits = finalizedAudits.filter(a => targetIds.includes(a.setorId) || targetIds.some(tId => setores.find(s => s.id === tId)?.nome.toLowerCase() === (a.setor || '').toLowerCase()));
      } else {
        sectorAudits = finalizedAudits.filter(a => a.setorId === sector.id || sector.nome.toLowerCase() === (a.setor || '').toLowerCase());
      }
      
      // Get unique months for this sector's audits
      const sectorMonths = new Set<string>();
      sectorAudits.forEach(a => {
        if (a.dataAuditoria) {
          sectorMonths.add(a.dataAuditoria.slice(0, 7));
        }
      });

      if (sectorAudits.length === 0) {
        rows.push({
          id: `${sector.id}-empty`,
          sectorId: sector.id,
          sectorName: sector.nome,
          month: 'Sem dados',
          S1: 0,
          S2: 0,
          S3: 0,
          S4: 0,
          S5: 0
        });
        return;
      }

      sectorMonths.forEach(month => {
        const monthlyAudits = sectorAudits.filter(a => a.dataAuditoria.startsWith(month));
        
        const getSenseAvg = (key: 'seiri' | 'seiton' | 'seiso' | 'seiketsu' | 'shitsuke') => {
          if (monthlyAudits.length === 0) return 0;
          const sum = monthlyAudits.reduce((acc, a) => acc + (a[key] || 0), 0);
          return Number((sum / monthlyAudits.length).toFixed(1));
        };

        rows.push({
          id: `${sector.id}-${month}`,
          sectorId: sector.id,
          sectorName: sector.nome,
          month,
          S1: getSenseAvg('seiri'),
          S2: getSenseAvg('seiton'),
          S3: getSenseAvg('seiso'),
          S4: getSenseAvg('seiketsu'),
          S5: getSenseAvg('shitsuke')
        });
      });
    });

    // Filter by selectedHeatmapMonth
    let filtered = rows;
    if (selectedHeatmapMonth !== 'todos') {
      filtered = rows.filter(r => r.month === selectedHeatmapMonth || r.month === 'Sem dados');
    }

    // Sort: newest month first, then sector name
    return filtered.sort((a, b) => {
      if (a.month === 'Sem dados') return 1;
      if (b.month === 'Sem dados') return -1;
      const monthComp = b.month.localeCompare(a.month);
      if (monthComp !== 0) return monthComp;
      return a.sectorName.localeCompare(b.sectorName);
    });
  }, [setores, finalizedAudits, selectedHeatmapMonth]);

  const sortedClassificacoes = useMemo(() => {
    if (!classificacoes || classificacoes.length === 0) return [];
    return [...classificacoes].sort((a, b) => b.min - a.min);
  }, [classificacoes]);

  const getClassificationColorStyle = (cor?: string) => {
    switch (cor?.toLowerCase()) {
      case 'emerald':
      case 'green':
        return {
          cellBg: 'bg-emerald-500 text-white',
          dotBg: 'bg-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
        };
      case 'blue':
        return {
          cellBg: 'bg-blue-500 text-white',
          dotBg: 'bg-blue-500',
          badgeBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
        };
      case 'indigo':
        return {
          cellBg: 'bg-indigo-500 text-white',
          dotBg: 'bg-indigo-500',
          badgeBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
        };
      case 'amber':
      case 'yellow':
        return {
          cellBg: 'bg-amber-400 text-slate-950',
          dotBg: 'bg-amber-400',
          badgeBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
        };
      case 'rose':
      case 'red':
        return {
          cellBg: 'bg-rose-500 text-white animate-pulse',
          dotBg: 'bg-rose-500',
          badgeBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
        };
      default:
        return {
          cellBg: 'bg-slate-500 text-white',
          dotBg: 'bg-slate-500',
          badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        };
    }
  };

  // Get color for heatmap score based on dynamic 5S classifications
  const getHeatmapColor = (score: number) => {
    if (score === 0) return 'bg-slate-100 text-slate-400 dark:bg-slate-800';
    if (!classificacoes || classificacoes.length === 0) {
      if (score >= 90) return 'bg-emerald-500 text-white';
      if (score >= 80) return 'bg-blue-500 text-white';
      if (score >= 70) return 'bg-indigo-500 text-white';
      if (score >= 60) return 'bg-amber-400 text-slate-950';
      return 'bg-rose-500 text-white animate-pulse';
    }
    const classification = getClassificationForIndex(score, classificacoes);
    return getClassificationColorStyle(classification?.cor).cellBg;
  };

  // --- 6. INDICADORES DE PLANOS DE AÇÃO 5S (SETOR, MÊS, CICLO, PENDÊNCIAS E VENCIDOS) ---
  const [selectedPlanCycle, setSelectedPlanCycle] = useState<string>('TODOS');
  const [selectedPlanSector, setSelectedPlanSector] = useState<string>('TODOS');
  const [planMonthBasis, setPlanMonthBasis] = useState<'auditoria' | 'prazo'>('auditoria');
  const [planListTab, setPlanListTab] = useState<'vencidos' | 'pendentes' | 'vencendo' | 'abertos'>('vencidos');

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const in7DaysIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  type EffectivePlanStatus = 'Concluído' | 'Em Andamento' | 'Pendente' | 'Prazo Vencido';

  const enrichedPlanRecords = useMemo(() => {
    const auditMap = new Map<string, (typeof normalizedAudits)[number]>();
    normalizedAudits.forEach(a => auditMap.set(a.id, a));

    const sectorById = new Map<string, Setor5S>();
    const sectorByName = new Map<string, Setor5S>();
    setores.forEach(s => {
      sectorById.set(s.id, s);
      sectorByName.set(s.nome.trim().toLowerCase(), s);
    });

    const cycleById = new Map<string, CicloAuditoria>();
    ciclos.forEach(c => cycleById.set(c.id, c));

    const reqById = new Map<string, Requisito5S>();
    requisitos.forEach(r => reqById.set(r.id, r));

    return planos
      .filter(p => auditMap.has(p.auditoriaId))
      .map(plan => {
        const audit = auditMap.get(plan.auditoriaId)!;
        const sectorMatch = (audit.setorId && sectorById.get(audit.setorId)) ||
          (audit.setor && sectorByName.get(audit.setor.trim().toLowerCase()));
        const sectorId = sectorMatch?.id || audit.setorId || `raw-${audit.setor || 'geral'}`;
        const sectorName = sectorMatch?.nome || audit.setor || 'Geral';

        let cycleMatch = audit.cicloId ? cycleById.get(audit.cicloId) : undefined;
        if (!cycleMatch && audit.dataAuditoria) {
          cycleMatch = ciclos.find(c =>
            c.dataInicio && c.dataFim &&
            audit.dataAuditoria >= c.dataInicio &&
            audit.dataAuditoria <= c.dataFim
          );
        }
        const cycleId = cycleMatch?.id || audit.cicloId || 'sem-ciclo';
        const cycleName = cycleMatch?.nome || (audit.cicloId === 'ciclo-1' ? 'Ciclo Padrão' : 'Sem Ciclo');

        const isOverdue = plan.status !== 'Concluído' && (
          plan.status === 'Atrasado' || (!!plan.prazo && plan.prazo < todayIso)
        );
        const effectiveStatus: EffectivePlanStatus =
          plan.status === 'Concluído'
            ? 'Concluído'
            : isOverdue
              ? 'Prazo Vencido'
              : plan.status === 'Em Andamento'
                ? 'Em Andamento'
                : 'Pendente';

        const isDueSoon = plan.status !== 'Concluído' && !isOverdue && !!plan.prazo && plan.prazo >= todayIso && plan.prazo <= in7DaysIso;
        const hasOwner = !!plan.responsavel && plan.responsavel.trim().length > 0;

        let daysDelta = 0;
        if (plan.prazo) {
          const deadlineMs = new Date(`${plan.prazo}T12:00:00`).getTime();
          const todayMs = new Date(`${todayIso}T12:00:00`).getTime();
          if (!isNaN(deadlineMs) && !isNaN(todayMs)) {
            daysDelta = Math.round((deadlineMs - todayMs) / (1000 * 60 * 60 * 24));
          }
        }

        const auditMonth = audit.dataAuditoria ? audit.dataAuditoria.slice(0, 7) : '';
        const deadlineMonth = plan.prazo ? plan.prazo.slice(0, 7) : '';
        const req = reqById.get(plan.requisitoId);

        return {
          plan,
          audit,
          req,
          sectorId,
          sectorName,
          cycleId,
          cycleName,
          cycleStart: cycleMatch?.dataInicio || audit.dataAuditoria || '',
          effectiveStatus,
          isOverdue,
          isDueSoon,
          hasOwner,
          daysDelta,
          auditMonth,
          deadlineMonth
        };
      });
  }, [planos, normalizedAudits, setores, ciclos, requisitos, todayIso, in7DaysIso]);

  const availablePlanCycles = useMemo(() => {
    const map = new Map<string, { id: string; nome: string; start: string }>();
    ciclos.forEach(c => map.set(c.id, { id: c.id, nome: c.nome, start: c.dataInicio || '' }));
    enrichedPlanRecords.forEach(r => {
      if (!map.has(r.cycleId)) {
        map.set(r.cycleId, { id: r.cycleId, nome: r.cycleName, start: r.cycleStart });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.start.localeCompare(b.start));
  }, [ciclos, enrichedPlanRecords]);

  const availablePlanSectors = useMemo(() => {
    const map = new Map<string, string>();
    enrichedPlanRecords.forEach(r => map.set(r.sectorId, r.sectorName));
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [enrichedPlanRecords]);

  const filteredPlanRecords = useMemo(() => {
    return enrichedPlanRecords.filter(r => {
      const matchCycle = selectedPlanCycle === 'TODOS' || r.cycleId === selectedPlanCycle;
      const matchSector = selectedPlanSector === 'TODOS' || r.sectorId === selectedPlanSector;
      return matchCycle && matchSector;
    });
  }, [enrichedPlanRecords, selectedPlanCycle, selectedPlanSector]);

  const planMetrics = useMemo(() => {
    const total = filteredPlanRecords.length;
    let concluido = 0;
    let emAndamento = 0;
    let pendente = 0;
    let atrasado = 0;
    let semResponsavel = 0;
    let semPrazo = 0;
    let vencendo7Dias = 0;

    filteredPlanRecords.forEach(r => {
      if (r.effectiveStatus === 'Concluído') concluido += 1;
      else if (r.effectiveStatus === 'Prazo Vencido') atrasado += 1;
      else if (r.effectiveStatus === 'Em Andamento') emAndamento += 1;
      else pendente += 1;

      if (r.effectiveStatus !== 'Concluído' && !r.hasOwner) semResponsavel += 1;
      if (r.effectiveStatus !== 'Concluído' && (!r.plan.prazo || !r.plan.prazo.trim())) semPrazo += 1;
      if (r.isDueSoon) vencendo7Dias += 1;
    });

    const abertos = total - concluido;
    const taxaConclusao = total > 0 ? Math.round((concluido / total) * 100) : 0;

    return {
      total,
      concluido,
      emAndamento,
      pendente,
      atrasado,
      abertos,
      semResponsavel,
      semPrazo,
      vencendo7Dias,
      taxaConclusao
    };
  }, [filteredPlanRecords]);

  const plansStatusPieData = useMemo(() => {
    return [
      { name: 'Concluído', value: planMetrics.concluido, color: ACTION_PLAN_COLORS.concluido },
      { name: 'Em Andamento', value: planMetrics.emAndamento, color: ACTION_PLAN_COLORS.emAndamento },
      { name: 'Pendente de Tratamento', value: planMetrics.pendente, color: ACTION_PLAN_COLORS.pendente },
      { name: 'Prazo Vencido', value: planMetrics.atrasado, color: ACTION_PLAN_COLORS.atrasado }
    ].filter(item => item.value > 0);
  }, [planMetrics]);

  const plansBySectorData = useMemo(() => {
    const map = new Map<string, {
      setor: string;
      fullLabel: string;
      Concluído: number;
      'Em Andamento': number;
      Pendente: number;
      'Prazo Vencido': number;
      semResponsavel: number;
      total: number;
    }>();

    filteredPlanRecords.forEach(r => {
      const current = map.get(r.sectorName) || {
        setor: r.sectorName.length > 14 ? `${r.sectorName.slice(0, 13)}…` : r.sectorName,
        fullLabel: r.sectorName,
        Concluído: 0,
        'Em Andamento': 0,
        Pendente: 0,
        'Prazo Vencido': 0,
        semResponsavel: 0,
        total: 0
      };
      current[r.effectiveStatus] += 1;
      current.total += 1;
      if (r.effectiveStatus !== 'Concluído' && !r.hasOwner) current.semResponsavel += 1;
      map.set(r.sectorName, current);
    });

    return Array.from(map.values()).sort((a, b) => {
      const openA = a.total - a.Concluído;
      const openB = b.total - b.Concluído;
      if (openB !== openA) return openB - openA;
      return b.total - a.total;
    });
  }, [filteredPlanRecords]);

  const plansByMonthData = useMemo(() => {
    const map = new Map<string, {
      monthKey: string;
      mes: string;
      fullLabel: string;
      Concluído: number;
      'Em Andamento': number;
      Pendente: number;
      'Prazo Vencido': number;
      semResponsavel: number;
    }>();

    filteredPlanRecords.forEach(r => {
      const ym = planMonthBasis === 'auditoria' ? r.auditMonth : r.deadlineMonth;
      if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return;

      const label = formatMonth(ym);
      const current = map.get(ym) || {
        monthKey: ym,
        mes: label,
        fullLabel: `${label} (${planMonthBasis === 'auditoria' ? 'Mês da Auditoria' : 'Mês de Vencimento'})`,
        Concluído: 0,
        'Em Andamento': 0,
        Pendente: 0,
        'Prazo Vencido': 0,
        semResponsavel: 0
      };
      current[r.effectiveStatus] += 1;
      if (r.effectiveStatus !== 'Concluído' && !r.hasOwner) current.semResponsavel += 1;
      map.set(ym, current);
    });

    return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [filteredPlanRecords, planMonthBasis]);

  const plansByCycleData = useMemo(() => {
    const map = new Map<string, {
      cycleId: string;
      ciclo: string;
      fullLabel: string;
      start: string;
      Concluído: number;
      'Em Andamento': number;
      Pendente: number;
      'Prazo Vencido': number;
      semResponsavel: number;
    }>();

    filteredPlanRecords.forEach(r => {
      const current = map.get(r.cycleId) || {
        cycleId: r.cycleId,
        ciclo: r.cycleName.length > 16 ? `${r.cycleName.slice(0, 15)}…` : r.cycleName,
        fullLabel: r.cycleName,
        start: r.cycleStart,
        Concluído: 0,
        'Em Andamento': 0,
        Pendente: 0,
        'Prazo Vencido': 0,
        semResponsavel: 0
      };
      current[r.effectiveStatus] += 1;
      if (r.effectiveStatus !== 'Concluído' && !r.hasOwner) current.semResponsavel += 1;
      map.set(r.cycleId, current);
    });

    return Array.from(map.values()).sort((a, b) => a.start.localeCompare(b.start));
  }, [filteredPlanRecords]);

  const actionablePlanRows = useMemo(() => {
    const overdueRows = filteredPlanRecords
      .filter(r => r.effectiveStatus === 'Prazo Vencido')
      .sort((a, b) => a.daysDelta - b.daysDelta);
    const pendingRows = filteredPlanRecords
      .filter(r => r.effectiveStatus === 'Pendente')
      .sort((a, b) => (a.plan.prazo || '9999').localeCompare(b.plan.prazo || '9999'));
    const dueSoonRows = filteredPlanRecords
      .filter(r => r.isDueSoon)
      .sort((a, b) => a.daysDelta - b.daysDelta);
    const allOpenRows = filteredPlanRecords
      .filter(r => r.effectiveStatus !== 'Concluído')
      .sort((a, b) => a.daysDelta - b.daysDelta);

    return {
      vencidos: overdueRows,
      pendentes: pendingRows,
      vencendo: dueSoonRows,
      abertos: allOpenRows
    };
  }, [filteredPlanRecords]);

  const displayedActionRows = actionablePlanRows[planListTab];

  const formatDateBr = (isoDate?: string) => {
    if (!isoDate || !isoDate.includes('-')) return isoDate || '—';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. QUICK METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Índice Médio 5S</span>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{avgConformity}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-blue-500">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Auditorias Realizadas</span>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{totalAuditsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Não Conformidades</span>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{totalNCsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-red-50 dark:bg-rose-950/20 rounded-lg text-red-500 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Reincidências</span>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{totalReincidenciasCount}</p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE: RANKING & SENSES RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Sector Ranking List */}
        <div className="col-span-12 md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Ranking de Excelência 5S</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Última avaliação de cada setor elegível para o ranking
                {excludedRankingCount > 0 ? (
                  <span className="ml-1 text-slate-400 font-medium">({sectorRanking.length} no ranking • {excludedRankingCount} fora do ranking)</span>
                ) : (
                  <span className="ml-1 font-medium">({sectorRanking.length} setores)</span>
                )}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full font-bold">
              Prêmio: {config.trofeuNomePremio || 'Troféu 5S'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            {sectorRanking.map((item, idx) => {
              const classification = item.hasAudit ? getClassificationForIndex(item.score, classificacoes) : null;
              return (
                <div key={item.id} className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50/20 transition-all flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      item.hasAudit && idx === 0 ? 'bg-amber-500 text-slate-950 shadow-sm' :
                      item.hasAudit && idx === 1 ? 'bg-slate-300 text-slate-900' :
                      item.hasAudit && idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <p className="font-extrabold text-slate-800 dark:text-slate-100">{item.nome}</p>
                        {item.isConsolidated && (
                          <span 
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60"
                            title={`Nota calculada pela média consolidada de ${item.subSectorsCount} áreas auditadas`}
                          >
                            Consolidado ({item.subSectorsCount} áreas)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Última auditoria: <span className="font-semibold font-mono">{item.date}</span>
                        {item.isConsolidated && item.subSectorsDetails && item.subSectorsDetails.length > 0 && (
                          <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Áreas contabilizadas: {item.subSectorsDetails.map(d => `${d.sectorName} (${d.score}%)`).join(', ')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {item.hasAudit && classification ? (
                      <>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                          getClassificationColorStyle(classification?.cor).badgeBg
                        }`}>
                          {classification.nome}
                        </span>
                        <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                          {item.score}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                          Pendente
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-600">
                          --%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda Dinâmica de Classificações 5S */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 px-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            {sortedClassificacoes.length > 0 ? (
              sortedClassificacoes.map((c) => {
                const style = getClassificationColorStyle(c.cor);
                let rangeLabel = '';
                if (c.max >= 100) {
                  rangeLabel = `≥${c.min}%`;
                } else if (c.min <= 0) {
                  rangeLabel = `<${Math.round(c.max + 0.1)}%`;
                } else {
                  rangeLabel = `${c.min}-${Math.floor(c.max)}%`;
                }
                return (
                  <div key={c.id} className="flex items-center space-x-1">
                    <span className={`inline-block w-2 h-2 ${style.dotBg} rounded-full shrink-0`} />
                    <span className="whitespace-nowrap">{rangeLabel} {c.nome}</span>
                  </div>
                );
              })
            ) : null}
          </div>
        </div>

        {/* 5 Senses Radar Polygon */}
        <div className="col-span-12 md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
              Diagnóstico por Senso
            </h3>
            <p className="text-[10px] text-slate-400">Média de conformidade consolidada para os 5 sensos.</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            {totalAuditsCount === 0 ? (
              <p className="text-xs text-slate-400 italic">Lance auditorias finalizadas para ver o radar.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={avgSenses}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="senso" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name="Consolidado" dataKey="Valor" stroke="#0B3A63" fill="#0B3A63" fillOpacity={0.15} />
                  <Tooltip wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM: LINE CHART & HEATMAP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Evolution Over Time line chart */}
        <div className="col-span-12 md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
                Evolução Mensal do Índice 5S
              </h3>
              <p className="text-[10px] text-slate-400">Tendência de melhoria contínua na conformidade geral.</p>
            </div>
            
            {/* Control buttons & Selects */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <select
                value={evolutionMode}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setEvolutionMode(val);
                  if (val === 'setor' && selectedSectorEvolution === 'todos') {
                    const firstSec = setores.find(s => s.ativo && s.participaRanking !== false);
                    if (firstSec) setSelectedSectorEvolution(firstSec.id);
                  }
                }}
                className="p-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="geral">Consolidado Geral</option>
                <option value="setor">Por Setor Único</option>
                <option value="comparativo">Comparativo Multi-Setor</option>
              </select>

              {evolutionMode === 'setor' && (
                <select
                  value={selectedSectorEvolution}
                  onChange={(e) => setSelectedSectorEvolution(e.target.value)}
                  className="p-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {setores.filter(s => s.ativo && s.participaRanking !== false).map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">Sem histórico disponível</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={formatMonth} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <Tooltip labelFormatter={formatMonth} wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  
                  {evolutionMode === 'geral' && (
                    <Line 
                      type="monotone" 
                      dataKey="Média Geral" 
                      name="Média Geral Vickytex"
                      stroke="#0B3A63" 
                      strokeWidth={3} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  )}

                  {evolutionMode === 'setor' && (() => {
                    const sec = setores.find(s => s.id === selectedSectorEvolution);
                    const secName = sec ? sec.nome : '';
                    return secName ? (
                      <Line 
                        type="monotone" 
                        dataKey={secName} 
                        name={`Setor: ${secName}`}
                        stroke="#10B981" 
                        strokeWidth={3} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    ) : null;
                  })()}

                  {evolutionMode === 'comparativo' && 
                    setores.filter(s => s.ativo && s.participaRanking !== false).map((sector, idx) => (
                      <Line 
                        key={sector.id}
                        type="monotone" 
                        dataKey={sector.nome} 
                        name={sector.nome}
                        stroke={sectorColors[idx % sectorColors.length]} 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        connectNulls={true}
                      />
                    ))
                  }
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weak spots heatmap grid */}
        <div className="col-span-12 md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
                Matriz de Calor dos Sensos por Setor
              </h3>
              <p className="text-[10px] text-slate-400">Identifique gargalos e desvios de sensos por setor e mês.</p>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Filtrar Mês:</span>
              <select
                value={selectedHeatmapMonth}
                onChange={(e) => setSelectedHeatmapMonth(e.target.value)}
                className="p-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="todos">Todos os Meses</option>
                {availableMonths.map(ym => (
                  <option key={ym} value={ym}>{formatMonth(ym)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-y-auto max-h-64 rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="w-full text-center text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-150 dark:border-slate-800">
                  <th className="p-2 text-left w-24">Setor</th>
                  <th className="p-2 text-center w-16">Mês</th>
                  <th className="p-2">S1</th>
                  <th className="p-2">S2</th>
                  <th className="p-2">S3</th>
                  <th className="p-2">S4</th>
                  <th className="p-2">S5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {heatmapData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-slate-400 italic">Aguardando dados...</td>
                  </tr>
                ) : (
                  heatmapData.map((row) => (
                    <tr key={row.id}>
                      <td className="p-2 text-left font-extrabold text-slate-700 dark:text-slate-300 truncate w-24" title={row.sectorName}>{row.sectorName}</td>
                      <td className="p-2 text-center font-mono text-slate-500 dark:text-slate-400 w-16">{formatMonth(row.month)}</td>
                      <td className={`p-2 font-mono ${getHeatmapColor(row.S1)}`}>{row.S1}%</td>
                      <td className={`p-2 font-mono ${getHeatmapColor(row.S2)}`}>{row.S2}%</td>
                      <td className={`p-2 font-mono ${getHeatmapColor(row.S3)}`}>{row.S3}%</td>
                      <td className={`p-2 font-mono ${getHeatmapColor(row.S4)}`}>{row.S4}%</td>
                      <td className={`p-2 font-mono ${getHeatmapColor(row.S5)}`}>{row.S5}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* LEGENDA DINÂMICA DAS FAIXAS DE CLASSIFICAÇÃO 5S */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 px-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            {sortedClassificacoes.length > 0 ? (
              sortedClassificacoes.map((c) => {
                const style = getClassificationColorStyle(c.cor);
                let rangeLabel = '';
                if (c.max >= 100) {
                  rangeLabel = `≥${c.min}%`;
                } else if (c.min <= 0) {
                  rangeLabel = `<${Math.round(c.max + 0.1)}%`;
                } else {
                  rangeLabel = `${c.min}-${Math.floor(c.max)}%`;
                }
                return (
                  <div key={c.id} className="flex items-center space-x-1">
                    <span className={`inline-block w-2.5 h-2.5 ${style.dotBg} rounded-xs shrink-0`} />
                    <span className="whitespace-nowrap">{rangeLabel} {c.nome}</span>
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex items-center space-x-1">
                  <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
                  <span>&ge;90% Excelência</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-xs" />
                  <span>80-89% Muito Bom</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-xs" />
                  <span>70-79% Aceitável</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-xs" />
                  <span>60-69% Atenção</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                  <span>&lt;60% Crítico</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. INDICADORES DOS PLANOS DE AÇÃO 5S */}
      <div className="space-y-6 pt-2">
        {/* Cabeçalho e Filtros da Seção de Planos de Ação */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0B3A63] dark:text-sky-400 tracking-tight">
              Indicadores dos Planos de Ação 5S
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acompanhamento de tratativas por setor, mês, ciclo de auditoria e prazos vencidos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filtrar planos por ciclo"
              value={selectedPlanCycle}
              onChange={(e) => setSelectedPlanCycle(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="TODOS">Todos os Ciclos</option>
              {availablePlanCycles.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>

            <select
              aria-label="Filtrar planos por setor"
              value={selectedPlanSector}
              onChange={(e) => setSelectedPlanSector(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="TODOS">Todos os Setores</option>
              {availablePlanSectors.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>

            {(selectedPlanCycle !== 'TODOS' || selectedPlanSector !== 'TODOS') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanCycle('TODOS');
                  setSelectedPlanSector('TODOS');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}

            {onNavigateToPlanos && (
              <button
                type="button"
                onClick={onNavigateToPlanos}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B3A63] hover:bg-[#144d7e] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Gerenciar Planos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* KPIs Executivos de Planos de Ação */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[#0B3A63] dark:text-sky-400 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Total de Planos</span>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono tabular-nums mt-0.5">{planMetrics.total}</p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">{planMetrics.abertos} em aberto</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Pendentes de Tratamento</span>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-0.5">{planMetrics.pendente}</p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">{planMetrics.semResponsavel} sem responsável</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Em Andamento</span>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums mt-0.5">{planMetrics.emAndamento}</p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">{planMetrics.vencendo7Dias} vencem em 7d</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Prazos Vencidos</span>
              <p className={`text-xl font-black font-mono tabular-nums mt-0.5 ${planMetrics.atrasado > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {planMetrics.atrasado}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {planMetrics.total > 0 ? Math.round((planMetrics.atrasado / planMetrics.total) * 100) : 0}% do total
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 col-span-2 sm:col-span-1">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Concluídos</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">{planMetrics.concluido}</p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">{planMetrics.taxaConclusao}% de eficácia</span>
            </div>
          </div>
        </div>

        {/* Gráficos: Linha 1 (Por Setor + Distribuição por Status) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Status por Setor */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
                  Status dos Planos de Ação por Setor
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Volume de tratativas concluídas, em andamento, pendentes e vencidas por área
                </p>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {plansBySectorData.length} {plansBySectorData.length === 1 ? 'setor' : 'setores'}
              </span>
            </div>

            <div className="h-68">
              {plansBySectorData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Nenhum plano de ação registrado para os filtros selecionados.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Finalize auditorias 5S com desvios para acompanhar a evolução por setor.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plansBySectorData} margin={{ top: 10, right: 12, left: -18, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis
                      dataKey="setor"
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      tickLine={false}
                      interval={0}
                      angle={plansBySectorData.length > 5 ? -20 : 0}
                      textAnchor={plansBySectorData.length > 5 ? 'end' : 'middle'}
                      height={plansBySectorData.length > 5 ? 48 : 30}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomActionPlanTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                    <Bar dataKey="Concluído" stackId="a" fill={ACTION_PLAN_COLORS.concluido} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Em Andamento" stackId="a" fill={ACTION_PLAN_COLORS.emAndamento} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Pendente" stackId="a" fill={ACTION_PLAN_COLORS.pendente} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Prazo Vencido" stackId="a" fill={ACTION_PLAN_COLORS.atrasado} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Distribuição Geral & Alertas Operacionais */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
                Distribuição por Status &amp; Pendências
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Proporção atual de resolução e gargalos de responsabilidade
              </p>
            </div>

            {planMetrics.total === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 italic">
                Sem planos de ação para exibir a distribuição.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6 h-52 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={plansStatusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={2}
                      >
                        {plansStatusPieData.map((entry, idx) => (
                          <Cell key={`pie-cell-${idx}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [`${value} (${Math.round((Number(value) / planMetrics.total) * 100)}%)`, name]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(100,116,139,0.4)',
                          borderRadius: '10px',
                          fontSize: '11px',
                          color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono tabular-nums">
                      {planMetrics.taxaConclusao}%
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Concluídos
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-6 space-y-2.5 text-xs">
                  {[
                    { label: 'Concluído', count: planMetrics.concluido, color: ACTION_PLAN_COLORS.concluido },
                    { label: 'Em Andamento', count: planMetrics.emAndamento, color: ACTION_PLAN_COLORS.emAndamento },
                    { label: 'Pendente', count: planMetrics.pendente, color: ACTION_PLAN_COLORS.pendente },
                    { label: 'Prazo Vencido', count: planMetrics.atrasado, color: ACTION_PLAN_COLORS.atrasado }
                  ].map(item => {
                    const pct = planMetrics.total > 0 ? Math.round((item.count / planMetrics.total) * 100) : 0;
                    return (
                      <div key={item.label} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                          <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                          <span>{item.label}</span>
                        </span>
                        <span className="font-mono font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {item.count} <span className="text-[11px] font-normal text-slate-400">({pct}%)</span>
                        </span>
                      </div>
                    );
                  })}

                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <UserX className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Sem responsável</span>
                      </span>
                      <span className="font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                        {planMetrics.semResponsavel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CalendarOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Sem prazo definido</span>
                      </span>
                      <span className="font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                        {planMetrics.semPrazo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Vencem em até 7 dias</span>
                      </span>
                      <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                        {planMetrics.vencendo7Dias}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráficos: Linha 2 (Por Mês + Por Ciclo) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Status por Mês */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
                  Status dos Planos por Mês
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Evolução mensal por {planMonthBasis === 'auditoria' ? 'data da auditoria' : 'prazo de vencimento'}
                </p>
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlanMonthBasis('auditoria')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    planMonthBasis === 'auditoria'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Mês Auditoria
                </button>
                <button
                  type="button"
                  onClick={() => setPlanMonthBasis('prazo')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    planMonthBasis === 'prazo'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Mês Prazo
                </button>
              </div>
            </div>

            <div className="h-64">
              {plansByMonthData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
                  Sem dados mensais para exibir.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plansByMonthData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomActionPlanTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                    <Bar dataKey="Concluído" stackId="m" fill={ACTION_PLAN_COLORS.concluido} />
                    <Bar dataKey="Em Andamento" stackId="m" fill={ACTION_PLAN_COLORS.emAndamento} />
                    <Bar dataKey="Pendente" stackId="m" fill={ACTION_PLAN_COLORS.pendente} />
                    <Bar dataKey="Prazo Vencido" stackId="m" fill={ACTION_PLAN_COLORS.atrasado} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Status por Ciclo de Auditoria */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
                  Status dos Planos por Ciclo 5S
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Comparativo de pendências e resoluções por ciclo de auditoria
                </p>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {plansByCycleData.length} {plansByCycleData.length === 1 ? 'ciclo' : 'ciclos'}
              </span>
            </div>

            <div className="h-64">
              {plansByCycleData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
                  Sem dados de ciclos para exibir.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plansByCycleData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis
                      dataKey="ciclo"
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomActionPlanTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                    <Bar dataKey="Concluído" stackId="c" fill={ACTION_PLAN_COLORS.concluido} />
                    <Bar dataKey="Em Andamento" stackId="c" fill={ACTION_PLAN_COLORS.emAndamento} />
                    <Bar dataKey="Pendente" stackId="c" fill={ACTION_PLAN_COLORS.pendente} />
                    <Bar dataKey="Prazo Vencido" stackId="c" fill={ACTION_PLAN_COLORS.atrasado} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Acompanhamento: Prazos Vencidos & Pendentes de Tratamento */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-black text-[#0B3A63] dark:text-sky-400 uppercase tracking-wider">
                Ações com Prazo Vencido e Pendentes de Tratamento
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Priorização das pendências abertas para cobrança dos responsáveis
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              {[
                { id: 'vencidos', label: `Prazos Vencidos (${actionablePlanRows.vencidos.length})` },
                { id: 'pendentes', label: `Pendentes (${actionablePlanRows.pendentes.length})` },
                { id: 'vencendo', label: `Vencem em 7d (${actionablePlanRows.vencendo.length})` },
                { id: 'abertos', label: `Todos em Aberto (${actionablePlanRows.abertos.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPlanListTab(tab.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    planListTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Requisito</th>
                  <th className="py-2.5 px-3">Setor / Ciclo</th>
                  <th className="py-2.5 px-3">Descrição do Desvio</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3 text-right">Prazo</th>
                  <th className="py-2.5 px-3 text-right">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedActionRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-xs text-slate-400">
                      Nenhum plano de ação encontrado nesta categoria para os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  displayedActionRows.map(({ plan, req, sectorName, cycleName, effectiveStatus, hasOwner, daysDelta }) => {
                    const statusColor =
                      effectiveStatus === 'Prazo Vencido'
                        ? 'text-rose-600 dark:text-rose-400'
                        : effectiveStatus === 'Pendente'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-blue-600 dark:text-blue-400';

                    const delayText = !plan.prazo
                      ? 'Sem prazo definido'
                      : daysDelta < 0
                        ? `${Math.abs(daysDelta)}d em atraso`
                        : daysDelta === 0
                          ? 'Vence hoje'
                          : `${daysDelta}d restantes`;

                    return (
                      <tr key={plan.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#0B3A63] dark:text-sky-400">
                            {req?.codigo || '5S'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{sectorName}</div>
                          <div className="text-[11px] text-slate-400 whitespace-nowrap">{cycleName}</div>
                        </td>
                        <td className="py-2.5 px-3 max-w-[320px]">
                          {(() => {
                            const desvioText = plan.desvioApontado || plan.descricao;
                            const acaoText = plan.acaoCorretiva?.trim();
                            return (
                              <>
                                <p className="text-slate-700 dark:text-slate-300 line-clamp-1" title={desvioText}>
                                  {desvioText}
                                </p>
                                {acaoText && (
                                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 line-clamp-1 mt-0.5" title={acaoText}>
                                    <span className="font-semibold">Ação:</span> {acaoText}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {hasOwner ? (
                            <div>
                              <span className="text-slate-700 dark:text-slate-200 font-medium block">{plan.responsavel}</span>
                              {plan.responsavelEmail && plan.responsavelEmail.toLowerCase() !== plan.responsavel.trim().toLowerCase() && (
                                <span className="text-[10px] text-slate-400 font-mono block">{plan.responsavelEmail}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">Não definido</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{formatDateBr(plan.prazo)}</div>
                          <div className={`text-[11px] ${daysDelta < 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'}`}>
                            {delayText}
                          </div>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${statusColor}`}>
                          {effectiveStatus}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. META & FAQ INFO BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-transparent border border-emerald-500/20 dark:border-emerald-900/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
            <h4 className="font-extrabold text-sm">{personalizacao?.auditorias5sMetaTitulo || 'Meta de Conformidade 5S'}</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {personalizacao?.auditorias5sMetaSubtitulo || 'A Vickytex estabelece que todo setor que obtiver uma nota média geral abaixo de 75% deve abrir obrigatoriamente um Plano de Ação Corretiva 5W2H focado nos sensos deficientes, visando reorganizar, realizar mutirões de limpeza ou reorientar a equipe em reuniões diárias.'}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Objetivo Geral:</span>
            <span className="px-2 py-0.5 bg-emerald-500 text-white font-mono text-xs font-black rounded-sm shadow-xs">
              &ge; {personalizacao?.auditorias5sMetaGrafico ?? 75}%
            </span>
          </div>
        </div>

        {/* Help/FAQ Card */}
        <div className="bg-gradient-to-br from-[#0B3A63]/5 to-[#1D5E91]/5 dark:from-[#0B3A63]/10 dark:to-transparent border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#0B3A63] dark:text-sky-400">
            <Activity className="w-5 h-5" />
            <h4 className="font-extrabold text-sm">{personalizacao?.auditorias5sAjudaTitulo || 'Dúvidas sobre o Programa 5S?'}</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {personalizacao?.auditorias5sAjudaSubtitulo || 'As auditorias são realizadas periodicamente pelo time da Qualidade. Qualquer desvio gera um plano de ação imediato de 15 dias para os supervisores tratarem as reincidências.'}
          </p>
        </div>
      </div>
    </div>
  );
};
