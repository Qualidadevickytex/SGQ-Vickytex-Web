/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export interface Auditoria {
  id: string;
  codigo: string;
  titulo: string;
  dataPlanejada: string;
  setor: SectorType;
  auditor: string;
  status: 'Agendada' | 'Em Andamento' | 'Realizada' | 'Cancelada';
}

export interface NaoConformidade {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  dataAbertura: string;
  setor: SectorType;
  responsavel: string;
  status: 'Aberta' | 'Em Análise' | 'Em Execução' | 'Fechada' | 'Eficaz';
  documentoRelacionadoId?: string;
  origem?: string;
}

// Alias solicitado
export type Audit = Auditoria;
