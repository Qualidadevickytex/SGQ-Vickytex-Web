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
  Info, 
  Plus, 
  Trash2, 
  Sliders, 
  Check,
  RotateCcw,
  ArrowRight,
  Gauge,
  Scale
} from 'lucide-react';
import { Fornecedor, InspecaoLoteFornecedor, ParametrosTexteisLote, ParametroInspecaoItem } from '../../types/supplier';

interface FornecedorModalInspecaoProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onSaveInspecao: (inspecao: InspecaoLoteFornecedor) => void;
}

// Catálogo de parâmetros pré-cadastrados por categoria têxtil Vickytex
export const CATALOGO_PARAMETROS_PRE_CADASTRADOS: Record<string, Array<{
  nome: string;
  valorPadrao: number | string;
  unidadeMedida: string;
  toleranciaMin: number | string;
  toleranciaMax: number | string;
  descricao?: string;
}>> = {
  malharia: [
    { nome: 'Gramatura Real', valorPadrao: 180, unidadeMedida: 'g/m²', toleranciaMin: 175, toleranciaMax: 185, descricao: 'Massa por metro quadrado do tecido acabado' },
    { nome: 'Largura Útil', valorPadrao: 185, unidadeMedida: 'cm', toleranciaMin: 183, toleranciaMax: 190, descricao: 'Largura útil aproveitável para corte' },
    { nome: 'Desvio de Tonalidade (Delta E)', valorPadrao: 0.0, unidadeMedida: 'ΔE', toleranciaMin: 0.0, toleranciaMax: 0.8, descricao: 'Diferença colorimétrica em espectrofotômetro' },
    { nome: 'Solidez à Lavagem', valorPadrao: 5.0, unidadeMedida: 'Escala 1-5', toleranciaMin: 4.0, toleranciaMax: 5.0, descricao: 'Resistência ao desbotamento e manchamento' },
    { nome: 'Solidez à Fricção / Atrito', valorPadrao: 5.0, unidadeMedida: 'Escala 1-5', toleranciaMin: 4.0, toleranciaMax: 5.0, descricao: 'Resistência a seco e a úmido' },
    { nome: 'Encolhimento Comprimento', valorPadrao: -2.0, unidadeMedida: '%', toleranciaMin: -4.0, toleranciaMax: 0.0, descricao: 'Variação dimensional longitudinal após lavagem' },
    { nome: 'Encolhimento Largura', valorPadrao: -1.5, unidadeMedida: '%', toleranciaMin: -3.0, toleranciaMax: 0.0, descricao: 'Variação dimensional transversal após lavagem' },
    { nome: 'Torção / Espiralidade', valorPadrao: 0, unidadeMedida: '%', toleranciaMin: 0, toleranciaMax: 3.5, descricao: 'Desvio angular das colunas de malha' },
    { nome: 'Potencial Hidrogeniônico (pH)', valorPadrao: 6.5, unidadeMedida: 'pH', toleranciaMin: 5.5, toleranciaMax: 7.5, descricao: 'Acidez/alcalinidade do tecido' }
  ],
  faccao: [
    { nome: 'Pontos por Polegada (SPI)', valorPadrao: 12, unidadeMedida: 'SPI', toleranciaMin: 11, toleranciaMax: 13, descricao: 'Densidade de pontos na costura' },
    { nome: 'Desvio em Medidas - Comprimento', valorPadrao: 0.0, unidadeMedida: 'cm', toleranciaMin: -1.0, toleranciaMax: 1.0, descricao: 'Tolerância dimensional com gabarito' },
    { nome: 'Desvio em Medidas - Tórax / Cintura', valorPadrao: 0.0, unidadeMedida: 'cm', toleranciaMin: -1.0, toleranciaMax: 1.0, descricao: 'Tolerância circunferencial conforme ficha técnica' },
    { nome: 'Alongamento / Tensão de Costura', valorPadrao: 75, unidadeMedida: '%', toleranciaMin: 60, toleranciaMax: 90, descricao: 'Capacidade de estiramento sem quebra de fio' },
    { nome: 'Peças com Retrabalho Apontadas', valorPadrao: 0, unidadeMedida: 'peças', toleranciaMin: 0, toleranciaMax: 3, descricao: 'Peças enviadas para conserto interno' }
  ],
  estamparia: [
    { nome: 'Desvio de Encaixe / Posicionamento', valorPadrao: 0.0, unidadeMedida: 'cm', toleranciaMin: -0.5, toleranciaMax: 0.5, descricao: 'Alinhamento em relação ao gabarito' },
    { nome: 'Solidez e Aderência ao Teste de Lavagem', valorPadrao: 5, unidadeMedida: 'Grau', toleranciaMin: 4, toleranciaMax: 5, descricao: 'Avaliação de trincas, descascamento ou descoloração' },
    { nome: 'Resolução e Definição do Traço', valorPadrao: 100, unidadeMedida: '%', toleranciaMin: 95, toleranciaMax: 100, descricao: 'Nítidez das linhas e bordas da estampa' },
    { nome: 'Temperatura de Termofixação', valorPadrao: 160, unidadeMedida: '°C', toleranciaMin: 155, toleranciaMax: 165, descricao: 'Temperatura da estufa de cura' }
  ],
  insumos: [
    { nome: 'Resistência à Tração do Fio/Fita', valorPadrao: 110, unidadeMedida: 'N', toleranciaMin: 95, toleranciaMax: 150, descricao: 'Força de ruptura em dinamômetro' },
    { nome: 'Metragem por Carretel/Rolo', valorPadrao: 1000, unidadeMedida: 'm', toleranciaMin: 990, toleranciaMax: 1020, descricao: 'Comprimento real aferido por embalagem' },
    { nome: 'Espessura / Título Nominal', valorPadrao: 30, unidadeMedida: 'Ne', toleranciaMin: 29, toleranciaMax: 31, descricao: 'Densidade linear do fio ou aviamento' },
    { nome: 'Elasticidade Sob Carga', valorPadrao: 15, unidadeMedida: '%', toleranciaMin: 12, toleranciaMax: 18, descricao: 'Alongamento elástico com retorno conforme' }
  ],
  geral: [
    { nome: 'Resistência ao Pilling (Bolinhas)', valorPadrao: 4.5, unidadeMedida: 'Grau', toleranciaMin: 4.0, toleranciaMax: 5.0, descricao: 'Teste em tambor rotativo Martindale' },
    { nome: 'Gramatura Linear', valorPadrao: 250, unidadeMedida: 'g/m', toleranciaMin: 240, toleranciaMax: 260, descricao: 'Peso por metro linear de tecido' },
    { nome: 'Densidade de Fios (Urdume x Trama)', valorPadrao: 45, unidadeMedida: 'fios/cm', toleranciaMin: 43, toleranciaMax: 47, descricao: 'Contagem de fios por centímetro' }
  ]
};

