/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { Fornecedor, AvaliacaoFornecedor } from '../../types/supplier';
import { 
  calcularEstatisticasReaisFornecedor,
  calcularProximaReavaliacao 
} from '../../utils/supplierEvaluationEngine';

interface FornecedorModalAvaliacaoProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onSaveAvaliacao: (avaliacao: AvaliacaoFornecedor) => void;
}

export const FornecedorModalAvaliacao: React.FC<FornecedorModalAvaliacaoProps> = ({
  fornecedor,
  onClose,
  onSaveAvaliacao
}) => {
  const stats = calcularEstatisticasReaisFornecedor(fornecedor);

  const [periodoReferencia, setPeriodoReferencia] = useState(
    `Ciclo ${new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
  );
  const [dataAvaliacao, setDataAvaliacao] = useState(new Date().toISOString().split('T')[0]);
  const [avaliador, setAvaliador] = useState('Qualidade (Vickytex)');

  // 5 Critérios Ponderados
  const [criterioQualidade, setCriterioQualidade] = useState<number>(stats.scoreQualidadeLotes);
  const [criterioPrazo, setCriterioPrazo] = useState<number>(stats.scorePontualidade);
  const [criterioEspecificacoes, setCriterioEspecificacoes] = useState<number>(stats.scoreEspecificacoes);
  const [criterioAtendimento, setCriterioAtendimento] = useState<number>(stats.scoreAtendimento);
  const [criterioAcoesCorretivas, setCriterioAcoesCorretivas] = useState<number>(stats.scoreAcoesCorretivas);

  const [parecerTecnico, setParecerTecnico] = useState('');
  const [foiAlimentadoAuto, setFoiAlimentadoAuto] = useState(true);

  // Preenchimento com dados estatísticos reais
  const handlePreencherAutomatico = () => {
    const s = calcularEstatisticasReaisFornecedor(fornecedor);
    if (s.totalLotes === 0) {
      setCriterioQualidade(70);
      setCriterioPrazo(70);
      setCriterioEspecificacoes(70);
      setCriterioAtendimento(70);
      setCriterioAcoesCorretivas(70);
      setFoiAlimentadoAuto(false);
      setParecerTecnico(
        `Avaliação manual preliminar. Fornecedor sem lotes inspecionados registrados. Pontuações atribuídas manualmente com base na homologação cadastral/auditoria inicial.`
      );
      return;
    }
    setCriterioQualidade(s.scoreQualidadeLotes);
    setCriterioPrazo(s.scorePontualidade);
    setCriterioEspecificacoes(s.scoreEspecificacoes);
    setCriterioAtendimento(s.scoreAtendimento);
    setCriterioAcoesCorretivas(s.scoreAcoesCorretivas);
    setFoiAlimentadoAuto(true);
    setParecerTecnico(
      `Avaliação gerada automaticamente com base em ${s.totalLotes} lote(s) inspecionado(s) e ${s.totalRNCs} RNC(s) registrada(s). Taxa de aprovação de lotes: ${s.taxaAprovacao}%, Pontualidade de entrega: ${s.taxaPontualidade}%. Classificação IQF: ${s.faixaIQF} (${s.iqfGeral}%).`
    );
  };

  useEffect(() => {
    handlePreencherAutomatico();
  }, [fornecedor]);

  // Cálculo Dinâmico do IQF
  const notaGeral = Math.round(
    (criterioQualidade * 0.40) +
    (criterioPrazo * 0.20) +
    (criterioEspecificacoes * 0.15) +
    (criterioAtendimento * 0.10) +
    (criterioAcoesCorretivas * 0.15)
  );

  let faixaIQF: 'A - Excelente' | 'B - Bom' | 'C - Regular' | 'D - Crítico' | 'Sem Avaliação' = 'Sem Avaliação';
  let resultado: 'Aprovado' | 'Aprovado com Restrições' | 'Reprovado' | 'Em Avaliação' = 'Em Avaliação';

  if (notaGeral >= 90) {
    faixaIQF = 'A - Excelente';
    resultado = 'Aprovado';
  } else if (notaGeral >= 75) {
    faixaIQF = 'B - Bom';
    resultado = 'Aprovado';
  } else if (notaGeral >= 60) {
    faixaIQF = 'C - Regular';
    resultado = 'Aprovado com Restrições';
  } else if (notaGeral > 0) {
    faixaIQF = 'D - Crítico';
    resultado = 'Reprovado';
  } else {
    faixaIQF = 'Sem Avaliação';
    resultado = 'Em Avaliação';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novaAvaliacao: AvaliacaoFornecedor = {
      id: `eval-${Date.now()}`,
      dataAvaliacao,
      periodoReferencia,
      avaliador: avaliador.trim(),
      criterioQualidade,
      criterioPrazo,
      criterioAtendimento,
      criterioEspecificacoes,
      criterioAcoesCorretivas,
      notaGeral,
      classificacaoFaixa: faixaIQF,
      resultado,
      alimentadoPorDadosReais: foiAlimentadoAuto,
      estatisticasCalculadas: {
        totalLotesInspecionados: stats.totalLotes,
        lotesAprovados: stats.lotesAprovados,
        lotesReprovados: stats.lotesReprovados,
        taxaAprovacaoLotes: stats.taxaAprovacao,
        totalRNCs: stats.totalRNCs,
        entregasNoPrazo: stats.entregasNoPrazo,
        taxaPontualidade: stats.taxaPontualidade
      },
      parecerTecnico: parecerTecnico.trim()
    };

    onSaveAvaliacao(novaAvaliacao);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Award className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Avaliação de Desempenho (IQF - ISO 8.4)</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {fornecedor.nomeFantasia || fornecedor.razaoSocial} • Criticidade {fornecedor.criticidade}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card de Cálculo Automático baseado nos dados de inspeção */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 border-b border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Alimentação Automática por Dados Reais
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              {stats.totalLotes} lotes inspecionados ({stats.taxaAprovacao}% aprovados) e {stats.totalRNCs} RNC(s) registradas.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePreencherAutomatico}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer flex items-center shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Recalcular com Dados Reais
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Identificação da Avaliação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Período de Referência *</label>
              <input 
                type="text" 
                required
                value={periodoReferencia}
                onChange={e => setPeriodoReferencia(e.target.value)}
                placeholder="Ex: 1º Trimestre / 2026"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Data da Avaliação *</label>
              <input 
                type="date" 
                required
                value={dataAvaliacao}
                onChange={e => setDataAvaliacao(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Avaliador Responsável</label>
              <input 
                type="text" 
                value={avaliador}
                onChange={e => setAvaliador(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Critérios Ponderados ISO 9001 */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Critérios de Pontuação Ponderada (0 a 100)</span>
              <span className="text-[10px] text-slate-400 normal-case">ISO 9001 - Cláusula 8.4</span>
            </h4>

            {/* Critério 1: Qualidade dos Lotes (40%) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
                  1. Qualidade de Lotes & Matéria-Prima
                  <span className="ml-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">Peso 40%</span>
                </span>
                <span className="font-extrabold font-mono text-slate-800 dark:text-slate-100">{criterioQualidade}/100</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={criterioQualidade}
                onChange={e => { setCriterioQualidade(Number(e.target.value)); setFoiAlimentadoAuto(false); }}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Reprovado (&lt;60)</span>
                <span>Taxa real de aprovação: {stats.taxaAprovacao}%</span>
                <span>Excelente (90-100)</span>
              </div>
            </div>

            {/* Critério 2: Pontualidade OTIF (20%) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
                  2. Pontualidade e Prazos de Entrega (OTIF)
                  <span className="ml-1.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.2 rounded">Peso 20%</span>
                </span>
                <span className="font-extrabold font-mono text-slate-800 dark:text-slate-100">{criterioPrazo}/100</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={criterioPrazo}
                onChange={e => { setCriterioPrazo(Number(e.target.value)); setFoiAlimentadoAuto(false); }}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Atrasos freq.</span>
                <span>Pontualidade real: {stats.taxaPontualidade}%</span>
                <span>100% no prazo</span>
              </div>
            </div>

            {/* Critério 3: Especificações Técnicas Têxteis (15%) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
                  3. Especificações Técnicas & Ficha Operacional
                  <span className="ml-1.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.2 rounded">Peso 15%</span>
                </span>
                <span className="font-extrabold font-mono text-slate-800 dark:text-slate-100">{criterioEspecificacoes}/100</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={criterioEspecificacoes}
                onChange={e => { setCriterioEspecificacoes(Number(e.target.value)); setFoiAlimentadoAuto(false); }}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Desvios técnicos</span>
                <span>Delta E, Gramatura, Medidas</span>
                <span>Em conformidade</span>
              </div>
            </div>

            {/* Critério 4: Atendimento Comercial e Suporte (10%) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
                  4. Atendimento Comercial & Flexibilidade
                  <span className="ml-1.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded">Peso 10%</span>
                </span>
                <span className="font-extrabold font-mono text-slate-800 dark:text-slate-100">{criterioAtendimento}/100</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={criterioAtendimento}
                onChange={e => { setCriterioAtendimento(Number(e.target.value)); setFoiAlimentadoAuto(false); }}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Critério 5: Resolução de Não Conformidades e Ações (15%) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
                  5. Resolução de RNCs & Eficácia de Ações Corretivas
                  <span className="ml-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded">Peso 15%</span>
                </span>
                <span className="font-extrabold font-mono text-slate-800 dark:text-slate-100">{criterioAcoesCorretivas}/100</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={criterioAcoesCorretivas}
                onChange={e => { setCriterioAcoesCorretivas(Number(e.target.value)); setFoiAlimentadoAuto(false); }}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>RNCs sem retorno</span>
                <span>RNCs Abertas: {stats.rncsAbertas}</span>
                <span>Ações 100% eficazes</span>
              </div>
            </div>
          </div>

          {/* Resultado Final Calculado */}
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Índice de Qualificação de Fornecedor (IQF)
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {notaGeral}%
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  faixaIQF === 'A - Excelente' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  faixaIQF === 'B - Bom' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                  faixaIQF === 'C - Regular' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  Faixa {faixaIQF}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Status de Homologação
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold mt-0.5 ${
                resultado === 'Aprovado' ? 'bg-emerald-600 text-white' :
                resultado === 'Aprovado com Restrições' ? 'bg-amber-500 text-white' :
                'bg-rose-600 text-white'
              }`}>
                {resultado === 'Aprovado' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                {resultado === 'Aprovado com Restrições' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                {resultado === 'Reprovado' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                {resultado}
              </span>
            </div>
          </div>

          {/* Parecer Técnico */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Parecer Técnico & Justificativa do Avaliador *
            </label>
            <textarea 
              rows={3}
              required
              value={parecerTecnico}
              onChange={e => setParecerTecnico(e.target.value)}
              placeholder="Descreva a fundamentação técnica da nota, pontos fortes e oportunidades de melhoria para o fornecedor..."
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Próxima reavaliação agendada conforme criticidade {fornecedor.criticidade}.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center"
              >
                <Award className="w-4 h-4 mr-1.5" />
                Registrar Avaliação IQF
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
