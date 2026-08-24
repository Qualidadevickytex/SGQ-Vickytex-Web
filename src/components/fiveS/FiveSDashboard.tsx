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
  Legend
} from 'recharts';
import { 
  Trophy, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Award,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  Setor5S, 
  Requisito5S, 
  ItemAuditado, 
  Configuracao5S, 
  Auditoria5S,
  Senso5S,
  Classificacao5S
} from '../../types/fiveS';
import { getClassificationForIndex } from '../../utils/fiveSStore';
import { PersonalizacaoGeral } from '../../utils/mockData';

interface FiveSDashboardProps {
  auditorias: Auditoria5S[];
  setores: Setor5S[];
  sensos: Senso5S[];
  requisitos: Requisito5S[];
  classificacoes: Classificacao5S[];
  config: Configuracao5S;
  itens: ItemAuditado[];
  personalizacao?: PersonalizacaoGeral;
}

export const FiveSDashboard: React.FC<FiveSDashboardProps> = ({
  auditorias,
  setores,
  sensos,
  requisitos,
  classificacoes,
  config,
  itens,
  personalizacao
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
  // Get latest finalized audit for each sector
  const sectorRanking = useMemo(() => {
    return setores
      .filter(s => s.ativo)
      .map(sector => {
        const sectorAudits = finalizedAudits.filter(a => a.setorId === sector.id);
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
          date
        };
      })
      .sort((a, b) => {
        if (a.hasAudit && !b.hasAudit) return -1;
        if (!a.hasAudit && b.hasAudit) return 1;
        return b.score - a.score;
      });
  }, [setores, finalizedAudits]);

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

      // B. Individual Active Sectors Averages
      setores.filter(s => s.ativo).forEach(sector => {
        const sectorMonthly = monthlyAudits.filter(a => a.setorId === sector.id);
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

    // Grouping sectors and months
    setores.filter(s => s.ativo).forEach(sector => {
      const sectorAudits = finalizedAudits.filter(a => a.setorId === sector.id);
      
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
              <p className="text-[10px] text-slate-400">Última avaliação de cada setor elegível.</p>
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
                      <p className="font-extrabold text-slate-800 dark:text-slate-100">{item.nome}</p>
                      <p className="text-[10px] text-slate-400">Última auditoria: <span className="font-semibold font-mono">{item.date}</span></p>
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
                    const firstSec = setores.find(s => s.ativo);
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
                  {setores.filter(s => s.ativo).map(s => (
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
                    setores.filter(s => s.ativo).map((sector, idx) => (
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

      {/* 4. META & FAQ INFO BANNERS */}
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
