/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export interface ItemAcao5W2H {
  id: string;
  itemNumero?: number; // 1, 2, 3...
  titulo?: string;
  oQue: string;        // What (O quê?)
  porQue?: string;     // Why (Por quê?)
  onde?: string;       // Where (Onde?)
  quando: string;      // When (Prazo / Data)
  quem: string;        // Who (Responsável)
  como?: string;       // How (Como?)
  quantoCusta: number; // How Much (Custo estimado R$)
  status: 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada';
  observacoes?: string;
  concluidoEm?: string;
}

export interface PlanoAcao {
  id: string;
  codigo: string; // Ex: PA-2026-001
  titulo: string; // Título da Capa do Plano de Ação
  setor: SectorType;
  status: 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelada';
  dataCriacao: string;
  
  // Metadados da Capa (Nível Macro)
  coordenador?: string; // Líder / Coordenador geral do Plano
  objetivo?: string;    // Objetivo / Avaliação de Eficácia do Plano
  prazoGeral?: string;  // Prazo Limite Consolidado

  // Lista de Ações 5W2H (Nível Micro / Filhas)
  acoes?: ItemAcao5W2H[];

  // Campos 5W2H no nível raiz (mantidos para compatibilidade direta com planos existentes)
  oQue?: string;       // What
  porQue?: string;     // Why
  onde?: string;       // Where
  quando?: string;     // When (Date string/deadline)
  quem?: string;       // Who (Responsible)
  como?: string;       // How
  quantoCusta?: number; // How Much (Value)

  // Integrations
  documentoId?: string;
  auditoriaId?: string;
  naoConformidadeId?: string;
}

// Alias solicitado
export type ActionPlan = PlanoAcao;
