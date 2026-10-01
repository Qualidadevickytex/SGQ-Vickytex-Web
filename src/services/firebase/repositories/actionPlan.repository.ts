/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlanoAcao } from '../../../types/actionPlan';
import { BaseRepository } from './base.repository';

class ActionPlanRepositoryClass extends BaseRepository<PlanoAcao> {
  protected collectionName = 'action_plans';

  protected getLocalData(): PlanoAcao[] {
    return [];
  }

  protected saveLocalData(_data: PlanoAcao[]): void {}

  protected mapRecord(rec: any): PlanoAcao {
    const acoes = Array.isArray(rec.acoes) 
      ? rec.acoes.map((a: any, idx: number) => ({
          ...a,
          itemNumero: idx + 1,
          evidencias: Array.isArray(a.evidencias) ? a.evidencias : [],
          comentarios: Array.isArray(a.comentarios) ? a.comentarios : [],
          historicoPrazos: Array.isArray(a.historicoPrazos) ? a.historicoPrazos : []
        }))
      : (rec.oQue ? [{
          id: `${rec.id}-1`,
          itemNumero: 1,
          oQue: rec.oQue || rec.o_que || '',
          porQue: rec.porQue || rec.por_que || '',
          onde: rec.onde || '',
          quando: rec.quando || '',
          quem: rec.quem || rec.coordenador || '',
          como: rec.como || '',
          quantoCusta: rec.quantoCusta ?? rec.quanto_custa ?? 0,
          status: rec.status || 'Planejado'
        }] : []);

    return {
      id: rec.id,
      codigo: rec.codigo || `PA-${rec.id}`,
      titulo: rec.titulo || '',
      setor: rec.setor || rec.sector || 'Geral',
      status: rec.status || 'Planejado',
      dataCriacao: rec.dataCriacao || rec.data_criacao || new Date().toISOString().split('T')[0],
      coordenador: rec.coordenador || rec.quem || '',
      objetivo: rec.objetivo || '',
      prazoGeral: rec.prazoGeral || rec.quando || '',
      acoes: acoes,
      oQue: rec.oQue || (acoes[0]?.oQue) || '',
      porQue: rec.porQue || (acoes[0]?.porQue) || '',
      onde: rec.onde || (acoes[0]?.onde) || '',
      quando: rec.quando || (acoes[0]?.quando) || '',
      quem: rec.quem || rec.coordenador || (acoes[0]?.quem) || '',
      como: rec.como || (acoes[0]?.como) || '',
      quantoCusta: rec.quantoCusta ?? (acoes.reduce((acc: number, a: any) => acc + (Number(a.quantoCusta) || 0), 0)),
      documentoId: rec.documentoId,
      auditoriaId: rec.auditoriaId,
      naoConformidadeId: rec.naoConformidadeId
    };
  }

  protected mapToPayload(data: Partial<PlanoAcao>): any {
    return {
      codigo: data.codigo,
      titulo: data.titulo,
      setor: data.setor,
      status: data.status,
      dataCriacao: data.dataCriacao,
      coordenador: data.coordenador || data.quem,
      objetivo: data.objetivo || '',
      prazoGeral: data.prazoGeral || data.quando,
      acoes: Array.isArray(data.acoes) ? data.acoes : [],
      oQue: data.oQue,
      porQue: data.porQue,
      onde: data.onde,
      quando: data.quando,
      quem: data.quem || data.coordenador,
      como: data.como,
      quantoCusta: data.quantoCusta,
      documentoId: data.documentoId,
      auditoriaId: data.auditoriaId,
      naoConformidadeId: data.naoConformidadeId
    };
  }

  protected getSearchFilter(query: string): string {
    return `codigo ~ "${query}" || titulo ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: PlanoAcao, query: string): boolean {
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.titulo.toLowerCase().includes(query) ||
      (Boolean(item.setor) && item.setor.toLowerCase().includes(query))
    );
  }
}

export const ActionPlanRepository = new ActionPlanRepositoryClass();
export default ActionPlanRepository;
