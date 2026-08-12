/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseRepository } from './base.repository';

export interface AuditLogDocument {
  id: string;
  usuarioEmail: string;
  usuarioNome: string;
  usuarioRole: string;
  acao: string;
  detalhes: string;
  timestamp: string;
  documentoId?: string;
}

class AuditLogRepositoryClass extends BaseRepository<AuditLogDocument> {
  protected collectionName = 'audit_logs';

  protected getLocalData(): AuditLogDocument[] {
    return [];
  }

  protected saveLocalData(_data: AuditLogDocument[]): void {}

  protected mapRecord(rec: any): AuditLogDocument {
    return {
      id: rec.id,
      usuarioEmail: rec.usuarioEmail || rec.usuario_email || '',
      usuarioNome: rec.usuarioNome || rec.usuario_nome || '',
      usuarioRole: rec.usuarioRole || rec.usuario_role || 'Usuário',
      acao: rec.acao || '',
      detalhes: rec.detalhes || rec.registro || '',
      timestamp: rec.timestamp || rec.data || new Date().toISOString(),
      documentoId: rec.documentoId || rec.documento_id || undefined
    };
  }

  protected mapToPayload(data: Partial<AuditLogDocument>): any {
    return {
      usuarioEmail: data.usuarioEmail,
      usuarioNome: data.usuarioNome,
      usuarioRole: data.usuarioRole,
      acao: data.acao,
      detalhes: data.detalhes,
      timestamp: data.timestamp || new Date().toISOString(),
      documentoId: data.documentoId || null
    };
  }

  protected getSearchFilter(query: string): string {
    return `usuarioEmail ~ "${query}" || acao ~ "${query}" || detalhes ~ "${query}"`;
  }

  protected localSearchMatch(item: AuditLogDocument, query: string): boolean {
    const q = query.toLowerCase();
    return (
      item.usuarioEmail.toLowerCase().includes(q) ||
      item.acao.toLowerCase().includes(q) ||
      item.detalhes.toLowerCase().includes(q)
    );
  }
}

export const AuditLogsRepository = new AuditLogRepositoryClass();
export default AuditLogsRepository;
