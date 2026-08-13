/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Treinamento } from '../../../types/training';
import { BaseRepository } from './base.repository';

class TrainingRepositoryClass extends BaseRepository<Treinamento> {
  protected collectionName = 'trainings';

  protected getLocalData(): Treinamento[] {
    return [];
  }

  protected saveLocalData(_data: Treinamento[]): void {}

  protected mapRecord(rec: any): Treinamento {
    return {
      id: rec.id,
      codigo: rec.codigo || `TRN-${rec.id}`,
      documentoId: rec.documentoId || rec.documento_id || '',
      titulo: rec.titulo || '',
      dataTreinamento: rec.dataTreinamento || rec.data_realizacao || rec.dataRealizacao || new Date().toISOString().split('T')[0],
      instrutor: rec.instrutor || '',
      setor: rec.setor || rec.sector || 'Geral',
      duracaoHoras: Number(rec.duracaoHoras || rec.carga_horaria || rec.cargaHoraria || 1),
      participantes: Array.isArray(rec.participantes) ? rec.participantes : [],
      status: rec.status || 'Planejado'
    };
  }

  protected mapToPayload(data: Partial<Treinamento>): any {
    const payload: any = {
      codigo: data.codigo,
      documentoId: data.documentoId,
      documento_id: data.documentoId,
      titulo: data.titulo,
      instrutor: data.instrutor,
      setor: data.setor,
      sector: data.setor,
      dataTreinamento: data.dataTreinamento,
      dataRealizacao: data.dataTreinamento,
      data_realizacao: data.dataTreinamento,
      duracaoHoras: Number(data.duracaoHoras || 1),
      cargaHoraria: Number(data.duracaoHoras || 1),
      carga_horaria: Number(data.duracaoHoras || 1),
      participantes: Array.isArray(data.participantes) ? data.participantes : [],
      status: data.status || 'Planejado'
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    return payload;
  }

  protected getSearchFilter(query: string): string {
    return `titulo ~ "${query}" || instrutor ~ "${query}"`;
  }

  protected localSearchMatch(item: Treinamento, query: string): boolean {
    return (
      item.titulo.toLowerCase().includes(query) ||
      item.instrutor.toLowerCase().includes(query) ||
      item.setor.toLowerCase().includes(query)
    );
  }
}

export const TrainingRepository = new TrainingRepositoryClass();
export default TrainingRepository;
