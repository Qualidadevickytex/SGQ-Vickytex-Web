/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Auditoria5S } from '../../../types/fiveS';
import { BaseRepository } from './base.repository';
import { INITIAL_5S_AUDITS } from '../../../utils/mockData';

class FiveSRepositoryClass extends BaseRepository<Auditoria5S> {
  protected collectionName = 'fives_audits';

  protected getLocalData(): Auditoria5S[] {
    return [];
  }

  protected saveLocalData(_data: Auditoria5S[]): void {}

  protected mapRecord(rec: any): Auditoria5S {
    return {
      id: rec.id,
      codigo: rec.codigo || `AUD5S-${rec.id}`,
      setor: rec.setor || rec.sector || 'Geral',
      setorId: rec.setor_id || rec.setorId,
      cicloId: rec.ciclo_id || rec.cicloId,
      auditor: rec.auditor || '',
      dataAuditoria: rec.data_auditoria || rec.dataAuditoria || new Date().toISOString(),
      seiri: rec.seiri || 0,
      seiton: rec.seiton || 0,
      seiso: rec.seiso || 0,
      seiketsu: rec.seiketsu || 0,
      shitsuke: rec.shitsuke || 0,
      mediaGeral: rec.media_geral || rec.mediaGeral || 0,
      observacoes: rec.observacoes || '',
      status: rec.status || 'Finalizada',
      pontuacaoMaxima: rec.pontuacao_maxima || rec.pontuacaoMaxima,
      pontuacaoObtida: rec.pontuacao_obtida || rec.pontuacaoObtida,
      totalPenalidades: rec.total_penalidades || rec.totalPenalidades,
      indiceConformidade: rec.indice_conformidade || rec.indiceConformidade,
      classificacaoId: rec.classificacao_id || rec.classificacaoId,
      fotos: rec.fotos || []
    };
  }

  protected mapToPayload(data: Partial<Auditoria5S>): any {
    return {
      codigo: data.codigo,
      data_auditoria: data.dataAuditoria,
      setor: data.setor,
      setor_id: data.setorId,
      ciclo_id: data.cicloId,
      auditor: data.auditor,
      seiri: data.seiri,
      seiton: data.seiton,
      seiso: data.seiso,
      seiketsu: data.seiketsu,
      shitsuke: data.shitsuke,
      media_geral: data.mediaGeral,
      observacoes: data.observacoes,
      status: data.status,
      pontuacao_maxima: data.pontuacaoMaxima,
      pontuacao_obtida: data.pontuacaoObtida,
      total_penalidades: data.totalPenalidades,
      indice_conformidade: data.indiceConformidade,
      classificacao_id: data.classificacaoId,
      fotos: data.fotos || []
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || setor ~ "${query}" || auditor ~ "${query}"`;
  }

  protected localSearchMatch(item: Auditoria5S, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.setor.toLowerCase().includes(query) ||
      item.auditor.toLowerCase().includes(query)
    );
  }
}

export const FiveSRepository = new FiveSRepositoryClass();
export default FiveSRepository;
