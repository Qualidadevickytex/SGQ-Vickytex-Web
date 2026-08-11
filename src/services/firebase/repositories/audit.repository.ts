/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Auditoria } from '../../../types/audit';
import { BaseRepository } from './base.repository';
import { INITIAL_AUDITORIAS } from '../../../utils/mockData';

class AuditRepositoryClass extends BaseRepository<Auditoria> {
  protected collectionName = 'audits';

  protected getLocalData(): Auditoria[] {
    return [];
  }

  protected saveLocalData(_data: Auditoria[]): void {}

  protected mapRecord(rec: any): Auditoria {
    return {
      id: rec.id,
      codigo: rec.codigo,
      titulo: rec.titulo,
      dataPlanejada: rec.data_planejada || rec.dataPlanejada,
      setor: rec.sector || rec.setor,
      auditor: rec.auditor,
      status: rec.status || 'Agendada'
    };
  }

  protected mapToPayload(data: Partial<Auditoria>): any {
    return {
      codigo: data.codigo,
      titulo: data.titulo,
      data_planejada: data.dataPlanejada,
      sector: data.setor,
      auditor: data.auditor,
      status: data.status || 'Agendada'
    };
  }

  protected getSearchFilter(query: string): string {
    return `titulo ~ "${query}" || codigo ~ "${query}" || auditor ~ "${query}"`;
  }

  protected localSearchMatch(item: Auditoria, query: string): boolean {
    return (
      item.titulo.toLowerCase().includes(query) ||
      item.codigo.toLowerCase().includes(query) ||
      item.auditor.toLowerCase().includes(query)
    );
  }
}

export const AuditRepository = new AuditRepositoryClass();
export default AuditRepository;
