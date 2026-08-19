/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  BarChart3, 
  Calendar, 
  Award, 
  Layers, 
  Sliders, 
  FileText, 
  HelpCircle, 
  Edit3, 
  Trash2, 
  X, 
  Info,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { PersonalizacaoGeral } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';
import { IndicatorRepository } from '../services/database/repositories/indicator.repository';
import { CriticalAnalysesRepository } from '../services/firebase/repositories/criticalAnalysis.repository';
import { IndicadorDesempenho } from '../types/indicator';

interface Indicador {
  id: string;
  nome: string;
  setor: string;
  unidade: string;
  meta: number;
  direcaoMeta: 'maior' | 'menor'; // 'maior' = maior ou igual à meta é bom, 'menor' = menor ou igual à meta é bom
  frequencia: 'Mensal' | 'Trimestral';
  requisitoISO: string;
  descricao: string;
  formula: string;
  responsavel: string;
  historico: { mes: string; valor: number }[];
}

interface AnaliseCritica {
  id: string;
  data: string;
  indicadorId: string;
  indicadorNome: string;
  avaliador: string;
  conclusao: string;
  statusAcao: 'Necessita Ação' | 'Sob Controle' | 'Plano Aberto';
  linkPlanoId?: string;
}

interface IndicadoresProps {
  onAddLog: (action: string, details: string) => void;
  personalizacao?: PersonalizacaoGeral;
}

// Dados iniciais ricos de Indicadores (ISO 9001 9.1.3)
const INITIAL_INDICADORES: Indicador[] = [
  {
    id: 'kpi-1',
    nome: 'Eficiência Global dos Equipamentos (OEE)',
    setor: 'Tecelagem',
    unidade: '%',
    meta: 85,
    direcaoMeta: 'maior',
    frequencia: 'Mensal',
    requisitoISO: '8.5 - Produção e Provisão de Serviço',
    descricao: 'Mede a produtividade real dos teares considerando Disponibilidade, Performance e Qualidade do tecido.',
    formula: 'Disponibilidade (%) × Performance (%) × Qualidade (%)',
    responsavel: 'Roberto Souza (Supervisor de Tecelagem)',
    historico: [
      { mes: 'Jan', valor: 78 },
      { mes: 'Fev', valor: 80 },
      { mes: 'Mar', valor: 82 },
      { mes: 'Abr', valor: 84 },
      { mes: 'Mai', valor: 86 },
      { mes: 'Jun', valor: 85 },
      { mes: 'Jul', valor: 87 }
    ]
  },
  {
    id: 'kpi-2',
    nome: 'Índice de Defeitos e Retrabalho (Segunda Qualidade)',
    setor: 'Costura',
    unidade: '%',
    meta: 2.5,
    direcaoMeta: 'menor',
    frequencia: 'Mensal',
    requisitoISO: '8.7 - Controle de Saídas Não Conformes',
    descricao: 'Percentual de peças costuradas com falhas de conformidade que necessitam de desmonte ou reparo.',
    formula: '(Peças com Defeito / Total de Peças Produzidas) × 100',
    responsavel: 'Mariana Silva (Garantia da Qualidade)',
    historico: [
      { mes: 'Jan', valor: 3.4 },
      { mes: 'Fev', valor: 3.1 },
      { mes: 'Mar', valor: 2.8 },
      { mes: 'Abr', valor: 2.4 },
      { mes: 'Mai', valor: 2.1 },
      { mes: 'Jun', valor: 1.9 },
      { mes: 'Jul', valor: 1.8 }
    ]
  },
  {
    id: 'kpi-3',
    nome: 'Média Geral de Auditorias 5S',
    setor: 'Geral',
    unidade: '%',
    meta: 75,
    direcaoMeta: 'maior',
    frequencia: 'Mensal',
    requisitoISO: '7.1.4 - Ambiente para Operação dos Processos',
    descricao: 'Média dos 5 sensos auditados em todos os setores fabris, visando organização, limpeza e produtividade.',
    formula: '(Seiri + Seiton + Seiso + Seiketsu + Shitsuke) / 5',
    responsavel: 'Carlos Santos (Comitê 5S / Auditoria)',
    historico: [
      { mes: 'Jan', valor: 64 },
      { mes: 'Fev', valor: 68 },
      { mes: 'Mar', valor: 72 },
      { mes: 'Abr', valor: 75 },
      { mes: 'Mai', valor: 82 },
      { mes: 'Jun', valor: 85 },
      { mes: 'Jul', valor: 88 }
    ]
  },
  {
    id: 'kpi-4',
    nome: 'Reclamações de Clientes Atendidas no Prazo',
    setor: 'Qualidade',
    unidade: '%',
    meta: 95,
    direcaoMeta: 'maior',
    frequencia: 'Mensal',
    requisitoISO: '8.2.1 - Comunicação com o Cliente',
    descricao: 'Percentual de reclamações de clientes (RNC Externa) tratadas e respondidas dentro do SLA estabelecido de 5 dias úteis.',
    formula: '(Reclamações Fechadas no Prazo / Total de Reclamações Fechadas) × 100',
    responsavel: 'Rodrigo Berto (Garantia da Qualidade)',
    historico: [
      { mes: 'Jan', valor: 90 },
      { mes: 'Fev', valor: 92 },
      { mes: 'Mar', valor: 95 },
      { mes: 'Abr', valor: 93 },
      { mes: 'Mai', valor: 96 },
      { mes: 'Jun', valor: 100 },
      { mes: 'Jul', valor: 97 }
    ]
  },
  {
    id: 'kpi-5',
    nome: 'Índice de Qualificação de Fornecedores (IQF)',
    setor: 'Qualidade',
    unidade: 'Pontos',
    meta: 80,
    direcaoMeta: 'maior',
    frequencia: 'Mensal',
    requisitoISO: '8.4 - Controle de Processos e Serviços Providos Externamente',
    descricao: 'Pontuação consolidada dos fornecedores críticos (fios, corantes) com base nos critérios de qualidade, pontualidade e atendimento.',
    formula: '(Média do critério de Qualidade × 0.5) + (Média do critério de Prazo × 0.3) + (Média de Atendimento × 0.2)',
    responsavel: 'Fernando Oliveira (Gerente de Suprimentos)',
    historico: [
      { mes: 'Jan', valor: 75 },
      { mes: 'Fev', valor: 78 },
      { mes: 'Mar', valor: 81 },
      { mes: 'Abr', valor: 80 },
      { mes: 'Mai', valor: 84 },
      { mes: 'Jun', valor: 85 },
      { mes: 'Jul', valor: 83 }
    ]
  },
  {
    id: 'kpi-6',
    nome: 'Aderência ao Cronograma de Treinamentos',
    setor: 'Qualidade',
    unidade: '%',
    meta: 90,
    direcaoMeta: 'maior',
    frequencia: 'Trimestral',
    requisitoISO: '7.2 - Competência e Conscientização',
    descricao: 'Mede o nível de cumprimento das capacitações obrigatórias planejadas no Plano Anual de Treinamentos (PAT).',
    formula: '(Treinamentos Realizados / Treinamentos Planejados no Período) × 100',
    responsavel: 'Ana Souza (Analista de RH / Treinamento)',
    historico: [
      { mes: 'Jan', valor: 80 },
      { mes: 'Fev', valor: 80 },
      { mes: 'Mar', valor: 90 },
      { mes: 'Abr', valor: 88 },
      { mes: 'Mai', valor: 88 },
      { mes: 'Jun', valor: 94 },
      { mes: 'Jul', valor: 92 }
    ]
  }
];

