/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColaboradorCompetencia } from '../../../types/training';
import { BaseRepository } from './base.repository';

class CollaboratorRepositoryClass extends BaseRepository<ColaboradorCompetencia> {
  protected collectionName = 'collaborators';

  protected getLocalData(): ColaboradorCompetencia[] {
    return [];
  }

  protected saveLocalData(_data: ColaboradorCompetencia[]): void {}

  protected mapRecord(rec: any): ColaboradorCompetencia {
    return {
      id: rec.id,
      nome: rec.nome || '',
      cargo: rec.cargo || '',
      setor: rec.setor || rec.sector || 'Geral',
      documentosAssinados: rec.documentosAssinados || [],
      status: rec.status || 'Apto'
    };
  }

  protected mapToPayload(data: Partial<ColaboradorCompetencia>): any {
    return {
      nome: data.nome,
      cargo: data.cargo,
      setor: data.setor,
      documentosAssinados: data.documentosAssinados,
      status: data.status
    };
  }

  protected getSearchFilter(query: string): string {
    return `nome ~ "${query}" || cargo ~ "${query}" || setor ~ "${query}"`;
  }

  protected localSearchMatch(item: ColaboradorCompetencia, query: string): boolean {
    return (
      item.nome.toLowerCase().includes(query) ||
      item.cargo.toLowerCase().includes(query) ||
      (Boolean(item.setor) && item.setor.toLowerCase().includes(query))
    );
  }
}

export const CollaboratorRepository = new CollaboratorRepositoryClass();
export default CollaboratorRepository;
