/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Equipamento } from '../../../types';
import { BaseRepository } from './base.repository';

class EquipmentRepositoryClass extends BaseRepository<Equipamento> {
  protected collectionName = 'equipments';

  protected getLocalData(): Equipamento[] {
    return [];
  }

  protected saveLocalData(_data: Equipamento[]): void {}

  protected mapRecord(rec: any): Equipamento {
    return {
      id: rec.id,
      tag: rec.tag || '',
      nome: rec.nome || '',
      fabricante: rec.fabricante || '',
      modelo: rec.modelo || '',
      numeroSerie: rec.numeroSerie || rec.numero_serie || '',
      setor: rec.setor || rec.sector || 'Geral',
      frequenciaCalibracao: rec.frequenciaCalibracao ?? 12,
      dataAquisicao: rec.dataAquisicao || new Date().toISOString().split('T')[0],
      status: rec.status || 'Calibrado',
      calibracoes: rec.calibracoes || []
    };
  }

  protected mapToPayload(data: Partial<Equipamento>): any {
    return {
      tag: data.tag,
      nome: data.nome,
      fabricante: data.fabricante,
      modelo: data.modelo,
      numeroSerie: data.numeroSerie,
      setor: data.setor,
      frequenciaCalibracao: data.frequenciaCalibracao,
      dataAquisicao: data.dataAquisicao,
      status: data.status,
      calibracoes: data.calibracoes
    };
  }

  protected getSearchFilter(query: string): string {
    return `tag ~ "${query}" || nome ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: Equipamento, query: string): boolean {
    return (
      item.tag.toLowerCase().includes(query) ||
      item.nome.toLowerCase().includes(query) ||
      (Boolean(item.setor) && item.setor.toLowerCase().includes(query))
    );
  }
}

export const EquipmentRepository = new EquipmentRepositoryClass();
export default EquipmentRepository;