const INITIAL_ANALISES: AnaliseCritica[] = [
  {
    id: 'ana-1',
    data: '2026-06-15',
    indicadorId: 'kpi-2',
    indicadorNome: 'Índice de Defeitos e Retrabalho (Segunda Qualidade)',
    avaliador: 'Rodrigo Berto (Qualidade)',
    conclusao: 'Meta batida consecutivamente em Maio e Junho após a implementação dos novos guias de costura dupla. Processo está estabilizado.',
    statusAcao: 'Sob Controle'
  },
  {
    id: 'ana-2',
    data: '2026-07-05',
    indicadorId: 'kpi-5',
    indicadorNome: 'Índice de Qualificação de Fornecedores (IQF)',
    avaliador: 'Fernando Oliveira (Suprimentos)',
    conclusao: 'O IQF de Julho manteve-se acima da meta de 80 pontos, porém o fornecedor de fios de poliéster apresentou queda na pontualidade. Notificado para apresentar plano corretivo.',
    statusAcao: 'Necessita Ação',
    linkPlanoId: 'PLA-2026-004'
  }
];

const mapToRepo = (ind: Indicador): IndicadorDesempenho => {
  const valoresMensais: { [key: string]: number } = {};
  if (ind.historico && Array.isArray(ind.historico)) {
    ind.historico.forEach(h => {
      if (h && h.mes) {
        valoresMensais[h.mes] = Number(h.valor);
      }
    });
  }
  return {
    id: ind.id,
    codigo: ind.id,
    nome: ind.nome,
    setor: ind.setor as any,
    meta: Number(ind.meta),
    unidade: ind.unidade,
    frequenciaMensuracao: ind.frequencia as any,
    valoresMensais,
    responsavel: ind.responsavel,
    direcaoMeta: ind.direcaoMeta,
    requisitoISO: ind.requisitoISO,
    descricao: ind.descricao,
    formula: ind.formula,
    historico: ind.historico
  } as any;
};

const mapFromRepo = (repoInd: any): Indicador => {
  let historico: { mes: string; valor: number }[] = [];
  if (Array.isArray(repoInd.historico) && repoInd.historico.length > 0) {
    historico = repoInd.historico;
  } else if (repoInd.valoresMensais && Object.keys(repoInd.valoresMensais).length > 0) {
    Object.entries(repoInd.valoresMensais).forEach(([mes, valor]) => {
      historico.push({ mes, valor: Number(valor) });
    });
  }

  return {
    id: repoInd.id,
    nome: repoInd.nome || '',
    setor: repoInd.setor || '',
    unidade: repoInd.unidade || '%',
    meta: Number(repoInd.meta ?? 0),
    direcaoMeta: repoInd.direcaoMeta || 'maior',
    frequencia: repoInd.frequenciaMensuracao || repoInd.frequencia || 'Mensal',
    requisitoISO: repoInd.requisitoISO || '9.1.3 - Análise e avaliação',
    descricao: repoInd.descricao || '',
    formula: repoInd.formula || '',
    responsavel: repoInd.responsavel || '',
    historico
  };
};

