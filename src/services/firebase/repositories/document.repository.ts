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
    try {
      const saved = localStorage.getItem('sgq_vickytex_documents');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DOCUMENTS;
  }

  protected saveLocalData(data: Documento[]): void {
    try {
      localStorage.setItem('sgq_vickytex_documents', JSON.stringify(data));
    } catch {}
  }

  protected mapRecord(rec: any): Documento {
    return {
      id: rec.id,
      codigo: rec.codigo || '',
      titulo: rec.titulo || '',
      tipo: rec.tipo || 'POP',
      setor: rec.sector || rec.setor || 'Geral',
      objetivo: rec.objetivo || '',
      descricao: rec.descricao || '',
      status: rec.status || 'Rascunho',
      revisao: rec.revisao ?? 0,
      periodicidade: rec.periodicidade || 12,
      dataEmissao: rec.data_emissao || rec.dataEmissao || '',
      proximaRevisao: rec.proxima_revisao || rec.proximaRevisao || '',
      elaborador: rec.elaborador || '',
      revisor: rec.revisor || '',
      aprovador: rec.aprovador || '',
      googleDriveId: rec.google_drive_id || rec.googleDriveId || '',
      googleDriveLink: rec.google_drive_link || rec.googleDriveLink || '',
      qrCode: rec.qr_code || rec.qrCode || rec.codigo || '',
      createdAt: rec.createdAt || rec.created || new Date().toISOString(),
      updatedAt: rec.updatedAt || rec.updated || new Date().toISOString(),
      revisoesHistorico: Array.isArray(rec.revisoesHistorico) 
        ? rec.revisoesHistorico 
        : (Array.isArray(rec.revisoes_historico) ? rec.revisoes_historico : []),
      distribuicaoCopias: Array.isArray(rec.distribuicaoCopias) 
        ? rec.distribuicaoCopias 
        : (Array.isArray(rec.distribuicao_copias) ? rec.distribuicao_copias : []),
      documentLogs: Array.isArray(rec.documentLogs) 
        ? rec.documentLogs 
        : (Array.isArray(rec.document_logs) ? rec.document_logs : []),
      documentReadings: Array.isArray(rec.documentReadings) 
        ? rec.documentReadings 
        : (Array.isArray(rec.document_readings) ? rec.document_readings : []),
      fluxoCustomId: rec.fluxoCustomId || rec.fluxo_custom_id,
      assinaturaElaborador: rec.assinaturaElaborador || rec.assinatura_elaborador,
      dataElaboracao: rec.dataElaboracao || rec.data_elaboracao,
      assinaturaRevisor: rec.assinaturaRevisor || rec.assinatura_revisor,
      dataRevisao: rec.dataRevisao || rec.data_revisao,
      assinaturaAprovador: rec.assinaturaAprovador || rec.assinatura_aprovador,
      dataAprovacao: rec.dataAprovacao || rec.data_aprovacao,
      feedbackAjuste: rec.feedbackAjuste || rec.feedback_ajuste
    };
  }

  protected mapToPayload(data: Partial<Documento>): any {
    const payload: any = {
      codigo: data.codigo,
      titulo: data.titulo,
      tipo: data.tipo,
      sector: data.setor,
      objetivo: data.objetivo || '',
      descricao: data.descricao || '',
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

    if (data.revisoesHistorico !== undefined) payload.revisoesHistorico = data.revisoesHistorico;
    if (data.distribuicaoCopias !== undefined) payload.distribuicaoCopias = data.distribuicaoCopias;
    if (data.documentLogs !== undefined) payload.documentLogs = data.documentLogs;
    if (data.documentReadings !== undefined) payload.documentReadings = data.documentReadings;
    if (data.fluxoCustomId !== undefined) payload.fluxoCustomId = data.fluxoCustomId;
    if (data.assinaturaElaborador !== undefined) payload.assinaturaElaborador = data.assinaturaElaborador;
    if (data.dataElaboracao !== undefined) payload.dataElaboracao = data.dataElaboracao;
    if (data.assinaturaRevisor !== undefined) payload.assinaturaRevisor = data.assinaturaRevisor;
    if (data.dataRevisao !== undefined) payload.dataRevisao = data.dataRevisao;
    if (data.assinaturaAprovador !== undefined) payload.assinaturaAprovador = data.assinaturaAprovador;
    if (data.dataAprovacao !== undefined) payload.dataAprovacao = data.dataAprovacao;
    if (data.feedbackAjuste !== undefined) payload.feedbackAjuste = data.feedbackAjuste;

    return payload;
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
