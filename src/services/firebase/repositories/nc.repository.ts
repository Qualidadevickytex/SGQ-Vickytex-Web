/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NaoConformidade } from '../../../types/audit';
import { BaseRepository } from './base.repository';

class NCRepositoryClass extends BaseRepository<NaoConformidade> {
  protected collectionName = 'ncs';

  protected getLocalData(): NaoConformidade[] {
    return [];
  }

  protected saveLocalData(_data: NaoConformidade[]): void {}

  protected mapRecord(rec: any): NaoConformidade {
    return {
      id: rec.id,
      codigo: rec.codigo || `NC-${rec.id}`,
      titulo: rec.titulo || '',
      descricao: rec.descricao || '',
      dataAbertura: rec.dataAbertura || rec.data_abertura || new Date().toISOString().split('T')[0],
      setor: rec.setor || rec.sector || 'Geral',
      responsavel: rec.responsavel || '',
      status: rec.status || 'Aberta',
      documentoRelacionadoId: rec.documentoRelacionadoId || rec.documento_relacionado_id,
      origem: rec.origem
    };
  }

  protected mapToPayload(data: Partial<NaoConformidade>): any {
    return {
      codigo: data.codigo,
      titulo: data.titulo,
      descricao: data.descricao,
      dataAbertura: data.dataAbertura,
      data_abertura: data.dataAbertura,
      setor: data.setor,
      responsavel: data.responsavel,
      status: data.status,
      documentoRelacionadoId: data.documentoRelacionadoId,
      origem: data.origem
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: NaoConformidade, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.titulo.toLowerCase().includes(query) ||
      (Boolean(item.setor) && item.setor.toLowerCase().includes(query))
    );
  }
}

export const NCRepository = new NCRepositoryClass();
export default NCRepository;
