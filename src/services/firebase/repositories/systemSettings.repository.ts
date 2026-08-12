/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseRepository } from './base.repository';

export interface SystemSettingRecord {
  id: string; // Document ID, e.g.: 'sgq_5s_setores', 'sgq_5s_sensos', 'sgq_5s_requisitos', 'sgq_5s_classificacoes', 'sgq_5s_configuracao', 'sgq_5s_ciclos', 'sgq_5s_itens', 'sgq_5s_fotos', 'sgq_5s_planos', 'sgq_vickytex_setores', 'sgq_vickytex_tipos_documentos', 'sgq_vickytex_fornecedores_categorias', 'sgq_vickytex_calibracao_tipos', 'sgq_vickytex_auditorias_origens', 'sgq_vickytex_riscos_categorias', 'sgq_vickytex_metodologias_config'
  items?: any[];
  data?: any;
}

class SystemSettingsRepositoryClass extends BaseRepository<SystemSettingRecord> {
  protected collectionName = 'system_settings';

  protected getLocalData(): SystemSettingRecord[] {
    return [];
  }

  protected saveLocalData(_data: SystemSettingRecord[]): void {}

  protected mapRecord(rec: any): SystemSettingRecord {
    return {
      id: rec.id,
      items: Array.isArray(rec.items) ? rec.items : undefined,
      data: rec.data !== undefined ? rec.data : undefined
    };
  }

  protected mapToPayload(data: Partial<SystemSettingRecord>): any {
    const payload: any = {};
    if (data.items !== undefined) payload.items = data.items;
    if (data.data !== undefined) payload.data = data.data;
    return payload;
  }

  protected getSearchFilter(query: string): string {
    return `id ~ "${query}"`;
  }

  protected localSearchMatch(item: SystemSettingRecord, query: string): boolean {
    return item.id.toLowerCase().includes(query);
  }
}

export const SystemSettingsRepository = new SystemSettingsRepositoryClass();
export default SystemSettingsRepository;
