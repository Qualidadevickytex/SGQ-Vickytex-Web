/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseRepository } from './base.repository';

export interface CriticalAnalysisDocument {
  id: string;
  data: string;
  indicadorId: string;
  indicadorNome: string;
  avaliador: string;
  conclusao: string;
  statusAcao: 'Sob Controle' | 'Plano Criado' | 'Em Análise' | 'Necessita Ação';
  linkPlanoId?: string;
}

class CriticalAnalysesRepositoryClass extends BaseRepository<CriticalAnalysisDocument> {
  protected collectionName = 'critical_analyses';

  protected getLocalData(): CriticalAnalysisDocument[] {
    try {
      const saved = localStorage.getItem('sgq_vickytex_critical_analyses');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  }

  protected saveLocalData(data: CriticalAnalysisDocument[]): void {
    try {
      localStorage.setItem('sgq_vickytex_critical_analyses', JSON.stringify(data));
    } catch (e) {}
  }

  protected mapRecord(rec: any): CriticalAnalysisDocument {
    return {
      id: rec.id,
      data: rec.data || new Date().toISOString().split('T')[0],
      indicadorId: rec.indicadorId || rec.indicador_id || '',
      indicadorNome: rec.indicadorNome || rec.indicador_nome || '',
      avaliador: rec.avaliador || 'Gestor de Qualidade',
      conclusao: rec.conclusao || '',
      statusAcao: rec.statusAcao || rec.status_acao || 'Sob Controle',
      linkPlanoId: rec.linkPlanoId || rec.link_plano_id || undefined
    };
  }

  protected mapToPayload(data: Partial<CriticalAnalysisDocument>): any {
    return {
      data: data.data,
      indicadorId: data.indicadorId,
      indicadorNome: data.indicadorNome,
      avaliador: data.avaliador,
      conclusao: data.conclusao,
      statusAcao: data.statusAcao,
      linkPlanoId: data.linkPlanoId || null
    };
  }

  protected getSearchFilter(query: string): string {
    return `indicadorNome ~ "${query}" || conclusao ~ "${query}"`;
  }

  protected localSearchMatch(item: CriticalAnalysisDocument, query: string): boolean {
    return (
      item.indicadorNome.toLowerCase().includes(query.toLowerCase()) ||
      item.conclusao.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const CriticalAnalysesRepository = new CriticalAnalysesRepositoryClass();
export default CriticalAnalysesRepository;
