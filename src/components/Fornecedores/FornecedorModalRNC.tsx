/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  FileWarning, 
  Tag, 
  Layers, 
  DollarSign,
  ClipboardList
} from 'lucide-react';
import { Fornecedor, OcorrenciaRNCFornecedor, PlanoAcaoFornecedor } from '../../types/supplier';

interface FornecedorModalRNCProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onSaveRNC: (rnc: OcorrenciaRNCFornecedor, planoAcao?: PlanoAcaoFornecedor) => void;
}

export const FornecedorModalRNC: React.FC<FornecedorModalRNCProps> = ({
  fornecedor,
  onClose,
  onSaveRNC
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [gravidade, setGravidade] = useState<OcorrenciaRNCFornecedor['gravidade']>('Grave');
  const [dataOcorrencia, setDataOcorrencia] = useState(new Date().toISOString().split('T')[0]);
  const [codigoRNC, setCodigoRNC] = useState(`RNC-FORN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [loteEnvolvido, setLoteEnvolvido] = useState('');
  const [notaFiscal, setNotaFiscal] = useState('');
  const [quantidadeAfetada, setQuantidadeAfetada] = useState('');
  const [custoPrejuizo, setCustoPrejuizo] = useState<number>(0);
  const [reincidente, setReincidente] = useState<boolean>(false);
  const [exigePlanoAcao, setExigePlanoAcao] = useState<boolean>(true);

  // Plano de Ação inicial (se exigido)
  const [causaRaiz, setCausaRaiz] = useState('');
  const [acaoCorretiva, setAcaoCorretiva] = useState('');
  const [prazoPlano, setPrazoPlano] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [responsavelFornecedor, setResponsavelFornecedor] = useState(fornecedor.contatoNome || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rncId = `rnc-${Date.now()}`;
    const novaRnc: OcorrenciaRNCFornecedor = {
      id: rncId,
      codigoRNC: codigoRNC.trim(),
      dataOcorrencia,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      gravidade,
      loteEnvolvido: loteEnvolvido.trim() || undefined,
      notaFiscal: notaFiscal.trim() || undefined,
      quantidadeAfetada: quantidadeAfetada.trim() || undefined,
      status: exigePlanoAcao ? 'Aguardando Plano de Ação' : 'Aberta',
      custoPrejuizo: Number(custoPrejuizo) || 0,
      reincidente,
      exigePlanoAcao
    };

    let plano: PlanoAcaoFornecedor | undefined = undefined;
    if (exigePlanoAcao && (causaRaiz.trim() || acaoCorretiva.trim())) {
      plano = {
        id: `pa-${Date.now()}`,
        codigo: `CAPA-${codigoRNC.replace('RNC-', '')}`,
        titulo: `Plano de Ação Corretiva para ${titulo.trim()}`,
        ocorrenciaId: rncId,
        causaRaiz: causaRaiz.trim() || 'Em investigação pelo fornecedor (5 Porquês / Ishikawa).',
        acaoCorretiva: acaoCorretiva.trim() || 'Aguardando proposta formal de ação corretiva pelo fornecedor.',
        responsavelFornecedor: responsavelFornecedor.trim() || 'Representante do Fornecedor',
        responsavelVickytex: 'Qualidade Vickytex',
        prazo: prazoPlano,
        status: 'Pendente'
      };
    }

    onSaveRNC(novaRnc, plano);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-linear-to-r from-rose-700 via-rose-600 to-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <FileWarning className="w-6 h-6 text-rose-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Registrar Não Conformidade de Fornecedor (RNC)</h3>
              <p className="text-xs text-rose-100 mt-0.5">
                {fornecedor.nomeFantasia || fornecedor.razaoSocial} • Rastreabilidade ISO 9001 (8.4 / 8.7 / 10.2)
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Código RNC *</label>
              <input 
                type="text" 
                required
                value={codigoRNC}
                onChange={e => setCodigoRNC(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Data da Ocorrência *</label>
              <input 
                type="date" 
                required
                value={dataOcorrencia}
                onChange={e => setDataOcorrencia(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Gravidade do Desvio *</label>
              <select 
                value={gravidade}
                onChange={e => setGravidade(e.target.value as any)}
                className={`w-full text-xs font-bold px-3 py-2 rounded-lg border ${
                  gravidade === 'Crítica' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                  gravidade === 'Grave' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                  gravidade === 'Média' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                <option value="Leve">Leve (Sem impacto operacional imediato)</option>
                <option value="Média">Média (Requer triagem / retrabalho menor)</option>
                <option value="Grave">Grave (Lote retido / alto impacto)</option>
                <option value="Crítica">Crítica (Risco iminente de parada ou cliente final)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Título da Não Conformidade *</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Tonalidade barrada em malha 100% algodão / Medidas de costura fora do gabarito"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Lote Envolvido</label>
              <input 
                type="text" 
                placeholder="Ex: LT-2026-088"
                value={loteEnvolvido}
                onChange={e => setLoteEnvolvido(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nota Fiscal</label>
              <input 
                type="text" 
                placeholder="Ex: NF-10940"
                value={notaFiscal}
                onChange={e => setNotaFiscal(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Qtd Afetada</label>
              <input 
                type="text" 
                placeholder="Ex: 500 kg / 300 peças"
                value={quantidadeAfetada}
                onChange={e => setQuantidadeAfetada(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Descrição Detalhada do Problema *</label>
            <textarea 
              rows={3}
              required
              placeholder="Descreva a evidência objetiva, ensaio realizado, desvio observado vs ficha técnica Vickytex..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="reincidente-check"
                checked={reincidente}
                onChange={e => setReincidente(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <label htmlFor="reincidente-check" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Defeito Reincidente no Fornecedor?
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="exige-plano-check"
                checked={exigePlanoAcao}
                onChange={e => setExigePlanoAcao(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <label htmlFor="exige-plano-check" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Exigir Plano de Ação Corretiva (CAPA / 5W2H)?
              </label>
            </div>
          </div>

          {/* Seção Plano de Ação CAPA */}
          {exigePlanoAcao && (
            <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-150 dark:border-rose-900/40 space-y-3">
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center">
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Estruturação do Plano de Ação Corretiva (CAPA)
              </h4>
              
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Causa Raiz Apontada (Ishikawa / 5 Porquês)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Falha térmica no sensor do ramo / Desgaste de agulha sem troca periódica"
                  value={causaRaiz}
                  onChange={e => setCausaRaiz(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Ação Corretiva / Bloqueio Exigido</label>
                <input 
                  type="text" 
                  placeholder="Ex: Substituição imediata dos sensores e revisão 100% antes da expedição"
                  value={acaoCorretiva}
                  onChange={e => setAcaoCorretiva(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Responsável no Fornecedor</label>
                  <input 
                    type="text" 
                    value={responsavelFornecedor}
                    onChange={e => setResponsavelFornecedor(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Prazo para Retorno do Plano *</label>
                  <input 
                    type="date" 
                    value={prazoPlano}
                    onChange={e => setPrazoPlano(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rodapé */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              RNCs impactam automaticamente o IQF de fornecedor.
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
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center"
              >
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Registrar Não Conformidade
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
