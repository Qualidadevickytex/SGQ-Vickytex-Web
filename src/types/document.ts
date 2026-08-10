/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export type DocumentType = 'POP' | 'FOR' | 'IT' | 'MAN' | 'LIST';

export type DocumentStatus = 
  | 'Rascunho'
  | 'Elaboração'
  | 'Revisão Técnica'
  | 'Aprovação'
  | 'Publicação'
  | 'Distribuição'
  | 'Aceite'
  | 'Nova Revisão'
  | 'Obsoleto'
  | 'Em Elaboração'
  | 'Em Revisão'
  | 'Em Aprovação'
  | 'Homologado';

export interface DocumentLog {
  id: string;
  documentoId: string;
  usuario: string; // nome do usuário
  acao: string;
  detalhes: string;
  data: string;
  ip?: string;
  dispositivo?: string;
  navegador?: string;
}

export interface ApprovalFlowStep {
  id: string;
  etapaNumero: number;
  perfilResponsavel: string; // ex: 'Supervisor', 'Qualidade', 'Gestor', 'Administrador'
  usuarioEspecifico?: string; // e-mail opcional
  descricao: string;
  statusAlvo: DocumentStatus;
  statusSeRejeitado: DocumentStatus;
}

export interface ApprovalFlow {
  id: string;
  tipoDocumento: DocumentType;
  nome: string;
  etapas: ApprovalFlowStep[];
}

export interface DocumentRevision {
  id: string;
  documentoId: string;
  revisaoNumero: number;
  dataRevisao: string;
  motivo: string;
  elaborador: string;
  revisor: string;
  aprovador: string;
  googleDriveId: string; // Retrocompatibilidade
  googleDriveLink?: string; // Retrocompatibilidade
  status: DocumentStatus;
  assinaturaElaborador?: string;
  dataElaboracao?: string;
  assinaturaRevisor?: string;
  dataRevisaoTecnica?: string;
  assinaturaAprovador?: string;
  dataAprovacao?: string;
  // Campos do modelo em 3 camadas
  versaoFormatada?: string; // ex: Rev.01
  criadoPor?: string;
  criadoEm?: string;
  arquivo?: DocumentFile; // Arquivo físico associado
}

export interface DocumentFile {
  id: string;
  revisaoId: string; // Relacionamento com a revisão correspondente
  driveFileId: string;
  driveUrl: string;
  sha256?: string;
  arquivoTamanho?: number; // em bytes
  mimeType?: string; // ex: application/pdf
  ativo: boolean;
  criadoPor: string;
  criadoEm: string;
}

export interface CopiaDistribuida {
  id: string;
  destinatario: string; // ex: "Tear Circular", "Qualidade", "Almoxarifado"
  tipo: 'Digital Controlada' | 'Física Impressa';
  quantidade: number;
  dataEntrega: string;
  status: 'Ativa' | 'Recolhida' | 'Substituída';
  recebidoPor: string;
  dataRecolhimento?: string;
  recolhidoPor?: string;
  aceiteStatus?: 'Pendente' | 'Aceito';
  dataAceite?: string;
  observacao?: string;
}

export interface Documento {
  id: string; // Geralmente o código único
  codigo: string;
  titulo: string;
  tipo: DocumentType;
  setor: SectorType;
  objetivo: string;
  descricao: string;
  status: DocumentStatus;
  revisao: number;
  periodicidade: number; // em meses
  dataEmissao: string;
  proximaRevisao: string;
  elaborador: string; // e-mail do autor
  revisor: string; // e-mail do revisor
  aprovador: string; // e-mail do aprovador
  googleDriveId: string; // Retrocompatibilidade
  googleDriveLink: string; // Retrocompatibilidade
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  revisoesHistorico?: DocumentRevision[];
  distribuicaoCopias?: CopiaDistribuida[];
  documentLogs?: DocumentLog[];
  documentReadings?: DocumentReading[];
  fluxoCustomId?: string;
  assinaturaElaborador?: string;
  dataElaboracao?: string;
  assinaturaRevisor?: string;
  dataRevisao?: string;
  assinaturaAprovador?: string;
  dataAprovacao?: string;
  feedbackAjuste?: string;
}

export interface DocumentReading {
  id: string;
  documentoId: string;
  usuario: string;
  dataLeitura: string;
  assinaturaEletronica: string;
  logGerado?: string;
}

// Alias solicitado
export type Document = Documento;
