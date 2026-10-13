/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Categorias e Tipos Têxteis Vickytex
export type CategoriaFornecedor = 
  | 'Malharias e Tinturarias'
  | 'Facções e Oficinas de Costura'
  | 'Estamparias e Bordados'
  | 'Insumos e Aviamentos'
  | 'Fios e Fibras'
  | 'Produtos Químicos'
  | 'Embalagens'
  | 'Manutenção'
  | 'Calibração'
  | 'Serviços de Tinturaria'
  | 'Serviços de Facção/Costura'
  | 'Outros';

export type CriticidadeFornecedor = 'Alta' | 'Média' | 'Baixa';

export type StatusQualificacaoFornecedor = 
  | 'Qualificado'
  | 'Qualificado com Restrições'
  | 'Em Avaliação'
  | 'Não Qualificado'
  | 'Bloqueado';

export interface ContatoFornecedor {
  id: string;
  tipo: 'Comercial' | 'Qualidade' | 'Financeiro' | 'Diretoria' | 'Técnico';
  nome: string;
  email: string;
  telefone: string;
  cargo?: string;
  whatsapp?: string;
}

export type TipoDocumentoFornecedor = 
  | 'Certificado OEKO-TEX'
  | 'Licença Ambiental'
  | 'Ficha Cadastral / CNPJ'
  | 'FISPQ / FDS'
  | 'Certificado de Calibração'
  | 'Contrato Social'
  | 'Termo de Confidencialidade'
  | 'Certificado ISO 9001'
  | 'Outro';

export interface DocumentoFornecedor {
  id: string;
  tipo: TipoDocumentoFornecedor | string;
  titulo: string;
  numeroDocumento?: string;
  dataEmissao?: string;
  dataValidade?: string;
  anexoUrl?: string; // Link drive ou arquivo
  status: 'Vigente' | 'Vencendo em 30 dias' | 'Vencido' | 'Não Aplicável';
  observacoes?: string;
}

export interface CriterioQualificacao {
  id: string;
  descricao: string;
  obrigatorio: boolean;
  status: 'Conforme' | 'Não Conforme' | 'Pendente' | 'Dispensado';
  observacao?: string;
}

export interface QualificacaoInicial {
  dataInicio: string;
  dataConclusao?: string;
  criterios: CriterioQualificacao[];
  analiseTecnica?: string;
  lotePilotoStatus: 'Não Aplicável' | 'Aguardando Amostras' | 'Em Testes' | 'Aprovado' | 'Reprovado';
  auditoriaInicialStatus: 'Não Aplicável' | 'Pendente' | 'Conforme' | 'Não Conforme';
  parecerFinal?: string;
  responsavel: string;
  statusFinal: 'Em Andamento' | 'Aprovado' | 'Aprovado com Restrições' | 'Reprovado';
}

export interface AprovacaoEtapa {
  id: string;
  etapa: 'Qualidade' | 'Compras' | 'Diretoria';
  responsavelNome: string;
  data?: string;
  status: 'Pendente' | 'Aprovado' | 'Aprovado Condicional' | 'Reprovado';
  justificativa?: string;
}

// Parâmetros operacionais têxteis Vickytex por lote
export interface ParametrosTexteisLote {
  // Malharias e Tinturarias
  deltaE?: number; // Desvio de cor (ideal <= 0.8)
  gramaturaReal?: number; // g/m²
  gramaturaEspecificada?: number; // g/m²
  larguraUtilCm?: number; // cm
  composicaoConforme?: boolean;
  solidezLavagem?: number; // Escala 1-5
  solidezFriccao?: number; // Escala 1-5
  encolhimentoComprimento?: number; // % (ex: -3.5%)
  encolhimentoLargura?: number; // % (ex: -2.0%)
  
  // Facções (Costura)
  pontosPorPolegada?: number; // SPI
  conformidadeTabelaMedidas?: 'Conforme' | 'Desvio Leve' | 'Fora da Tolerância';
  qualidadeAcabamentoCostura?: 'Excelente' | 'Bom' | 'Defeituoso';
  pecasRetrabalhadas?: number;
  
  // Estamparias e Bordados
  posicionamentoEncaixe?: 'Perfeito' | 'Desvio Tolerável' | 'Fora de Posição';
  aderenciaResistenciaLavagem?: 'Excelente' | 'Normal' | 'Descascando / Trincando';
  conformidadeAmostraPadrao?: 'Idêntico' | 'Variação Aceitável' | 'Rejeitado';
  
  // Insumos e Aviamentos
  especificacaoTecnicaConforme?: boolean;
  resistenciaMaterial?: 'Conforme' | 'Abaixo do Padrão';
}

export interface InspecaoLoteFornecedor {
  id: string;
  numeroLote: string;
  notaFiscal?: string;
  dataRecebimento: string;
  quantidadeRecebida: number;
  unidade: 'kg' | 'm' | 'peças' | 'rolos' | 'un' | 'pct';
  resultado: 'Aprovado' | 'Aprovado com Restrição' | 'Reprovado';
  defeitosDetectados?: string[];
  taxaDefeitoPercentual: number;
  gerouRetrabalho: boolean;
  custoRetrabalho?: number;
  entregaNoPrazo: boolean;
  diasAtraso?: number;
  inspecionadoPor: string;
  observacoes?: string;
  parametrosTexteis?: ParametrosTexteisLote;
}

