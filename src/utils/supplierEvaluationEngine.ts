/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fornecedor, AvaliacaoFornecedor } from '../types/supplier';

export interface ResumoEstatisticasFornecedor {
  totalLotes: number;
  lotesAprovados: number;
  lotesComRestricao: number;
  lotesReprovados: number;
  taxaAprovacao: number; // 0-100%
  taxaDefeitoMedia: number; // %
  totalRetrabalho: number; // qtd lotes que geraram retrabalho
  custoTotalRetrabalho: number; // R$
  totalEntregas: number;
  entregasNoPrazo: number;
  taxaPontualidade: number; // 0-100%
  
  // RNCs
  totalRNCs: number;
  rncsAbertas: number;
  rncsCriticas: number;
  
  // Planos de Ação
  totalPlanos: number;
  planosConcluidos: number;
  taxaEficaciaPlanos: number; // 0-100%
  
  // Documentos
  documentosVencidos: number;
  documentosVencendo: number;
  
  // IQF Calculado Automaticamente
  scoreQualidadeLotes: number;
  scorePontualidade: number;
  scoreEspecificacoes: number;
  scoreAtendimento: number;
  scoreAcoesCorretivas: number;
  iqfGeral: number;
  faixaIQF: 'A - Excelente' | 'B - Bom' | 'C - Regular' | 'D - Crítico' | 'Sem Avaliação';
  resultadoSugerido: 'Aprovado' | 'Aprovado com Restrições' | 'Reprovado' | 'Em Avaliação';
  temHistoricoValido: boolean;
}

/**
 * Motor de Cálculo Estatístico Automatizado ISO 9001 (Cláusula 8.4)
 * Alimenta a nota real do fornecedor a partir das inspeções e RNCs registradas,
 * eliminando a subjetividade e retrabalho manual.
 * 
 * Se o fornecedor tiver 0 lotes inspecionados e nenhuma avaliação manual,
 * o IQF retorna 0 / "Sem Avaliação", impedindo falsas qualificações no SGQ.
 */
