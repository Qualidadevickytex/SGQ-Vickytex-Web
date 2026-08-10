/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndicadorDesempenho } from '../../../types/indicator';
import { BaseRepository } from './base.repository';

class IndicatorRepositoryClass extends BaseRepository<IndicadorDesempenho> {
  protected collectionName = 'indicators';

  protected getLocalData(): IndicadorDesempenho[] {
    const saved = localStorage.getItem('sgq_vickytex_indicators');
    if (saved) return JSON.parse(saved);
    return [];
  }

  protected saveLocalData(data: IndicadorDesempenho[]): void {
    localStorage.setItem('sgq_vickytex_indicators', JSON.stringify(data));
  }

  protected mapRecord(rec: any): IndicadorDesempenho {
    return {
      id: rec.id,
      codigo: rec.codigo || `IND-${rec.id}`,
      nome: rec.nome || '',
      setor: rec.setor || rec.sector || 'Geral',
      meta: rec.meta || 0,
      unidade: rec.unidade || '%',
      frequenciaMensuracao: rec.frequenciaMensuracao || rec.frequencia || 'Mensal',
      valoresMensais: rec.valoresMensais || {},
      responsavel: rec.responsavel || ''
    };
  }

  protected mapToPayload(data: Partial<IndicadorDesempenho>): any {
    return {
      codigo: data.codigo,
      nome: data.nome,
      setor: data.setor,
      meta: data.meta,
      unidade: data.unidade,
      frequencia: data.frequenciaMensuracao,
      responsavel: data.responsavel
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || nome ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: IndicadorDesempenho, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.nome.toLowerCase().includes(query) ||
      item.setor.toLowerCase().includes(query)
    );
  }
}

export const IndicatorRepository = new IndicatorRepositoryClass();
export default IndicatorRepository;
