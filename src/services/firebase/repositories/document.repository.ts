/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Documento } from '../../../types';
import { BaseRepository } from './base.repository';
import { INITIAL_DOCUMENTS } from '../../../utils/mockData';

class DocumentRepositoryClass extends BaseRepository<Documento> {
  protected collectionName = 'documents';

  protected getLocalData(): Documento[] {
    const saved = localStorage.getItem('sgq_vickytex_documents');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('sgq_vickytex_documents', JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }

  protected saveLocalData(data: Documento[]): void {
    localStorage.setItem('sgq_vickytex_documents', JSON.stringify(data));
  }

  protected mapRecord(rec: any): Documento {
    return {
      id: rec.id,
      codigo: rec.codigo,
      titulo: rec.titulo,
      tipo: rec.tipo,
      setor: rec.sector || rec.setor || 'Geral',
      objetivo: rec.objetivo,
      descricao: rec.descricao,
      status: rec.status,
      revisao: rec.revisao ?? 0,
      periodicidade: rec.periodicidade || 12,
      dataEmissao: rec.data_emissao || rec.dataEmissao,
      proximaRevisao: rec.proxima_revisao || rec.proximaRevisao,
      elaborador: rec.elaborador || '',
      revisor: rec.revisor || '',
      aprovador: rec.aprovador || '',
      googleDriveId: rec.google_drive_id || rec.googleDriveId || '',
      googleDriveLink: rec.google_drive_link || rec.googleDriveLink || '',
      qrCode: rec.qr_code || rec.qrCode || rec.codigo,
      createdAt: rec.createdAt || rec.created,
      updatedAt: rec.updatedAt || rec.updated,
      revisoesHistorico: rec.revisoesHistorico || []
    };
  }

  protected mapToPayload(data: Partial<Documento>): any {
    return {
      codigo: data.codigo,
      titulo: data.titulo,
      tipo: data.tipo,
      sector: data.setor,
      objetivo: data.objetivo,
      descricao: data.descricao,
      status: data.status,
      revisao: data.revisao,
      periodicidade: data.periodicidade,
      data_emissao: data.dataEmissao,
      proxima_revisao: data.proximaRevisao,
      elaborador: data.elaborador,
      revisor: data.revisor,
      aprovador: data.aprovador,
      google_drive_id: data.googleDriveId,
      google_drive_link: data.googleDriveLink,
      qr_code: data.qrCode
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || sector ~ "${query}"`;
  }

  protected localSearchMatch(item: Documento, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.titulo.toLowerCase().includes(query) ||
      item.setor.toLowerCase().includes(query)
    );
  }
}

export const DocumentRepository = new DocumentRepositoryClass();
export default DocumentRepository;
