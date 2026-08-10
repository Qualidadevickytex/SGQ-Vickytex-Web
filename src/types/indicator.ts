/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorType } from './department';

export interface IndicadorDesempenho {
  id: string;
  codigo: string;
  nome: string;
  setor: SectorType;
  meta: number; // ex: 95 (%)
  unidade: string; // ex: "%", "Pcs", "Dias"
  frequenciaMensuracao: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  valoresMensais: { [mesAno: string]: number }; // ex: { "2026-01": 96.5, "2026-02": 94.2 }
  responsavel: string;
}

// Alias solicitado
export type Indicator = IndicadorDesempenho;
