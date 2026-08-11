/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Registro } from '../../../types';
import { BaseRepository } from './base.repository';

class RecordRepositoryClass extends BaseRepository<Registro> {
  protected collectionName = 'records';

  protected getLocalData(): Registro[] {
    return [];
  }

  protected saveLocalData(_data: Registro[]): void {}

  protected mapRecord(rec: any): Registro {
    return {
      id: rec.id,
      codigo: rec.codigo || `REG-${rec.id}`,
      titulo: rec.titulo || '',
      documentoOrigemId: rec.documentoOrigemId,
      setor: rec.setor || rec.sector || 'Geral',
      tipoMidia: rec.tipoMidia || 'Digital',
      localArmazenamento: rec.localArmazenamento || '',
      tempoRetencaoAnos: rec.tempoRetencaoAnos ?? 5,
      disposicaoFinal: rec.disposicaoFinal || 'Digitalização e Descarte',
      responsavelPreenchimento: rec.responsavelPreenchimento || '',
      responsavelGuarda: rec.responsavelGuarda || '',
      indexacaoMetodo: rec.indexacaoMetodo || '',
      statusControle: rec.statusControle || 'Ativo',
      dataUltimaVerificacao: rec.dataUltimaVerificacao,
      observacoes: rec.observacoes,
      googleDriveId: rec.googleDriveId,
      googleDriveLink: rec.googleDriveLink
    };
  }

  protected mapToPayload(data: Partial<Registro>): any {
    return {
      codigo: data.codigo,
      titulo: data.titulo,
      documentoOrigemId: data.documentoOrigemId,
      setor: data.setor,
      tipoMidia: data.tipoMidia,
      localArmazenamento: data.localArmazenamento,
      tempoRetencaoAnos: data.tempoRetencaoAnos,
      disposicaoFinal: data.disposicaoFinal,
      responsavelPreenchimento: data.responsavelPreenchimento,
      responsavelGuarda: data.responsavelGuarda,
      indexacaoMetodo: data.indexacaoMetodo,
      statusControle: data.statusControle,
      dataUltimaVerificacao: data.dataUltimaVerificacao,
      observacoes: data.observacoes,
      googleDriveId: data.googleDriveId,
      googleDriveLink: data.googleDriveLink
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: Registro, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.titulo.toLowerCase().includes(query) ||
      (Boolean(item.setor) && item.setor.toLowerCase().includes(query))
    );
  }
}

export const RecordRepository = new RecordRepositoryClass();
export default RecordRepository;
