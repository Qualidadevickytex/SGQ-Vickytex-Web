/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RiscoOportunidade } from '../../../types';
import { BaseRepository } from './base.repository';

class RiskRepositoryClass extends BaseRepository<RiscoOportunidade> {
  protected collectionName = 'risks';

  protected getLocalData(): RiscoOportunidade[] {
    return [];
  }

  protected saveLocalData(_data: RiscoOportunidade[]): void {}

  protected mapRecord(rec: any): RiscoOportunidade {
    return {
      id: rec.id,
      codigo: rec.codigo || `RS-${rec.id}`,
      titulo: rec.titulo || '',
      tipo: rec.tipo || 'Risco',
      setor: rec.setor || rec.sector || 'Geral',
      descricao: rec.descricao || '',
      probabilidade: rec.probabilidade ?? 1,
      impacto: rec.impacto ?? 1,
      nivelExposicao: rec.nivelExposicao ?? ((rec.probabilidade || 1) * (rec.impacto || 1)),
      estrategia: rec.estrategia || 'Mitigar',
      planoAcaoId: rec.planoAcaoId,
      status: rec.status || 'Identificado',
      dataIdentificacao: rec.dataIdentificacao || rec.data_identificacao || new Date().toISOString().split('T')[0],
      responsavel: rec.responsavel || '',
      categoria: rec.categoria
    };
  }

  protected mapToPayload(data: Partial<RiscoOportunidade>): any {
    return {
      codigo: data.codigo,
      titulo: data.titulo,
      tipo: data.tipo,
      setor: data.setor,
      descricao: data.descricao,
      probabilidade: data.probabilidade,
      impacto: data.impacto,
      nivelExposicao: data.nivelExposicao,
      estrategia: data.estrategia,
      planoAcaoId: data.planoAcaoId,
      status: data.status,
      dataIdentificacao: data.dataIdentificacao,
      responsavel: data.responsavel,
      categoria: data.categoria
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: RiscoOportunidade, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.titulo.toLowerCase().includes(query) ||
      (Boolean(item.setor) && item.setor.toLowerCase().includes(query))
    );
  }
}

export const RiskRepository = new RiskRepositoryClass();
export default RiskRepository;