export interface OcorrenciaRNCFornecedor {
  id: string;
  codigoRNC?: string; // Link opcional para o módulo RNC
  dataOcorrencia: string;
  titulo: string;
  descricao: string;
  gravidade: 'Leve' | 'Média' | 'Grave' | 'Crítica';
  loteEnvolvido?: string;
  notaFiscal?: string;
  quantidadeAfetada?: string;
  status: 'Aberta' | 'Em Análise' | 'Aguardando Plano de Ação' | 'Resolvida';
  custoPrejuizo?: number;
  reincidente: boolean;
  exigePlanoAcao: boolean;
}

export interface PlanoAcaoFornecedor {
  id: string;
  codigo?: string;
  titulo: string;
  ocorrenciaId?: string;
  causaRaiz: string; // 5 Porquês ou Ishikawa
  acaoCorretiva: string; // O que será feito
  responsavelFornecedor: string;
  responsavelVickytex: string;
  prazo: string;
  status: 'Pendente' | 'Em Andamento' | 'Aguardando Verificação' | 'Eficaz e Concluído' | 'Ineficaz';
  dataConclusao?: string;
  verificacaoEficacia?: string;
}

export interface GestaoRiscoFornecedor {
  monossuprimento: boolean; // Fornecedor exclusivo/único
  impactoQualidade: 'Crítico (Direto no Produto)' | 'Moderado (Processo)' | 'Baixo (Suporte)';
  riscoAbastecimento: 'Alto' | 'Médio' | 'Baixo';
  planoContingencia: string;
  fornecedorSubstitutoNome?: string;
  fornecedorSubstitutoId?: string;
}

export interface BloqueioHistorico {
  id: string;
  data: string;
  tipo: 'Bloqueio Preventivo' | 'Bloqueio por Qualidade' | 'Suspensão Temporária' | 'Desbloqueio / Liberação';
  motivo: string;
  responsavel: string;
  criteriosLiberacao?: string;
}

export interface AuditoriaFornecedor {
  id: string;
  codigo: string;
  dataPlanejada: string;
  dataRealizada?: string;
  auditor: string;
  tipoAuditoria: 'Presencial (Fábrica)' | 'Remota / Documental' | 'Homologação Inicial';
  escopo: string;
  notaChecklist: number; // 0-100%
  resultado: 'Aprovado' | 'Aprovado com Ressalvas' | 'Reprovado';
  observacoes?: string;
  qtdNaoConformidades: number;
}

export interface AvaliacaoFornecedor {
  id: string;
  dataAvaliacao: string;
  periodoReferencia?: string; // ex: 1º Trimestre / 2026
  avaliador: string;
  
  // Critérios isolados (0-100)
  criterioQualidade: number; // 0-100 (qualidade dos lotes)
  criterioPrazo: number; // 0-100 (pontualidade OTIF)
  criterioAtendimento: number; // 0-100 (suporte e comercial)
  criterioEspecificacoes?: number; // 0-100 (fichas técnicas)
  criterioAcoesCorretivas?: number; // 0-100 (resolução de RNCs)
  
  notaGeral: number; // IQF Ponderado (0-100)
  classificacaoFaixa?: 'A - Excelente' | 'B - Bom' | 'C - Regular' | 'D - Crítico';
  resultado: 'Aprovado' | 'Aprovado com Restrições' | 'Reprovado';
  
  alimentadoPorDadosReais?: boolean; // Se foi calculado pelos dados de inspeção
  estatisticasCalculadas?: {
    totalLotesInspecionados: number;
    lotesAprovados: number;
    lotesReprovados: number;
    taxaAprovacaoLotes: number;
    totalRNCs: number;
    entregasNoPrazo: number;
    taxaPontualidade: number;
  };
  parecerTecnico?: string;
}

export interface ReavaliacaoConfig {
  periodicidadeMeses: number; // 3, 6 ou 12 meses
  dataUltimaReavaliacao?: string;
  dataProximaReavaliacao: string;
  status: 'Em Dia' | 'A Vencer (30d)' | 'Vencida';
}

export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual?: string;
  enderecoCompleto?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  
  // Contato principal (retrocompatibilidade)
  contatoNome: string;
  contatoEmail: string;
  contatoTelefone: string;
  contatosAdicionais?: ContatoFornecedor[];
  
  categoria: CategoriaFornecedor | string;
  subcategoria?: string;
  produtosServicosFornecidos?: string[]; // Lista de itens/tecidos fornecidos
  
  criticidade: CriticidadeFornecedor;
  statusQualificacao: StatusQualificacaoFornecedor;
  dataQualificacao?: string;
  notaAvaliacao?: number; // Média / IQF atual (0-100)
  
  // 18 Pilares ISO 9001
  documentos?: DocumentoFornecedor[];
  qualificacaoInicial?: QualificacaoInicial;
  fluxoAprovacao?: AprovacaoEtapa[];
  historicoInspecoes?: InspecaoLoteFornecedor[];
  ocorrenciasRNC?: OcorrenciaRNCFornecedor[];
  planosAcao?: PlanoAcaoFornecedor[];
  gestaoRisco?: GestaoRiscoFornecedor;
  historicoBloqueios?: BloqueioHistorico[];
  auditorias?: AuditoriaFornecedor[];
  reavaliacao?: ReavaliacaoConfig;
  
  historicoAvaliacoes: AvaliacaoFornecedor[];
  observacoes?: string;
  
  criadoEm?: string;
  atualizadoEm?: string;
}

// Alias solicitado
export type Supplier = Fornecedor;
