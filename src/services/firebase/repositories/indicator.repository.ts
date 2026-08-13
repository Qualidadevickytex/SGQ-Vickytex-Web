/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndicadorDesempenho } from '../../../types/indicator';
import { BaseRepository } from './base.repository';

class IndicatorRepositoryClass extends BaseRepository<IndicadorDesempenho> {
  protected collectionName = 'indicators';

  protected getLocalData(): IndicadorDesempenho[] {
    const saved = localStorage.getItem('sgq_vickytex_indicators');
    if (saved) return JSON.parse(saved);
    return [];
  }

  protected saveLocalData(data: IndicadorDesempenho[]): void {
    localStorage.setItem('sgq_vickytex_indicators', JSON.stringify(data));
  }

  protected mapRecord(rec: any): IndicadorDesempenho {
    const valoresMensais = rec.valoresMensais || {};
    let historico = rec.historico;
    if (!historico && Object.keys(valoresMensais).length > 0) {
      historico = Object.entries(valoresMensais).map(([mes, valor]) => ({
        mes,
        valor: Number(valor)
      }));
    }

    return {
      id: rec.id,
      codigo: rec.codigo || `IND-${rec.id}`,
      nome: rec.nome || '',
      setor: rec.setor || rec.sector || 'Geral',
      meta: Number(rec.meta ?? 0),
      unidade: rec.unidade || '%',
      frequenciaMensuracao: rec.frequenciaMensuracao || rec.frequencia || 'Mensal',
      valoresMensais,
      responsavel: rec.responsavel || '',
      direcaoMeta: rec.direcaoMeta || 'maior',
      requisitoISO: rec.requisitoISO || '9.1.3 - Análise e avaliação',
      descricao: rec.descricao || '',
      formula: rec.formula || '',
      historico: historico || []
    } as any;
  }

  protected mapToPayload(data: Partial<IndicadorDesempenho>): any {
    const raw: any = data;
    const valoresMensais: { [key: string]: number } = raw.valoresMensais ? { ...raw.valoresMensais } : {};
    
    // Se vier com array de historico, sincroniza valoresMensais
    if (Array.isArray(raw.historico) && raw.historico.length > 0) {
      raw.historico.forEach((h: any) => {
        if (h && h.mes !== undefined) {
          valoresMensais[h.mes] = Number(h.valor);
        }
      });
    }

    const payload: any = {
      codigo: raw.codigo || (raw.id ? `IND-${raw.id}` : 'IND'),
      nome: raw.nome || '',
      setor: raw.setor || 'Geral',
      meta: Number(raw.meta ?? 0),
      unidade: raw.unidade || '%',
      frequenciaMensuracao: raw.frequenciaMensuracao || raw.frequencia || 'Mensal',
      frequencia: raw.frequenciaMensuracao || raw.frequencia || 'Mensal',
      responsavel: raw.responsavel || '',
      valoresMensais,
      direcaoMeta: raw.direcaoMeta || 'maior',
      requisitoISO: raw.requisitoISO || '9.1.3 - Análise e avaliação',
      descricao: raw.descricao || '',
      formula: raw.formula || '',
      historico: Array.isArray(raw.historico) ? raw.historico : Object.entries(valoresMensais).map(([mes, valor]) => ({ mes, valor: Number(valor) }))
    };

    return payload;
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || nome ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: IndicadorDesempenho, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.nome.toLowerCase().includes(query) ||
      item.setor.toLowerCase().includes(query)
    );
  }
}

export const IndicatorRepository = new IndicatorRepositoryClass();
export default IndicatorRepository;
