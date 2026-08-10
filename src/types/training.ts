/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export interface Treinamento {
  id: string;
  codigo: string;
  documentoId: string;
  titulo: string;
  dataTreinamento: string;
  instrutor: string;
  setor: SectorType;
  duracaoHoras: number;
  participantes: string[];
  status: 'Planejado' | 'Realizado' | 'Cancelado';
}

export interface ColaboradorCompetencia {
  id: string;
  nome: string;
  cargo: string;
  setor: SectorType;
  documentosAssinados: string[];
  status: 'Apto' | 'Em Treinamento' | 'Pendente';
}

// Alias solicitado
export type Training = Treinamento;
