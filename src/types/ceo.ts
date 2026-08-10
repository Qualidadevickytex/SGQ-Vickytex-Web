/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export type MetodologiaCEO = 
  | 'PDCA' 
  | 'DMAIC' 
  | 'Kaizen' 
  | 'A3' 
  | 'Projeto Lean' 
  | 'Projeto Estratégico' 
  | 'Projeto Personalizado';

export type StatusProjetoCEO = 'Planejado' | 'Em Execução' | 'Suspenso' | 'Concluído' | 'Cancelado';

export type StatusSugestaoCEO = 'Submetida' | 'Em Análise' | 'Aprovada' | 'Em Implantação' | 'Concluída' | 'Rejeitada';

export interface MembroEquipe {
  nome: string;
  email: string;
  funcao: string;
}

export interface SipocData {
  fornecedores: string;
  entradas: string;
  processo: string[]; // Passos do processo principais
  saidas: string;
  clientes: string;
}

export interface VocItem {
  id: string;
  cliente: string;
  feedback: string;
  necessidade: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
}

export interface BrainstormingIdea {
  id: string;
  ideia: string;
  categoria: string;
  impacto: number; // 1 a 5
  esforco: number; // 1 a 5
  pick: 'Possible' | 'Implement' | 'Challenge' | 'Kill'; // Calculado
  status: 'Nova' | 'Aprovada' | 'Rejeitada';
}

export interface GutItem {
  id: string;
  problema: string;
  G: number; // Gravidade 1 a 5
  U: number; // Urgência 1 a 5
  T: number; // Tendência 1 a 5
  total: number; // G * U * T
  acao: string;
}

export interface SwotData {
  forcas: string[];
  fraquezas: string[];
  oportunidades: string[];
  ameacas: string[];
}

export interface FiveWhysItem {
  id: string;
  problema: string;
  porques: string[]; // N porquês
  causaRaiz: string;
  acaoProposta: string;
}

export interface ParetoCauseItem {
  id: string;
  causa: string;
  ocorrencias: number;
}

export interface IshikawaData {
  efeito: string;
  metodo: string[];
  materiaPrima: string[];
  maoDeObra: string[];
  maquina: string[];
  medicao: string[];
  meioAmbiente: string[];
}

export interface FluxoStep {
  id: string;
  titulo: string;
  tipo: 'Inicio' | 'Processo' | 'Decisao' | 'Fim';
  nextId?: string;
  nextIdNo?: string; // Caminho "Não" ou alternativa
  labelSim?: string; // Nome personalizado para caminho principal (ex: "Sim")
  labelNao?: string; // Nome personalizado para desvio (ex: "Não")
  responsavel?: string;
}

export interface CronogramaTask {
  id: string;
  tarefa: string;
  etapa: string; // Ex: Plan, Do, Define, etc.
  responsavel: string;
  dataInicio: string;
  dataFim: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluido';
}

export interface EvidenciaFile {
  id: string;
  nome: string;
  url: string;
  dataUpload: string;
  enviadoPor: string;
}

export interface EtapaMetodologia {
  nome: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluido';
  dataConclusao?: string;
  observacoes?: string;
}

export interface VsmStep {
  id: string;
  etapa: string;
  tempoCiclo: number; // em minutos
  tempoPreparacao: number; // em minutos
  disponibilidade: number; // em %
  estoqueFila: number; // unidades
  tempoFila: number; // em minutos (tempo de espera)
  agregaValor: boolean;
}

export interface DmaicPhase {
  fase: 'Define' | 'Measure' | 'Analyze' | 'Improve' | 'Control';
  descricao: string;
  concluida: boolean;
  entregaveis: string;
  metasMetricas?: string;
}

export interface FerramentasCEO {
  equipe: MembroEquipe[];
  sipoc: SipocData;
  voc: VocItem[];
  brainstorming: BrainstormingIdea[];
  gut: GutItem[];
  swot: SwotData;
  fiveWhys: FiveWhysItem[];
  pareto?: ParetoCauseItem[];
  ishikawa: IshikawaData;
  fluxograma: FluxoStep[];
  cronograma: CronogramaTask[];
  evidencias: EvidenciaFile[];
  etapas: EtapaMetodologia[];
  vsm?: {
    etapas: VsmStep[];
    tempoAgregaValor: number;
    tempoNaoAgregaValor: number;
    eficienciaCiclo: number;
  };
  dmaic?: {
    fases: DmaicPhase[];
  };
  encerramento?: {
    relatorioFinal: string;
    licoesAprendidas: string;
    roiValidado: boolean;
    dataFechamento: string;
  };
  approvals?: {
    opening?: { sponsor?: boolean; quality?: boolean; date?: string; signedBySponsor?: string; signedByQuality?: string };
    closure?: { sponsor?: boolean; quality?: boolean; date?: string; signedBySponsor?: string; signedByQuality?: string };
  };
  leadTime?: {
    before: number;
    after: number;
    unit: 'horas' | 'dias' | 'minutos';
  };
  planoAcaoId?: string;
  auditoriaId?: string;
  documentoSopId?: string;
  treinamentoHoras?: number;
}

export interface ProjetoCEO {
  id: string;
  codigo: string; // Ex: PROJ-CEO-2026-001
  titulo: string;
  descricao: string;
  setor: SectorType;
  lider: string; // Email do líder do projeto
  patrocinador: string; // Email ou nome do patrocinador
  status: StatusProjetoCEO;
  dataInicio: string; // ISO Date
  dataFimPlanejada: string; // ISO Date
  dataFimReal?: string; // ISO Date
  metodologia: MetodologiaCEO;
  investimento: number; // Valor gasto
  retornoEsperado: number; // Ganho financeiro esperado (anual)
  retornoReal?: number; // Ganho financeiro real obtido
  indicadoresImpactados: string[]; // IDs/Códigos de Indicadores
  acoesRealizadas: string[]; // Breve resumo das ações
  documentosVinculados?: string[]; // IDs de Documentos vinculados
  auditoriasVinculadas?: string[]; // IDs de Auditorias vinculadas
  ferramentas: FerramentasCEO; // JSON enriquecido para todas as ferramentas
  criadoPor: string; // Email do criador
  criadoEm: string; // ISO Date
  atualizadoEm: string; // ISO Date
}

export interface SugestaoCEO {
  id: string;
  codigo: string; // Ex: IDEIA-CEO-2026-001
  titulo: string;
  descricao: string;
  setor: SectorType;
  autor: string; // Email do autor
  dataSubmissao: string; // ISO Date
  status: StatusSugestaoCEO;
  avaliacaoComite?: string;
  notaImpacto?: number; // Escala 1 a 5
  notaFacilidade?: number; // Escala 1 a 5
  projetoId?: string; // ID do ProjetoCEO associado
  planoAcaoId?: string; // ID do Plano de Ação 5W2H associado
  criadoEm: string; // ISO Date
}

export interface CEOStats {
  totalProjetos: number;
  projetosAtivos: number;
  projetosConcluidos: number;
  investimentoTotal: number;
  retornoTotalReal: number;
  totalSugestoes: number;
  sugestoesAprovadas: number;
  sugestoesPendentes: number;
}
