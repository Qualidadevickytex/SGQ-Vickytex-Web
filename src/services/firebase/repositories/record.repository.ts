/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Registro } from '../../../types';
import { BaseRepository } from './base.repository';

class RecordRepositoryClass extends BaseRepository<Registro> {
  protected collectionName = 'records';

  protected getLocalData(): Registro[] {
    try {
      const saved = localStorage.getItem('sgq_vickytex_registros');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  protected saveLocalData(data: Registro[]): void {
    try {
      localStorage.setItem('sgq_vickytex_registros', JSON.stringify(data));
    } catch (e) {
      console.warn('[RecordRepository] Error saving local storage backup:', e);
    }
  }

  protected mapRecord(rec: any): Registro {
    const rawFotos = Array.isArray(rec.fotos) ? rec.fotos : [];
    const fotoEvidencia = rec.fotoEvidencia || rec.foto_evidencia || (rawFotos.length > 0 ? rawFotos[0] : undefined);
    const fotos = rawFotos.length > 0 ? rawFotos : (fotoEvidencia ? [fotoEvidencia] : []);

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
      googleDriveLink: rec.googleDriveLink,
      fotoEvidencia: fotoEvidencia,
      fotos: fotos
    };
  }

  protected mapToPayload(data: Partial<Registro>): any {
    const rawFotos = Array.isArray(data.fotos) ? data.fotos : [];
    const fotoEvidencia = data.fotoEvidencia || (rawFotos.length > 0 ? rawFotos[0] : null);
    const fotos = rawFotos.length > 0 ? rawFotos : (fotoEvidencia ? [fotoEvidencia] : []);

    return {
      codigo: data.codigo || '',
      titulo: data.titulo || '',
      documentoOrigemId: data.documentoOrigemId || null,
      setor: data.setor || 'Geral',
      tipoMidia: data.tipoMidia || 'Digital',
      localArmazenamento: data.localArmazenamento || '',
      tempoRetencaoAnos: data.tempoRetencaoAnos ?? 5,
      disposicaoFinal: data.disposicaoFinal || 'Digitalização e Descarte',
      responsavelPreenchimento: data.responsavelPreenchimento || '',
      responsavelGuarda: data.responsavelGuarda || '',
      indexacaoMetodo: data.indexacaoMetodo || '',
      statusControle: data.statusControle || 'Ativo',
      dataUltimaVerificacao: data.dataUltimaVerificacao || new Date().toISOString().split('T')[0],
      observacoes: data.observacoes || '',
      googleDriveId: data.googleDriveId || '',
      googleDriveLink: data.googleDriveLink || '',
      fotoEvidencia: fotoEvidencia,
      fotos: fotos
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
