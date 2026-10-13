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
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    return isDemoMode ? INITIAL_FORNECEDORES : [];
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
      inscricaoEstadual: rec.inscricaoEstadual || rec.inscricao_estadual || '',
      enderecoCompleto: rec.enderecoCompleto || rec.endereco || '',
      cidade: rec.cidade || '',
      uf: rec.uf || '',
      cep: rec.cep || '',
      
      contatoNome: rec.contatoNome || rec.contato || '',
      contatoEmail: rec.contatoEmail || rec.email || '',
      contatoTelefone: rec.contatoTelefone || rec.telefone || '',
      contatosAdicionais: Array.isArray(rec.contatosAdicionais) ? rec.contatosAdicionais : [],
      
      categoria: rec.categoria || 'Outros',
      subcategoria: rec.subcategoria || '',
      produtosServicosFornecidos: Array.isArray(rec.produtosServicosFornecidos) ? rec.produtosServicosFornecidos : [],
      
      criticidade: rec.criticidade || 'Média',
      statusQualificacao: rec.statusQualificacao || rec.status || 'Em Avaliação',
      dataQualificacao: rec.dataQualificacao || undefined,
      notaAvaliacao: typeof rec.notaAvaliacao === 'number' ? rec.notaAvaliacao : (rec.notaAvaliacao ? Number(rec.notaAvaliacao) : undefined),
      
      // Módulos avançados ISO 9001
      documentos: Array.isArray(rec.documentos) ? rec.documentos : [],
      qualificacaoInicial: rec.qualificacaoInicial || undefined,
      fluxoAprovacao: Array.isArray(rec.fluxoAprovacao) ? rec.fluxoAprovacao : undefined,
      historicoInspecoes: Array.isArray(rec.historicoInspecoes) ? rec.historicoInspecoes : [],
      ocorrenciasRNC: Array.isArray(rec.ocorrenciasRNC) ? rec.ocorrenciasRNC : [],
      planosAcao: Array.isArray(rec.planosAcao) ? rec.planosAcao : [],
      gestaoRisco: rec.gestaoRisco || undefined,
      historicoBloqueios: Array.isArray(rec.historicoBloqueios) ? rec.historicoBloqueios : [],
      auditorias: Array.isArray(rec.auditorias) ? rec.auditorias : [],
      reavaliacao: rec.reavaliacao || undefined,
      
      historicoAvaliacoes: Array.isArray(rec.historicoAvaliacoes) ? rec.historicoAvaliacoes : [],
      observacoes: rec.observacoes || '',
      criadoEm: rec.criadoEm || undefined,
      atualizadoEm: rec.atualizadoEm || undefined
    };
  }

  protected mapToPayload(data: Partial<Fornecedor>): any {
    const payload: any = {};
    if (data.cnpj !== undefined) payload.cnpj = data.cnpj;
    if (data.razaoSocial !== undefined) payload.razaoSocial = data.razaoSocial;
    if (data.nomeFantasia !== undefined) payload.nomeFantasia = data.nomeFantasia;
    if (data.inscricaoEstadual !== undefined) payload.inscricaoEstadual = data.inscricaoEstadual;
    if (data.enderecoCompleto !== undefined) payload.enderecoCompleto = data.enderecoCompleto;
    if (data.cidade !== undefined) payload.cidade = data.cidade;
    if (data.uf !== undefined) payload.uf = data.uf;
    if (data.cep !== undefined) payload.cep = data.cep;
    
    if (data.contatoNome !== undefined) payload.contatoNome = data.contatoNome;
    if (data.contatoEmail !== undefined) payload.contatoEmail = data.contatoEmail;
    if (data.contatoTelefone !== undefined) payload.contatoTelefone = data.contatoTelefone;
    if (data.contatosAdicionais !== undefined) payload.contatosAdicionais = data.contatosAdicionais;
    
    if (data.categoria !== undefined) payload.categoria = data.categoria;
    if (data.subcategoria !== undefined) payload.subcategoria = data.subcategoria;
    if (data.produtosServicosFornecidos !== undefined) payload.produtosServicosFornecidos = data.produtosServicosFornecidos;
    
    if (data.criticidade !== undefined) payload.criticidade = data.criticidade;
    if (data.statusQualificacao !== undefined) payload.statusQualificacao = data.statusQualificacao;
    if (data.dataQualificacao !== undefined) payload.dataQualificacao = data.dataQualificacao;
    if (data.notaAvaliacao !== undefined) payload.notaAvaliacao = data.notaAvaliacao;
    
    if (data.documentos !== undefined) payload.documentos = data.documentos;
    if (data.qualificacaoInicial !== undefined) payload.qualificacaoInicial = data.qualificacaoInicial;
    if (data.fluxoAprovacao !== undefined) payload.fluxoAprovacao = data.fluxoAprovacao;
    if (data.historicoInspecoes !== undefined) payload.historicoInspecoes = data.historicoInspecoes;
    if (data.ocorrenciasRNC !== undefined) payload.ocorrenciasRNC = data.ocorrenciasRNC;
    if (data.planosAcao !== undefined) payload.planosAcao = data.planosAcao;
    if (data.gestaoRisco !== undefined) payload.gestaoRisco = data.gestaoRisco;
    if (data.historicoBloqueios !== undefined) payload.historicoBloqueios = data.historicoBloqueios;
    if (data.auditorias !== undefined) payload.auditorias = data.auditorias;
    if (data.reavaliacao !== undefined) payload.reavaliacao = data.reavaliacao;
    
    if (data.historicoAvaliacoes !== undefined) payload.historicoAvaliacoes = data.historicoAvaliacoes;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    if (data.criadoEm !== undefined) payload.criadoEm = data.criadoEm;
    if (data.atualizadoEm !== undefined) payload.atualizadoEm = data.atualizadoEm;
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