export function calcularEstatisticasReaisFornecedor(f: Fornecedor): ResumoEstatisticasFornecedor {
  const inspecoes = Array.isArray(f.historicoInspecoes) ? f.historicoInspecoes : [];
  const rncs = Array.isArray(f.ocorrenciasRNC) ? f.ocorrenciasRNC : [];
  const planos = Array.isArray(f.planosAcao) ? f.planosAcao : [];
  const docs = Array.isArray(f.documentos) ? f.documentos : [];

  // 1. Métricas de Inspeção de Lotes
  const totalLotes = inspecoes.length;
  const lotesAprovados = inspecoes.filter(i => i.resultado === 'Aprovado').length;
  const lotesComRestricao = inspecoes.filter(i => i.resultado === 'Aprovado com Restrição').length;
  const lotesReprovados = inspecoes.filter(i => i.resultado === 'Reprovado').length;

  // Taxa de aprovação ponderada: aprovado vale 100%, com restrição vale 60%
  // Se não há lotes inspecionados, a taxa de aprovação é 0% (nunca usar valor fictício)
  const taxaAprovacao = totalLotes > 0 
    ? Math.round(((lotesAprovados + (lotesComRestricao * 0.6)) / totalLotes) * 100)
    : 0;

  const taxaDefeitoMedia = totalLotes > 0
    ? Number((inspecoes.reduce((acc, i) => acc + (i.taxaDefeitoPercentual || 0), 0) / totalLotes).toFixed(1))
    : 0;

  const totalRetrabalho = inspecoes.filter(i => i.gerouRetrabalho).length;
  const custoTotalRetrabalho = inspecoes.reduce((acc, i) => acc + (i.custoRetrabalho || 0), 0);

  // 2. Pontualidade (OTIF)
  const totalEntregas = inspecoes.length;
  const entregasNoPrazo = inspecoes.filter(i => i.entregaNoPrazo).length;
  const taxaPontualidade = totalEntregas > 0
    ? Math.round((entregasNoPrazo / totalEntregas) * 100)
    : 0;

  // 3. Não Conformidades
  const totalRNCs = rncs.length;
  const rncsAbertas = rncs.filter(r => r.status !== 'Resolvida').length;
  const rncsCriticas = rncs.filter(r => r.gravidade === 'Crítica' || r.gravidade === 'Grave').length;

  // 4. Planos de Ação
  const totalPlanos = planos.length;
  const planosConcluidos = planos.filter(p => p.status === 'Eficaz e Concluído').length;
  const taxaEficaciaPlanos = totalPlanos > 0
    ? Math.round((planosConcluidos / totalPlanos) * 100)
    : 100;

  // 5. Documentos
  const hoje = new Date().toISOString().split('T')[0];
  let documentosVencidos = 0;
  let documentosVencendo = 0;

  docs.forEach(doc => {
    if (!doc.dataValidade) return;
    const diffDays = Math.ceil((new Date(doc.dataValidade).getTime() - new Date(hoje).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) documentosVencidos++;
    else if (diffDays <= 30) documentosVencendo++;
  });

  // Filtrar avaliações válidas (ignorar avaliações automáticas espúrias geradas com 0 lotes)
  const avaliacoesValidas = (f.historicoAvaliacoes || []).filter(a => {
    if (a.alimentadoPorDadosReais) {
      return (a.estatisticasCalculadas?.totalLotesInspecionados || 0) > 0;
    }
    return true; // Avaliação manual feita pelo usuário
  });

  // Um fornecedor só tem histórico estatístico se possui lotes inspecionados OU avaliação manual válida
  const temHistoricoValido = totalLotes > 0 || avaliacoesValidas.length > 0;

  // 6. Cálculo dos Scores dos 5 Critérios (0 a 100)
  let scoreQualidadeLotes = 0;
  let scorePontualidade = 0;
  let scoreEspecificacoes = 0;
  let scoreAtendimento = 0;
  let scoreAcoesCorretivas = 0;

  if (totalLotes > 0) {
    scoreQualidadeLotes = Math.max(0, Math.min(100, Math.round(taxaAprovacao - (taxaDefeitoMedia * 2))));
    scorePontualidade = Math.max(0, Math.min(100, taxaPontualidade));

    let desviosTecnicos = 0;
    inspecoes.forEach(insp => {
      const p = insp.parametrosTexteis;
      if (p) {
        if (p.deltaE && p.deltaE > 1.0) desviosTecnicos++;
        if (p.conformidadeTabelaMedidas === 'Fora da Tolerância') desviosTecnicos++;
        if (p.aderenciaResistenciaLavagem === 'Descascando / Trincando') desviosTecnicos++;
        if (p.especificacaoTecnicaConforme === false) desviosTecnicos++;
        if (p.itensParametros && Array.isArray(p.itensParametros)) {
          p.itensParametros.forEach(item => {
            if (item.statusConformidade === 'Fora da Tolerância') desviosTecnicos++;
          });
        }
      }
    });
    scoreEspecificacoes = Math.max(40, Math.min(100, 100 - (desviosTecnicos * 12)));
    scoreAtendimento = 90;
    const penalidadeRNC = (rncsCriticas * 12) + (rncsAbertas * 6);
    scoreAcoesCorretivas = Math.max(20, Math.min(100, Math.round(taxaEficaciaPlanos - penalidadeRNC)));
  } else if (avaliacoesValidas.length > 0) {
    const ultimaManual = avaliacoesValidas[0];
    scoreQualidadeLotes = ultimaManual.criterioQualidade || 0;
    scorePontualidade = ultimaManual.criterioPrazo || 0;
    scoreEspecificacoes = ultimaManual.criterioEspecificacoes || 0;
    scoreAtendimento = ultimaManual.criterioAtendimento || 0;
    scoreAcoesCorretivas = ultimaManual.criterioAcoesCorretivas || 0;
  }

  // Penalidade documental se houver doc vencido
  if (documentosVencidos > 0 && scoreEspecificacoes > 0) {
    scoreEspecificacoes = Math.max(20, scoreEspecificacoes - (documentosVencidos * 10));
  }

  // 7. IQF Geral Ponderado (ISO 9001 Vickytex):
  // 40% Qualidade de Lotes + 20% Pontualidade + 15% Especificações + 10% Atendimento + 15% RNCs/Ações
  const iqfGeral = !temHistoricoValido ? 0 : Math.max(0, Math.min(100, Math.round(
    (scoreQualidadeLotes * 0.40) +
    (scorePontualidade * 0.20) +
    (scoreEspecificacoes * 0.15) +
    (scoreAtendimento * 0.10) +
    (scoreAcoesCorretivas * 0.15)
  )));

  let faixaIQF: 'A - Excelente' | 'B - Bom' | 'C - Regular' | 'D - Crítico' | 'Sem Avaliação' = 'Sem Avaliação';
  let resultadoSugerido: 'Aprovado' | 'Aprovado com Restrições' | 'Reprovado' | 'Em Avaliação' = 'Em Avaliação';

  if (!temHistoricoValido) {
    faixaIQF = 'Sem Avaliação';
    resultadoSugerido = 'Em Avaliação';
  } else if (iqfGeral >= 90) {
    faixaIQF = 'A - Excelente';
    resultadoSugerido = 'Aprovado';
  } else if (iqfGeral >= 75) {
    faixaIQF = 'B - Bom';
    resultadoSugerido = 'Aprovado';
  } else if (iqfGeral >= 60) {
    faixaIQF = 'C - Regular';
    resultadoSugerido = 'Aprovado com Restrições';
  } else {
    faixaIQF = 'D - Crítico';
    resultadoSugerido = 'Reprovado';
  }

  return {
    totalLotes,
    lotesAprovados,
    lotesComRestricao,
    lotesReprovados,
    taxaAprovacao,
    taxaDefeitoMedia,
    totalRetrabalho,
    custoTotalRetrabalho,
    totalEntregas,
    entregasNoPrazo,
    taxaPontualidade,
    totalRNCs,
    rncsAbertas,
    rncsCriticas,
    totalPlanos,
    planosConcluidos,
    taxaEficaciaPlanos,
    documentosVencidos,
    documentosVencendo,
    scoreQualidadeLotes,
    scorePontualidade,
    scoreEspecificacoes,
    scoreAtendimento,
    scoreAcoesCorretivas,
    iqfGeral,
    faixaIQF,
    resultadoSugerido,
    temHistoricoValido
  };
}

/**
 * Gera uma nova avaliação completa alimentada automaticamente pelos dados reais de inspeção
 */
export function criarAvaliacaoAutomaticaPorDadosReais(
  fornecedor: Fornecedor,
  avaliadorNome: string = 'Qualidade (Vickytex)'
): AvaliacaoFornecedor {
  const stats = calcularEstatisticasReaisFornecedor(fornecedor);
  const dataHoje = new Date().toISOString().split('T')[0];

  const parecerTecnico = stats.totalLotes > 0
    ? `Avaliação gerada automaticamente com base em ${stats.totalLotes} lote(s) inspecionado(s) e ${stats.totalRNCs} RNC(s) registrada(s). Taxa de aprovação de lotes: ${stats.taxaAprovacao}%, Pontualidade de entrega: ${stats.taxaPontualidade}%. Classificação IQF: ${stats.faixaIQF} (${stats.iqfGeral}%).`
    : `Fornecedor sem lotes inspecionados registrados. Status mantido em "Em Avaliação" até que inspeções de lotes têxteis sejam cadastradas.`;

  return {
    id: `eval-auto-${Date.now()}`,
    dataAvaliacao: dataHoje,
    periodoReferencia: `Ciclo Automático ${new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`,
    avaliador: avaliadorNome,
    criterioQualidade: stats.scoreQualidadeLotes,
    criterioPrazo: stats.scorePontualidade,
    criterioAtendimento: stats.scoreAtendimento,
    criterioEspecificacoes: stats.scoreEspecificacoes,
    criterioAcoesCorretivas: stats.scoreAcoesCorretivas,
    notaGeral: stats.iqfGeral,
    classificacaoFaixa: stats.faixaIQF,
    resultado: stats.resultadoSugerido,
    alimentadoPorDadosReais: true,
    estatisticasCalculadas: {
      totalLotesInspecionados: stats.totalLotes,
      lotesAprovados: stats.lotesAprovados,
      lotesReprovados: stats.lotesReprovados,
      taxaAprovacaoLotes: stats.taxaAprovacao,
      totalRNCs: stats.totalRNCs,
      entregasNoPrazo: stats.entregasNoPrazo,
      taxaPontualidade: stats.taxaPontualidade
    },
    parecerTecnico
  };
}

/**
 * Calcula a próxima data de reavaliação periódica baseada na criticidade do fornecedor
 */
export function calcularProximaReavaliacao(criticidade: 'Alta' | 'Média' | 'Baixa', dataBase?: string): {
  periodicidadeMeses: number;
  dataProxima: string;
} {
  const base = dataBase ? new Date(dataBase) : new Date();
  let meses = 6;
  if (criticidade === 'Alta') meses = 3;
  else if (criticidade === 'Média') meses = 6;
  else meses = 12;

  const proxima = new Date(base);
  proxima.setMonth(proxima.getMonth() + meses);

  return {
    periodicidadeMeses: meses,
    dataProxima: proxima.toISOString().split('T')[0]
  };
}

/**
 * Alertas e Pendências ISO 9001 de um Fornecedor
 */
export function extrairAlertasFornecedor(f: Fornecedor): Array<{
  id: string;
  tipo: 'documento_vencido' | 'documento_vencendo' | 'reavaliacao_vencida' | 'rnc_aberta' | 'bloqueio' | 'lote_reprovado';
  gravidade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
}> {
  const alertas: Array<{
    id: string;
    tipo: 'documento_vencido' | 'documento_vencendo' | 'reavaliacao_vencida' | 'rnc_aberta' | 'bloqueio' | 'lote_reprovado';
    gravidade: 'alta' | 'media' | 'baixa';
    titulo: string;
    descricao: string;
  }> = [];

  const hoje = new Date().toISOString().split('T')[0];

  // 1. Status de Bloqueio
  if (f.statusQualificacao === 'Bloqueado') {
    alertas.push({
      id: `alerta-bloq-${f.id}`,
      tipo: 'bloqueio',
      gravidade: 'alta',
      titulo: 'Fornecedor Bloqueado / Suspenso',
      descricao: 'Compras e emissão de OPs estão suspensas para este fornecedor.'
    });
  }

  // 2. Documentos
  if (Array.isArray(f.documentos)) {
    f.documentos.forEach(doc => {
      if (!doc.dataValidade) return;
      const diffDays = Math.ceil((new Date(doc.dataValidade).getTime() - new Date(hoje).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        alertas.push({
          id: `alerta-doc-venc-${doc.id}`,
          tipo: 'documento_vencido',
          gravidade: 'alta',
          titulo: `Documento Vencido: ${doc.tipo}`,
          descricao: `O documento "${doc.titulo}" venceu em ${doc.dataValidade}.`
        });
      } else if (diffDays <= 30) {
        alertas.push({
          id: `alerta-doc-vencendo-${doc.id}`,
          tipo: 'documento_vencendo',
          gravidade: 'media',
          titulo: `Documento a Vencer: ${doc.tipo}`,
          descricao: `O documento "${doc.titulo}" expira em ${diffDays} dias (${doc.dataValidade}).`
        });
      }
    });
  }

  // 3. Reavaliação periódica
  if (f.reavaliacao?.dataProximaReavaliacao) {
    const diffDays = Math.ceil((new Date(f.reavaliacao.dataProximaReavaliacao).getTime() - new Date(hoje).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      alertas.push({
        id: `alerta-reav-venc-${f.id}`,
        tipo: 'reavaliacao_vencida',
        gravidade: 'alta',
        titulo: 'Reavaliação Periódica Vencida',
        descricao: `A reavaliação periódica ISO 8.4 deveria ter ocorrido até ${f.reavaliacao.dataProximaReavaliacao}.`
      });
    }
  }

  // 4. RNCs Abertas
  if (Array.isArray(f.ocorrenciasRNC)) {
    const abertas = f.ocorrenciasRNC.filter(r => r.status !== 'Resolvida');
    if (abertas.length > 0) {
      alertas.push({
        id: `alerta-rnc-aberta-${f.id}`,
        tipo: 'rnc_aberta',
        gravidade: abertas.some(r => r.gravidade === 'Crítica' || r.gravidade === 'Grave') ? 'alta' : 'media',
        titulo: `${abertas.length} RNC(s) Pendente(s)`,
        descricao: `Fornecedor possui ocorrências com plano de ação ou tratativa pendente.`
      });
    }
  }

  return alertas;
}

/**
 * Exportação dos fornecedores para CSV (compatível com Excel)
 */
export function exportarFornecedoresCSV(fornecedores: Fornecedor[]): void {
  const headers = [
    'Código/ID',
    'Razão Social',
    'Nome Fantasia',
    'CNPJ',
    'Inscrição Estadual',
    'Cidade/UF',
    'Categoria',
    'Criticidade',
    'Status Qualificação',
    'IQF (Nota %)',
    'Faixa',
    'Contato Nome',
    'Contato Email',
    'Contato Telefone',
    'Total Lotes Inspecionados',
    'Lotes Aprovados',
    'Lotes Reprovados',
    'Taxa Aprovação (%)',
    'Total RNCs',
    'Data Qualificação',
    'Próxima Reavaliação'
  ];

  const rows = fornecedores.map(f => {
    const stats = calcularEstatisticasReaisFornecedor(f);
    return [
      `"${f.id}"`,
      `"${f.razaoSocial || ''}"`,
      `"${f.nomeFantasia || ''}"`,
      `"${f.cnpj || ''}"`,
      `"${f.inscricaoEstadual || ''}"`,
      `"${f.cidade || ''}/${f.uf || ''}"`,
      `"${f.categoria || ''}"`,
      `"${f.criticidade || ''}"`,
      `"${f.statusQualificacao || ''}"`,
      stats.iqfGeral,
      `"${stats.faixaIQF}"`,
      `"${f.contatoNome || ''}"`,
      `"${f.contatoEmail || ''}"`,
      `"${f.contatoTelefone || ''}"`,
      stats.totalLotes,
      stats.lotesAprovados,
      stats.lotesReprovados,
      `${stats.taxaAprovacao}%`,
      stats.totalRNCs,
      `"${f.dataQualificacao || ''}"`,
      `"${f.reavaliacao?.dataProximaReavaliacao || ''}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `fornecedores_vickytex_iso9001_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
