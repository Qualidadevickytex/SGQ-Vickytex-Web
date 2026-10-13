/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { Fornecedor, BloqueioHistorico } from '../../types/supplier';

interface FornecedorModalBloqueioProps {
  fornecedor: Fornecedor;
  onClose: () => void;
  onConfirm: (novoStatus: Fornecedor['statusQualificacao'], registro: BloqueioHistorico) => void;
}

export const FornecedorModalBloqueio: React.FC<FornecedorModalBloqueioProps> = ({
  fornecedor,
  onClose,
  onConfirm
}) => {
  const isBloqueado = fornecedor.statusQualificacao === 'Bloqueado';

  const [tipoAcao, setTipoAcao] = useState<BloqueioHistorico['tipo']>(
    isBloqueado ? 'Desbloqueio / Liberação' : 'Bloqueio por Qualidade'
  );
  const [motivo, setMotivo] = useState('');
  const [responsavel, setResponsavel] = useState('Qualidade / Gerência Vickytex');
  const [criteriosLiberacao, setCriteriosLiberacao] = useState(
    isBloqueado 
      ? 'Apresentação de plano de ação 100% eficaz e inspeção reforçada nível II nos próximos 3 lotes.'
      : 'Inspeção nível rigoroso 100%, laudo laboratorial externo e auditoria in loco de conformidade.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novoStatus: Fornecedor['statusQualificacao'] = isBloqueado 
      ? 'Qualificado com Restrições' 
      : 'Bloqueado';

    const registro: BloqueioHistorico = {
      id: `bloq-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      tipo: tipoAcao,
      motivo: motivo.trim(),
      responsavel: responsavel.trim(),
      criteriosLiberacao: criteriosLiberacao.trim()
    };

    onConfirm(novoStatus, registro);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className={`text-white p-5 flex items-center justify-between ${
          isBloqueado ? 'bg-emerald-600' : 'bg-rose-700'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              {isBloqueado ? <ShieldCheck className="w-6 h-6 text-emerald-200" /> : <ShieldAlert className="w-6 h-6 text-rose-200" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {isBloqueado ? 'Desbloquear / Liberar Fornecedor' : 'Bloquear / Suspender Fornecedor (ISO 8.4)'}
              </h3>
              <p className="text-xs text-white/90 mt-0.5">
                {fornecedor.nomeFantasia || fornecedor.razaoSocial} • CNPJ: {fornecedor.cnpj}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            isBloqueado 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900' 
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
          }`}>
            <div className="flex items-start space-x-2.5">
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção:</strong> {isBloqueado 
                  ? 'A liberação deste fornecedor permitirá que o setor de Compras e PCP voltem a emitir ordens de compra e ordens de produção. Recomenda-se registrar os critérios de liberação estipulados.' 
                  : 'O bloqueio suspende preventivamente a homologação do fornecedor no sistema Vickytex, emitindo alertas imediatos nas telas de PCP e Compras para evitar recebimento de novos lotes.'
                }
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Tipo de Procedimento *
            </label>
            <select 
              value={tipoAcao}
              onChange={e => setTipoAcao(e.target.value as any)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
            >
              {isBloqueado ? (
                <>
                  <option value="Desbloqueio / Liberação">Desbloqueio / Liberação com Monitoramento</option>
                  <option value="Desbloqueio / Liberação Plena">Desbloqueio com Homologação Plena</option>
                </>
              ) : (
                <>
                  <option value="Bloqueio por Qualidade">Bloqueio por Qualidade (RNCs Reincidentes / Defeitos Críticos)</option>
                  <option value="Bloqueio Preventivo">Bloqueio Preventivo (Documentação / Auditoria Reprovada)</option>
                  <option value="Suspensão Temporária">Suspensão Temporária para Averiguação Técnica</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Justificativa Técnica Detalhada *
            </label>
            <textarea 
              rows={3}
              required
              placeholder="Descreva o motivo que fundamenta a decisão de bloqueio ou liberação..."
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Critérios para Liberação / Monitoramento Especial
            </label>
            <input 
              type="text" 
              placeholder="Ex: Reinspeção 100% dos próximos 3 lotes com ensaio laboratorial externo"
              value={criteriosLiberacao}
              onChange={e => setCriteriosLiberacao(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Responsável pela Decisão *
            </label>
            <input 
              type="text" 
              required
              value={responsavel}
              onChange={e => setResponsavel(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          {/* Rodapé */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center ${
                isBloqueado ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isBloqueado ? <ShieldCheck className="w-4 h-4 mr-1.5" /> : <ShieldAlert className="w-4 h-4 mr-1.5" />}
              {isBloqueado ? 'Confirmar Desbloqueio' : 'Confirmar Bloqueio Controlado'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
