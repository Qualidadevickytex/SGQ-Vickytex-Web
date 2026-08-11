/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlanoAcao } from '../../../types/actionPlan';
import { BaseRepository } from './base.repository';

class ActionPlanRepositoryClass extends BaseRepository<PlanoAcao> {
  protected collectionName = 'action_plans';

  protected getLocalData(): PlanoAcao[] {
    return [];
  }

  protected saveLocalData(_data: PlanoAcao[]): void {}

  protected mapRecord(rec: any): PlanoAcao {
    return {
      id: rec.id,
      codigo: rec.codigo || `PA-${rec.id}`,
      titulo: rec.titulo || '',
      setor: rec.setor || rec.sector || 'Geral',
      status: rec.status || 'Planejado',
      dataCriacao: rec.dataCriacao || rec.data_criacao || new Date().toISOString().split('T')[0],
      oQue: rec.oQue || rec.o_que || '',
      porQue: rec.porQue || rec.por_que || '',
      onde: rec.onde || '',
      quando: rec.quando || '',
      quem: rec.quem || '',
      como: rec.como || '',
      quantoCusta: rec.quantoCusta ?? rec.quanto_custa ?? 0,
      documentoId: rec.documentoId,
      auditoriaId: rec.auditoriaId,
      naoConformidadeId: rec.naoConformidadeId
    };
  }

  protected mapToPayload(data: Partial<PlanoAcao>): any {
    return {
      codigo: data.codigo,
      titulo: data.titulo,
      setor: data.setor,
      status: data.status,
      dataCriacao: data.dataCriacao,
      oQue: data.oQue,
      porQue: data.porQue,
      onde: data.onde,
      quando: data.quando,
      quem: data.quem,
      como: data.como,
      quantoCusta: data.quantoCusta,
      documentoId: data.documentoId,
      auditoriaId: data.auditoriaId,
      naoConformidadeId: data.naoConformidadeId
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: PlanoAcao, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.titulo.toLowerCase().includes(query) ||
      (Boolean(item.setor) && item.setor.toLowerCase().includes(query))
    );
  }
}

export const ActionPlanRepository = new ActionPlanRepositoryClass();
export default ActionPlanRepository;