export const Indicadores: React.FC<IndicadoresProps> = ({ onAddLog, personalizacao }) => {
  const { user } = useAuth();
  const [indicadores, setIndicadores] = useState<Indicador[]>(() => {
    return import.meta.env.VITE_DEMO_MODE === 'true' ? INITIAL_INDICADORES : [];
  });

  const [analises, setAnalises] = useState<AnaliseCritica[]>(() => {
    return import.meta.env.VITE_DEMO_MODE === 'true' ? INITIAL_ANALISES : [];
  });

  // Carregar dados reais remotamente usando os repositórios na montagem e manter sincronizado em tempo real
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [indRes, critRes] = await Promise.all([
          IndicatorRepository.findAll(),
          CriticalAnalysesRepository.findAll()
        ]);

        if (!isMounted) return;

        if (indRes.success && indRes.data && indRes.data.length > 0) {
          const mapped = indRes.data.map(mapFromRepo);
          setIndicadores(mapped);
          setSelectedKpiId(prev => {
            if (prev && mapped.some(m => m.id === prev)) return prev;
            return mapped[0]?.id || '';
          });
        }

        if (critRes.success && critRes.data && critRes.data.length > 0) {
          setAnalises(critRes.data as AnaliseCritica[]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do repositório remoto:', err);
      }
    };
    fetchData();

    // Assinaturas em tempo real via Firestore
    const unsubInd = IndicatorRepository.subscribe((items) => {
      if (!isMounted) return;
      if (items && items.length > 0) {
        const mapped = items.map(mapFromRepo);
        setIndicadores(mapped);
        setSelectedKpiId(prev => {
          if (prev && mapped.some(m => m.id === prev)) return prev;
          return mapped[0]?.id || '';
        });
      }
    });

    const unsubCrit = CriticalAnalysesRepository.subscribe((items) => {
      if (!isMounted) return;
      if (items && items.length > 0) {
        setAnalises(items as AnaliseCritica[]);
      }
    });

    return () => {
      isMounted = false;
      unsubInd();
      unsubCrit();
    };
  }, []);

  const [selectedKpiId, setSelectedKpiId] = useState<string>('kpi-1');
  const [filterSector, setFilterSector] = useState<string>('Todos');
  const [showAddKpiModal, setShowAddKpiModal] = useState(false);
  const [showAddMeasureModal, setShowAddMeasureModal] = useState(false);
  const [showAddCriticaModal, setShowAddCriticaModal] = useState(false);
  const [kpiToDelete, setKpiToDelete] = useState<Indicador | null>(null);
  const [editingKpi, setEditingKpi] = useState<Indicador | null>(null);

  // States para gerenciar edição dos apontamentos históricos
  const [editingHistIndex, setEditingHistIndex] = useState<number | null>(null);
  const [editingHistValue, setEditingHistValue] = useState<string>('');
  const [editingHistMes, setEditingHistMes] = useState<string>('');

  // States para Formulários
  const [newKpi, setNewKpi] = useState<Partial<Indicador>>({
    nome: '',
    setor: 'Tecelagem',
    unidade: '%',
    meta: 0,
    direcaoMeta: 'maior',
    frequencia: 'Mensal',
    requisitoISO: '9.1 - Monitoramento, medição, análise e avaliação',
    descricao: '',
    formula: '',
    responsavel: ''
  });

  const [newMeasure, setNewMeasure] = useState({
    mes: 'Ago',
    valor: ''
  });

  const [newCritica, setNewCritica] = useState({
    indicadorId: '',
    conclusao: '',
    statusAcao: 'Sob Controle' as 'Necessita Ação' | 'Sob Controle' | 'Plano Aberto',
    linkPlanoId: ''
  });


  const activeKpi = indicadores.find(k => k.id === selectedKpiId) || indicadores[0];

  const handleSelectKpi = (id: string) => {
    setSelectedKpiId(id);
  };

  // Setores únicos para filtro
  const uniqueSectors = ['Todos', ...Array.from(new Set(indicadores.map(k => k.setor)))];

  // Filtra indicadores exibidos no painel lateral
  const filteredKpis = indicadores.filter(k => filterSector === 'Todos' || k.setor === filterSector);

  // Verifica se o último valor de histórico cumpre a meta
  const checkConformity = (kpi: Indicador) => {
    if (!kpi.historico || kpi.historico.length === 0) return 'warning';
    const lastValue = kpi.historico[kpi.historico.length - 1].valor;
    if (kpi.direcaoMeta === 'maior') {
      return lastValue >= kpi.meta ? 'success' : 'danger';
    } else {
      return lastValue <= kpi.meta ? 'success' : 'danger';
    }
  };

  // Cálculo de estatísticas rápidas
  const getKpiStats = (kpi: Indicador) => {
    if (!kpi.historico || kpi.historico.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };
    const values = kpi.historico.map(h => h.valor);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / values.length;
    const current = values[values.length - 1];
    return { min, max, avg, current };
  };

  // Handler para Adicionar / Editar Indicador
  const handleAddKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKpi.nome || newKpi.meta === undefined) return;

    if (editingKpi) {
      let updatedObj: Indicador | null = null;
      const updatedList = indicadores.map(k => {
        if (k.id === editingKpi.id) {
          const updated: Indicador = {
            ...k,
            nome: newKpi.nome || '',
            setor: newKpi.setor || 'Geral',
            unidade: newKpi.unidade || '%',
            meta: Number(newKpi.meta),
            direcaoMeta: newKpi.direcaoMeta || 'maior',
            frequencia: (newKpi.frequencia as 'Mensal' | 'Trimestral') || 'Mensal',
            requisitoISO: newKpi.requisitoISO || '9.1.3 - Análise e avaliação',
            descricao: newKpi.descricao || '',
            formula: newKpi.formula || '',
            responsavel: newKpi.responsavel || 'Gestor da Qualidade',
          };
          updatedObj = updated;
          return updated;
        }
        return k;
      });

      setIndicadores(updatedList);
      setShowAddKpiModal(false);
      setEditingKpi(null);
      onAddLog('Indicadores', `Editou as configurações do indicador "${newKpi.nome}"`);
      
      if (updatedObj) {
        try {
          await IndicatorRepository.update(editingKpi.id, mapToRepo(updatedObj));
        } catch (err) {
          console.error('Falha ao atualizar indicador remoto:', err);
        }
      }

      // Limpar form
      setNewKpi({
        nome: '',
        setor: 'Tecelagem',
        unidade: '%',
        meta: 0,
        direcaoMeta: 'maior',
        frequencia: 'Mensal',
        requisitoISO: '9.1 - Monitoramento, medição, análise e avaliação',
        descricao: '',
        formula: '',
        responsavel: ''
      });
      return;
    }

    const created: Indicador = {
      id: `kpi-${Date.now()}`,
      nome: newKpi.nome,
      setor: newKpi.setor || 'Geral',
      unidade: newKpi.unidade || '%',
      meta: Number(newKpi.meta),
      direcaoMeta: newKpi.direcaoMeta || 'maior',
      frequencia: (newKpi.frequencia as 'Mensal' | 'Trimestral') || 'Mensal',
      requisitoISO: newKpi.requisitoISO || '9.1.3 - Análise e avaliação',
      descricao: newKpi.descricao || '',
      formula: newKpi.formula || '',
      responsavel: newKpi.responsavel || 'Gestor da Qualidade',
      historico: [
        { mes: 'Mai', valor: Math.round(Number(newKpi.meta) * 0.9) },
        { mes: 'Jun', valor: Math.round(Number(newKpi.meta) * 0.95) },
        { mes: 'Jul', valor: Number(newKpi.meta) }
      ]
    };

    setIndicadores(prev => [...prev, created]);
    setSelectedKpiId(created.id);
    setShowAddKpiModal(false);
    onAddLog('Indicadores', `Cadastrou o indicador de qualidade "${created.nome}" para o setor de ${created.setor}`);

    try {
      await IndicatorRepository.create(mapToRepo(created));
    } catch (err) {
      console.error('Falha ao criar indicador remoto:', err);
    }

    // Limpar form
    setNewKpi({
      nome: '',
      setor: 'Tecelagem',
      unidade: '%',
      meta: 0,
      direcaoMeta: 'maior',
      frequencia: 'Mensal',
      requisitoISO: '9.1 - Monitoramento, medição, análise e avaliação',
      descricao: '',
      formula: '',
      responsavel: ''
    });
  };

  // Handler para Adicionar Medição Mensal
  const handleAddMeasure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeasure.valor) return;

    const numericValue = Number(newMeasure.valor);
    const mesToSave = newMeasure.mes;

    let updatedKpi: Indicador | null = null;
    setIndicadores(prev => prev.map(k => {
      if (k.id === selectedKpiId) {
        // Evitar duplicar mesmo mês, remover se já existe
        const filteredHist = (k.historico || []).filter(h => h.mes !== mesToSave);
        updatedKpi = {
          ...k,
          historico: [...filteredHist, { mes: mesToSave, valor: numericValue }]
        };
        return updatedKpi;
      }
      return k;
    }));

    setShowAddMeasureModal(false);
    onAddLog('Indicadores', `Lançou medição de ${numericValue}${activeKpi?.unidade || ''} para o mês de ${mesToSave} no indicador "${activeKpi?.nome || ''}"`);
    setNewMeasure({ mes: 'Ago', valor: '' });

    if (updatedKpi) {
      try {
        await IndicatorRepository.update(selectedKpiId, mapToRepo(updatedKpi));
      } catch (err) {
        console.error('Falha ao atualizar medição remota:', err);
      }
    }
  };

  // Handler para Salvar Edição de Apontamento Histórico
  const handleSaveEditHistory = async (idx: number) => {
    if (!editingHistMes || !editingHistValue) return;

    let updatedKpi: Indicador | null = null;
    setIndicadores(prev => prev.map(k => {
      if (k.id === selectedKpiId) {
        const updatedHist = [...(k.historico || [])];
        const oldVal = updatedHist[idx]?.valor;
        const oldMes = updatedHist[idx]?.mes;
        updatedHist[idx] = { mes: editingHistMes, valor: Number(editingHistValue) };
        updatedKpi = {
          ...k,
          historico: updatedHist
        };
        onAddLog('Indicadores', `Alterou o apontamento do mês ${oldMes} (de ${oldVal} para ${editingHistValue}${k.unidade}) no indicador "${k.nome}"`);
        return updatedKpi;
      }
      return k;
    }));

    setEditingHistIndex(null);

    if (updatedKpi) {
      try {
        await IndicatorRepository.update(selectedKpiId, mapToRepo(updatedKpi));
      } catch (err) {
        console.error('Falha ao sincronizar edição do apontamento:', err);
      }
    }
  };

  // Handler para Excluir Apontamento Histórico
  const handleDeleteHistory = async (idx: number) => {
    if (!window.confirm('Deseja realmente excluir permanentemente este apontamento lançado?')) return;

    let updatedKpi: Indicador | null = null;
    setIndicadores(prev => prev.map(k => {
      if (k.id === selectedKpiId) {
        const deletedItem = (k.historico || [])[idx];
        const updatedHist = (k.historico || []).filter((_, i) => i !== idx);
        updatedKpi = {
          ...k,
          historico: updatedHist
        };
        if (deletedItem) {
          onAddLog('Indicadores', `Excluiu o apontamento de ${deletedItem.valor}${k.unidade} do mês de ${deletedItem.mes} no indicador "${k.nome}"`);
        }
        return updatedKpi;
      }
      return k;
    }));

    if (updatedKpi) {
      try {
        await IndicatorRepository.update(selectedKpiId, mapToRepo(updatedKpi));
      } catch (err) {
        console.error('Falha ao sincronizar exclusão do apontamento:', err);
      }
    }
  };

  // Handler para Adicionar Análise Crítica
  const handleAddCritica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritica.conclusao || !newCritica.conclusao.trim()) return;

    // Resolução resiliente do indicador alvo
    const targetKpi = indicadores.find(k => k.id === newCritica.indicadorId) 
      || indicadores.find(k => k.id === selectedKpiId) 
      || (indicadores.length > 0 ? indicadores[0] : null);

    const indId = targetKpi ? targetKpi.id : (newCritica.indicadorId || selectedKpiId || 'kpi-geral');
    const indNome = targetKpi ? targetKpi.nome : 'Indicador da Qualidade';

    const evaluatorName = user?.name 
      ? `${user.name}${user.role ? ` (${user.role})` : ''}` 
      : 'Mariana Silva (Qualidade)';

    const created: AnaliseCritica = {
      id: `ana-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      indicadorId: indId,
      indicadorNome: indNome,
      avaliador: evaluatorName,
      conclusao: newCritica.conclusao.trim(),
      statusAcao: newCritica.statusAcao,
      linkPlanoId: newCritica.linkPlanoId?.trim() || undefined
    };

    setAnalises(prev => [created, ...prev]);
    setShowAddCriticaModal(false);
    onAddLog('Indicadores', `Registrou análise crítica de qualidade (ISO 9.3) para o indicador "${indNome}"`);
    
    setNewCritica({
      indicadorId: indId,
      conclusao: '',
      statusAcao: 'Sob Controle',
      linkPlanoId: ''
    });

    try {
      await CriticalAnalysesRepository.create(created as any);
    } catch (err) {
      console.error('Falha ao salvar análise crítica no Firestore:', err);
    }
  };

  // Handler para Deletar Análise Crítica
  const handleDeleteCritica = async (id: string) => {
    const target = analises.find(a => a.id === id);
    setAnalises(prev => prev.filter(a => a.id !== id));
    if (target) {
      onAddLog('Indicadores', `Excluiu a análise crítica do indicador "${target.indicadorNome}"`);
    }
    try {
      await CriticalAnalysesRepository.delete(id);
    } catch (err) {
      console.error('Falha ao excluir análise crítica do Firestore:', err);
    }
  };

  // Deletar Indicador
  const handleDeleteKpi = async (id: string) => {
    const targetKpi = indicadores.find(k => k.id === id);
    if (!targetKpi) return;
    setIndicadores(prev => prev.filter(k => k.id !== id));
    onAddLog('Indicadores', `Deletou o indicador de qualidade "${targetKpi.nome}"`);
    if (selectedKpiId === id) {
      const remaining = indicadores.filter(k => k.id !== id);
      if (remaining.length > 0) {
        setSelectedKpiId(remaining[0].id);
      } else {
        setSelectedKpiId('');
      }
    }
    setKpiToDelete(null);

    try {
      await IndicatorRepository.delete(id);
    } catch (err) {
      console.error('Falha ao deletar indicador remoto:', err);
    }
  };

  // Radar Data - Visão Geral de Performance Recente (Último mês de todos)
  const radarData = indicadores.map(kpi => {
    const stats = getKpiStats(kpi);
    // Normaliza valor para escala 0 a 100 para o Radar
    let percentageOfTarget = 0;
    if (kpi.direcaoMeta === 'maior') {
      percentageOfTarget = Math.min(120, Math.round((stats.current / kpi.meta) * 100));
    } else {
      percentageOfTarget = stats.current === 0 ? 100 : Math.min(120, Math.round((kpi.meta / stats.current) * 100));
    }
    return {
      subject: kpi.nome.length > 25 ? kpi.nome.substring(0, 22) + '...' : kpi.nome,
      'Aderência à Meta (%)': percentageOfTarget,
      meta: 100
    };
  });

  return (
    <div id="indicadores-module-container" className="space-y-6">
      
      {/* Top Banner Header */}
      <div id="indicadores-header" className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                Requisito ISO 9.1.3
              </span>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center">
                Indicadores e Metas de Qualidade
                <span className="ml-2 text-xs font-semibold text-slate-400">({personalizacao?.nomeEmpresa || 'Vickytex'})</span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2.5 max-w-2xl leading-relaxed">
            Painel Executivo de Gestão de Processos (Clause 9.1 - Monitoramento, Medição, Análise e Avaliação). 
            Visualize o desempenho operacional, retrabalho, 5S, fornecedores e RH com gráficos e relatórios automatizados de conformidade.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            id="btn-add-measure"
            onClick={() => setShowAddMeasureModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-200/50 dark:border-indigo-900/50 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Lançar Medição</span>
          </button>
          
          <button
            id="btn-add-kpi"
            onClick={() => setShowAddKpiModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Indicador</span>
          </button>
        </div>
      </div>

      {/* Grid Central */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Lista de KPIs e Filtros */}
        <div className="xl:col-span-1 space-y-4">
          
          {/* Caixa de Filtros */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Filtrar por Área / Setor
            </label>
            <div className="flex flex-wrap gap-1.5">
              {uniqueSectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => setFilterSector(sector)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterSector === sector
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Cards de KPI */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredKpis.map((kpi) => {
                const stats = getKpiStats(kpi);
                const status = checkConformity(kpi);
                const isSelected = selectedKpiId === kpi.id;

                return (
                  <motion.div
                    key={kpi.id}
                    layoutId={`kpi-card-${kpi.id}`}
                    onClick={() => handleSelectKpi(kpi.id)}
                    className={`p-4 rounded-xl shadow-xs border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-900 dark:border-indigo-500/50'
                        : 'bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Indicador visual de seleção lateral */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          isSelected 
                            ? 'bg-white/10 text-slate-300' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {kpi.setor} — {kpi.frequencia}
                        </span>
                        
                        {/* Ações Rápidas com stopPropagation */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingKpi(kpi);
                              setNewKpi({
                                nome: kpi.nome,
                                setor: kpi.setor,
                                unidade: kpi.unidade,
                                meta: kpi.meta,
                                direcaoMeta: kpi.direcaoMeta,
                                frequencia: kpi.frequencia,
                                requisitoISO: kpi.requisitoISO,
                                descricao: kpi.descricao,
                                formula: kpi.formula,
                                responsavel: kpi.responsavel
                              });
                              setShowAddKpiModal(true);
                            }}
                            className={`p-1 rounded transition-colors ${
                              isSelected
                                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title="Editar Indicador"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          {status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-black leading-snug line-clamp-2">
                        {kpi.nome}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/10 dark:border-slate-800/80 flex items-end justify-between">
                      <div>
                        <p className={`text-[9px] font-bold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>Último Valor</p>
                        <p className="text-lg font-black font-mono tracking-tight flex items-baseline">
                          {stats.current}
                          <span className="text-xs font-bold ml-0.5 text-slate-400">{kpi.unidade}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400">Meta do KPI</p>
                        <p className={`text-xs font-bold font-mono ${
                          isSelected ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {kpi.direcaoMeta === 'maior' ? '≥' : '≤'} {kpi.meta}{kpi.unidade}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredKpis.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Nenhum indicador encontrado.</p>
                <p className="text-[10px] text-slate-400">Altere o filtro acima ou crie um novo KPI.</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Análise do KPI Selecionado */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Painel Gráfico e Detalhado */}
          {activeKpi && (
            <div id="kpi-focus-panel" className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
              
              {/* Cabeçalho do KPI em Foco */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">
                      {activeKpi.requisitoISO}
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono">
                      Resp: {activeKpi.responsavel.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                    {activeKpi.nome}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {activeKpi.descricao}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end gap-3 sm:gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingKpi(activeKpi);
                        setNewKpi({
                          nome: activeKpi.nome,
                          setor: activeKpi.setor,
                          unidade: activeKpi.unidade,
                          meta: activeKpi.meta,
                          direcaoMeta: activeKpi.direcaoMeta,
                          frequencia: activeKpi.frequencia,
                          requisitoISO: activeKpi.requisitoISO,
                          descricao: activeKpi.descricao,
                          formula: activeKpi.formula,
                          responsavel: activeKpi.responsavel
                        });
                        setShowAddKpiModal(true);
                      }}
                      className="p-2 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-slate-400 rounded-lg transition-colors cursor-pointer"
                      title="Editar Metadados do Indicador"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => setKpiToDelete(activeKpi)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-slate-400 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Indicador"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono flex items-center gap-1 border ${
                      checkConformity(activeKpi) === 'success'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 animate-pulse'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${checkConformity(activeKpi) === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {checkConformity(activeKpi) === 'success' ? 'Em Conformidade' : 'Fora da Meta'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estatísticas Rápidas do KPI */}
              {(() => {
                const stats = getKpiStats(activeKpi);
                const isSuccess = checkConformity(activeKpi) === 'success';
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/10 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Meta do Processo</p>
                      <p className="text-base font-black font-mono text-slate-700 dark:text-slate-200 mt-0.5">
                        {activeKpi.direcaoMeta === 'maior' ? '≥' : '≤'} {activeKpi.meta}
                        <span className="text-xs font-bold text-slate-400 ml-0.5">{activeKpi.unidade}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Real Atual (Julho)</p>
                      <p className={`text-base font-black font-mono mt-0.5 ${
                        isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {stats.current}
                        <span className="text-xs font-bold text-slate-400 ml-0.5">{activeKpi.unidade}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Médio do Ano</p>
                      <p className="text-base font-black font-mono text-slate-700 dark:text-slate-200 mt-0.5">
                        {stats.avg.toFixed(1)}
                        <span className="text-xs font-bold text-slate-400 ml-0.5">{activeKpi.unidade}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Extremos (Mín / Máx)</p>
                      <p className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400 mt-1">
                        {stats.min}{activeKpi.unidade} — {stats.max}{activeKpi.unidade}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Gráfico Recharts de Evolução Histórica */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-mono">
                    Evolução Histórica das Medições
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400">Frequência: {activeKpi.frequencia}</span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeKpi.historico} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorKpi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                        axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                        axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                        tickLine={false}
                        tickFormatter={(v) => `${v}${activeKpi.unidade}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid #334155', 
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }} 
                      />
                      <ReferenceLine 
                        y={activeKpi.meta} 
                        stroke="#ef4444" 
                        strokeDasharray="4 4" 
                        label={{ 
                          value: `Meta: ${activeKpi.meta}${activeKpi.unidade}`, 
                          position: 'insideBottomRight', 
                          fill: '#ef4444', 
                          fontSize: 10, 
                          fontWeight: 'bold' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#4f46e5" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorKpi)" 
                        name="Medição do Mês" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ficha Técnica Detalhada do KPI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <span>Fórmula de Cálculo</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 break-words">
                      {activeKpi.formula}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Award className="w-4 h-4 text-indigo-500" />
                    <span>Ficha de Controle ISO</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-400">Gestor</span>
                      <span className="text-slate-700 dark:text-slate-200">{activeKpi.responsavel}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-400">Frequência</span>
                      <span className="text-slate-700 dark:text-slate-200">{activeKpi.frequencia}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gerenciamento de Apontamentos Lançados */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <span>Gerenciar Apontamentos Lançados (Medições do Histórico)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Total: {activeKpi.historico?.length || 0} lançamentos</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-850/25 rounded-xl border border-slate-150 dark:border-slate-800/60 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800">
                        <th className="p-2.5 font-bold text-slate-500 dark:text-slate-400">Mês/Período</th>
                        <th className="p-2.5 font-bold text-slate-500 dark:text-slate-400">Valor Apontado</th>
                        <th className="p-2.5 font-bold text-slate-500 dark:text-slate-400 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {activeKpi.historico?.map((h, idx) => {
                        const isEditing = editingHistIndex === idx;
                        return (
                          <tr key={idx} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                            <td className="p-2.5 font-mono">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingHistMes}
                                  onChange={(e) => setEditingHistMes(e.target.value)}
                                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-16 text-slate-800 dark:text-slate-100 focus:outline-hidden font-bold"
                                />
                              ) : (
                                <span className="font-bold text-slate-700 dark:text-slate-250">{h.mes}</span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono">
                              {isEditing ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    step="any"
                                    value={editingHistValue}
                                    onChange={(e) => setEditingHistValue(e.target.value)}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-20 text-slate-800 dark:text-slate-100 focus:outline-hidden font-bold"
                                  />
                                  <span className="text-slate-400 font-sans">{activeKpi.unidade}</span>
                                </div>
                              ) : (
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                  {h.valor} {activeKpi.unidade}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-right space-x-1">
                              {isEditing ? (
                                <div className="inline-flex space-x-1">
                                  <button
                                    onClick={() => handleSaveEditHistory(idx)}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingHistIndex(null)}
                                    className="px-2 py-0.5 bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingHistIndex(idx);
                                      setEditingHistMes(h.mes);
                                      setEditingHistValue(String(h.valor));
                                    }}
                                    className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold inline-flex items-center gap-0.5"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHistory(idx)}
                                    className="px-2 py-0.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded text-[10px] font-bold inline-flex items-center gap-0.5"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {!activeKpi.historico || activeKpi.historico.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-slate-400">
                            Nenhum apontamento lançado para este indicador.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Painel de Análises Críticas da Direção (ISO 9.3) */}
          <div id="analise-critica-kpis" className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Análises Críticas do Desempenho (Clause 9.3)
                </h4>
                <p className="text-xs text-slate-400">Avaliações consolidadas pelo comitê de qualidade e gerência</p>
              </div>

              <button
                id="btn-add-critica"
                onClick={() => {
                  setNewCritica({
                    indicadorId: selectedKpiId || indicadores[0]?.id || '',
                    conclusao: '',
                    statusAcao: 'Sob Controle',
                    linkPlanoId: ''
                  });
                  setShowAddCriticaModal(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-200/50 dark:border-indigo-900/50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Análise</span>
              </button>
            </div>

            <div className="space-y-3">
              {analises.map((critica) => (
                <div 
                  key={critica.id}
                  className="p-4 bg-slate-50/50 dark:bg-slate-800/10 rounded-xl border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">{critica.indicadorNome}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{critica.data}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      "{critica.conclusao}"
                    </p>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold">
                      <span>Analisado por:</span>
                      <span className="text-slate-600 dark:text-slate-300">{critica.avaliador}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 self-start sm:self-center">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider font-mono ${
                        critica.statusAcao === 'Sob Controle'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                          : 'bg-red-50 text-red-600 dark:bg-red-950/20 animate-pulse'
                      }`}>
                        {critica.statusAcao}
                      </span>
                      <button
                        onClick={() => handleDeleteCritica(critica.id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Excluir parecer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {critica.linkPlanoId && (
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded-sm font-mono">
                        Ref: {critica.linkPlanoId}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {analises.length === 0 && (
                <div className="p-6 text-center text-slate-400">
                  <p className="text-xs font-bold text-slate-500">Sem avaliações críticas lançadas para este período.</p>
                </div>
              )}
            </div>
          </div>

          {/* Radar Chart de Visão Consolidada de Metas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gráfico de Radar de Metas */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <h5 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-mono">
                  Radar Geral de Aderência às Metas
                </h5>
                <p className="text-[10px] text-slate-400">Aproximação em % em relação às metas vigentes (100% = meta atingida)</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(148, 163, 184, 0.15)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 120]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                    <Radar name="Performance" dataKey="Aderência à Meta (%)" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '10px'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Informação e Guia ISO 9001 */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 dark:from-slate-900 dark:to-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>ISO 9001:2015 Clause 9.1</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  A organização deve monitorar e medir o desempenho e eficácia do Sistema de Gestão da Qualidade (SGQ). 
                  Os indicadores de qualidade devem estar alinhados aos <strong>Objetivos da Qualidade</strong> da Alta Direção e servir 
                  como base de dados fundamentais para a tomada de decisões corporativas com base em fatos e evidências reais.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 font-mono space-y-1">
                <p className="font-extrabold text-indigo-500">Fluxograma de Tratativas:</p>
                <p className="flex items-center gap-1">
                  <span>KPI Abaixo da Meta</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-red-500 font-bold">Instabilidade</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-indigo-400 font-bold">Abrir RNC / Plano 5W2H</span>
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL: NOVO INDICADOR */}
      {showAddKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-indigo-500" />
                {editingKpi ? 'Editar Indicador da Qualidade (KPI)' : 'Cadastrar Novo Indicador da Qualidade (KPI)'}
              </h3>
              <button 
                onClick={() => setShowAddKpiModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddKpi} className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500">Nome do Indicador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Eficiência Produtiva, Índice de Desperdício..."
                  value={newKpi.nome}
                  onChange={(e) => setNewKpi({ ...newKpi, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Setor Responsável</label>
                  <select
                    value={newKpi.setor}
                    onChange={(e) => setNewKpi({ ...newKpi, setor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="Tecelagem">Tecelagem</option>
                    <option value="Costura">Costura</option>
                    <option value="Qualidade">Qualidade</option>
                    <option value="Corte">Corte</option>
                    <option value="Tinturaria">Tinturaria</option>
                    <option value="Geral">Geral</option>
                    <option value="Suprimentos">Suprimentos</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Requisito ISO Regulador</label>
                  <input
                    type="text"
                    placeholder="Ex: 8.5.1, 7.2, 9.1..."
                    value={newKpi.requisitoISO}
                    onChange={(e) => setNewKpi({ ...newKpi, requisitoISO: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Unidade de Medida</label>
                  <select
                    value={newKpi.unidade}
                    onChange={(e) => setNewKpi({ ...newKpi, unidade: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="%">% (Percentual)</option>
                    <option value="Pontos">Pontos</option>
                    <option value="Horas">Horas</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Meta Numérica *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 85, 2.5..."
                    value={newKpi.meta || ''}
                    onChange={(e) => setNewKpi({ ...newKpi, meta: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Direcionamento Meta</label>
                  <select
                    value={newKpi.direcaoMeta}
                    onChange={(e) => setNewKpi({ ...newKpi, direcaoMeta: e.target.value as 'maior' | 'menor' })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="maior">Maior é Melhor (≥)</option>
                    <option value="menor">Menor é Melhor (≤)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Fórmula de Cálculo</label>
                  <input
                    type="text"
                    placeholder="Ex: (Total Aprovado / Total Produzido) * 100"
                    value={newKpi.formula}
                    onChange={(e) => setNewKpi({ ...newKpi, formula: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Gestor Responsável</label>
                  <input
                    type="text"
                    placeholder="Nome do Gestor do Processo"
                    value={newKpi.responsavel}
                    onChange={(e) => setNewKpi({ ...newKpi, responsavel: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500">Descrição / Objetivo do KPI</label>
                <textarea
                  rows={2}
                  placeholder="Escreva brevemente o objetivo estratégico e a forma de monitoramento..."
                  value={newKpi.descricao}
                  onChange={(e) => setNewKpi({ ...newKpi, descricao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddKpiModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  {editingKpi ? 'Salvar Alterações' : 'Salvar Indicador'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: LANÇAR MEDIÇÃO */}
      {showAddMeasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                Lançar Nova Medição
              </h3>
              <button 
                onClick={() => setShowAddMeasureModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddMeasure} className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">KPI Alvo</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{activeKpi?.nome}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Mês / Período</label>
                  <select
                    value={newMeasure.mes}
                    onChange={(e) => setNewMeasure({ ...newMeasure, mes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="Jan">Jan</option>
                    <option value="Fev">Fev</option>
                    <option value="Mar">Mar</option>
                    <option value="Abr">Abr</option>
                    <option value="Mai">Mai</option>
                    <option value="Jun">Jun</option>
                    <option value="Jul">Jul</option>
                    <option value="Ago">Ago</option>
                    <option value="Set">Set</option>
                    <option value="Out">Out</option>
                    <option value="Nov">Nov</option>
                    <option value="Dez">Dez</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Valor Obtido ({activeKpi?.unidade}) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 87.5"
                    value={newMeasure.valor}
                    onChange={(e) => setNewMeasure({ ...newMeasure, valor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMeasureModal(false)}
                  className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Registrar Medição
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA ANÁLISE CRÍTICA (ISO 9.3) */}
      {showAddCriticaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-500" />
                Registrar Análise Crítica da Direção (ISO 9.3)
              </h3>
              <button 
                onClick={() => setShowAddCriticaModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddCritica} className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500">Indicador Alvo *</label>
                <select
                  value={newCritica.indicadorId || (indicadores.length > 0 ? indicadores[0].id : '')}
                  onChange={(e) => setNewCritica({ ...newCritica, indicadorId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  {indicadores.map((kpi) => (
                    <option key={kpi.id} value={kpi.id}>{kpi.nome} ({kpi.setor})</option>
                  ))}
                  {indicadores.length === 0 && (
                    <option value="kpi-geral">Indicador Geral SGQ</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Status da Avaliação</label>
                  <select
                    value={newCritica.statusAcao}
                    onChange={(e) => setNewCritica({ ...newCritica, statusAcao: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="Sob Controle">Sob Controle (Meta Batida / Estável)</option>
                    <option value="Necessita Ação">Necessita Ação (Fora da Meta / Investigar)</option>
                    <option value="Plano Aberto">Plano Aberto (Tratativa já Iniciada)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500">Referência do Plano 5W2H (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: PLA-2026-005"
                    value={newCritica.linkPlanoId}
                    onChange={(e) => setNewCritica({ ...newCritica, linkPlanoId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500">Parecer Técnico / Decisão da Direção *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva as considerações do comitê quanto ao desempenho do KPI no período..."
                  value={newCritica.conclusao}
                  onChange={(e) => setNewCritica({ ...newCritica, conclusao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCriticaModal(false)}
                  className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Registrar Parecer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE INDICADOR */}
      {kpiToDelete && (
        <div id="delete-kpi-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Remover Indicador da Qualidade?
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tem certeza que deseja remover o indicador <strong className="text-slate-800 dark:text-slate-200">"{kpiToDelete.nome}"</strong>? 
              Esta ação irá apagar definitivamente todo o histórico de medições associado e não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setKpiToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteKpi(kpiToDelete.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
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
