/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fornecedor } from '../../../types/supplier';
import { BaseRepository } from './base.repository';
import { INITIAL_FORNECEDORES } from '../../../utils/mockData';

class SupplierRepositoryClass extends BaseRepository<Fornecedor> {
  protected collectionName = 'suppliers';

  protected getLocalData(): Fornecedor[] {
    const saved = localStorage.getItem('sgq_vickytex_suppliers');
    if (saved) return JSON.parse(saved);
    return INITIAL_FORNECEDORES;
  }

  protected saveLocalData(data: Fornecedor[]): void {
    localStorage.setItem('sgq_vickytex_suppliers', JSON.stringify(data));
  }

  protected mapRecord(rec: any): Fornecedor {
    return {
      id: rec.id,
      cnpj: rec.cnpj || '',
      razaoSocial: rec.razaoSocial || rec.razao_social || '',
      nomeFantasia: rec.nomeFantasia || rec.razaoSocial || '',
      contatoNome: rec.contatoNome || rec.contato || '',
      contatoEmail: rec.contatoEmail || rec.email || '',
      contatoTelefone: rec.contatoTelefone || '',
      categoria: rec.categoria || 'Outros',
      criticidade: rec.criticidade || 'Média',
      statusQualificacao: rec.statusQualificacao || 'Qualificado',
      historicoAvaliacoes: rec.historicoAvaliacoes || []
    };
  }

  protected mapToPayload(data: Partial<Fornecedor>): any {
    return {
      razaoSocial: data.razaoSocial,
      cnpj: data.cnpj,
      categoria: data.categoria,
      status: data.statusQualificacao,
      contato: data.contatoNome,
      email: data.contatoEmail
    };
  }

  protected getSearchFilter(query: string): string {
    return `razaoSocial ~ "${query}" || cnpj ~ "${query}" || categoria ~ "${query}"`;
  }

  protected localSearchMatch(item: Fornecedor, query: string): boolean {
    return (
      item.razaoSocial.toLowerCase().includes(query) ||
      item.cnpj.toLowerCase().includes(query) ||
      item.categoria.toLowerCase().includes(query)
    );
  }
}

export const SupplierRepository = new SupplierRepositoryClass();
export default SupplierRepository;