// Lista de unidades de medida pré-cadastradas no SGQ Têxtil Vickytex
export const UNIDADES_PRE_CADASTRADAS = [
  'g/m²',
  'cm',
  'mm',
  'm',
  'ΔE',
  '%',
  'SPI',
  'Escala 1-5',
  'Grau',
  'N',
  'kN/m',
  'kg',
  'peças',
  'pontos',
  'pH',
  '°C',
  'Ne',
  'fios/cm',
  'un'
];

export const FornecedorModalInspecao: React.FC<FornecedorModalInspecaoProps> = ({
  fornecedor,
  onClose,
  onSaveInspecao
}) => {
  const catLower = (fornecedor.categoria || '').toLowerCase();
  const isMalhariaTinturaria = catLower.includes('tinturaria') || catLower.includes('malharia') || catLower.includes('tecelagem');
  const isFaccao = catLower.includes('facção') || catLower.includes('costura');
  const isEstamparia = catLower.includes('estamparia') || catLower.includes('bordado');
  const isInsumos = catLower.includes('insumos') || catLower.includes('aviamentos') || catLower.includes('fios') || catLower.includes('químicos') || catLower.includes('embalagens');

  // Identifica a chave de categoria para presets
  const getCategoriaKey = () => {
    if (isFaccao) return 'faccao';
    if (isEstamparia) return 'estamparia';
    if (isInsumos) return 'insumos';
    return 'malharia';
  };

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
  const [inspecionadoPor, setInspecionadoPor] = useState('Garantia da Qualidade Vickytex');
  const [observacoes, setObservacoes] = useState('');
  const [defeitosDetectados, setDefeitosDetectados] = useState<string>('');

  // Função para checar conformidade automática baseada no Resultado x Tolerância Mín e Máx
  const checkStatusConformidade = (
    res: number | string, 
    min?: number | string, 
    max?: number | string
  ): 'Conforme' | 'Fora da Tolerância' | 'Alerta' => {
    const numRes = typeof res === 'number' ? res : parseFloat(String(res).replace(',', '.'));
    const numMin = typeof min === 'number' ? min : (min !== undefined && min !== '') ? parseFloat(String(min).replace(',', '.')) : undefined;
    const numMax = typeof max === 'number' ? max : (max !== undefined && max !== '') ? parseFloat(String(max).replace(',', '.')) : undefined;

    if (isNaN(numRes)) return 'Conforme';

    // Checagem estrita de mínimo e máximo
    if (numMin !== undefined && !isNaN(numMin) && numRes < numMin) {
      return 'Fora da Tolerância';
    }
    if (numMax !== undefined && !isNaN(numMax) && numRes > numMax) {
      return 'Fora da Tolerância';
    }

    // Alerta preventivo se estiver a menos de 5% das bordas do intervalo
    if (numMin !== undefined && numMax !== undefined && !isNaN(numMin) && !isNaN(numMax) && numMax > numMin) {
      const range = numMax - numMin;
      const margem = range * 0.06;
      if (numRes <= numMin + margem || numRes >= numMax - margem) {
        return 'Alerta';
      }
    }

    return 'Conforme';
  };

  // Gerar itens iniciais a partir do catálogo pré-cadastrado da categoria
  const getInitialParamItems = (): ParametroInspecaoItem[] => {
    const key = getCategoriaKey();
    const presets = CATALOGO_PARAMETROS_PRE_CADASTRADOS[key] || CATALOGO_PARAMETROS_PRE_CADASTRADOS.malharia;
    return presets.map((p, idx) => {
      // Valores simulados de teste realistas dentro da tolerância
      let valorInicial: number | string = p.valorPadrao;
      if (p.nome.includes('Delta E')) valorInicial = 0.65;
      else if (p.nome.includes('Gramatura')) valorInicial = 179;
      else if (p.nome.includes('Largura')) valorInicial = 185;
      else if (p.nome.includes('Solidez')) valorInicial = 4.5;
      else if (p.nome.includes('Comprimento')) valorInicial = -2.2;
      else if (p.nome.includes('Largura (%)')) valorInicial = -1.4;
      else if (p.nome.includes('SPI') || p.nome.includes('Pontos')) valorInicial = 12;

      const status = checkStatusConformidade(valorInicial, p.toleranciaMin, p.toleranciaMax);

      return {
        id: `param-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nome: p.nome,
        valorResultado: valorInicial,
        valorPadrao: p.valorPadrao,
        unidadeMedida: p.unidadeMedida,
        toleranciaMin: p.toleranciaMin,
        toleranciaMax: p.toleranciaMax,
        statusConformidade: status,
        observacao: ''
      };
    });
  };

  const [parametrosItens, setParametrosItens] = useState<ParametroInspecaoItem[]>(() => getInitialParamItems());

  // Atualiza campo de um parâmetro específico
  const handleUpdateParamItem = (id: string, field: keyof ParametroInspecaoItem, value: any) => {
    setParametrosItens(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'valorResultado' || field === 'toleranciaMin' || field === 'toleranciaMax') {
          updated.statusConformidade = checkStatusConformidade(
            field === 'valorResultado' ? value : updated.valorResultado,
            field === 'toleranciaMin' ? value : updated.toleranciaMin,
            field === 'toleranciaMax' ? value : updated.toleranciaMax
          );
        }
        return updated;
      }
      return item;
    }));
  };

  // Selecionar um item do catálogo pré-cadastrado para preenchimento rápido
  const handleSelectPreCadastrado = (id: string, itemSelecionadoNome: string) => {
    // Procura no catálogo geral
    const todosItens = Object.values(CATALOGO_PARAMETROS_PRE_CADASTRADOS).flat();
    const preset = todosItens.find(p => p.nome === itemSelecionadoNome);

    if (preset) {
      setParametrosItens(prev => prev.map(item => {
        if (item.id === id) {
          const status = checkStatusConformidade(preset.valorPadrao, preset.toleranciaMin, preset.toleranciaMax);
          return {
            ...item,
            nome: preset.nome,
            valorPadrao: preset.valorPadrao,
            valorResultado: preset.valorPadrao,
            unidadeMedida: preset.unidadeMedida,
            toleranciaMin: preset.toleranciaMin,
            toleranciaMax: preset.toleranciaMax,
            statusConformidade: status,
            observacao: preset.descricao || ''
          };
        }
        return item;
      }));
    } else {
      handleUpdateParamItem(id, 'nome', itemSelecionadoNome);
    }
  };

  // Adicionar novo parâmetro
  const handleAddParamItem = () => {
    const novo: ParametroInspecaoItem = {
      id: `param-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: '',
      valorResultado: 0,
      valorPadrao: 0,
      unidadeMedida: 'g/m²',
      toleranciaMin: 0,
      toleranciaMax: 0,
      statusConformidade: 'Conforme',
      observacao: ''
    };
    setParametrosItens(prev => [...prev, novo]);
  };

  // Remover parâmetro
  const handleRemoveParamItem = (id: string) => {
    setParametrosItens(prev => prev.filter(p => p.id !== id));
  };

  // Restaurar parâmetros recomendados da categoria
  const handleRestaurarPadroes = () => {
    setParametrosItens(getInitialParamItems());
  };

  // Cálculos consolidados dos parâmetros
  const totalParametros = parametrosItens.length;
  const conformesCount = parametrosItens.filter(p => p.statusConformidade === 'Conforme').length;
  const alertasCount = parametrosItens.filter(p => p.statusConformidade === 'Alerta').length;
  const foraCount = parametrosItens.filter(p => p.statusConformidade === 'Fora da Tolerância').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: ParametrosTexteisLote = {
      itensParametros: parametrosItens
    };

    // Extrair valores dos parâmetros estruturados para retrocompatibilidade com campos consolidados
    const deltaEItem = parametrosItens.find(p => p.nome.toLowerCase().includes('delta'));
    if (deltaEItem) params.deltaE = Number(deltaEItem.valorResultado);

    const gramItem = parametrosItens.find(p => p.nome.toLowerCase().includes('gramatura'));
    if (gramItem) {
      params.gramaturaReal = Number(gramItem.valorResultado);
      params.gramaturaEspecificada = Number(gramItem.valorPadrao);
    }

    const largItem = parametrosItens.find(p => p.nome.toLowerCase().includes('largura') && !p.nome.toLowerCase().includes('encolhimento'));
    if (largItem) params.larguraUtilCm = Number(largItem.valorResultado);

    const solidezItem = parametrosItens.find(p => p.nome.toLowerCase().includes('solidez'));
    if (solidezItem) params.solidezLavagem = Number(solidezItem.valorResultado);

    const encCompItem = parametrosItens.find(p => p.nome.toLowerCase().includes('encolhimento') && p.nome.toLowerCase().includes('comprimento'));
    if (encCompItem) params.encolhimentoComprimento = Number(encCompItem.valorResultado);

    const encLargItem = parametrosItens.find(p => p.nome.toLowerCase().includes('encolhimento') && p.nome.toLowerCase().includes('largura'));
    if (encLargItem) params.encolhimentoLargura = Number(encLargItem.valorResultado);

    const spiItem = parametrosItens.find(p => p.nome.toLowerCase().includes('spi') || p.nome.toLowerCase().includes('pontos'));
    if (spiItem) params.pontosPorPolegada = Number(spiItem.valorResultado);

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

  // Lista consolidada de todos os itens pré-cadastrados para o datalist
  const todosItensCatalogo = Array.from(
    new Set(
      Object.values(CATALOGO_PARAMETROS_PRE_CADASTRADOS)
        .flat()
        .map(i => i.nome)
    )
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[94vh] animate-fade-in">
        
        {/* Top Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs shadow-inner">
              <ClipboardCheck className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Ficha Técnica de Inspeção e Recebimento de Lote</h3>
              <p className="text-xs text-blue-100 flex flex-wrap items-center gap-1.5 mt-0.5">
                <span>Fornecedor: <strong>{fornecedor.nomeFantasia || fornecedor.razaoSocial}</strong></span>
                <span className="hidden sm:inline">•</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-medium">{fornecedor.categoria}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Seção 1: Dados do Lote e Recebimento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <Package className="w-4 h-4 mr-1.5 text-blue-600" />
              1. Identificação do Lote e Dados de Entrada
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nº Lote / Partida *</label>
                <input 
                  type="text" 
                  required
                  value={numeroLote}
                  onChange={e => setNumeroLote(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-semibold focus:ring-2 focus:ring-blue-500"
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
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Qtd Recebida *</label>
                <div className="flex items-center space-x-1.5">
                  <input 
                    type="number" 
                    required
                    min="0.01"
                    step="any"
                    value={quantidadeRecebida}
                    onChange={e => setQuantidadeRecebida(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                  <select 
                    value={unidade}
                    onChange={e => setUnidade(e.target.value as any)}
                    className="text-xs px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="kg">kg</option>
                    <option value="m">m</option>
                    <option value="peças">peças</option>
                    <option value="rolos">rolos</option>
                    <option value="un">un</option>
                    <option value="pct">pct</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Seção 2: PARÂMETROS ESPECÍFICOS TÊXTEIS (SOLICITADOS PELO USUÁRIO) */}
          {/* Itens (Pré cadastrado), Resultado X Padrão, Unidade de medida (Pré cadastrado), tolerâncias mínimo e máximo */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center">
                  <Sliders className="w-4 h-4 mr-1.5 text-indigo-600" />
                  2. Parâmetros e Especificações Técnicas (Resultado X Padrão & Tolerâncias)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Informe os parâmetros medidos, padrão técnico, unidade e faixas de tolerância mínima e máxima.
                </p>
              </div>

              {/* Botões de Ação dos Parâmetros */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleRestaurarPadroes}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Carregar itens pré-cadastrados padrão para esta categoria"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Carregar Padrões
                </button>
                <button
                  type="button"
                  onClick={handleAddParamItem}
                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Adicionar Parâmetro
                </button>
              </div>
            </div>

            {/* Resumo de Conformidade dos Parâmetros */}
            <div className="flex flex-wrap items-center justify-between bg-indigo-50/70 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-150 dark:border-indigo-900/50 text-xs">
              <div className="flex items-center space-x-3 text-indigo-950 dark:text-indigo-200">
                <span className="font-semibold">Status Geral dos Parâmetros:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {conformesCount} Conforme(s)
                </span>
                {alertasCount > 0 && (
                  <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {alertasCount} em Alerta
                  </span>
                )}
                {foraCount > 0 && (
                  <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> {foraCount} Fora da Tolerância
                  </span>
                )}
              </div>

              {foraCount > 0 && (
                <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                  <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
                    Ajustar resultado sugerido:
                  </span>
                  <button
                    type="button"
                    onClick={() => setResultado('Aprovado com Restrição')}
                    className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded cursor-pointer"
                  >
                    Restrição
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultado('Reprovado')}
                    className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                  >
                    Reprovar Lote
                  </button>
                </div>
              )}
            </div>

            {/* Datalist com todos os itens pré-cadastrados */}
            <datalist id="lista-parametros-pre-cadastrados">
              {todosItensCatalogo.map((itemNome, i) => (
                <option key={i} value={itemNome} />
              ))}
            </datalist>

            {/* Lista dos Cards de Parâmetros */}
            <div className="space-y-3">
              {parametrosItens.map((item, index) => {
                const numRes = typeof item.valorResultado === 'number' ? item.valorResultado : parseFloat(String(item.valorResultado).replace(',', '.'));
                const numPadrao = typeof item.valorPadrao === 'number' ? item.valorPadrao : parseFloat(String(item.valorPadrao).replace(',', '.'));
                const diferenca = (!isNaN(numRes) && !isNaN(numPadrao)) ? Number((numRes - numPadrao).toFixed(2)) : 0;
                const desvioPercentual = (!isNaN(numRes) && !isNaN(numPadrao) && numPadrao !== 0) 
                  ? Number(((diferenca / numPadrao) * 100).toFixed(1)) 
                  : null;

                return (
                  <div 
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.statusConformidade === 'Fora da Tolerância' 
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-xs'
                        : item.statusConformidade === 'Alerta'
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Linha 1: Item, Unidade de Medida, Status e Excluir */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-700/60">
                      <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          #{index + 1}
                        </span>

                        {/* Nome do Item com datalist pré-cadastrado */}
                        <div className="flex-1 w-full relative">
                          <input
                            type="text"
                            required
                            placeholder="Nome do Item / Parâmetro (ex: Gramatura Real)"
                            list="lista-parametros-pre-cadastrados"
                            value={item.nome}
                            onChange={e => handleSelectPreCadastrado(item.id, e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Seletor rápido de pré-cadastrados */}
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              handleSelectPreCadastrado(item.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                          className="text-[11px] px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                          title="Escolher do catálogo pré-cadastrado"
                        >
                          <option value="" disabled>Presets...</option>
                          <optgroup label="Malharia e Tinturaria">
                            {CATALOGO_PARAMETROS_PRE_CADASTRADOS.malharia.map((p, i) => (
                              <option key={`m-${i}`} value={p.nome}>{p.nome}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Facções e Costura">
                            {CATALOGO_PARAMETROS_PRE_CADASTRADOS.faccao.map((p, i) => (
                              <option key={`f-${i}`} value={p.nome}>{p.nome}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Estamparia e Bordados">
                            {CATALOGO_PARAMETROS_PRE_CADASTRADOS.estamparia.map((p, i) => (
                              <option key={`e-${i}`} value={p.nome}>{p.nome}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Insumos e Aviamentos">
                            {CATALOGO_PARAMETROS_PRE_CADASTRADOS.insumos.map((p, i) => (
                              <option key={`i-${i}`} value={p.nome}>{p.nome}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Outros Têxteis">
                            {CATALOGO_PARAMETROS_PRE_CADASTRADOS.geral.map((p, i) => (
                              <option key={`g-${i}`} value={p.nome}>{p.nome}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Unidade de Medida (Pré-cadastrada) e Ações */}
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <div className="flex items-center space-x-1">
                          <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Unidade:</label>
                          <select
                            value={item.unidadeMedida}
                            onChange={e => handleUpdateParamItem(item.id, 'unidadeMedida', e.target.value)}
                            className="text-xs px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-700 dark:text-slate-200"
                          >
                            {UNIDADES_PRE_CADASTRADAS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>

                        {/* Badge de Status de Conformidade */}
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center ${
                          item.statusConformidade === 'Conforme'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : item.statusConformidade === 'Alerta'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                        }`}>
                          {item.statusConformidade === 'Conforme' && <Check className="w-3.5 h-3.5 mr-1" />}
                          {item.statusConformidade === 'Alerta' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                          {item.statusConformidade === 'Fora da Tolerância' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                          {item.statusConformidade}
                        </span>

                        {/* Botão de Excluir */}
                        {parametrosItens.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParamItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remover parâmetro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Linha 2: Valores - Resultado X Padrão + Tolerância Mínimo e Máximo com Unidade */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                      
                      {/* 1. Resultado (Medido) */}
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Resultado Medido *
                        </label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            step="any"
                            required
                            value={item.valorResultado}
                            onChange={e => handleUpdateParamItem(item.id, 'valorResultado', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {item.unidadeMedida}
                          </span>
                        </div>
                      </div>

                      {/* 2. Padrão (Especificado) */}
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Padrão Especificado *
                        </label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            step="any"
                            required
                            value={item.valorPadrao}
                            onChange={e => handleUpdateParamItem(item.id, 'valorPadrao', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {item.unidadeMedida}
                          </span>
                        </div>
                      </div>

                      {/* 3. Tolerância Mínimo com Unidade de Medida */}
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Tolerância Mínima
                        </label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            step="any"
                            placeholder="Mínimo"
                            value={item.toleranciaMin ?? ''}
                            onChange={e => handleUpdateParamItem(item.id, 'toleranciaMin', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {item.unidadeMedida}
                          </span>
                        </div>
                      </div>

                      {/* 4. Tolerância Máximo com Unidade de Medida */}
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Tolerância Máxima
                        </label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            step="any"
                            placeholder="Máximo"
                            value={item.toleranciaMax ?? ''}
                            onChange={e => handleUpdateParamItem(item.id, 'toleranciaMax', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {item.unidadeMedida}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Linha 3: Comparativo Resultado X Padrão & Faixa Permitida */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-medium">Comparativo:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.valorResultado} {item.unidadeMedida}
                        </span>
                        <span className="text-slate-400">vs Padrão</span>
                        <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                          {item.valorPadrao} {item.unidadeMedida}
                        </span>
                        <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          diferenca === 0 ? 'bg-slate-100 text-slate-600' :
                          diferenca > 0 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          Δ {diferenca > 0 ? `+${diferenca}` : diferenca} {item.unidadeMedida} {desvioPercentual !== null ? `(${desvioPercentual > 0 ? `+${desvioPercentual}` : desvioPercentual}%)` : ''}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[11px]">
                        <span>Faixa aceitável:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {item.toleranciaMin !== undefined && item.toleranciaMin !== '' ? item.toleranciaMin : '-∞'} {item.unidadeMedida} até {item.toleranciaMax !== undefined && item.toleranciaMax !== '' ? item.toleranciaMax : '+∞'} {item.unidadeMedida}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção 3: Parecer da Inspeção & Pontualidade */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600" />
              3. Resultado da Inspeção e Prazo de Entrega
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
              
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
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
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
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      entregaNoPrazo ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
                    }`}
                  >
                    No Prazo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntregaNoPrazo(false)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      !entregaNoPrazo ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 font-bold' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
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
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Gerou retrabalho interno na Vickytex?</span>
                </label>

                {gerouRetrabalho && (
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Custo R$:</span>
                    <input 
                      type="number"
                      step="10"
                      min="0"
                      placeholder="Valor R$"
                      value={custoRetrabalho}
                      onChange={e => setCustoRetrabalho(Number(e.target.value))}
                      className="w-32 text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção 4: Defeitos e Observações */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <Info className="w-4 h-4 mr-1.5 text-blue-600" />
              4. Defeitos Detectados & Observações da Qualidade
            </h4>
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Inspetor / Técnico Responsável
                  </label>
                  <input 
                    type="text" 
                    value={inspecionadoPor}
                    onChange={e => setInspecionadoPor(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
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
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Parecer Técnico & Laudo de Liberação do Lote
                </label>
                <textarea 
                  rows={2}
                  placeholder="Instruções para liberação, condições de embalagem, etiquetas e destinação para a linha de produção..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Rodapé com botões de ação */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center text-xs text-slate-500">
              <Info className="w-3.5 h-3.5 mr-1 text-blue-500 shrink-0" />
              <span>{totalParametros} parâmetro(s) informados. O IQF será recalculado automaticamente.</span>
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
