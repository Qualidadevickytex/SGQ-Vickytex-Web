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
    try {
      const stored = localStorage.getItem('sgq_vickytex_fornecedores');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return INITIAL_FORNECEDORES;
  }

  protected saveLocalData(data: Fornecedor[]): void {
    try {
      localStorage.setItem('sgq_vickytex_fornecedores', JSON.stringify(data));
    } catch (e) {}
  }

  protected mapRecord(rec: any): Fornecedor {
    return {
      id: rec.id,
      cnpj: rec.cnpj || '',
      razaoSocial: rec.razaoSocial || rec.razao_social || '',
      nomeFantasia: rec.nomeFantasia || rec.razaoSocial || rec.razao_social || '',
      contatoNome: rec.contatoNome || rec.contato || '',
      contatoEmail: rec.contatoEmail || rec.email || '',
      contatoTelefone: rec.contatoTelefone || rec.telefone || '',
      categoria: rec.categoria || 'Outros',
      criticidade: rec.criticidade || 'Média',
      statusQualificacao: rec.statusQualificacao || rec.status || 'Em Avaliação',
      dataQualificacao: rec.dataQualificacao || undefined,
      notaAvaliacao: typeof rec.notaAvaliacao === 'number' ? rec.notaAvaliacao : (rec.notaAvaliacao ? Number(rec.notaAvaliacao) : undefined),
      historicoAvaliacoes: Array.isArray(rec.historicoAvaliacoes) ? rec.historicoAvaliacoes : [],
      observacoes: rec.observacoes || ''
    };
  }

  protected mapToPayload(data: Partial<Fornecedor>): any {
    const payload: any = {};
    if (data.cnpj !== undefined) payload.cnpj = data.cnpj;
    if (data.razaoSocial !== undefined) payload.razaoSocial = data.razaoSocial;
    if (data.nomeFantasia !== undefined) payload.nomeFantasia = data.nomeFantasia;
    if (data.contatoNome !== undefined) payload.contatoNome = data.contatoNome;
    if (data.contatoEmail !== undefined) payload.contatoEmail = data.contatoEmail;
    if (data.contatoTelefone !== undefined) payload.contatoTelefone = data.contatoTelefone;
    if (data.categoria !== undefined) payload.categoria = data.categoria;
    if (data.criticidade !== undefined) payload.criticidade = data.criticidade;
    if (data.statusQualificacao !== undefined) payload.statusQualificacao = data.statusQualificacao;
    if (data.dataQualificacao !== undefined) payload.dataQualificacao = data.dataQualificacao;
    if (data.notaAvaliacao !== undefined) payload.notaAvaliacao = data.notaAvaliacao;
    if (data.historicoAvaliacoes !== undefined) payload.historicoAvaliacoes = data.historicoAvaliacoes;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    return payload;
  }

  protected getSearchFilter(query: string): string {
    return `razaoSocial ~ "${query}" || cnpj ~ "${query}" || categoria ~ "${query}" || nomeFantasia ~ "${query}"`;
  }

  protected localSearchMatch(item: Fornecedor, query: string): boolean {
    const q = query.toLowerCase();
    return (
      (item.razaoSocial && item.razaoSocial.toLowerCase().includes(q)) ||
      (item.nomeFantasia && item.nomeFantasia.toLowerCase().includes(q)) ||
      (item.cnpj && item.cnpj.toLowerCase().includes(q)) ||
      (item.categoria && item.categoria.toLowerCase().includes(q))
    );
  }
}

export const SupplierRepository = new SupplierRepositoryClass();
export default SupplierRepository;
