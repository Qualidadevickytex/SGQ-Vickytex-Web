/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AvaliacaoFornecedor {
  id: string;
  dataAvaliacao: string;
  avaliador: string;
  criterioQualidade: number; // 0-100
  criterioPrazo: number; // 0-100
  criterioAtendimento: number; // 0-100
  notaGeral: number; // 0-100 (média)
  resultado: 'Aprovado' | 'Aprovado com Restrições' | 'Reprovado';
  parecerTecnico?: string;
}

export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  contatoNome: string;
  contatoEmail: string;
  contatoTelefone: string;
  categoria: 'Fios e Fibras' | 'Serviços de Tinturaria' | 'Embalagens' | 'Produtos Químicos' | 'Manutenção' | 'Calibração' | 'Serviços de Facção/Costura' | 'Outros';
  criticidade: 'Alta' | 'Média' | 'Baixa';
  statusQualificacao: 'Qualificado' | 'Qualificado com Restrições' | 'Não Qualificado' | 'Em Avaliação';
  dataQualificacao?: string;
  notaAvaliacao?: number; // Média das avaliações realizadas
  historicoAvaliacoes: AvaliacaoFornecedor[];
  observacoes?: string;
}

// Alias solicitado
export type Supplier = Fornecedor;
