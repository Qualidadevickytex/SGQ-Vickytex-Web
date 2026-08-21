/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fotografia5S } from '../../../types/fiveS';
import { BaseRepository } from './base.repository';

class FiveSPhotosRepositoryClass extends BaseRepository<Fotografia5S> {
  protected collectionName = 'fives_photos';

  protected getLocalData(): Fotografia5S[] {
    try {
      const saved = localStorage.getItem('sgq_5s_fotos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  protected saveLocalData(data: Fotografia5S[]): void {
    try {
      localStorage.setItem('sgq_5s_fotos', JSON.stringify(data));
    } catch (e) {
      console.warn('[FiveSPhotosRepository] Error saving local backup:', e);
    }
  }

  protected mapRecord(rec: any): Fotografia5S {
    return {
      id: rec.id,
      itemAuditadoId: rec.itemAuditadoId || rec.item_auditado_id || '',
      requisitoId: rec.requisitoId || rec.requisito_id || '',
      auditoriaId: rec.auditoriaId || rec.auditoria_id || '',
      url: rec.url || '',
      legenda: rec.legenda || '',
      data: rec.data || new Date().toISOString(),
      usuario: rec.usuario || '',
      observacoes: rec.observacoes || ''
    };
  }

  protected mapToPayload(data: Partial<Fotografia5S>): any {
    return {
      itemAuditadoId: data.itemAuditadoId || '',
      requisitoId: data.requisitoId || '',
      auditoriaId: data.auditoriaId || '',
      url: data.url || '',
      legenda: data.legenda || '',
      data: data.data || new Date().toISOString(),
      usuario: data.usuario || '',
      observacoes: data.observacoes || ''
    };
  }

  protected getSearchFilter(query: string): string {
    return `auditoriaId ~ "${query}" || legenda ~ "${query}"`;
  }

  protected localSearchMatch(item: Fotografia5S, query: string): boolean {
    return (
      item.auditoriaId.toLowerCase().includes(query) ||
      item.legenda.toLowerCase().includes(query) ||
      item.usuario.toLowerCase().includes(query)
    );
  }
}

export const FiveSPhotosRepository = new FiveSPhotosRepositoryClass();
export default FiveSPhotosRepository;
