/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ClipboardCheck, 
  Layers, 
  Scissors, 
  Palette, 
  Package, 
  Clock, 
  DollarSign,
  Info
} from 'lucide-react';
import { Fornecedor, InspecaoLoteFornecedor, ParametrosTexteisLote } from '../../types/supplier';

interface FornecedorModalInspecaoProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onSaveInspecao: (inspecao: InspecaoLoteFornecedor) => void;
}

export const FornecedorModalInspecao: React.FC<FornecedorModalInspecaoProps> = ({
  fornecedor,
  onClose,
  onSaveInspecao
}) => {
  const isMalhariaTinturaria = fornecedor.categoria.toLowerCase().includes('tinturaria') || fornecedor.categoria.toLowerCase().includes('malharia');
  const isFaccao = fornecedor.categoria.toLowerCase().includes('facção') || fornecedor.categoria.toLowerCase().includes('costura');
  const isEstamparia = fornecedor.categoria.toLowerCase().includes('estamparia') || fornecedor.categoria.toLowerCase().includes('bordado');
  const isInsumos = fornecedor.categoria.toLowerCase().includes('insumos') || fornecedor.categoria.toLowerCase().includes('aviamentos') || fornecedor.categoria.toLowerCase().includes('fios');

  // Dados Básicos do Lote
  const [numeroLote, setNumeroLote] = useState(`LT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notaFiscal, setNotaFiscal] = useState('');
  const [dataRecebimento, setDataRecebimento] = useState(new Date().toISOString().split('T')[0]);
  const [quantidadeRecebida, setQuantidadeRecebida] = useState<number>(1000);
  const [unidade, setUnidade] = useState<InspecaoLoteFornecedor['unidade']>(
    isFaccao ? 'peças' : isMalhariaTinturaria ? 'kg' : 'un'
  );
  const [resultado, setResultado] = useState<InspecaoLoteFornecedor['resultado']>('Aprovado');
  const [taxaDefeitoPercentual, setTaxaDefeitoPercentual] = useState<number>(0.5);
  const [gerouRetrabalho, setGerouRetrabalho] = useState<boolean>(false);
  const [custoRetrabalho, setCustoRetrabalho] = useState<number>(0);
  const [entregaNoPrazo, setEntregaNoPrazo] = useState<boolean>(true);
  const [diasAtraso, setDiasAtraso] = useState<number>(0);
  const [inspecionadoPor, setInspecionadoPor] = useState('Qualidade Vickytex');
  const [observacoes, setObservacoes] = useState('');
  const [defeitosDetectados, setDefeitosDetectados] = useState<string>('');

  // Parâmetros Específicos Vickytex
  // Malharia / Tinturaria
  const [deltaE, setDeltaE] = useState<number>(0.65);
  const [gramaturaReal, setGramaturaReal] = useState<number>(180);
  const [gramaturaEspecificada, setGramaturaEspecificada] = useState<number>(180);
  const [larguraUtilCm, setLarguraUtilCm] = useState<number>(185);
  const [composicaoConforme, setComposicaoConforme] = useState<boolean>(true);
  const [solidezLavagem, setSolidezLavagem] = useState<number>(4.5);
  const [solidezFriccao, setSolidezFriccao] = useState<number>(4.5);
  const [encolhimentoComprimento, setEncolhimentoComprimento] = useState<number>(-2.5);
  const [encolhimentoLargura, setEncolhimentoLargura] = useState<number>(-1.5);

  // Facção
  const [pontosPorPolegada, setPontosPorPolegada] = useState<number>(12);
  const [conformidadeTabelaMedidas, setConformidadeTabelaMedidas] = useState<'Conforme' | 'Desvio Leve' | 'Fora da Tolerância'>('Conforme');
  const [qualidadeAcabamentoCostura, setQualidadeAcabamentoCostura] = useState<'Excelente' | 'Bom' | 'Defeituoso'>('Excelente');
  const [pecasRetrabalhadas, setPecasRetrabalhadas] = useState<number>(0);

  // Estamparia / Bordado
  const [posicionamentoEncaixe, setPosicionamentoEncaixe] = useState<'Perfeito' | 'Desvio Tolerável' | 'Fora de Posição'>('Perfeito');
  const [aderenciaResistenciaLavagem, setAderenciaResistenciaLavagem] = useState<'Excelente' | 'Normal' | 'Descascando / Trincando'>('Excelente');
  const [conformidadeAmostraPadrao, setConformidadeAmostraPadrao] = useState<'Idêntico' | 'Variação Aceitável' | 'Rejeitado'>('Idêntico');

  // Insumos
  const [especificacaoTecnicaConforme, setEspecificacaoTecnicaConforme] = useState<boolean>(true);
  const [resistenciaMaterial, setResistenciaMaterial] = useState<'Conforme' | 'Abaixo do Padrão'>('Conforme');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: ParametrosTexteisLote = {};

    if (isMalhariaTinturaria) {
      params.deltaE = Number(deltaE);
      params.gramaturaReal = Number(gramaturaReal);
      params.gramaturaEspecificada = Number(gramaturaEspecificada);
      params.larguraUtilCm = Number(larguraUtilCm);
      params.composicaoConforme = composicaoConforme;
      params.solidezLavagem = Number(solidezLavagem);
      params.solidezFriccao = Number(solidezFriccao);
      params.encolhimentoComprimento = Number(encolhimentoComprimento);
      params.encolhimentoLargura = Number(encolhimentoLargura);
    } else if (isFaccao) {
      params.pontosPorPolegada = Number(pontosPorPolegada);
      params.conformidadeTabelaMedidas = conformidadeTabelaMedidas;
      params.qualidadeAcabamentoCostura = qualidadeAcabamentoCostura;
      params.pecasRetrabalhadas = Number(pecasRetrabalhadas);
    } else if (isEstamparia) {
      params.posicionamentoEncaixe = posicionamentoEncaixe;
      params.aderenciaResistenciaLavagem = aderenciaResistenciaLavagem;
      params.conformidadeAmostraPadrao = conformidadeAmostraPadrao;
    } else {
      params.especificacaoTecnicaConforme = especificacaoTecnicaConforme;
      params.resistenciaMaterial = resistenciaMaterial;
    }

    const novaInspecao: InspecaoLoteFornecedor = {
      id: `insp-${Date.now()}`,
      numeroLote: numeroLote.trim(),
      notaFiscal: notaFiscal.trim() || undefined,
      dataRecebimento,
      quantidadeRecebida: Number(quantidadeRecebida),
      unidade,
      resultado,
      defeitosDetectados: defeitosDetectados ? defeitosDetectados.split(',').map(s => s.trim()).filter(Boolean) : [],
      taxaDefeitoPercentual: Number(taxaDefeitoPercentual),
      gerouRetrabalho,
      custoRetrabalho: gerouRetrabalho ? Number(custoRetrabalho) : 0,
      entregaNoPrazo,
      diasAtraso: entregaNoPrazo ? 0 : Number(diasAtraso),
      inspecionadoPor: inspecionadoPor.trim(),
      observacoes: observacoes.trim(),
      parametrosTexteis: params
    };

    onSaveInspecao(novaInspecao);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <ClipboardCheck className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Registrar Inspeção de Recebimento de Lote</h3>
              <p className="text-xs text-blue-100 flex items-center mt-0.5">
                <span>Fornecedor: <strong>{fornecedor.nomeFantasia || fornecedor.razaoSocial}</strong></span>
                <span className="mx-2">•</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-medium">{fornecedor.categoria}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Seção 1: Dados do Lote e Recebimento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <Package className="w-4 h-4 mr-1.5 text-blue-600" />
              Identificação do Lote e NF
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nº Lote / Partida *</label>
                <input 
                  type="text" 
                  required
                  value={numeroLote}
                  onChange={e => setNumeroLote(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nota Fiscal</label>
                <input 
                  type="text" 
                  placeholder="Ex: NF-12490"
                  value={notaFiscal}
                  onChange={e => setNotaFiscal(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Data Recebimento *</label>
                <input 
                  type="date" 
                  required
                  value={dataRecebimento}
                  onChange={e => setDataRecebimento(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Qtd Recebida *</label>
                <input 
                  type="number" 
                  required
                  min="0.01"
                  step="any"
                  value={quantidadeRecebida}
                  onChange={e => setQuantidadeRecebida(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Unidade *</label>
                <select 
                  value={unidade}
                  onChange={e => setUnidade(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="kg">kg (Quilogramas)</option>
                  <option value="m">m (Metros)</option>
                  <option value="peças">peças (Unidades Costuradas)</option>
                  <option value="rolos">rolos (Peças de Tecido)</option>
                  <option value="un">un (Unidades)</option>
                  <option value="pct">pct (Pacotes)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Inspetor Responsável</label>
                <input 
                  type="text" 
                  value={inspecionadoPor}
                  onChange={e => setInspecionadoPor(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Particularidades Técnicas Têxteis Vickytex */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
                {isMalhariaTinturaria && <Palette className="w-4 h-4 mr-1.5 text-indigo-600" />}
                {isFaccao && <Scissors className="w-4 h-4 mr-1.5 text-indigo-600" />}
                {isEstamparia && <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />}
                {isInsumos && <Package className="w-4 h-4 mr-1.5 text-indigo-600" />}
                Parâmetros de Qualidade Têxtil Vickytex ({fornecedor.categoria})
              </h4>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                Personalizado para {fornecedor.categoria}
              </span>
            </div>

            {/* CASO 1: Malharias e Tinturarias */}
            {isMalhariaTinturaria && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-150 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Desvio de Tonalidade (Delta E)
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={deltaE}
                      onChange={e => setDeltaE(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                    <span className="text-[11px] text-slate-500 font-mono">ΔE</span>
                  </div>
                  <span className={`text-[10px] block mt-1 font-semibold ${deltaE <= 0.8 ? 'text-emerald-600' : deltaE <= 1.2 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {deltaE <= 0.8 ? '✓ Dentro da tolerância (≤ 0.80)' : deltaE <= 1.2 ? '⚠ Alerta leve (0.81 - 1.20)' : '✕ Fora da tolerância (> 1.20)'}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gramatura Real (g/m²)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      value={gramaturaReal}
                      onChange={e => setGramaturaReal(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">vs meta {gramaturaEspecificada}g</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Largura Útil (cm)
                  </label>
                  <input 
                    type="number" 
                    value={larguraUtilCm}
                    onChange={e => setLarguraUtilCm(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Solidez à Lavagem (1 a 5)
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max="5"
                    step="0.5"
                    value={solidezLavagem}
                    onChange={e => setSolidezLavagem(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Escala de cinzas (mín. 4.0)</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Encolhimento Comprimento (%)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={encolhimentoComprimento}
                    onChange={e => setEncolhimentoComprimento(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Máx tolerado: -4.0%</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Encolhimento Largura (%)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={encolhimentoLargura}
                    onChange={e => setEncolhimentoLargura(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Máx tolerado: -3.0%</span>
                </div>
              </div>
            )}

            {/* CASO 2: Facções de Costura */}
            {isFaccao && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-150 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pontos por Polegada (SPI)
                  </label>
                  <input 
                    type="number" 
                    value={pontosPorPolegada}
                    onChange={e => setPontosPorPolegada(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Padrão Vickytex: 11 a 13 pontos/pol</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tabela de Medidas / Gabarito
                  </label>
                  <select 
                    value={conformidadeTabelaMedidas}
                    onChange={e => setConformidadeTabelaMedidas(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Conforme">Conforme (Dentro da tolerância ±1cm)</option>
                    <option value="Desvio Leve">Desvio Leve (Tolerável sob triagem)</option>
                    <option value="Fora da Tolerância">Fora da Tolerância (Peças tortas/fora)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Acabamento Geral das Costuras
                  </label>
                  <select 
                    value={qualidadeAcabamentoCostura}
                    onChange={e => setQualidadeAcabamentoCostura(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Excelente">Excelente (Sem fios soltos, costura limpa)</option>
                    <option value="Bom">Bom (Pequenos arremates necessários)</option>
                    <option value="Defeituoso">Defeituoso (Pontos pulados / costura frouxa)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Peças com Retrabalho Apontadas
                  </label>
                  <input 
                    type="number" 
                    value={pecasRetrabalhadas}
                    onChange={e => setPecasRetrabalhadas(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Unidades enviadas para conserto na facção</span>
                </div>
              </div>
            )}

            {/* CASO 3: Estamparias e Bordados */}
            {isEstamparia && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-150 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Posicionamento e Encaixe
                  </label>
                  <select 
                    value={posicionamentoEncaixe}
                    onChange={e => setPosicionamentoEncaixe(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Perfeito">Perfeito (Centralizado conforme ficha)</option>
                    <option value="Desvio Tolerável">Desvio Tolerável (± 0.5cm)</option>
                    <option value="Fora de Posição">Fora de Posição (Estampa desalinhada)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Aderência e Teste de Lavagem
                  </label>
                  <select 
                    value={aderenciaResistenciaLavagem}
                    onChange={e => setAderenciaResistenciaLavagem(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Excelente">Excelente (Toque macio, sem rachaduras)</option>
                    <option value="Normal">Normal (Aceitável)</option>
                    <option value="Descascando / Trincando">Descascando / Trincando (Reprovado)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Conformidade com Amostra Padrão
                  </label>
                  <select 
                    value={conformidadeAmostraPadrao}
                    onChange={e => setConformidadeAmostraPadrao(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Idêntico">Idêntico ao Strike-off aprovado</option>
                    <option value="Variação Aceitável">Variação Aceitável</option>
                    <option value="Rejeitado">Rejeitado (Cor/efeito divergente)</option>
                  </select>
                </div>
              </div>
            )}

            {/* CASO 4: Insumos e Aviamentos */}
            {isInsumos && !isMalhariaTinturaria && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-150 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Especificações Técnicas do Aviamento
                  </label>
                  <select 
                    value={especificacaoTecnicaConforme ? 'true' : 'false'}
                    onChange={e => setEspecificacaoTecnicaConforme(e.target.value === 'true')}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="true">Conforme (Ficha técnica atendida 100%)</option>
                    <option value="false">Divergente das especificações</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Resistência e Tração do Material
                  </label>
                  <select 
                    value={resistenciaMaterial}
                    onChange={e => setResistenciaMaterial(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Conforme">Conforme (Aprovado em ensaio dinâmico)</option>
                    <option value="Abaixo do Padrão">Abaixo do Padrão (Risco de quebra)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Seção 3: Parecer da Inspeção & Pontualidade */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600" />
              Resultado da Inspeção e Prazo de Entrega
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
              
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Resultado do Lote *</label>
                <select 
                  value={resultado}
                  onChange={e => setResultado(e.target.value as any)}
                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border ${
                    resultado === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    resultado === 'Aprovado com Restrição' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400' :
                    'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400'
                  }`}
                >
                  <option value="Aprovado">✓ Aprovado (100% Conforme)</option>
                  <option value="Aprovado com Restrição">⚠ Aprovado com Restrição (Condicional)</option>
                  <option value="Reprovado">✕ Reprovado (Rejeitado / Devolução)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Taxa de Defeitos (%)</label>
                <div className="flex items-center space-x-1.5">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxaDefeitoPercentual}
                    onChange={e => setTaxaDefeitoPercentual(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <span className="text-xs text-slate-500 font-mono">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Pontualidade da Entrega</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEntregaNoPrazo(true)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      entregaNoPrazo ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
                    }`}
                  >
                    No Prazo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntregaNoPrazo(false)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      !entregaNoPrazo ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
                    }`}
                  >
                    Atrasada
                  </button>
                </div>
              </div>

              {!entregaNoPrazo && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Dias de Atraso</label>
                  <input 
                    type="number" 
                    min="1"
                    value={diasAtraso}
                    onChange={e => setDiasAtraso(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              )}

              <div className="sm:col-span-2 flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={gerouRetrabalho}
                    onChange={e => setGerouRetrabalho(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Gerou retrabalho interno na Vickytex?</span>
                </label>

                {gerouRetrabalho && (
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-xs text-slate-500">Custo estimado: R$</span>
                    <input 
                      type="number"
                      step="10"
                      min="0"
                      placeholder="Valor R$"
                      value={custoRetrabalho}
                      onChange={e => setCustoRetrabalho(Number(e.target.value))}
                      className="w-32 text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção 4: Defeitos e Observações */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Defeitos Detectados (separar por vírgula)
              </label>
              <input 
                type="text" 
                placeholder="Ex: Tonalidade barrada, manchas de óleo, costura solta, furo no tecido"
                value={defeitosDetectados}
                onChange={e => setDefeitosDetectados(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Parecer Técnico & Observações do Inspetor
              </label>
              <textarea 
                rows={3}
                placeholder="Detalhes sobre a liberação, condições das embalagens, etiquetas ou orientações para a produção..."
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rodapé com botões de ação */}
          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-500">
              <Info className="w-3.5 h-3.5 mr-1 text-blue-500" />
              <span>Esta inspeção atualizará o IQF automaticamente sem retrabalho manual.</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center"
              >
                <ClipboardCheck className="w-4 h-4 mr-1.5" />
                Gravar Inspeção de Lote
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
