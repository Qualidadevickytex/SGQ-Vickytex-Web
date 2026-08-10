/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export interface Setor5S {
  id: string;
  nome: string;
  ativo: boolean;
  ordemRanking: number;
}

export interface Senso5S {
  id: string; // S1, S2, S3, S4, S5
  codigo: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
}

export interface Requisito5S {
  id: string;
  codigo: string; // e.g. S1.1
  nome: string;
  descricao: string;
  sensoId: string; // S1, S2, etc.
  ativo: boolean;
  ordem: number;
  setoresAplicaveis: string[]; // Setor IDs or ['TODOS']
  observacoes?: string;
}

export interface Classificacao5S {
  id: string;
  min: number;
  max: number;
  nome: string;
  cor: string;
  icone: string;
}

export interface Configuracao5S {
  pontosAtendeTotalmente: number;
  pontosAtendeParcialmente: number;
  pontosNaoAtende: number;
  penalidadeReincidenciaParcial: number;
  penalidadeReincidenciaNaoAtende: number;
  trofeuQtdVencedores: number;
  trofeuCriterios: string[];
  trofeuCriteriosDesempate: string[];
  trofeuPeriodicidade: string;
  trofeuNomePremio: string;
  trofeuImagemUrl: string;
  trofeuTextoCertificado: string;
}

export interface CicloAuditoria {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
}

export interface ItemAuditado {
  id: string;
  auditoriaId: string;
  requisitoId: string;
  avaliacao: 'Atende Totalmente' | 'Atende Parcialmente' | 'Não Atende' | 'Não Aplicável';
  pontos: number;
  observacoes: string;
  planoAcaoId?: string;
  reincidenciaCount: number;
  penalidadeAplicada: number;
}

export interface Fotografia5S {
  id: string;
  itemAuditadoId: string;
  requisitoId: string;
  auditoriaId: string;
  url: string;
  legenda: string;
  data: string;
  usuario: string;
  observacoes?: string;
}

export interface PlanoAcao5S {
  id: string;
  auditoriaId: string;
  requisitoId: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Atrasado';
  dataConclusao?: string;
  fotosCorrecao: string[];
  comentarios: string[];
  historico: {
    data: string;
    usuario: string;
    acao: string;
    detalhes: string;
  }[];
}

export interface Auditoria5S {
  id: string;
  codigo: string; // Ex: AUD5S-COR-001
  setor: SectorType; // Nome do setor, p. ex. 'Corte'
  auditor: string;
  dataAuditoria: string; // data ISO
  seiri: number; // score percentual (0-100)
  seiton: number; // score percentual (0-100)
  seiso: number; // score percentual (0-100)
  seiketsu: number; // score percentual (0-100)
  shitsuke: number; // score percentual (0-100)
  mediaGeral: number; // score percentual (0-100)
  observacoes: string;
  status: 'Rascunho' | 'Finalizada';
  planoAcaoId?: string; // Link para Plano de Ação se houver algum item com NC
  fotos?: string[]; // Mantido para compatibilidade (lista de URLs/base64)
  linkDrive?: string;

  // Rich extensions para o novo modelo
  setorId?: string;
  cicloId?: string;
  pontuacaoMaxima?: number;
  pontuacaoObtida?: number;
  totalPenalidades?: number;
  indiceConformidade?: number; // 0 a 100
  classificacaoId?: string;
}

export type FiveS = Auditoria5S;
