/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Treinamento } from '../../../types/training';
import { BaseRepository } from './base.repository';

class TrainingRepositoryClass extends BaseRepository<Treinamento> {
  protected collectionName = 'trainings';

  protected getLocalData(): Treinamento[] {
    const saved = localStorage.getItem('sgq_vickytex_trainings');
    if (saved) return JSON.parse(saved);
    return [];
  }

  protected saveLocalData(data: Treinamento[]): void {
    localStorage.setItem('sgq_vickytex_trainings', JSON.stringify(data));
  }

  protected mapRecord(rec: any): Treinamento {
    return {
      id: rec.id,
      codigo: rec.codigo || `TRN-${rec.id}`,
      documentoId: rec.documentoId || '',
      titulo: rec.titulo || '',
      dataTreinamento: rec.dataTreinamento || rec.data_realizacao || new Date().toISOString().split('T')[0],
      instrutor: rec.instrutor || '',
      setor: rec.setor || rec.sector || 'Geral',
      duracaoHoras: rec.duracaoHoras || rec.carga_horaria || 1,
      participantes: rec.participantes || [],
      status: rec.status || 'Planejado'
    };
  }

  protected mapToPayload(data: Partial<Treinamento>): any {
    return {
      titulo: data.titulo,
      instrutor: data.instrutor,
      dataRealizacao: data.dataTreinamento,
      cargaHoraria: data.duracaoHoras,
      status: data.status
    };
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
