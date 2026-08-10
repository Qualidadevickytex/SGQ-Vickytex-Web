/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export interface PlanoAcao {
  id: string;
  codigo: string; // Ex: PA-001
  titulo: string;
  setor: SectorType;
  status: 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada';
  dataCriacao: string;
  
  // 5W2H fields
  oQue: string;       // What
  porQue: string;     // Why
  onde: string;       // Where
  quando: string;     // When (Date string/deadline)
  quem: string;       // Who (Responsible)
  como: string;       // How
  quantoCusta: number; // How Much (Value)

  // Integrations
  documentoId?: string;
  auditoriaId?: string;
  naoConformidadeId?: string;
}

// Alias solicitado
export type ActionPlan = PlanoAcao;
