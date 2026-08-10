/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Exportando os modulares solicitados na Sprint 1
export * from './role';
export * from './department';
export * from './user';
export * from './document';
export * from './notification';

// Novos modulares estruturados
export * from './audit';
export * from './actionPlan';
export * from './training';
export * from './indicator';
export * from './fiveS';
export * from './supplier';
export * from './ceo';

// Importações internas para manter compatibilidade retroativa
import { SectorType } from './department';
import { UserRole } from './role';

export interface ActivityLog {
  id: string;
  usuarioEmail: string;
  usuarioNome: string;
  usuarioRole: UserRole;
  acao: string;
  detalhes: string;
  timestamp: string;
  documentoId?: string;
}

export interface AppConfig {
  empresa: string;
  versao: string;
  isoNorma: string;
}

export interface Calibracao {
  id: string;
  equipamentoId: string;
  dataCalibracao: string;
  proximaCalibracao: string;
  laboratorio: string;
  numeroCertificado: string;
  resultado: 'Aprovado' | 'Aprovado com Restrição' | 'Reprovado';
  erroMaximoDetectado: string;
  incerteza: string;
  status: 'Vigente' | 'Vencida';
}

export interface Equipamento {
  id: string;
  tag: string;
  nome: string;
  fabricante: string;
  modelo: string;
  numeroSerie: string;
  setor: SectorType;
  frequenciaCalibracao: number; // em meses
  dataAquisicao: string;
  status: 'Calibrado' | 'Calibração Pendente' | 'Fora de Uso';
  calibracoes: Calibracao[];
}

export interface RiscoOportunidade {
  id: string;
  codigo: string; // Ex: RS-COR-001, OP-COS-002
  titulo: string;
  tipo: 'Risco' | 'Oportunidade';
  setor: SectorType;
  descricao: string;
  probabilidade: number; // 1 a 5
  impacto: number; // 1 a 5
  nivelExposicao: number; // probabilidade * impacto
  estrategia: 'Mitigar' | 'Evitar' | 'Aceitar' | 'Transferir' | 'Explorar' | 'Melhorar';
  planoAcaoId?: string; // Link para PlanoAcao
  status: 'Identificado' | 'Em Tratamento' | 'Controlado' | 'Inativo';
  dataIdentificacao: string;
  responsavel: string;
  categoria?: string;
}

export interface RolePermission {
  role: UserRole;
  allowedSections: ('dashboard' | 'documentos' | 'auditorias' | 'riscos' | '5s' | 'treinamentos' | 'calibracao' | 'planos' | 'configuracoes' | 'usuarios' | 'integracao' | 'database' | 'registros' | 'fornecedores' | 'indicadores' | 'ceo')[];
}

export interface Registro {
  id: string;
  codigo: string;
  titulo: string;
  documentoOrigemId?: string; // Link para o Formulário/Lista de origem (e.g., FOR-COS-001)
  setor: SectorType;
  tipoMidia: 'Físico' | 'Digital' | 'Misto';
  localArmazenamento: string;
  tempoRetencaoAnos: number;
  disposicaoFinal: 'Descarte' | 'Reciclagem' | 'Digitalização e Descarte' | 'Histórico Permanente';
  responsavelPreenchimento: string;
  responsavelGuarda: string;
  indexacaoMetodo: string;
  statusControle: 'Ativo' | 'Arquivado' | 'Descartado';
  dataUltimaVerificacao?: string;
  observacoes?: string;
  googleDriveId?: string;
  googleDriveLink?: string;
}
